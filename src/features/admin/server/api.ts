import "server-only";
import type { z } from "zod";

import { NextResponse } from "next/server";

import type { AdminActor } from "../../admin-auth/server/actor.ts";
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
      actor: AdminActor,
    ) => Promise<ServiceResult<unknown>>;
  },
) {
  const auth = await requireAdminApi(request);
  if ("response" in auth) return auth.response;

  if (
    options.id !== undefined &&
    !objectIdSchema.safeParse(options.id).success
  ) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  const parsedBody = await readJsonBody(request, "en");
  if ("response" in parsedBody) return parsedBody.response;

  const parsed = options.schema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some fields are not valid. Check what you entered.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await options.run(parsed.data, auth.actor);
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
      { error: "Could not save the changes. Please try again later." },
      { status: 503 },
    );
  }
}
