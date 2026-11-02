/*
 * Filter helpers for the manual connection step. They narrow the list of
 * qualified tutors and show how a profile compares with a request. They do
 * not score, rank or pick anyone: the team decides.
 */
import { labelOf, slotLabels } from "./labels.ts";

export type MatchRequest = {
  goal: string;
  currentLevel: string;
  format: string;
  budgetMax?: number | null;
  availabilitySlots?: readonly string[] | null;
};

export type MatchTutor = {
  teachingAreas?: readonly string[] | null;
  learnerLevels?: readonly string[] | null;
  format: string;
  availabilitySlots?: readonly string[] | null;
  expectedFee?: number | null;
};

export type SoftFilters = { level: boolean; slots: boolean; fee: boolean };
export const noSoftFilters: SoftFilters = {
  level: false,
  slots: false,
  fee: false,
};

/** Teaching areas that satisfy each learner goal. Others are not filtered. */
const goalAreas: Record<string, readonly string[]> = {
  foundation: ["foundation"],
  communication: ["communication"],
  work: ["work"],
  ielts: ["ielts"],
  toeic: ["toeic"],
};

export function areasForGoal(goal: string): readonly string[] | null {
  return goalAreas[goal] ?? null;
}

/** Tutor formats that can serve a learner format. `null` means any. */
export function tutorFormatsFor(format: string): readonly string[] | null {
  if (format === "online") return ["online", "either"];
  if (format === "in_person") return ["in_person", "either"];
  return null;
}

/** MongoDB filter for qualified tutors; the caller adds the status. */
export function buildTutorFilter(
  request: MatchRequest,
  soft: SoftFilters = noSoftFilters,
): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  const areas = areasForGoal(request.goal);
  if (areas) filter.teachingAreas = { $in: areas };
  const formats = tutorFormatsFor(request.format);
  if (formats) filter.format = { $in: formats };

  const and: Record<string, unknown>[] = [];
  if (soft.level && request.currentLevel !== "unsure") {
    and.push({ learnerLevels: request.currentLevel });
  }
  if (soft.slots && request.availabilitySlots?.length) {
    and.push({ availabilitySlots: { $in: request.availabilitySlots } });
  }
  if (soft.fee && request.budgetMax != null) {
    and.push({
      $or: [
        { expectedFee: null },
        { expectedFee: { $lte: request.budgetMax } },
      ],
    });
  }
  if (and.length) filter.$and = and;
  return filter;
}

export type CheckState = "match" | "mismatch" | "unknown";
export type MatchCheck = {
  key: "content" | "format" | "level" | "slots" | "fee";
  label: string;
  hard: boolean;
  state: CheckState;
  detail: string;
};

const money = (value: number) => `${value.toLocaleString("en-US")} VND`;

export function compareTutor(
  request: MatchRequest,
  tutor: MatchTutor,
): MatchCheck[] {
  const checks: MatchCheck[] = [];

  const areas = areasForGoal(request.goal);
  checks.push(
    areas
      ? {
          key: "content",
          label: "Teaching content",
          hard: true,
          state: areas.some((area) => tutor.teachingAreas?.includes(area))
            ? "match"
            : "mismatch",
          detail: "The tutor teaches the content the learner needs.",
        }
      : {
          key: "content",
          label: "Teaching content",
          hard: true,
          state: "unknown",
          detail: "The learner has no specific goal yet. Discuss it with them.",
        },
  );

  const formats = tutorFormatsFor(request.format);
  checks.push(
    formats
      ? {
          key: "format",
          label: "Lesson format",
          hard: true,
          state: formats.includes(tutor.format) ? "match" : "mismatch",
          detail:
            "The tutor's format compared with the format the learner chose.",
        }
      : {
          key: "format",
          label: "Lesson format",
          hard: true,
          state: "unknown",
          detail: "The learner has not decided, or accepts either format.",
        },
  );

  checks.push(
    request.currentLevel === "unsure"
      ? {
          key: "level",
          label: "Supported level",
          hard: false,
          state: "unknown",
          detail: "The learner is not sure of their level.",
        }
      : {
          key: "level",
          label: "Supported level",
          hard: false,
          state: tutor.learnerLevels?.includes(request.currentLevel)
            ? "match"
            : "mismatch",
          detail: "The tutor teaches the learner's current level.",
        },
  );

  if (request.availabilitySlots?.length) {
    const shared = request.availabilitySlots.filter((slot) =>
      tutor.availabilitySlots?.includes(slot),
    );
    checks.push({
      key: "slots",
      label: "Schedule",
      hard: false,
      state: shared.length ? "match" : "mismatch",
      detail: shared.length
        ? `Overlap: ${shared.map((slot) => labelOf(slotLabels, slot)).join(", ")}`
        : "No overlapping time slots yet.",
    });
  } else {
    checks.push({
      key: "slots",
      label: "Schedule",
      hard: false,
      state: "unknown",
      detail:
        "Older requests only describe the schedule as text. Compare it manually.",
    });
  }

  if (request.budgetMax == null || tutor.expectedFee == null) {
    checks.push({
      key: "fee",
      label: "Fee",
      hard: false,
      state: "unknown",
      detail:
        request.budgetMax == null
          ? "The learner has not given a budget."
          : "The tutor's fee is negotiable.",
    });
  } else {
    checks.push({
      key: "fee",
      label: "Fee",
      hard: false,
      state: tutor.expectedFee <= request.budgetMax ? "match" : "mismatch",
      detail: `Tutor ${money(tutor.expectedFee)} / lesson, budget ${money(request.budgetMax)}.`,
    });
  }

  return checks;
}

/** True when no hard criterion is a mismatch. */
export function passesHardCriteria(checks: readonly MatchCheck[]) {
  return checks.every((check) => !check.hard || check.state !== "mismatch");
}
