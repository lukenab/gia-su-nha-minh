import { adminMutation } from "@/features/admin/server/api";
import { setLearnerNote } from "@/features/admin/server/service";
import { internalNoteSchema } from "@/features/admin/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: internalNoteSchema,
    run: (input, actor) => setLearnerNote(id, input.note, actor),
  });
}
