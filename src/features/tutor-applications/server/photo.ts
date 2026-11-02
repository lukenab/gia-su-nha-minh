import "server-only";
import mongoose, { Schema } from "mongoose";

import { PHOTO_MAX_BYTES } from "../validation.ts";

/*
 * Tutor profile photos, kept apart from the application so lists never load
 * image data. Only signed-in admins can read them (see the admin photo
 * route); they are shown to a learner only when the team introduces a tutor.
 */
const tutorPhotoSchema = new Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true, collection: "tutor_photos" },
);

export const TutorPhoto =
  mongoose.models.TutorPhoto || mongoose.model("TutorPhoto", tutorPhotoSchema);

/** Decodes the photo data URL; returns null unless it is a real JPEG. */
export function decodePhoto(dataUrl: string) {
  const data = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  const isJpeg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  return isJpeg && data.length <= PHOTO_MAX_BYTES ? data : null;
}
