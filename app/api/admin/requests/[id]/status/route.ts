import { adminMutation } from "@/lib/admin-api";
import { changeLearnerStatus } from "@/lib/admin-service";
import { learnerStatusChangeSchema } from "@/lib/admin-validation";

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
