import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "gsnm_admin";
const SESSION_SECONDS = 8 * 60 * 60;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}

export function adminIsConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim() && secret());
}

export function checkAdminPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !secret()) return false;
  const left = createHash("sha256").update(candidate).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function createAdminSession() {
  const key = secret();
  if (!key) throw new Error("Admin session secret is not configured");
  const expiry = String(Date.now() + SESSION_SECONDS * 1000);
  const signature = createHmac("sha256", key).update(expiry).digest("hex");
  return `${expiry}.${signature}`;
}

export function verifyAdminSession(value?: string) {
  const key = secret();
  if (!key || !value) return false;
  const [expiry, signature, extra] = value.split(".");
  if (
    extra ||
    !/^\d{13}$/.test(expiry ?? "") ||
    !/^[a-f0-9]{64}$/.test(signature ?? "")
  )
    return false;
  if (Number(expiry) <= Date.now()) return false;
  const expected = createHmac("sha256", key).update(expiry).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/admin",
  maxAge: SESSION_SECONDS,
};
