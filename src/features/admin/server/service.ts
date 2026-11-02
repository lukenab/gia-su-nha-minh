/*
 * Writes for the /admin workflow. Every function takes the AdminActor issued
 * by requireAdminApi() and refuses to run without one; the operator name
 * written to status history comes from that actor.
 *
 * Every status change is conditional on the status the person saw ("from"),
 * so a double click or a second admin working from a stale page gets a clear
 * conflict instead of a silent overwrite or a duplicate history entry.
 */
import "server-only";
import mongoose from "mongoose";

import {
  MIN_REASON_LENGTH,
  canTransition,
  normalizeStatus,
  statusLabel,
  statusNeedsNote,
  type ConnectionStatus,
  type LearnerStatus,
  type TutorStatus,
} from "../../../shared/lib/workflow.ts";
import { connectToDatabase } from "../../../shared/server/mongodb.ts";
import {
  assertAdminActor,
  type AdminActor,
} from "../../admin-auth/server/actor.ts";
import { LearnerRequest } from "../../learner-requests/server/model.ts";
import { TutorApplication } from "../../tutor-applications/server/model.ts";
import { Connection } from "./connection-model.ts";

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
  "The status was changed elsewhere. Reload the page to see the latest status.";
const NOT_FOUND = "Record not found.";

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
    return `Please give a reason for moving to “${statusLabel(kind, to)}”.`;
  }
  return null;
}

/* ------------------------- learner requests ------------------------- */

export async function changeLearnerStatus(
  id: string,
  input: { from: LearnerStatus; to: LearnerStatus; note: string },
  actor: AdminActor,
): Promise<ServiceResult<{ status: LearnerStatus }>> {
  assertAdminActor(actor);
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
      `Cannot move from “${statusLabel("learner", from)}” to “${statusLabel("learner", input.to)}”.`,
    );
  }
  const problem = reasonProblem("learner", input.to, input.note);
  if (problem) return fail(422, problem);

  const now = new Date();
  const set: Record<string, unknown> = {
    status: input.to,
    statusUpdatedAt: now,
    statusUpdatedBy: actor.operator,
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
          by: actor.operator,
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
  actor: AdminActor,
): Promise<ServiceResult> {
  assertAdminActor(actor);
  await connectToDatabase();
  const result = await LearnerRequest.updateOne(
    { _id: id },
    {
      $set: {
        internalNote: note,
        internalNoteUpdatedAt: new Date(),
        internalNoteUpdatedBy: actor.operator,
      },
    },
  );
  return result.matchedCount ? ok({}) : fail(404, NOT_FOUND);
}

/* ---------------------------- tutor profiles ---------------------------- */

export const reviewChecks = ["identity", "certificates", "experience"] as const;
export type ReviewCheck = (typeof reviewChecks)[number];
export const reviewLabels: Record<ReviewCheck, string> = {
  identity: "Identity",
  certificates: "Certificates",
  experience: "Experience",
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
  actor: AdminActor,
): Promise<ServiceResult<{ status: TutorStatus }>> {
  assertAdminActor(actor);
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
      `Cannot move from “${statusLabel("tutor", from)}” to “${statusLabel("tutor", input.to)}”.`,
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
        `Record the ${missing.map((check) => reviewLabels[check].toLowerCase()).join(", ")} review before approving the profile.`,
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
        statusUpdatedBy: actor.operator,
      },
      $push: {
        statusHistory: {
          from,
          to: input.to,
          at: now,
          by: actor.operator,
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
  actor: AdminActor,
): Promise<ServiceResult> {
  assertAdminActor(actor);
  if (input.reviewed && input.note.trim().length < MIN_REASON_LENGTH) {
    return fail(
      422,
      "Add a short note on what you reviewed (for example documents or sources checked).",
    );
  }
  let reviewedAt: Date | null = null;
  if (input.reviewed) {
    reviewedAt = input.reviewedOn
      ? new Date(`${input.reviewedOn}T12:00:00+07:00`)
      : new Date();
    if (Number.isNaN(reviewedAt.getTime()))
      return fail(422, "The review date is not valid.");
    if (reviewedAt.getTime() > Date.now() + 24 * 3600 * 1000)
      return fail(422, "The review date cannot be in the future.");
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
          reviewedBy: input.reviewed ? actor.operator : "",
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
        "Reviews can only be recorded while the profile is “In review”.",
      )
    : fail(404, NOT_FOUND);
}

export async function setTutorNote(
  id: string,
  note: string,
  actor: AdminActor,
): Promise<ServiceResult> {
  assertAdminActor(actor);
  await connectToDatabase();
  const result = await TutorApplication.updateOne(
    { _id: id },
    {
      $set: {
        internalNote: note,
        internalNoteUpdatedAt: new Date(),
        internalNoteUpdatedBy: actor.operator,
      },
    },
  );
  return result.matchedCount ? ok({}) : fail(404, NOT_FOUND);
}

/* ------------------------------ connections ------------------------------ */

export async function createConnection(
  input: { requestId: string; tutorId: string; note: string },
  actor: AdminActor,
): Promise<ServiceResult<{ id: string }>> {
  assertAdminActor(actor);
  await connectToDatabase();
  const [request, tutor] = await Promise.all([
    LearnerRequest.findById(input.requestId)
      .select("referenceCode status")
      .lean(),
    TutorApplication.findById(input.tutorId)
      .select("referenceCode status acceptingStudents")
      .lean(),
  ]);
  if (!request || !tutor) return fail(404, NOT_FOUND);

  const requestStatus = normalizeStatus("learner", request.status);
  if (!CONNECTABLE_REQUEST_STATUSES.includes(requestStatus)) {
    return fail(
      422,
      requestStatus === "NEW"
        ? "Contact the learner and record “Contacted” before connecting a tutor."
        : `Cannot add a connection while the request is “${statusLabel("learner", requestStatus)}”.`,
    );
  }
  if (normalizeStatus("tutor", tutor.status) !== "ELIGIBLE") {
    return fail(422, "Only approved tutor profiles can be connected.");
  }

  if (tutor.acceptingStudents !== true)
    return fail(
      422,
      "The tutor has not confirmed they are taking new learners.",
    );
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
      statusUpdatedBy: actor.operator,
      createdBy: actor.operator,
      history: [
        {
          from: "",
          to: "REVIEWING",
          at: now,
          by: actor.operator,
          note: input.note,
        },
      ],
    });
    return ok({ id: String(created._id) });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return fail(409, "This tutor is already recorded for this request.");
    }
    throw error;
  }
}

export async function changeConnectionStatus(
  id: string,
  input: { from: ConnectionStatus; to: ConnectionStatus; note: string },
  actor: AdminActor,
): Promise<ServiceResult<{ status: ConnectionStatus }>> {
  assertAdminActor(actor);
  await connectToDatabase();
  const current = await Connection.findById(id)
    .select(
      "status tutor introducedAt startedAt confirmedAt paymentStatus operationsRevision",
    )
    .lean();
  if (!current) return fail(404, NOT_FOUND);

  const from = normalizeStatus("connection", current.status);
  if (from !== input.from) return fail(409, STALE);
  if (!canTransition("connection", from, input.to)) {
    return fail(
      422,
      `Cannot move from “${statusLabel("connection", from)}” to “${statusLabel("connection", input.to)}”.`,
    );
  }
  const problem = reasonProblem("connection", input.to, input.note);
  if (problem) return fail(422, problem);

  if (input.to === "CONFIRMED")
    return fail(
      422,
      "Record the learner's and the tutor's confirmation separately.",
    );
  if (input.to === "STARTED" && !current.confirmedAt)
    return fail(
      422,
      "Both sides must confirm before lessons can be recorded as started.",
    );
  if (input.to === "DECLINED" && current.paymentStatus === "PAID")
    return fail(
      422,
      "Reconcile and reverse the payment before closing a paid connection.",
    );
  // Only a qualified profile may be introduced or put back under review.
  if (input.to === "INTRODUCED" || input.to === "REVIEWING") {
    const tutor = await TutorApplication.findById(current.tutor)
      .select("status acceptingStudents")
      .lean();
    if (
      !tutor ||
      tutor.acceptingStudents !== true ||
      normalizeStatus("tutor", tutor.status) !== "ELIGIBLE"
    ) {
      return fail(422, "The tutor profile is no longer approved.");
    }
  }

  const now = new Date();
  const set: Record<string, unknown> = {
    status: input.to,
    statusUpdatedAt: now,
    statusUpdatedBy: actor.operator,
  };
  if (input.to === "INTRODUCED" && !current.introducedAt)
    set.introducedAt = now;
  if (input.to === "STARTED" && !current.startedAt) set.startedAt = now;

  if (input.to === "DECLINED")
    Object.assign(set, {
      learnerConfirmedAt: null,
      tutorConfirmedAt: null,
      confirmedAt: null,
      paymentStatus: "NOT_DUE",
    });
  const updated = await Connection.findOneAndUpdate(
    {
      _id: id,
      status: current.status,
      ...(current.operationsRevision == null
        ? { operationsRevision: { $exists: false } }
        : { operationsRevision: current.operationsRevision }),
    },
    {
      $set: set,
      $inc: { operationsRevision: 1 },
      $push: {
        history: {
          from,
          to: input.to,
          at: now,
          by: actor.operator,
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
