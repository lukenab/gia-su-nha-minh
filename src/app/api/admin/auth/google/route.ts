import { NextResponse } from "next/server";

import {
  NEXT_COOKIE,
  OAUTH_COOKIE,
  OAUTH_COOKIE_SECONDS,
  appOrigin,
  buildAuthorizeUrl,
  createOAuthRequest,
  googleCallbackPath,
} from "@/features/admin-auth/server/google-oauth";
import { googleIsConfigured } from "@/features/admin-auth/server/session";
import { safeNextPath } from "@/features/admin-auth/server/token";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = appOrigin(request);
  if (!googleIsConfigured()) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=google_unavailable`,
    );
  }
  const oauth = createOAuthRequest();
  const response = NextResponse.redirect(
    buildAuthorizeUrl({
      clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
      redirectUri: `${origin}${googleCallbackPath}`,
      state: oauth.state,
      nonce: oauth.nonce,
      challenge: oauth.challenge,
    }),
  );
  response.cookies.set(
    OAUTH_COOKIE,
    `${oauth.state}.${oauth.nonce}.${oauth.verifier}`,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/admin/auth",
      maxAge: OAUTH_COOKIE_SECONDS,
    },
  );
  const next = safeNextPath(new URL(request.url).searchParams.get("next"));
  response.cookies.set(NEXT_COOKIE, next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/admin/auth",
    maxAge: OAUTH_COOKIE_SECONDS,
  });
  return response;
}
