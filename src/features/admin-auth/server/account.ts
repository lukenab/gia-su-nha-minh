/*
 * The signed-in team member's own account: profile details, display name
 * and password change. Every function takes the identity from the verified
 * session cookie, never an email sent by the browser.
 */
import "server-only";
import { connectToDatabase } from "../../../shared/server/mongodb.ts";
import { LOCK_MINUTES, MAX_FAILED_LOGINS, type AuthResult } from "./auth.ts";
import { hashPassword, passwordProblem, verifyPassword } from "./password.ts";
import { normalizeOperatorName, type AdminIdentity } from "./token.ts";
import { AdminUser } from "./user-model.ts";

export type AccountView = {
  email: string;
  name: string;
  method: string;
  createdAt: string | null;
  passwordUpdatedAt: string | null;
  lastLoginAt: string | null;
};

type AccountDoc = {
  _id: unknown;
  name?: string;
  passwordHash?: string | null;
  failedLoginCount?: number;
  lockedUntil?: Date | null;
  createdAt?: Date | null;
  passwordUpdatedAt?: Date | null;
  lastLoginAt?: Date | null;
};

const iso = (value?: Date | null) => (value ? value.toISOString() : null);
const NO_ACCOUNT = "No password account exists for this sign-in.";

async function findAccount(identity: AdminIdentity) {
  if (identity.method !== "password") return null;
  await connectToDatabase();
  return (await AdminUser.findOne({
    email: identity.email,
  }).lean()) as AccountDoc | null;
}

export async function getAccount(
  identity: AdminIdentity,
): Promise<AccountView> {
  const user = await findAccount(identity);
  return {
    email: identity.email,
    name: identity.operator,
    method: identity.method === "password" ? "Email and password" : "Local",
    createdAt: iso(user?.createdAt),
    passwordUpdatedAt: iso(user?.passwordUpdatedAt),
    lastLoginAt: iso(user?.lastLoginAt),
  };
}

/** Returns the identity to sign into a fresh session cookie. */
export async function updateDisplayName(
  identity: AdminIdentity,
  rawName: unknown,
): Promise<AuthResult<AdminIdentity>> {
  const name = normalizeOperatorName(rawName);
  if (!name)
    return {
      ok: false,
      status: 422,
      error: "Enter a display name (2–60 characters).",
    };
  const user = await findAccount(identity);
  if (!user) return { ok: false, status: 404, error: NO_ACCOUNT };
  await AdminUser.updateOne({ _id: user._id }, { $set: { name } });
  return { ok: true, data: { ...identity, operator: name } };
}

/**
 * Needs the current password. Wrong attempts count towards the same lockout
 * as sign-in, so this form cannot be used to guess the password.
 */
export async function changePassword(
  identity: AdminIdentity,
  current: unknown,
  next: unknown,
): Promise<AuthResult<Record<string, never>>> {
  if (typeof current !== "string" || !current || typeof next !== "string")
    return {
      ok: false,
      status: 400,
      error: "Enter your current and new password.",
    };
  const user = await findAccount(identity);
  if (!user?.passwordHash) return { ok: false, status: 404, error: NO_ACCOUNT };
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60_000,
    );
    return {
      ok: false,
      status: 429,
      error: `Too many wrong passwords. Try again in ${minutes} minutes.`,
    };
  }
  if (!(await verifyPassword(current, user.passwordHash))) {
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
    return {
      ok: false,
      status: 401,
      error: "The current password is incorrect.",
    };
  }
  const problem = passwordProblem(next, identity.email);
  if (problem) return { ok: false, status: 422, error: problem };
  if (next === current)
    return {
      ok: false,
      status: 422,
      error: "Choose a password different from the current one.",
    };
  await AdminUser.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash: await hashPassword(next),
        passwordUpdatedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    },
  );
  return { ok: true, data: {} };
}
