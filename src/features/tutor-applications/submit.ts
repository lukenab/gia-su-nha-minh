import type { State } from "./form-model.ts";

/** Sends the finished application and returns the reference code, or throws. */
export async function submitTutorApplication(s: State): Promise<string> {
  const expectedFee =
    s.feeChoice === "negotiable"
      ? null
      : Number(
          s.feeChoice === "custom"
            ? s.feeCustom.replace(/\D/g, "")
            : s.feeChoice,
        );
  const response = await fetch("/api/tutor-applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: s.fullName.trim(),
      email: s.email.trim(),
      phone: s.phone.trim(),
      preferredChannel: s.preferredChannel,
      teachingAreas: s.teachingAreas,
      learnerLevels: s.learnerLevels,
      experience: s.experience,
      experienceNote: s.experienceNote.trim(),
      certificates: s.certificates.trim(),
      format: s.format,
      area: s.area.trim(),
      availabilitySlots: s.availabilitySlots,
      expectedFee,
      consent: s.consent,
      website: s.website,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error || "Chưa thể gửi hồ sơ lúc này.");
  return result.referenceCode;
}
