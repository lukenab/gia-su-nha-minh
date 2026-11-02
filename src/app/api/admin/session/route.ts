import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/features/admin-auth/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tells the caller only whether their own cookie is a valid admin session.
 * The public site uses it to show a "Vào quản trị" shortcut to signed-in staff.
 */
export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json(
    { authenticated },
    { headers: { "Cache-Control": "no-store" } },
  );
}
