// Uses the same scrypt hashing and allow-list as the application.
import mongoose from "mongoose";
import { createRequire } from "node:module";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

import {
  hashPassword,
  passwordProblem,
} from "../src/features/admin-auth/server/password.ts";
import {
  normalizeEmail,
  isAllowedEmail,
  normalizeOperatorName,
} from "../src/features/admin-auth/server/token.ts";
import { AdminUser } from "../src/features/admin-auth/server/user-model.ts";
import { connectToDatabase } from "../src/shared/server/mongodb.ts";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
async function ask(label) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await rl.question(label);
  } finally {
    rl.close();
  }
}
async function passwordPrompt(label) {
  if (!process.stdin.isTTY)
    throw new Error(
      "Cần terminal tương tác hoặc biến ADMIN_BOOTSTRAP_PASSWORD.",
    );
  // Readline handles paste, backspace and Vietnamese input; the sink suppresses echo.
  const sink = new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  });
  const rl = createInterface({
    input: process.stdin,
    output: sink,
    terminal: true,
  });
  process.stdout.write(label);
  try {
    return await rl.question("");
  } finally {
    rl.close();
    process.stdout.write("\n");
  }
}
try {
  const resetting = process.argv.includes("--reset");
  const email = normalizeEmail(
    process.env.ADMIN_BOOTSTRAP_EMAIL || (await ask("Email: ")),
  );
  if (!email || !isAllowedEmail(email))
    throw new Error(
      "Email không hợp lệ hoặc chưa nằm trong ADMIN_ALLOWED_EMAILS của repo này.",
    );
  await connectToDatabase();
  await AdminUser.init();
  const existing = await AdminUser.findOne({ email }).select("name").lean();
  // Check before requesting a new password: a refused create must never look like a reset.
  if (existing && !resetting)
    throw new Error(
      "Tài khoản đã tồn tại. CHƯA THAY ĐỔI MẬT KHẨU. Chạy npm run admin:create -- --reset để đặt lại mật khẩu cho tài khoản này.",
    );
  if (!existing && resetting)
    throw new Error(
      "Tài khoản chưa tồn tại. Chạy npm run admin:create để cấp tài khoản mới.",
    );
  const name = normalizeOperatorName(
    process.env.ADMIN_BOOTSTRAP_NAME ||
      existing?.name ||
      (await ask("Tên hiển thị: ")),
  );
  if (!name) throw new Error("Tên hiển thị phải từ 2 đến 60 ký tự.");
  let password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) {
    password = await passwordPrompt("Mật khẩu mới (không hiển thị): ");
    const confirmation = await passwordPrompt("Nhập lại mật khẩu mới: ");
    if (password.normalize("NFKC") !== confirmation.normalize("NFKC"))
      throw new Error("Hai mật khẩu không khớp. CHƯA LƯU THAY ĐỔI.");
  }
  const problem = passwordProblem(password, email);
  if (problem) throw new Error(problem);
  await AdminUser.updateOne(
    { email },
    {
      $set: {
        name,
        passwordHash: await hashPassword(password),
        passwordUpdatedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
      $setOnInsert: { email },
    },
    { upsert: !resetting },
  );
  console.log(
    resetting
      ? "ĐÃ ĐẶT LẠI MẬT KHẨU THÀNH CÔNG. Đăng nhập bằng email và mật khẩu vừa nhập."
      : "ĐÃ TẠO TÀI KHOẢN THÀNH CÔNG. Đăng nhập bằng email và mật khẩu vừa nhập.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
