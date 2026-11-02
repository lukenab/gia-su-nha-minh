import { paymentSchema } from "@/features/admin/operations-validation";
import { adminMutation } from "@/features/admin/server/api";
import { recordPayment } from "@/features/admin/server/operations";
export const runtime = "nodejs";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: paymentSchema,
    run: (input, actor) => recordPayment(id, input, actor),
  });
}
