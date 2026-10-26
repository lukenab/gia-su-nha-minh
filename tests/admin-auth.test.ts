import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_FAILED_LOGINS,
  inspectResetToken,
  loginWithPassword,
  recordGoogleLogin,
  requestPasswordReset,
  resetPassword,
} from "../src/features/admin-auth/server/auth.ts";
import { hashPassword } from "../src/features/admin-auth/server/password.ts";
import { AdminUser } from "../src/features/admin-auth/server/user-model.ts";

process.env.ADMIN_SESSION_SECRET = "s".repeat(48);
process.env.ADMIN_ALLOWED_EMAILS = "tra@example.com,anh@example.com";
(process.env as Record<string, string>).NODE_ENV = "development"; // print links

async function withDatabase(run: () => Promise<void>) {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("gsnm_admin_auth");
  try {
    await run();
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
    delete process.env.MONGODB_URI;
  }
}

/** Captures the reset link printed in development instead of emailed. */
async function captureLink(run: () => Promise<void>) {
  const original = console.info;
  let link = "";
  console.info = (message: string) => {
    link = String(message).split(" ").pop() ?? "";
  };
  try {
    await run();
  } finally {
    console.info = original;
  }
  return link ? (new URL(link).searchParams.get("token") ?? "") : "";
}

test("password sign-in: allow-list, generic errors and lockout", async () => {
  await withDatabase(async () => {
    await mongoose.connect(process.env.MONGODB_URI!);
    await AdminUser.create({
      email: "tra@example.com",
      name: "Thanh Trà",
      passwordHash: await hashPassword("cầu Ninh Kiều lúc 7 giờ"),
    });
    await AdminUser.create({
      email: "removed@example.com",
      passwordHash: await hashPassword("cầu Ninh Kiều lúc 7 giờ"),
    });

    const ok = await loginWithPassword(
      "TRA@example.com",
      "cầu Ninh Kiều lúc 7 giờ",
    );
    assert.deepEqual(ok, {
      ok: true,
      data: {
        email: "tra@example.com",
        operator: "Thanh Trà",
        method: "password",
      },
    });

    // Same message for a wrong password, an unknown email and a removed member.
    const wrong = await loginWithPassword("tra@example.com", "sai");
    const unknown = await loginWithPassword(
      "nobody@example.com",
      "cầu Ninh Kiều lúc 7 giờ",
    );
    const removed = await loginWithPassword(
      "removed@example.com",
      "cầu Ninh Kiều lúc 7 giờ",
    );
    for (const result of [wrong, unknown, removed]) {
      assert.equal(result.ok, false);
      assert.equal(
        !result.ok && result.error,
        "Email hoặc mật khẩu không đúng.",
      );
    }

    for (let attempt = 1; attempt < MAX_FAILED_LOGINS; attempt++) {
      await loginWithPassword("tra@example.com", "sai");
    }
    const locked = await loginWithPassword(
      "tra@example.com",
      "cầu Ninh Kiều lúc 7 giờ",
    );
    assert.deepEqual([locked.ok, !locked.ok && locked.status], [false, 429]);
  });
});

test("first password and reset links are single-use and allow-listed", async () => {
  await withDatabase(async () => {
    // Not on the team: nothing is created or sent.
    const none = await captureLink(() =>
      requestPasswordReset("stranger@example.com", "http://localhost:3000"),
    );
    assert.equal(none, "");
    assert.equal(await AdminUser.countDocuments({}), 0);

    const token = await captureLink(() =>
      requestPasswordReset("anh@example.com", "http://localhost:3000"),
    );
    assert.ok(token.length > 20);
    const saved = await AdminUser.findOne({ email: "anh@example.com" }).lean();
    assert.ok(saved?.resetTokenHash);
    assert.notEqual(saved?.resetTokenHash, token); // only the hash is stored

    // A second request inside the cooldown does not send another link.
    const again = await captureLink(() =>
      requestPasswordReset("anh@example.com", "http://localhost:3000"),
    );
    assert.equal(again, "");

    assert.deepEqual(await inspectResetToken(token), {
      needsName: true,
      isFirstPassword: true,
    });
    const noName = await resetPassword({
      token,
      password: "cầu Ninh Kiều lúc 7 giờ",
      name: "",
    });
    assert.equal(noName.ok, false);
    const weak = await resetPassword({
      token,
      password: "short",
      name: "Hoàng Anh",
    });
    assert.equal(weak.ok, false);

    const [first, second] = await Promise.all([
      resetPassword({
        token,
        password: "cầu Ninh Kiều lúc 7 giờ",
        name: "Hoàng Anh",
      }),
      resetPassword({
        token,
        password: "một mật khẩu khác hẳn",
        name: "Hoàng Anh",
      }),
    ]);
    assert.equal([first, second].filter((result) => result.ok).length, 1);
    assert.equal(await inspectResetToken(token), null);

    const login = await loginWithPassword(
      "anh@example.com",
      first.ok ? "cầu Ninh Kiều lúc 7 giờ" : "một mật khẩu khác hẳn",
    );
    assert.ok(login.ok);
    assert.equal(login.ok && login.data.operator, "Hoàng Anh");
  });
});

test("Google sign-ins keep a chosen name and record the method", async () => {
  await withDatabase(async () => {
    assert.equal(
      await recordGoogleLogin("tra@example.com", "Trà Nguyễn"),
      "Trà Nguyễn",
    );
    await AdminUser.updateOne(
      { email: "tra@example.com" },
      { name: "Thanh Trà" },
    );
    assert.equal(
      await recordGoogleLogin("tra@example.com", "Trà Nguyễn"),
      "Thanh Trà",
    );
    const saved = await AdminUser.findOne({ email: "tra@example.com" }).lean();
    assert.equal(saved?.lastLoginMethod, "google");
    assert.equal(saved?.passwordHash, null);
  });
});
