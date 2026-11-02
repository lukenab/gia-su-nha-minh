import { NextResponse } from "next/server";

import { changePassword } from "@/features/admin-auth/server/account";
import { requireAdminApi } from "@/features/admin-auth/server/guard";
import { readJsonBody } from "@/shared/server/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = await readJsonBody(request, "en");
  if ("response" in parsed) return parsed.response;
  const body = (parsed.body ?? {}) as { current?: unknown; next?: unknown };
  try {
    const result = await changePassword(auth.identity, body.current, body.next);
    return result.ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: result.error }, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: "Could not change the password. Please try again later." },
      { status: 503 },
    );
  }
}
