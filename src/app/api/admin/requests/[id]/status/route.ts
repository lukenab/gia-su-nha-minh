import { adminMutation } from "@/features/admin/server/api";
import { changeLearnerStatus } from "@/features/admin/server/service";
import { learnerStatusChangeSchema } from "@/features/admin/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: learnerStatusChangeSchema,
    run: (input, operator) => changeLearnerStatus(id, input, operator),
  });
}
