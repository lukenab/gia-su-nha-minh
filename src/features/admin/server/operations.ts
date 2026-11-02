import "server-only";
import type { z } from "zod";

import type { AdminActor } from "../../admin-auth/server/actor.ts";
import type {
  assignmentSchema,
  availabilitySchema,
  confirmationSchema,
  paymentSchema,
} from "../operations-validation.ts";
import type { ServiceResult } from "./service.ts";

import { connectToDatabase } from "../../../shared/server/mongodb.ts";
import { assertAdminActor } from "../../admin-auth/server/actor.ts";
import { allowedEmails } from "../../admin-auth/server/token.ts";
import { AdminUser } from "../../admin-auth/server/user-model.ts";
import { LearnerRequest } from "../../learner-requests/server/model.ts";
import { TutorApplication } from "../../tutor-applications/server/model.ts";
import { Connection } from "./connection-model.ts";

const fail = (status: number, error: string): ServiceResult => ({
  ok: false,
  status,
  error,
});
const ok = (): ServiceResult => ({ ok: true, data: {} });
const stale = () =>
  fail(409, "The data has changed. Reload the page before saving.");
const revisionFilter = (revision: number) =>
  revision === 0
    ? {
        $or: [
          { operationsRevision: 0 },
          { operationsRevision: { $exists: false } },
        ],
      }
    : { operationsRevision: revision };

export async function listOperators(actor: AdminActor) {
  assertAdminActor(actor);
  await connectToDatabase();
  const users = await AdminUser.find({
    email: { $in: [...allowedEmails()] },
    passwordHash: { $ne: null },
  })
    .select("email name")
    .lean();
  return users.map((u) => ({
    email: String(u.email),
    name: String(u.name || u.email),
  }));
}

export async function assignRequest(
  id: string,
  input: z.infer<typeof assignmentSchema>,
  actor: AdminActor,
): Promise<ServiceResult> {
  assertAdminActor(actor);
  await connectToDatabase();
  const email = input.email.trim().toLowerCase();
  if (email && !(await listOperators(actor)).some((u) => u.email === email))
    return fail(422, "This team member has no authorised admin account.");
  const result = await LearnerRequest.updateOne(
    {
      _id: id,
      $or: [
        { assignedTo: input.expected },
        ...(input.expected === "" ? [{ assignedTo: { $exists: false } }] : []),
      ],
    },
    {
      $set: { assignedTo: email },
      $push: {
        assignmentHistory: {
          from: input.expected || "Unassigned",
          to: email || "Unassigned",
          at: new Date(),
          by: actor.operator,
          note: "Assignment",
        },
      },
    },
  );
  return result.matchedCount ? ok() : stale();
}

export async function setAvailability(
  id: string,
  input: z.infer<typeof availabilitySchema>,
  actor: AdminActor,
): Promise<ServiceResult> {
  assertAdminActor(actor);
  await connectToDatabase();
  const filter =
    input.expected === null
      ? { _id: id, acceptingStudents: { $exists: false } }
      : { _id: id, acceptingStudents: input.expected };
  const result = await TutorApplication.updateOne(filter, {
    $set: {
      acceptingStudents: input.accepting,
      availabilityUpdatedAt: new Date(),
      availabilityUpdatedBy: actor.operator,
    },
    $push: {
      statusHistory: {
        from:
          input.expected === null
            ? "Availability not confirmed"
            : input.expected
              ? "Taking learners"
              : "Paused",
        to: input.accepting ? "Taking learners" : "Paused",
        at: new Date(),
        by: actor.operator,
        note: "Availability updated",
      },
    },
  });
  return result.matchedCount ? ok() : stale();
}

export async function confirmParty(
  id: string,
  input: z.infer<typeof confirmationSchema>,
  actor: AdminActor,
): Promise<ServiceResult> {
  assertAdminActor(actor);
  await connectToDatabase();
  const current = await Connection.findById(id).lean();
  if (!current) return fail(404, "Connection not found.");
  if (!["INTRODUCED", "STARTED"].includes(String(current.status)))
    return fail(
      422,
      "Confirmations can only be recorded after the tutor is introduced.",
    );
  if ((current.operationsRevision ?? 0) !== input.revision) return stale();
  const field =
    input.side === "learner" ? "learnerConfirmedAt" : "tutorConfirmedAt";
  const other =
    input.side === "learner" ? "tutorConfirmedAt" : "learnerConfirmedAt";
  if (current[field])
    return fail(409, "This side's confirmation is already recorded.");
  const tutor = await TutorApplication.findById(current.tutor)
    .select("status")
    .lean();
  if (!tutor || tutor.status !== "ELIGIBLE")
    return fail(422, "The tutor profile must be approved.");
  const now = new Date();
  const both = Boolean(current[other]);
  const set: Record<string, unknown> = { [field]: now };
  const push: Record<string, unknown> = {
    operationsHistory: {
      from: "Not confirmed",
      to: input.side === "learner" ? "Learner agreed" : "Tutor agreed",
      at: now,
      by: actor.operator,
      note: input.note,
    },
  };
  if (both) {
    Object.assign(set, {
      confirmedAt: now,
      feeAmount: 50000,
      paymentStatus: "UNPAID",
      statusUpdatedAt: now,
      statusUpdatedBy: actor.operator,
    });
    if (current.status !== "STARTED") {
      set.status = "CONFIRMED";
      push.history = {
        from: current.status,
        to: "CONFIRMED",
        at: now,
        by: actor.operator,
        note: "Both sides' agreement recorded.",
      };
    }
  }
  const result = await Connection.updateOne(
    { _id: id, status: current.status, ...revisionFilter(input.revision) },
    { $set: set, $inc: { operationsRevision: 1 }, $push: push },
  );
  return result.matchedCount ? ok() : stale();
}

export async function recordPayment(
  id: string,
  input: z.infer<typeof paymentSchema>,
  actor: AdminActor,
): Promise<ServiceResult> {
  assertAdminActor(actor);
  await connectToDatabase();
  const current = await Connection.findById(id).lean();
  if (!current) return fail(404, "Connection not found.");
  if ((current.operationsRevision ?? 0) !== input.revision) return stale();
  if (
    !current.confirmedAt ||
    !["CONFIRMED", "STARTED"].includes(String(current.status))
  )
    return fail(
      422,
      "The fee is only due after both sides agree to start lessons.",
    );
  const receive = input.action === "receive";
  if (
    (receive && current.paymentStatus !== "UNPAID") ||
    (!receive && current.paymentStatus !== "PAID")
  )
    return fail(409, "The payment status does not allow this.");
  const paidAt = new Date(input.paidOn);
  if (
    receive &&
    (!Number.isFinite(paidAt.getTime()) ||
      paidAt > new Date() ||
      paidAt.getTime() <
        Math.floor(new Date(current.confirmedAt).getTime() / 60000) * 60000)
  )
    return fail(
      422,
      "The payment date must be between the connection's confirmation and now.",
    );
  if (receive && input.method === "transfer" && input.reference.length < 3)
    return fail(422, "Enter the bank transfer reference or description.");
  const now = new Date();
  const result = await Connection.updateOne(
    {
      _id: id,
      status: current.status,
      paymentStatus: current.paymentStatus,
      ...revisionFilter(input.revision),
    },
    {
      $set: {
        paymentStatus: receive ? "PAID" : "UNPAID",
        feeAmount: 50000,
        paidAt: receive ? paidAt : null,
        paymentMethod: receive ? input.method : "",
        paymentReference: receive ? input.reference : "",
      },
      $inc: { operationsRevision: 1 },
      $push: {
        operationsHistory: {
          from: current.paymentStatus,
          to: receive ? "Received 50,000 VND" : "Payment reversed",
          at: now,
          by: actor.operator,
          note: `${input.note} | ${receive ? input.method : current.paymentMethod} | ${receive ? input.reference : current.paymentReference} | ${receive ? paidAt.toISOString() : current.paidAt}`,
        },
      },
    },
  );
  return result.matchedCount ? ok() : stale();
}

export async function getOperationMetrics(actor: AdminActor) {
  assertAdminActor(actor);
  await connectToDatabase();
  const [availableTutors, confirmed, outstanding, paid] = await Promise.all([
    TutorApplication.countDocuments({
      status: "ELIGIBLE",
      acceptingStudents: true,
    }),
    Connection.countDocuments({ confirmedAt: { $ne: null } }),
    Connection.countDocuments({
      paymentStatus: "UNPAID",
      status: { $in: ["CONFIRMED", "STARTED"] },
    }),
    Connection.aggregate([
      { $match: { paymentStatus: "PAID", confirmedAt: { $ne: null } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$feeAmount" },
        },
      },
    ]),
  ]);
  return {
    availableTutors,
    confirmed,
    outstanding,
    paid: paid[0]?.count ?? 0,
    revenue: paid[0]?.amount ?? 0,
  };
}
