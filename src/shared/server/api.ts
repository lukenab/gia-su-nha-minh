import "server-only";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const MAX_BODY = 10_000;

/** Public forms answer in Vietnamese; the admin API answers in English. */
const BODY_ERRORS = {
  vi: {
    type: "Định dạng yêu cầu không hợp lệ.",
    size: "Yêu cầu vượt quá giới hạn dữ liệu.",
    json: "Dữ liệu gửi lên không hợp lệ.",
  },
  en: {
    type: "The request format is not valid.",
    size: "The request is too large.",
    json: "The submitted data is not valid.",
  },
};

/** Parses a small JSON request body or returns an error response. */
export async function readJsonBody(
  request: Request,
  language: keyof typeof BODY_ERRORS = "vi",
  /** Larger only for forms that carry a small image. */
  maxBody = MAX_BODY,
): Promise<{ body: unknown } | { response: NextResponse }> {
  const errors = BODY_ERRORS[language];
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {
      response: NextResponse.json({ error: errors.type }, { status: 415 }),
    };
  }
  try {
    const raw = await request.text();
    if (raw.length > maxBody) {
      return {
        response: NextResponse.json({ error: errors.size }, { status: 413 }),
      };
    }
    return { body: JSON.parse(raw) };
  } catch {
    return {
      response: NextResponse.json({ error: errors.json }, { status: 400 }),
    };
  }
}

/** Reference code such as GSNM-20261021-1A2B3C4D (prefix varies by form). */
export function createReferenceCode(prefix: "GSNM" | "GSNM-GS") {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${prefix}-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function invalidFields(
  fieldErrors: Record<string, string[] | undefined>,
) {
  return NextResponse.json(
    { error: "Vui lòng kiểm tra lại thông tin đã nhập.", fields: fieldErrors },
    { status: 400 },
  );
}

export function serviceUnavailable() {
  return NextResponse.json(
    { error: "Hệ thống chưa thể tiếp nhận thông tin. Vui lòng thử lại sau." },
    { status: 503 },
  );
}
