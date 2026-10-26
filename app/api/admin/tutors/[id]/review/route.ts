import { adminMutation } from "@/lib/admin-api";
import { setTutorReview } from "@/lib/admin-service";
import { tutorReviewSchema } from "@/lib/admin-validation";

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
