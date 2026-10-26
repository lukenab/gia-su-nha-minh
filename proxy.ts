import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_PATH_HEADER } from "@/lib/admin-path";

/**
 * Passes the requested admin URL to server pages so that, when a signed-out
 * visitor is sent to the login page, they can return to where they were going.
 * It does not make access decisions: every page and API still checks the session.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(ADMIN_PATH_HEADER, request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/admin/:path*"] };
