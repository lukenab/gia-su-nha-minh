import { adminMutation } from "@/lib/admin-api";
import { setTutorNote } from "@/lib/admin-service";
import { internalNoteSchema } from "@/lib/admin-validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return adminMutation(request, {
    id,
    schema: internalNoteSchema,
    run: (input, operator) => setTutorNote(id, input.note, operator),
  });
}
