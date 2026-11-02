import type { State } from "./form-model.ts";

/** Sends the finished form and returns the reference code, or throws. */
export async function submitLearnerRequest(s: State): Promise<string> {
  const budgetMax =
    s.budgetChoice === "unknown"
      ? null
      : Number(
          s.budgetChoice === "custom"
            ? s.budgetCustom.replace(/\D/g, "")
            : s.budgetChoice,
        );
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: s.fullName.trim(),
      email: s.email.trim(),
      phone: s.phone.trim(),
      preferredChannel: s.preferredChannel,
      goal: s.goal,
      currentLevel: s.currentLevel,
      concerns: s.concerns,
      format: s.format,
      startTime: s.startTime,
      budgetMax,
      availabilitySlots: s.availabilitySlots,
      availabilityNote: s.availabilityNote.trim(),
      location: s.location.trim(),
      notes: s.notes.trim(),
      consent: s.consent,
      website: s.website,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error || "Chưa thể gửi yêu cầu lúc này.");
  return result.referenceCode;
}
