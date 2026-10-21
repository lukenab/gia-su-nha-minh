import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminIsConfigured,
  checkAdminPassword,
  createAdminSession,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminIsConfigured()) {
    return NextResponse.json(
      { error: "Tài khoản quản trị chưa được cấu hình." },
      { status: 503 },
    );
  }

  let password: unknown;
  try {
    const body = await request.json();
    password = body.password;
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || !checkAdminPassword(password)) {
    return NextResponse.json(
      { error: "Mật khẩu không đúng." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), adminCookieOptions);
  return response;
}
