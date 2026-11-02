import { NextResponse } from "next/server";

import { loginWithPassword } from "@/features/admin-auth/server/auth";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminIsConfigured,
  createAdminSession,
} from "@/features/admin-auth/server/session";
import { readJsonBody } from "@/shared/server/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminIsConfigured()) {
    return NextResponse.json(
      { error: "The admin area is not configured." },
      { status: 503 },
    );
  }
  const parsed = await readJsonBody(request, "en");
  if ("response" in parsed) return parsed.response;
  const body = (parsed.body ?? {}) as { email?: unknown; password?: unknown };

  try {
    const result = await loginWithPassword(body.email, body.password);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_COOKIE,
      createAdminSession(result.data),
      adminCookieOptions,
    );
    return response;
  } catch (error) {
    console.error("[admin-auth]", error);
    return NextResponse.json(
      { error: "Could not sign in right now. Please try again later." },
      { status: 503 },
    );
  }
}
