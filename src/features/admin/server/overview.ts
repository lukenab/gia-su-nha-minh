/*
 * Reads for the admin overview. Like every admin read it needs the
 * AdminActor from the guards, and it returns plain values only.
 */
import "server-only";
import { RESPONSE_SLA_MS } from "../../../shared/lib/workflow.ts";
import { connectToDatabase } from "../../../shared/server/mongodb.ts";
import {
  assertAdminActor,
  type AdminActor,
} from "../../admin-auth/server/actor.ts";
import { LearnerRequest } from "../../learner-requests/server/model.ts";
import { TutorApplication } from "../../tutor-applications/server/model.ts";
import {
  countInside,
  demandAgainstTutors,
  matchingFunnel,
  replyBuckets,
  replyRate,
  sumInside,
  windowsFor,
  type RangeKey,
} from "../overview.ts";
import { Connection } from "./connection-model.ts";

const QUEUE_SIZE = 5;

export type QueueItem = {
  id: string;
  href: string;
  code: string;
  name: string;
  detail: string;
  at: string;
  /** Only for requests: when the 24-hour mark passes. */
  dueAt?: string;
};

type Lean = Record<string, unknown> & { _id: unknown };
const iso = (value: unknown) => new Date(value as Date).toISOString();

export async function getOverview(actor: AdminActor, range: RangeKey) {
  assertAdminActor(actor);
  await connectToDatabase();
  const now = new Date();
  const { current, previous } = windowsFor(range, now);
  const overdueBefore = new Date(now.getTime() - RESPONSE_SLA_MS);

  const [
    waiting,
    overdue,
    recent,
    contactedRecords,
    confirmed,
    paid,
    contactQueue,
    reviewCount,
    reviewQueue,
    feeCount,
    feeQueue,
    openGoals,
    tutors,
  ] = await Promise.all([
    LearnerRequest.countDocuments({ status: "NEW" }),
    LearnerRequest.countDocuments({
      status: "NEW",
      createdAt: { $lt: overdueBefore },
    }),
    // Requests received in the range: the reply chart and the funnel.
    LearnerRequest.find({ createdAt: { $gte: current.start } })
      .select("createdAt contactedAt status")
      .lean() as Promise<Lean[]>,
    // Contacts recorded in either window: the on-time rate and its change.
    LearnerRequest.find({ contactedAt: { $gte: previous.start } })
      .select("createdAt contactedAt")
      .lean() as Promise<Lean[]>,
    Connection.find({ confirmedAt: { $gte: previous.start } })
      .select("confirmedAt")
      .lean() as Promise<Lean[]>,
    Connection.find({ paymentStatus: "PAID", paidAt: { $gte: previous.start } })
      .select("paidAt feeAmount")
      .lean() as Promise<Lean[]>,
    LearnerRequest.find({ status: "NEW" })
      .sort({ createdAt: 1 })
      .limit(QUEUE_SIZE)
      .select("referenceCode fullName goal createdAt")
      .lean() as Promise<Lean[]>,
    TutorApplication.countDocuments({ status: { $in: ["NEW", "REVIEWING"] } }),
    TutorApplication.find({ status: { $in: ["NEW", "REVIEWING"] } })
      .sort({ createdAt: 1 })
      .limit(QUEUE_SIZE)
      .select("referenceCode fullName status createdAt")
      .lean() as Promise<Lean[]>,
    Connection.countDocuments({
      paymentStatus: "UNPAID",
      status: { $in: ["CONFIRMED", "STARTED"] },
    }),
    Connection.find({
      paymentStatus: "UNPAID",
      status: { $in: ["CONFIRMED", "STARTED"] },
    })
      .sort({ confirmedAt: 1 })
      .limit(QUEUE_SIZE)
      .select("requestCode tutorCode confirmedAt")
      .lean() as Promise<Lean[]>,
    LearnerRequest.find({ status: { $in: ["NEW", "CONTACTED", "SEARCHING"] } })
      .select("goal")
      .lean() as Promise<Lean[]>,
    TutorApplication.find({ status: "ELIGIBLE", acceptingStudents: true })
      .select("teachingAreas")
      .lean() as Promise<Lean[]>,
  ]);

  const funnelConnections = recent.length
    ? ((await Connection.find({ request: { $in: recent.map((r) => r._id) } })
        .select("request introducedAt confirmedAt paymentStatus")
        .lean()) as Lean[])
    : [];

  const replyRecords = contactedRecords.map((item) => ({
    createdAt: item.createdAt as Date,
    contactedAt: item.contactedAt as Date,
  }));
  const confirmedAt = confirmed.map((item) => item.confirmedAt as Date);
  const payments = paid.map((item) => ({
    at: item.paidAt as Date,
    amount: Number(item.feeAmount ?? 0),
  }));

  return {
    range,
    kpis: {
      waiting,
      overdue,
      replies: {
        current: replyRate(replyRecords, current),
        previous: replyRate(replyRecords, previous),
      },
      confirmed: {
        current: countInside(confirmedAt, current),
        previous: countInside(confirmedAt, previous),
      },
      revenue: {
        current: sumInside(payments, current),
        previous: sumInside(payments, previous),
      },
    },
    queues: {
      contact: {
        total: waiting,
        items: contactQueue.map((item): QueueItem => ({
          id: String(item._id),
          href: `/admin/requests/${String(item._id)}`,
          code: String(item.referenceCode),
          name: String(item.fullName),
          detail: String(item.goal),
          at: iso(item.createdAt),
          dueAt: new Date(
            new Date(item.createdAt as Date).getTime() + RESPONSE_SLA_MS,
          ).toISOString(),
        })),
      },
      review: {
        total: reviewCount,
        items: reviewQueue.map((item): QueueItem => ({
          id: String(item._id),
          href: `/admin/tutors/${String(item._id)}`,
          code: String(item.referenceCode),
          name: String(item.fullName),
          detail: String(item.status),
          at: iso(item.createdAt),
        })),
      },
      fees: {
        total: feeCount,
        items: feeQueue.map((item): QueueItem => ({
          id: String(item._id),
          href: `/admin/connections/${String(item._id)}`,
          code: `${String(item.requestCode)} ↔ ${String(item.tutorCode)}`,
          name: "50,000 VND due",
          detail: "fee",
          at: iso(item.confirmedAt ?? now),
        })),
      },
    },
    replies: replyBuckets(
      recent.map((item) => ({
        createdAt: item.createdAt as Date,
        contactedAt: item.contactedAt as Date | null,
      })),
      range,
      now,
    ),
    funnel: matchingFunnel(
      recent.map((item) => ({
        _id: item._id,
        contactedAt: item.contactedAt as Date | null,
      })),
      funnelConnections.map((item) => ({
        request: item.request,
        introducedAt: item.introducedAt as Date | null,
        confirmedAt: item.confirmedAt as Date | null,
        paymentStatus: item.paymentStatus as string | null,
      })),
    ),
    demand: demandAgainstTutors(
      openGoals.map((item) => String(item.goal)),
      tutors.map((item) => item.teachingAreas as string[]),
    ),
  };
}

export type Overview = Awaited<ReturnType<typeof getOverview>>;
