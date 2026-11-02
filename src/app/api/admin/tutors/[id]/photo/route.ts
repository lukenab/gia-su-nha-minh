import { NextResponse } from "next/server";

import { requireAdminApi } from "@/features/admin-auth/server/guard";
import { objectIdSchema } from "@/features/admin/validation";
import { TutorPhoto } from "@/features/tutor-applications/server/photo";
import { connectToDatabase } from "@/shared/server/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A tutor's profile photo, for signed-in admins only (never public). */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await context.params;
  if (!objectIdSchema.safeParse(id).success)
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  try {
    await connectToDatabase();
    const photo = (await TutorPhoto.findOne({ application: id }).lean()) as {
      contentType: string;
      data: { buffer: ArrayBuffer } | Buffer;
    } | null;
    if (!photo)
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    const bytes = Buffer.isBuffer(photo.data)
      ? photo.data
      : Buffer.from(photo.data.buffer);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": photo.contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load the photo. Please try again." },
      { status: 503 },
    );
  }
}
