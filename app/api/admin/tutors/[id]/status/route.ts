import { adminMutation } from "@/lib/admin-api";
import { changeTutorStatus } from "@/lib/admin-service";
import { tutorStatusChangeSchema } from "@/lib/admin-validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: tutorStatusChangeSchema,
    run: (input, operator) => changeTutorStatus(id, input, operator),
  });
}
