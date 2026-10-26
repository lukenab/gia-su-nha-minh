/*
 * Filter helpers for the manual connection step. They narrow the list of
 * qualified tutors and show how a profile compares with a request. They do
 * not score, rank or pick anyone: the team decides.
 */
import { labelOf, slotLabels } from "../../shared/lib/options.ts";

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

const money = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

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
          label: "Nội dung dạy",
          hard: true,
          state: areas.some((area) => tutor.teachingAreas?.includes(area))
            ? "match"
            : "mismatch",
          detail: "Gia sư đăng ký dạy nội dung người học cần.",
        }
      : {
          key: "content",
          label: "Nội dung dạy",
          hard: true,
          state: "unknown",
          detail: "Người học chưa nêu mục tiêu cụ thể, cần trao đổi thêm.",
        },
  );

  const formats = tutorFormatsFor(request.format);
  checks.push(
    formats
      ? {
          key: "format",
          label: "Hình thức học",
          hard: true,
          state: formats.includes(tutor.format) ? "match" : "mismatch",
          detail: "Hình thức gia sư nhận dạy so với hình thức người học chọn.",
        }
      : {
          key: "format",
          label: "Hình thức học",
          hard: true,
          state: "unknown",
          detail: "Người học chưa xác định hình thức hoặc nhận cả hai.",
        },
  );

  checks.push(
    request.currentLevel === "unsure"
      ? {
          key: "level",
          label: "Trình độ hỗ trợ",
          hard: false,
          state: "unknown",
          detail: "Người học chưa xác định trình độ.",
        }
      : {
          key: "level",
          label: "Trình độ hỗ trợ",
          hard: false,
          state: tutor.learnerLevels?.includes(request.currentLevel)
            ? "match"
            : "mismatch",
          detail: "Gia sư có nhận dạy trình độ hiện tại của người học.",
        },
  );

  if (request.availabilitySlots?.length) {
    const shared = request.availabilitySlots.filter((slot) =>
      tutor.availabilitySlots?.includes(slot),
    );
    checks.push({
      key: "slots",
      label: "Lịch học",
      hard: false,
      state: shared.length ? "match" : "mismatch",
      detail: shared.length
        ? `Trùng: ${shared.map((slot) => labelOf(slotLabels, slot)).join(", ")}`
        : "Chưa có khung giờ trùng nhau.",
    });
  } else {
    checks.push({
      key: "slots",
      label: "Lịch học",
      hard: false,
      state: "unknown",
      detail:
        "Yêu cầu cũ chỉ có mô tả lịch dạng văn bản, cần đối chiếu thủ công.",
    });
  }

  if (request.budgetMax == null || tutor.expectedFee == null) {
    checks.push({
      key: "fee",
      label: "Học phí",
      hard: false,
      state: "unknown",
      detail:
        request.budgetMax == null
          ? "Người học chưa nêu ngân sách."
          : "Gia sư để học phí thỏa thuận.",
    });
  } else {
    checks.push({
      key: "fee",
      label: "Học phí",
      hard: false,
      state: tutor.expectedFee <= request.budgetMax ? "match" : "mismatch",
      detail: `Gia sư ${money(tutor.expectedFee)} / buổi, ngân sách ${money(request.budgetMax)}.`,
    });
  }

  return checks;
}

/** True when no hard criterion is a mismatch. */
export function passesHardCriteria(checks: readonly MatchCheck[]) {
  return checks.every((check) => !check.hard || check.state !== "mismatch");
}
