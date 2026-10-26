/*
 * Minimal "Sign in with Google" (OpenID Connect, authorization code + PKCE).
 * Only the verified email and display name are used.
 */
import { createHash, randomBytes } from "node:crypto";

export const GOOGLE_AUTHORIZE_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export const OAUTH_COOKIE = "gsnm_oauth";
export const NEXT_COOKIE = "gsnm_next";
export const OAUTH_COOKIE_SECONDS = 10 * 60;

const random = (bytes = 32) => randomBytes(bytes).toString("base64url");

export function createOAuthRequest() {
  const verifier = random(48);
  return {
    state: random(),
    nonce: random(),
    verifier,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
  };
}

export function buildAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  challenge: string;
}) {
  const url = new URL(GOOGLE_AUTHORIZE_URL);
  url.search = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    nonce: input.nonce,
    code_challenge: input.challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
    access_type: "online",
  }).toString();
  return url.toString();
}

/** Reads a JWT payload without checking the signature (see below). */
export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const value = JSON.parse(
      Buffer.from(parts[1] ?? "", "base64url").toString("utf8"),
    );
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

export type IdTokenResult =
  | { ok: true; email: string; name: string }
  | { ok: false; reason: "invalid" | "unverified_email" };

/**
 * The ID token comes straight from Google's token endpoint over TLS in
 * exchange for our client secret, so (per OpenID Connect Core 3.1.3.7) its
 * claims are checked rather than its signature.
 */
export function validateIdTokenClaims(
  claims: Record<string, unknown> | null,
  expected: { clientId: string; nonce: string; now?: number },
): IdTokenResult {
  if (!claims) return { ok: false, reason: "invalid" };
  const now = Math.floor((expected.now ?? Date.now()) / 1000);
  const audience = claims.aud;
  const audienceOk = Array.isArray(audience)
    ? audience.includes(expected.clientId)
    : audience === expected.clientId;
  if (
    !ISSUERS.includes(String(claims.iss)) ||
    !audienceOk ||
    typeof claims.exp !== "number" ||
    claims.exp < now - 60 ||
    claims.nonce !== expected.nonce ||
    typeof claims.email !== "string"
  ) {
    return { ok: false, reason: "invalid" };
  }
  if (claims.email_verified !== true && claims.email_verified !== "true") {
    return { ok: false, reason: "unverified_email" };
  }
  return {
    ok: true,
    email: claims.email.toLowerCase(),
    name: typeof claims.name === "string" ? claims.name : "",
  };
}

export async function exchangeCode(input: {
  code: string;
  verifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      code_verifier: input.verifier,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      redirect_uri: input.redirectUri,
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { id_token?: unknown };
  return typeof data.id_token === "string" ? data.id_token : null;
}

/** Public origin of the site, used to build the Google redirect URI. */
export function appOrigin(request: Request) {
  const configured = process.env.APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

export const googleCallbackPath = "/api/admin/auth/google/callback";
