import { NextResponse } from "next/server";

import { TutorApplication } from "@/features/tutor-applications/server/model";
import {
  TutorPhoto,
  decodePhoto,
} from "@/features/tutor-applications/server/photo";
import {
  describeCertificates,
  tutorApplicationSchema,
} from "@/features/tutor-applications/validation";
import {
  createReferenceCode,
  invalidFields,
  readJsonBody,
  serviceUnavailable,
} from "@/shared/server/api";
import { connectToDatabase } from "@/shared/server/mongodb";

export const runtime = "nodejs";

/** The form text plus one resized photo (about 300 KB at most). */
const MAX_BODY = 480_000;

/** Tutor application intake (POST /api/tutor-applications). */
export async function POST(request: Request) {
  const read = await readJsonBody(request, "vi", MAX_BODY);
  if ("response" in read) return read.response;

  const parsed = tutorApplicationSchema.safeParse(read.body);
  if (!parsed.success) return invalidFields(parsed.error.flatten().fieldErrors);
  const data = parsed.data;
  const photo = data.photo ? decodePhoto(data.photo) : null;
  if (data.photo && !photo)
    return invalidFields({
      photo: ["Ảnh chân dung cần là ảnh JPG dưới 300 KB."],
    });

  try {
    await connectToDatabase();
    const now = new Date();
    const referenceCode = createReferenceCode("GSNM-GS");
    const created = await TutorApplication.create({
      referenceCode,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      phoneHasZalo: data.phoneHasZalo,
      // The team calls or messages the phone number.
      preferredChannel: data.phoneHasZalo ? "zalo" : "phone",
      education: data.education,
      school: data.school,
      certificateList: data.certificateList,
      certificates: describeCertificates(data.certificateList),
      teachingAreas: data.teachingAreas,
      otherTeachingArea: data.otherTeachingArea,
      // Someone applying is looking for learners; the team can pause it later.
      acceptingStudents: true,
      learnerLevels: data.learnerLevels,
      experience: data.experience,
      // The introduction is kept in the existing "experience note" field.
      experienceNote: data.bio,
      format: data.format,
      area: data.area,
      availabilitySlots: data.availabilitySlots,
      expectedFee: data.expectedFee,
      hasPhoto: Boolean(photo),
      consentAt: now,
      consents: { privacyAt: now, accuracyAt: now, verificationAt: now },
    });
    if (photo)
      try {
        await TutorPhoto.create({
          application: created._id,
          contentType: "image/jpeg",
          data: photo,
          size: photo.length,
        });
      } catch (error) {
        // Never keep an application whose photo was not saved.
        await TutorApplication.deleteOne({ _id: created._id });
        throw error;
      }
    return NextResponse.json({ referenceCode }, { status: 201 });
  } catch {
    return serviceUnavailable();
  }
}
