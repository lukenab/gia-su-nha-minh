import { adminMutation } from "@/features/admin/server/api";
import { changeConnectionStatus } from "@/features/admin/server/service";
import { connectionStatusChangeSchema } from "@/features/admin/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: connectionStatusChangeSchema,
    run: (input, actor) => changeConnectionStatus(id, input, actor),
  });
}
