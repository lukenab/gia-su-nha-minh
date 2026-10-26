import { NextResponse } from "next/server";

import { googleIsConfigured } from "@/lib/admin-session";
import { safeNextPath } from "@/lib/admin-token";
import {
  NEXT_COOKIE,
  OAUTH_COOKIE,
  OAUTH_COOKIE_SECONDS,
  appOrigin,
  buildAuthorizeUrl,
  createOAuthRequest,
  googleCallbackPath,
} from "@/lib/google-oauth";

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
