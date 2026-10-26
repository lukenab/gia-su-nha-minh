import { adminMutation } from "@/features/admin/server/api";
import { changeTutorStatus } from "@/features/admin/server/service";
import { tutorStatusChangeSchema } from "@/features/admin/validation";

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
