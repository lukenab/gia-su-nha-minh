import { adminMutation } from "@/features/admin/server/api";
import { createConnection } from "@/features/admin/server/service";
import { createConnectionSchema } from "@/features/admin/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return adminMutation(request, {
    schema: createConnectionSchema,
    successStatus: 201,
    run: (input, actor) => createConnection(input, actor),
  });
}
