/*
 * Writes for the /admin workflow. Callers (route handlers) must already have
 * checked the admin session; the operator name comes from that session.
 *
 * Every status change is conditional on the status the person saw ("from"),
 * so a double click or a second admin working from a stale page gets a clear
 * conflict instead of a silent overwrite or a duplicate history entry.
 */
import mongoose from "mongoose";

import { Connection } from "./connection-model.ts";
import { LearnerRequest } from "./learner-request-model.ts";
import { connectToDatabase } from "./mongodb.ts";
import { TutorApplication } from "./tutor-application-model.ts";
import {
  MIN_REASON_LENGTH,
  canTransition,
  normalizeStatus,
  statusLabel,
  statusNeedsNote,
  type ConnectionStatus,
  type LearnerStatus,
  type TutorStatus,
} from "./workflow.ts";

export type ServiceResult<T = Record<string, never>> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

const fail = (status: number, error: string): ServiceResult<never> => ({
  ok: false,
  status,
  error,
});
const ok = <T>(data: T): ServiceResult<T> => ({ ok: true, data });

const STALE =
  "Trạng thái đã thay đổi ở nơi khác. Hãy tải lại trang để xem trạng thái mới nhất.";
const NOT_FOUND = "Không tìm thấy bản ghi.";

export const CONNECTABLE_REQUEST_STATUSES: readonly LearnerStatus[] = [
  "CONTACTED",
  "SEARCHING",
  "INTRODUCED",
];

function reasonProblem(
  kind: "learner" | "tutor" | "connection",
  to: string,
  note: string,
) {
  if (
    statusNeedsNote(kind, to as never) &&
    note.trim().length < MIN_REASON_LENGTH
  ) {
    return `Vui lòng ghi lý do khi chuyển sang “${statusLabel(kind, to)}”.`;
  }
  return null;
}

/* ------------------------- learner requests ------------------------- */

export async function changeLearnerStatus(
  id: string,
  input: { from: LearnerStatus; to: LearnerStatus; note: string },
  operator: string,
): Promise<ServiceResult<{ status: LearnerStatus }>> {
  await connectToDatabase();
  const current = await LearnerRequest.findById(id)
    .select("status contactedAt")
    .lean();
  if (!current) return fail(404, NOT_FOUND);

  const from = normalizeStatus("learner", current.status);
  if (from !== input.from) return fail(409, STALE);
  if (!canTransition("learner", from, input.to)) {
    return fail(
      422,
      `Không thể chuyển từ “${statusLabel("learner", from)}” sang “${statusLabel("learner", input.to)}”.`,
    );
  }
  const problem = reasonProblem("learner", input.to, input.note);
  if (problem) return fail(422, problem);

  const now = new Date();
  const set: Record<string, unknown> = {
    status: input.to,
    statusUpdatedAt: now,
    statusUpdatedBy: operator,
  };
  // The 24-hour clock stops only when the team records the first contact.
  if (input.to === "CONTACTED" && !current.contactedAt) set.contactedAt = now;

  const updated = await LearnerRequest.findOneAndUpdate(
    { _id: id, status: current.status },
    {
      $set: set,
      $push: {
        statusHistory: {
          from,
          to: input.to,
          at: now,
          by: operator,
          note: input.note,
        },
      },
    },
    { new: true },
  )
    .select("status")
    .lean();
  if (!updated) return fail(409, STALE);
  return ok({ status: input.to });
}

export async function setLearnerNote(
  id: string,
  note: string,
  operator: string,
): Promise<ServiceResult> {
  await connectToDatabase();
  const result = await LearnerRequest.updateOne(
    { _id: id },
    {
      $set: {
        internalNote: note,
        internalNoteUpdatedAt: new Date(),
        internalNoteUpdatedBy: operator,
      },
    },
  );
  return result.matchedCount ? ok({}) : fail(404, NOT_FOUND);
}

/* ---------------------------- tutor profiles ---------------------------- */

export const reviewChecks = ["identity", "certificates", "experience"] as const;
export type ReviewCheck = (typeof reviewChecks)[number];
export const reviewLabels: Record<ReviewCheck, string> = {
  identity: "Danh tính",
  certificates: "Chứng chỉ",
  experience: "Kinh nghiệm",
};

type ReviewsShape = Partial<
  Record<ReviewCheck, { reviewed?: boolean } | undefined>
>;

export function missingReviews(reviews: ReviewsShape | null | undefined) {
  return reviewChecks.filter((check) => !reviews?.[check]?.reviewed);
}

export async function changeTutorStatus(
  id: string,
  input: { from: TutorStatus; to: TutorStatus; note: string },
  operator: string,
): Promise<ServiceResult<{ status: TutorStatus }>> {
  await connectToDatabase();
  const current = await TutorApplication.findById(id)
    .select("status reviews")
    .lean();
  if (!current) return fail(404, NOT_FOUND);

  const from = normalizeStatus("tutor", current.status);
  if (from !== input.from) return fail(409, STALE);
  if (!canTransition("tutor", from, input.to)) {
    return fail(
      422,
      `Không thể chuyển từ “${statusLabel("tutor", from)}” sang “${statusLabel("tutor", input.to)}”.`,
    );
  }
  const problem = reasonProblem("tutor", input.to, input.note);
  if (problem) return fail(422, problem);

  // A submitted form never counts as verified: each check is recorded apart.
  if (input.to === "ELIGIBLE") {
    const missing = missingReviews(current.reviews);
    if (missing.length) {
      return fail(
        422,
        `Cần ghi nhận đã xem xét ${missing.map((check) => reviewLabels[check].toLowerCase()).join(", ")} trước khi đánh dấu đủ điều kiện giới thiệu.`,
      );
    }
  }

  const now = new Date();
  const filter: Record<string, unknown> = { _id: id, status: current.status };
  if (input.to === "ELIGIBLE") {
    for (const check of reviewChecks)
      filter[`reviews.${check}.reviewed`] = true;
  }
  const updated = await TutorApplication.findOneAndUpdate(
    filter,
    {
      $set: {
        status: input.to,
        statusUpdatedAt: now,
        statusUpdatedBy: operator,
      },
      $push: {
        statusHistory: {
          from,
          to: input.to,
          at: now,
          by: operator,
          note: input.note,
        },
      },
    },
    { new: true },
  )
    .select("status")
    .lean();
  if (!updated) return fail(409, STALE);
  return ok({ status: input.to });
}

export async function setTutorReview(
  id: string,
  input: {
    check: ReviewCheck;
    reviewed: boolean;
    note: string;
    reviewedOn?: string;
  },
  operator: string,
): Promise<ServiceResult> {
  if (input.reviewed && input.note.trim().length < MIN_REASON_LENGTH) {
    return fail(
      422,
      "Vui lòng ghi chú ngắn gọn bạn đã xem xét những gì (ví dụ giấy tờ, nguồn đối chiếu).",
    );
  }
  let reviewedAt: Date | null = null;
  if (input.reviewed) {
    reviewedAt = input.reviewedOn
      ? new Date(`${input.reviewedOn}T12:00:00+07:00`)
      : new Date();
    if (Number.isNaN(reviewedAt.getTime()))
      return fail(422, "Ngày xem xét không hợp lệ.");
    if (reviewedAt.getTime() > Date.now() + 24 * 3600 * 1000)
      return fail(422, "Ngày xem xét không thể ở tương lai.");
  }

  await connectToDatabase();
  // Reviews can only change while the profile is being reviewed, so an
  // "eligible" profile cannot silently lose the evidence behind it.
  const result = await TutorApplication.updateOne(
    { _id: id, status: "REVIEWING" },
    {
      $set: {
        [`reviews.${input.check}`]: {
          reviewed: input.reviewed,
          reviewedAt,
          reviewedBy: input.reviewed ? operator : "",
          note: input.note,
        },
      },
    },
  );
  if (result.matchedCount) return ok({});
  const exists = await TutorApplication.exists({ _id: id });
  return exists
    ? fail(
        409,
        "Chỉ ghi nhận xem xét khi hồ sơ đang ở trạng thái “Đang xem xét”.",
      )
    : fail(404, NOT_FOUND);
}

export async function setTutorNote(
  id: string,
  note: string,
  operator: string,
): Promise<ServiceResult> {
  await connectToDatabase();
  const result = await TutorApplication.updateOne(
    { _id: id },
    {
      $set: {
        internalNote: note,
        internalNoteUpdatedAt: new Date(),
        internalNoteUpdatedBy: operator,
      },
    },
  );
  return result.matchedCount ? ok({}) : fail(404, NOT_FOUND);
}

/* ------------------------------ connections ------------------------------ */

export async function createConnection(
  input: { requestId: string; tutorId: string; note: string },
  operator: string,
): Promise<ServiceResult<{ id: string }>> {
  await connectToDatabase();
  const [request, tutor] = await Promise.all([
    LearnerRequest.findById(input.requestId)
      .select("referenceCode status")
      .lean(),
    TutorApplication.findById(input.tutorId)
      .select("referenceCode status")
      .lean(),
  ]);
  if (!request || !tutor) return fail(404, NOT_FOUND);

  const requestStatus = normalizeStatus("learner", request.status);
  if (!CONNECTABLE_REQUEST_STATUSES.includes(requestStatus)) {
    return fail(
      422,
      requestStatus === "NEW"
        ? "Hãy liên hệ người học và ghi nhận “Đã liên hệ” trước khi kết nối gia sư."
        : `Không thể thêm kết nối khi yêu cầu đang ở trạng thái “${statusLabel("learner", requestStatus)}”.`,
    );
  }
  if (normalizeStatus("tutor", tutor.status) !== "ELIGIBLE") {
    return fail(
      422,
      "Chỉ hồ sơ gia sư đã được đánh dấu “Đủ điều kiện giới thiệu” mới có thể được kết nối.",
    );
  }

  // Make sure the unique index exists before relying on it for duplicates.
  await Connection.init();
  const now = new Date();
  try {
    const created = await Connection.create({
      request: request._id,
      tutor: tutor._id,
      requestCode: request.referenceCode,
      tutorCode: tutor.referenceCode,
      status: "REVIEWING",
      statusUpdatedAt: now,
      statusUpdatedBy: operator,
      createdBy: operator,
      history: [
        { from: "", to: "REVIEWING", at: now, by: operator, note: input.note },
      ],
    });
    return ok({ id: String(created._id) });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return fail(409, "Gia sư này đã được ghi nhận cho yêu cầu này.");
    }
    throw error;
  }
}

export async function changeConnectionStatus(
  id: string,
  input: { from: ConnectionStatus; to: ConnectionStatus; note: string },
  operator: string,
): Promise<ServiceResult<{ status: ConnectionStatus }>> {
  await connectToDatabase();
  const current = await Connection.findById(id)
    .select("status tutor introducedAt startedAt")
    .lean();
  if (!current) return fail(404, NOT_FOUND);

  const from = normalizeStatus("connection", current.status);
  if (from !== input.from) return fail(409, STALE);
  if (!canTransition("connection", from, input.to)) {
    return fail(
      422,
      `Không thể chuyển từ “${statusLabel("connection", from)}” sang “${statusLabel("connection", input.to)}”.`,
    );
  }
  const problem = reasonProblem("connection", input.to, input.note);
  if (problem) return fail(422, problem);

  // Only a qualified profile may be introduced or put back under review.
  if (input.to === "INTRODUCED" || input.to === "REVIEWING") {
    const tutor = await TutorApplication.findById(current.tutor)
      .select("status")
      .lean();
    if (!tutor || normalizeStatus("tutor", tutor.status) !== "ELIGIBLE") {
      return fail(
        422,
        "Hồ sơ gia sư không còn ở trạng thái “Đủ điều kiện giới thiệu”.",
      );
    }
  }

  const now = new Date();
  const set: Record<string, unknown> = {
    status: input.to,
    statusUpdatedAt: now,
    statusUpdatedBy: operator,
  };
  if (input.to === "INTRODUCED" && !current.introducedAt)
    set.introducedAt = now;
  if (input.to === "STARTED" && !current.startedAt) set.startedAt = now;

  const updated = await Connection.findOneAndUpdate(
    { _id: id, status: current.status },
    {
      $set: set,
      $push: {
        history: {
          from,
          to: input.to,
          at: now,
          by: operator,
          note: input.note,
        },
      },
    },
    { new: true },
  )
    .select("status")
    .lean();
  if (!updated) return fail(409, STALE);
  return ok({ status: input.to });
}

export function isObjectId(value: string) {
  return mongoose.isValidObjectId(value);
}
