import { NextResponse } from "next/server";

import { requireAdminApi } from "@/features/admin-auth/server/guard";
import {
  getNavCounts,
  getNotifications,
} from "@/features/admin/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Header notifications and the sidebar badge counts, in one request. */
export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if ("response" in auth) return auth.response;
  try {
    const [items, counts] = await Promise.all([
      getNotifications(auth.actor),
      getNavCounts(auth.actor),
    ]);
    return NextResponse.json(
      { items, counts },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load notifications. Please try again." },
      { status: 503 },
    );
  }
}
