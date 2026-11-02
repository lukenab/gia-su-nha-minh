import { confirmationSchema } from "@/features/admin/operations-validation";
import { adminMutation } from "@/features/admin/server/api";
import { confirmParty } from "@/features/admin/server/operations";
export const runtime = "nodejs";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: confirmationSchema,
    run: (input, actor) => confirmParty(id, input, actor),
  });
}
