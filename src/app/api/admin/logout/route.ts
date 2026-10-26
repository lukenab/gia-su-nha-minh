import { NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/features/admin-auth/server/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Clear the current cookie and the older one that was scoped to /admin.
  // NextResponse.cookies.set() replaces cookies with the same name even when
  // their paths differ, so emit both Set-Cookie headers explicitly.
  for (const path of ["/", "/admin"]) {
    response.headers.append(
      "Set-Cookie",
      `${ADMIN_COOKIE}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=Lax`,
    );
  }
  return response;
}
