import { NextResponse } from "next/server";

import { loginWithPassword } from "@/lib/admin-auth";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminIsConfigured,
  createAdminSession,
} from "@/lib/admin-session";
import { readJsonBody } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminIsConfigured()) {
    return NextResponse.json(
      { error: "Khu vực quản trị chưa được cấu hình." },
      { status: 503 },
    );
  }
  const parsed = await readJsonBody(request);
  if ("response" in parsed) return parsed.response;
  const body = (parsed.body ?? {}) as { email?: unknown; password?: unknown };

  try {
    const result = await loginWithPassword(body.email, body.password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSession(result.data), adminCookieOptions);
    return response;
  } catch (error) {
    console.error("[admin-auth]", error);
    return NextResponse.json(
      { error: "Chưa thể đăng nhập lúc này. Vui lòng thử lại sau." },
      { status: 503 },
    );
  }
}
