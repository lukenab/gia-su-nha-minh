import type { z } from "zod";

import { NextResponse } from "next/server";

import type { ServiceResult } from "./service.ts";

import { readJsonBody } from "../../../shared/server/api.ts";
import { requireAdminApi } from "../../admin-auth/server/guard";
import { objectIdSchema } from "../validation.ts";

/**
 * Shared shape for every admin write: session check first (before reading
 * the body), then id and body validation, then the service call. Errors are
 * returned as { error } with a status the form can show as-is. Request data
 * is never written to logs because it holds personal information.
 */
export async function adminMutation<S extends z.ZodType>(
  request: Request,
  options: {
    id?: string;
    schema: S;
    successStatus?: number;
    run: (
      input: z.infer<S>,
      operator: string,
    ) => Promise<ServiceResult<unknown>>;
  },
) {
  const auth = await requireAdminApi(request);
  if ("response" in auth) return auth.response;

  if (
    options.id !== undefined &&
    !objectIdSchema.safeParse(options.id).success
  ) {
    return NextResponse.json(
      { error: "Không tìm thấy bản ghi." },
      { status: 404 },
    );
  }

  const parsedBody = await readJsonBody(request);
  if ("response" in parsedBody) return parsedBody.response;

  const parsed = options.schema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại các trường đã nhập.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await options.run(parsed.data, auth.operator);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json(
      { ok: true, ...(result.data as object) },
      { status: options.successStatus ?? 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Chưa thể lưu thay đổi. Vui lòng thử lại sau." },
      { status: 503 },
    );
  }
}
