/*
 * Account operations for /admin: password sign-in with lockout, password
 * set/reset by email, and recording Google sign-ins. Who may sign in is
 * always decided by ADMIN_ALLOWED_EMAILS.
 */
import { createHash, randomBytes } from "node:crypto";

import {
  displayNameFor,
  isAllowedEmail,
  normalizeEmail,
  normalizeOperatorName,
  type AdminIdentity,
} from "./admin-token.ts";
import { AdminUser } from "./admin-user-model.ts";
import { sendPasswordResetEmail } from "./mailer.ts";
import { connectToDatabase } from "./mongodb.ts";
import { hashPassword, passwordProblem, verifyPassword } from "./password.ts";

export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;
export const RESET_TOKEN_MINUTES = 30;
export const RESET_COOLDOWN_SECONDS = 60;

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

const INVALID = "Email hoặc mật khẩu không đúng.";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

type UserDoc = {
  _id: unknown;
  email: string;
  name?: string;
  passwordHash?: string | null;
  failedLoginCount?: number;
  lockedUntil?: Date | null;
  resetRequestedAt?: Date | null;
};

export async function loginWithPassword(
  rawEmail: unknown,
  password: unknown,
): Promise<AuthResult<AdminIdentity>> {
  const email = normalizeEmail(rawEmail);
  if (!email || typeof password !== "string" || !password) {
    return { ok: false, status: 400, error: "Vui lòng nhập email và mật khẩu." };
  }
  await connectToDatabase();
  const user = (await AdminUser.findOne({ email }).lean()) as UserDoc | null;
  const allowed = isAllowedEmail(email);

  if (!allowed || !user?.passwordHash) {
    await verifyPassword(password, null); // same timing as a real check
    return { ok: false, status: 401, error: INVALID };
  }
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
    return {
      ok: false,
      status: 429,
      error: `Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${minutes} phút hoặc đặt lại mật khẩu.`,
    };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    const failures = (user.failedLoginCount ?? 0) + 1;
    const lock = failures >= MAX_FAILED_LOGINS;
    await AdminUser.updateOne(
      { _id: user._id },
      lock
        ? {
            $set: {
              failedLoginCount: 0,
              lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000),
            },
          }
        : { $set: { failedLoginCount: failures } },
    );
    return { ok: false, status: 401, error: INVALID };
  }

  await AdminUser.updateOne(
    { _id: user._id },
    {
      $set: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginMethod: "password",
      },
    },
  );
  return {
    ok: true,
    data: { email, operator: displayNameFor(user.name, email), method: "password" },
  };
}

/**
 * Always resolves the same way whether or not the email may sign in, so the
 * form cannot be used to discover who is on the team.
 */
export async function requestPasswordReset(rawEmail: unknown, origin: string) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isAllowedEmail(email)) return;
  await connectToDatabase();
  await AdminUser.init(); // the unique email index guards the cooldown

  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const cooldownStart = new Date(now.getTime() - RESET_COOLDOWN_SECONDS * 1000);
  // Upsert so allowed team members can set their first password this way.
  const updated = await AdminUser.findOneAndUpdate(
    {
      email,
      $or: [{ resetRequestedAt: null }, { resetRequestedAt: { $lt: cooldownStart } }],
    },
    {
      $set: {
        resetTokenHash: hashToken(token),
        resetTokenExpiresAt: new Date(now.getTime() + RESET_TOKEN_MINUTES * 60_000),
        resetRequestedAt: now,
      },
      $setOnInsert: { email },
    },
    { upsert: true, new: true },
  ).catch((error: { code?: number }) => {
    // Duplicate key: the user exists but is still inside the cooldown.
    if (error?.code === 11000) return null;
    throw error;
  });
  if (!updated) return;

  const link = `${origin}/admin/reset-password?token=${encodeURIComponent(token)}`;
  await sendPasswordResetEmail(email, link, RESET_TOKEN_MINUTES);
}

export async function resetPassword(input: {
  token: unknown;
  password: unknown;
  name: unknown;
}): Promise<AuthResult<{ email: string }>> {
  if (typeof input.token !== "string" || input.token.length < 20) {
    return { ok: false, status: 400, error: "Liên kết không hợp lệ hoặc đã hết hạn." };
  }
  if (typeof input.password !== "string") {
    return { ok: false, status: 400, error: "Vui lòng nhập mật khẩu mới." };
  }
  await connectToDatabase();
  const tokenHash = hashToken(input.token);
  const user = (await AdminUser.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpiresAt: { $gt: new Date() },
  }).lean()) as UserDoc | null;
  if (!user || !isAllowedEmail(user.email)) {
    return { ok: false, status: 400, error: "Liên kết không hợp lệ hoặc đã hết hạn." };
  }

  const problem = passwordProblem(input.password, user.email);
  if (problem) return { ok: false, status: 422, error: problem };
  const name = normalizeOperatorName(input.name);
  if (!user.name && !name) {
    return { ok: false, status: 422, error: "Vui lòng nhập tên hiển thị (2–60 ký tự)." };
  }

  const passwordHash = await hashPassword(input.password);
  // Clearing the token in the same conditional update makes it single-use.
  const updated = await AdminUser.findOneAndUpdate(
    { _id: user._id, resetTokenHash: tokenHash },
    {
      $set: {
        passwordHash,
        passwordUpdatedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        ...(name ? { name } : {}),
      },
    },
  ).lean();
  if (!updated) {
    return { ok: false, status: 400, error: "Liên kết không hợp lệ hoặc đã hết hạn." };
  }
  return { ok: true, data: { email: user.email } };
}

/** Whether a reset link is still usable, and if the account needs a name. */
export async function inspectResetToken(token: unknown) {
  if (typeof token !== "string" || token.length < 20) return null;
  await connectToDatabase();
  const user = (await AdminUser.findOne({
    resetTokenHash: hashToken(token),
    resetTokenExpiresAt: { $gt: new Date() },
  })
    .select("email name passwordHash")
    .lean()) as UserDoc | null;
  if (!user || !isAllowedEmail(user.email)) return null;
  return { needsName: !user.name, isFirstPassword: !user.passwordHash };
}

export async function recordGoogleLogin(email: string, googleName: string) {
  await connectToDatabase();
  const name = normalizeOperatorName(googleName) ?? "";
  const user = (await AdminUser.findOneAndUpdate(
    { email },
    {
      $set: { lastLoginAt: new Date(), lastLoginMethod: "google" },
      $setOnInsert: { email, name },
    },
    { upsert: true, new: true },
  ).lean()) as UserDoc;
  // Keep a name the person chose; otherwise use the Google profile name.
  if (!user.name && name) await AdminUser.updateOne({ _id: user._id }, { $set: { name } });
  return displayNameFor(user.name || name, email);
}
