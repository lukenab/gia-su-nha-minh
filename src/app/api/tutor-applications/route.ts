import { NextResponse } from "next/server";

import { TutorApplication } from "@/features/tutor-applications/server/model";
import { tutorApplicationSchema } from "@/features/tutor-applications/validation";
import {
  createReferenceCode,
  invalidFields,
  readJsonBody,
  serviceUnavailable,
} from "@/shared/server/api";
import { connectToDatabase } from "@/shared/server/mongodb";

export const runtime = "nodejs";

/** Tutor application intake (POST /api/tutor-applications). */
export async function POST(request: Request) {
  const read = await readJsonBody(request);
  if ("response" in read) return read.response;

  const parsed = tutorApplicationSchema.safeParse(read.body);
  if (!parsed.success) return invalidFields(parsed.error.flatten().fieldErrors);
  const data = parsed.data;

  try {
    await connectToDatabase();
    const referenceCode = createReferenceCode("GSNM-GS");
    await TutorApplication.create({
      referenceCode,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      preferredChannel: data.preferredChannel,
      teachingAreas: data.teachingAreas,
      learnerLevels: data.learnerLevels,
      experience: data.experience,
      experienceNote: data.experienceNote,
      certificates: data.certificates,
      format: data.format,
      area: data.area,
      availabilitySlots: data.availabilitySlots,
      expectedFee: data.expectedFee,
      consentAt: new Date(),
    });
    return NextResponse.json({ referenceCode }, { status: 201 });
  } catch {
    return serviceUnavailable();
  }
}
