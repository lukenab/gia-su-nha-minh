import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { recordGoogleLogin } from "@/lib/admin-auth";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSession,
  googleIsConfigured,
} from "@/lib/admin-session";
import { isAllowedEmail, safeNextPath } from "@/lib/admin-token";
import {
  NEXT_COOKIE,
  OAUTH_COOKIE,
  appOrigin,
  decodeJwtPayload,
  exchangeCode,
  googleCallbackPath,
  validateIdTokenClaims,
} from "@/lib/google-oauth";

export const runtime = "nodejs";

const sameText = (left: string, right: string) =>
  left.length === right.length &&
  timingSafeEqual(Buffer.from(left), Buffer.from(right));

export async function GET(request: Request) {
  const origin = appOrigin(request);
  const fail = (code: string) => {
    const response = NextResponse.redirect(
      `${origin}/admin/login?error=${code}`,
    );
    response.cookies.set(OAUTH_COOKIE, "", {
      path: "/api/admin/auth",
      maxAge: 0,
    });
    return response;
  };
  if (!googleIsConfigured()) return fail("google_unavailable");

  const url = new URL(request.url);
  if (url.searchParams.get("error")) return fail("google_cancelled");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const stored = (await cookies()).get(OAUTH_COOKIE)?.value ?? "";
  const [expectedState = "", nonce = "", verifier = ""] = stored.split(".");
  if (!code || !expectedState || !sameText(state, expectedState))
    return fail("google_failed");

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!.trim();
    const idToken = await exchangeCode({
      code,
      verifier,
      clientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
      redirectUri: `${origin}${googleCallbackPath}`,
    });
    if (!idToken) return fail("google_failed");
    const result = validateIdTokenClaims(decodeJwtPayload(idToken), {
      clientId,
      nonce,
    });
    if (!result.ok) return fail("google_failed");
    if (!isAllowedEmail(result.email)) return fail("not_allowed");

    const operator = await recordGoogleLogin(result.email, result.name);
    const next = safeNextPath((await cookies()).get(NEXT_COOKIE)?.value);
    const response = NextResponse.redirect(`${origin}${next}`);
    response.cookies.set(
      ADMIN_COOKIE,
      createAdminSession({ email: result.email, operator, method: "google" }),
      adminCookieOptions,
    );
    response.cookies.set(OAUTH_COOKIE, "", {
      path: "/api/admin/auth",
      maxAge: 0,
    });
    response.cookies.set(NEXT_COOKIE, "", {
      path: "/api/admin/auth",
      maxAge: 0,
    });
    return response;
  } catch {
    return fail("google_failed");
  }
}
