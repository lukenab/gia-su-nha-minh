import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { ADMIN_PATH_HEADER } from "../admin-path";
import { createAdminActor, type AdminActor } from "./actor.ts";
import { getAdminSession } from "./session";
import { safeNextPath } from "./token";

/**
 * Every admin read and write checks the session on the server. Layouts alone
 * are not enough because pages and route handlers run independently.
 */
export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    const requested = safeNextPath((await headers()).get(ADMIN_PATH_HEADER));
    redirect(
      requested === "/admin"
        ? "/admin/login"
        : `/admin/login?next=${encodeURIComponent(requested)}`,
    );
  }
  return session;
}

export async function requireAdminPage(): Promise<AdminActor> {
  return createAdminActor((await requireAdminSession()).operator);
}

export async function requireAdminApi(
  request?: Request,
): Promise<{ actor: AdminActor } | { response: NextResponse }> {
  const session = await getAdminSession();
  if (!session) {
    return {
      response: NextResponse.json(
        { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
        { status: 401 },
      ),
    };
  }
  // Defence in depth on top of SameSite=Strict for state-changing calls.
  const origin = request?.headers.get("origin");
  const host = request?.headers.get("host");
  if (origin && host) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      /* treated as a mismatch below */
    }
    if (originHost !== host) {
      return {
        response: NextResponse.json(
          { error: "Yêu cầu không hợp lệ." },
          { status: 403 },
        ),
      };
    }
  }
  return { actor: createAdminActor(session.operator) };
}
