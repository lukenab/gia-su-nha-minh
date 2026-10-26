import { adminMutation } from "@/lib/admin-api";
import { createConnection } from "@/lib/admin-service";
import { createConnectionSchema } from "@/lib/admin-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return adminMutation(request, {
    schema: createConnectionSchema,
    successStatus: 201,
    run: (input, operator) => createConnection(input, operator),
  });
}
