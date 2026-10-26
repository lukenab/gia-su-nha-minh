import { adminMutation } from "@/lib/admin-api";
import { changeConnectionStatus } from "@/lib/admin-service";
import { connectionStatusChangeSchema } from "@/lib/admin-validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: connectionStatusChangeSchema,
    run: (input, operator) => changeConnectionStatus(id, input, operator),
  });
}
