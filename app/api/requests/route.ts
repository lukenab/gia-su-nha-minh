import { NextResponse } from "next/server";

import {
  createReferenceCode,
  invalidFields,
  readJsonBody,
  serviceUnavailable,
} from "@/lib/api";
import { LearnerRequest } from "@/lib/learner-request-model";
import {
  describeAvailability,
  learnerRequestSchema,
} from "@/lib/learner-request-validation";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

/** Learner request intake (POST /api/requests). */
export async function POST(request: Request) {
  const read = await readJsonBody(request);
  if ("response" in read) return read.response;

  const parsed = learnerRequestSchema.safeParse(read.body);
  if (!parsed.success) return invalidFields(parsed.error.flatten().fieldErrors);
  const data = parsed.data;

  try {
    await connectToDatabase();
    const referenceCode = createReferenceCode("GSNM");
    await LearnerRequest.create({
      referenceCode,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      preferredChannel: data.preferredChannel,
      goal: data.goal,
      currentLevel: data.currentLevel,
      concerns: data.concerns,
      format: data.format,
      startTime: data.startTime,
      budgetMax: data.budgetMax,
      availabilitySlots: data.availabilitySlots,
      availability: describeAvailability(
        data.availabilitySlots,
        data.availabilityNote,
      ),
      location: data.location,
      notes: data.notes,
      consentAt: new Date(),
    });
    return NextResponse.json({ referenceCode }, { status: 201 });
  } catch {
    return serviceUnavailable();
  }
}
