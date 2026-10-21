import { NextResponse } from "next/server";

import {
  createReferenceCode,
  invalidFields,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { TutorApplication } from "@/lib/tutor-application-model";
import { tutorApplicationSchema } from "@/lib/tutor-application-validation";

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
