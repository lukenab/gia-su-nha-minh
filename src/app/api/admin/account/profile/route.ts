import { NextResponse } from "next/server";

import { updateDisplayName } from "@/features/admin-auth/server/account";
import { requireAdminApi } from "@/features/admin-auth/server/guard";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSession,
} from "@/features/admin-auth/server/session";
import { readJsonBody } from "@/shared/server/api";

export const runtime = "nodejs";

/** Changes the display name and re-issues the cookie that carries it. */
export async function PATCH(request: Request) {
  const auth = await requireAdminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = await readJsonBody(request, "en");
  if ("response" in parsed) return parsed.response;
  const body = (parsed.body ?? {}) as { name?: unknown };
  try {
    const result = await updateDisplayName(auth.identity, body.name);
    if (!result.ok)
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    const response = NextResponse.json({
      ok: true,
      name: result.data.operator,
    });
    response.cookies.set(
      ADMIN_COOKIE,
      createAdminSession(result.data),
      adminCookieOptions,
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not save the changes. Please try again later." },
      { status: 503 },
    );
  }
}
