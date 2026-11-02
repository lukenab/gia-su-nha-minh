import { NextResponse } from "next/server";

import { resetPassword } from "@/features/admin-auth/server/auth";
import { readJsonBody } from "@/shared/server/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = await readJsonBody(request, "en");
  if ("response" in parsed) return parsed.response;
  const body = (parsed.body ?? {}) as {
    token?: unknown;
    password?: unknown;
    name?: unknown;
  };
  try {
    const result = await resetPassword({
      token: body.token,
      password: body.password,
      name: body.name,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin-auth]", error);
    return NextResponse.json(
      {
        error: "Could not set the password right now. Please try again later.",
      },
      { status: 503 },
    );
  }
}
