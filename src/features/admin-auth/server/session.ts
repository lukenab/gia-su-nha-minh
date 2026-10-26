import "server-only";
import { cookies } from "next/headers";

import { ADMIN_COOKIE, SESSION_SECONDS, readAdminSession } from "./token.ts";

export {
  ADMIN_COOKIE,
  adminIsConfigured,
  createAdminSession,
  googleIsConfigured,
  localLoginEnabled,
  readAdminSession,
  verifyAdminSession,
} from "./token.ts";
export type { AdminIdentity } from "./token.ts";

export async function getAdminSession() {
  const store = await cookies();
  return readAdminSession(store.get(ADMIN_COOKIE)?.value);
}

export async function isAdminAuthenticated() {
  return (await getAdminSession()) !== null;
}

/*
 * Lax (not Strict) so the cookie set when Google redirects back is sent on
 * the next navigation. Cross-site writes are still blocked: admin APIs only
 * accept JSON with a same-origin Origin header.
 */
export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_SECONDS,
};
