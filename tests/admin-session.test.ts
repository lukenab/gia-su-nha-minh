import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

process.env.ADMIN_SESSION_SECRET = "s".repeat(48);
process.env.ADMIN_ALLOWED_EMAILS = "Tra@Example.com, anh@example.com;bad-entry";

const token = await import("../lib/admin-token.ts");
const google = await import("../lib/google-oauth.ts");
const password = await import("../lib/password.ts");

const tra = {
  email: "tra@example.com",
  operator: "Thanh Trà",
  method: "password",
} as const;

test("the allow-list is parsed case-insensitively and ignores junk", () => {
  assert.deepEqual(
    [...token.allowedEmails()],
    ["tra@example.com", "anh@example.com"],
  );
  assert.ok(token.isAllowedEmail("TRA@example.com"));
  assert.ok(!token.isAllowedEmail("someone@example.com"));
  assert.equal(token.normalizeEmail("  A@B.co "), "a@b.co");
  assert.equal(token.normalizeEmail("not an email"), null);
});

test("the session cookie carries a signed identity", () => {
  const cookie = token.createAdminSession(tra);
  assert.deepEqual(token.readAdminSession(cookie), tra);
});

test("tampering, expiry and old cookie formats are rejected", () => {
  const [expiry, body, signature] = token.createAdminSession(tra).split(".");
  const forged = Buffer.from(
    JSON.stringify({ e: "anh@example.com", n: "Anh", m: "password" }),
  ).toString("base64url");
  assert.equal(
    token.readAdminSession(`${expiry}.${forged}.${signature}`),
    null,
  );
  assert.equal(
    token.readAdminSession(`${Number(expiry) + 1}.${body}.${signature}`),
    null,
  );
  assert.equal(
    token.readAdminSession(`${expiry}.${body}.${"0".repeat(64)}`),
    null,
  );
  assert.equal(token.readAdminSession(undefined), null);

  const key = process.env.ADMIN_SESSION_SECRET!;
  const past = String(Date.now() - 1000);
  const sig = createHmac("sha256", key).update(`${past}.${body}`).digest("hex");
  assert.equal(token.readAdminSession(`${past}.${body}.${sig}`), null);

  // Cookies from the shared-password version had two parts.
  const legacy = String(Date.now() + 60_000);
  const legacySig = createHmac("sha256", key).update(legacy).digest("hex");
  assert.equal(token.readAdminSession(`${legacy}.${legacySig}`), null);
});

test("removing an email from the allow-list ends its sessions", () => {
  const cookie = token.createAdminSession({ ...tra, email: "anh@example.com" });
  assert.ok(token.readAdminSession(cookie));
  const before = process.env.ADMIN_ALLOWED_EMAILS;
  process.env.ADMIN_ALLOWED_EMAILS = "tra@example.com";
  try {
    assert.equal(token.readAdminSession(cookie), null);
  } finally {
    process.env.ADMIN_ALLOWED_EMAILS = before;
  }
});

test("the shared development password never works outside `next dev`", () => {
  const env = process.env as Record<string, string | undefined>;
  const before = env.NODE_ENV;
  env.ADMIN_PASSWORD = "local-password";
  env.NODE_ENV = "production";
  try {
    assert.equal(token.localLoginEnabled(), false);
    assert.equal(token.checkLocalPassword("local-password"), false);
    const cookie = token.createAdminSession(token.localIdentity());
    assert.equal(token.readAdminSession(cookie), null);
    env.NODE_ENV = "development";
    assert.ok(token.localLoginEnabled());
    assert.ok(token.checkLocalPassword("local-password"));
    assert.ok(token.readAdminSession(cookie));
  } finally {
    env.NODE_ENV = before;
    delete env.ADMIN_PASSWORD;
  }
});

test("display names are cleaned and fall back to the email", () => {
  assert.equal(token.normalizeOperatorName("  An\u0000  Bình "), "An Bình");
  assert.equal(token.normalizeOperatorName("A"), null);
  assert.equal(token.displayNameFor("", "tra@example.com"), "tra");
});

test("only admin paths are accepted after sign-in", () => {
  assert.equal(
    token.safeNextPath("/admin/requests?status=NEW"),
    "/admin/requests?status=NEW",
  );
  assert.equal(token.safeNextPath("https://evil.example"), "/admin");
  assert.equal(token.safeNextPath("//evil.example"), "/admin");
  assert.equal(token.safeNextPath("/admin/login"), "/admin");
  assert.equal(token.safeNextPath(undefined), "/admin");
});

test("passwords are hashed with scrypt and checked in constant shape", async () => {
  const hash = await password.hashPassword("một cụm từ đủ dài");
  assert.match(hash, /^scrypt\$16384\$8\$1\$/);
  assert.ok(await password.verifyPassword("một cụm từ đủ dài", hash));
  assert.equal(await password.verifyPassword("sai mật khẩu", hash), false);
  assert.equal(await password.verifyPassword("anything", null), false);
  assert.notEqual(hash, await password.hashPassword("một cụm từ đủ dài"));
  assert.ok(password.passwordProblem("short"));
  assert.ok(password.passwordProblem("aaaaaaaaaaaa"));
  assert.ok(password.passwordProblem("tra-1234567890", "tra@example.com"));
  assert.equal(password.passwordProblem("cầu Ninh Kiều lúc 7 giờ"), null);
});

test("Google sign-in uses PKCE and validates the ID token claims", () => {
  const request = google.createOAuthRequest();
  const url = new URL(
    google.buildAuthorizeUrl({
      clientId: "client.apps.googleusercontent.com",
      redirectUri: "https://giasunhaminh.vn/api/admin/auth/google/callback",
      ...request,
    }),
  );
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("scope"), "openid email profile");
  assert.equal(url.searchParams.get("state"), request.state);

  const now = Date.UTC(2026, 9, 25);
  const claims = {
    iss: "https://accounts.google.com",
    aud: "client.apps.googleusercontent.com",
    exp: now / 1000 + 300,
    nonce: request.nonce,
    email: "Tra@Example.com",
    email_verified: true,
    name: "Thanh Trà",
  };
  const expected = {
    clientId: "client.apps.googleusercontent.com",
    nonce: request.nonce,
    now,
  };
  assert.deepEqual(google.validateIdTokenClaims(claims, expected), {
    ok: true,
    email: "tra@example.com",
    name: "Thanh Trà",
  });
  for (const broken of [
    { iss: "https://evil.example" },
    { aud: "another-client" },
    { exp: now / 1000 - 3600 },
    { nonce: "replayed" },
  ]) {
    assert.equal(
      google.validateIdTokenClaims({ ...claims, ...broken }, expected).ok,
      false,
    );
  }
  assert.deepEqual(
    google.validateIdTokenClaims(
      { ...claims, email_verified: false },
      expected,
    ),
    { ok: false, reason: "unverified_email" },
  );

  const jwt = `x.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.y`;
  assert.equal(google.decodeJwtPayload(jwt)?.email, "Tra@Example.com");
  assert.equal(google.decodeJwtPayload("garbage"), null);
});
