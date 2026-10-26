import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/features/admin-auth/server/auth";
import { appOrigin } from "@/features/admin-auth/server/google-oauth";
import { readJsonBody } from "@/shared/server/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if ("response" in parsed) return parsed.response;
  const email = (parsed.body as { email?: unknown } | null)?.email;
  try {
    await requestPasswordReset(email, appOrigin(request));
  } catch (error) {
    console.error("[admin-auth]", error);
    return NextResponse.json(
      { error: "Chưa thể xử lý yêu cầu lúc này. Vui lòng thử lại sau." },
      { status: 503 },
    );
  }
  // Same answer whether or not the address is on the team.
  return NextResponse.json({ ok: true });
}
