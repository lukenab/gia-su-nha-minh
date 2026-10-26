import { adminMutation } from "@/features/admin/server/api";
import { setTutorReview } from "@/features/admin/server/service";
import { tutorReviewSchema } from "@/features/admin/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: tutorReviewSchema,
    run: (input, operator) => setTutorReview(id, input, operator),
  });
}
