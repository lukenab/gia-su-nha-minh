/*
 * Signed session cookie for /admin and the allow-list that decides who may
 * sign in. Pure Node code (no Next.js imports) so it can be unit-tested.
 *
 * Cookie value: `<expiry>.<base64url JSON identity>.<hmac-sha256>`.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "gsnm_admin";
export const SESSION_SECONDS = 8 * 60 * 60;

export type SignInMethod = "google" | "password" | "local";
export type AdminIdentity = {
  /** Display name stored on status history entries. */
  operator: string;
  email: string;
  method: SignInMethod;
};

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}

/* ------------------------------ allow-list ------------------------------ */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 120 && EMAIL_PATTERN.test(email) ? email : null;
}

/** ADMIN_ALLOWED_EMAILS="a@x.com, b@y.com" — the only people who may sign in. */
export function allowedEmails(raw = process.env.ADMIN_ALLOWED_EMAILS ?? "") {
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((item) => normalizeEmail(item))
      .filter((item): item is string => Boolean(item)),
  );
}

export function isAllowedEmail(email: string) {
  return allowedEmails().has(email.toLowerCase());
}

/* ---------------------------- sign-in methods ---------------------------- */

export function googleIsConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
    process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

/**
 * The old shared password only works on a developer machine (`next dev`),
 * never in a production build, so it cannot be used on Vercel.
 */
export function localLoginEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    Boolean(process.env.ADMIN_PASSWORD?.trim()) &&
    Boolean(secret())
  );
}

export function checkLocalPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!localLoginEnabled() || !expected) return false;
  const left = createHash("sha256").update(candidate).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function adminIsConfigured() {
  return Boolean(secret()) && (allowedEmails().size > 0 || localLoginEnabled());
}

/* ------------------------------- names ------------------------------- */

export function normalizeOperatorName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return name.length >= 2 && name.length <= 60 ? name : null;
}

/** Display name, falling back to the part of the email before "@". */
export function displayNameFor(name: unknown, email: string) {
  return normalizeOperatorName(name) ?? email.split("@")[0] ?? email;
}

/* ------------------------------- cookie ------------------------------- */

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("hex");
}

const LOCAL_EMAIL = "local@localhost";

export function createAdminSession(identity: AdminIdentity) {
  const key = secret();
  if (!key) throw new Error("Admin session secret is not configured");
  const body = Buffer.from(
    JSON.stringify({
      e: identity.email,
      n: displayNameFor(identity.operator, identity.email),
      m: identity.method,
    }),
    "utf8",
  ).toString("base64url");
  const expiry = String(Date.now() + SESSION_SECONDS * 1000);
  const payload = `${expiry}.${body}`;
  return `${payload}.${sign(payload, key)}`;
}

export function localIdentity(): AdminIdentity {
  return {
    operator: "Quản trị viên (local)",
    email: LOCAL_EMAIL,
    method: "local",
  };
}

/**
 * Returns the signed-in person, or null. The allow-list is checked on every
 * request, so removing an email takes effect without waiting for expiry.
 */
export function readAdminSession(value?: string): AdminIdentity | null {
  const key = secret();
  if (!key || !value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [expiry = "", body = "", signature = ""] = parts;
  if (
    !/^\d{13}$/.test(expiry) ||
    !/^[A-Za-z0-9_-]+$/.test(body) ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    return null;
  if (Number(expiry) <= Date.now()) return null;
  const expected = sign(`${expiry}.${body}`, key);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected)))
    return null;

  let data: { e?: unknown; n?: unknown; m?: unknown };
  try {
    data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const method = data.m;
  if (method === "local") {
    return localLoginEnabled() ? localIdentity() : null;
  }
  if (method !== "google" && method !== "password") return null;
  const email = normalizeEmail(data.e);
  if (!email || !isAllowedEmail(email)) return null;
  return { email, operator: displayNameFor(data.n, email), method };
}

export function verifyAdminSession(value?: string) {
  return readAdminSession(value) !== null;
}

/** Only same-site admin paths are accepted as a post-login destination. */
export function safeNextPath(value: unknown) {
  if (typeof value !== "string") return "/admin";
  if (!/^\/admin(\/[A-Za-z0-9/_-]*)?(\?[A-Za-z0-9=&_%.-]*)?$/.test(value))
    return "/admin";
  if (value.startsWith("/admin/login")) return "/admin";
  return value;
}
