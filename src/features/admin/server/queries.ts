/*
 * Reads for the /admin pages. Every function takes the AdminActor issued by
 * requireAdminPage() and refuses to run without one, so authorization is
 * enforced here and not only in the pages. Nothing here is reachable from
 * public routes.
 */
import "server-only";
import mongoose from "mongoose";

import type {
  AdminNotification,
  ConnectionDoc,
  Paged,
  RequestDoc,
  TutorDoc,
} from "../types.ts";

import {
  RESPONSE_SLA_MS,
  connectionStatuses,
  learnerStatuses,
  normalizeStatus,
  tutorStatuses,
} from "../../../shared/lib/workflow.ts";
import { connectToDatabase } from "../../../shared/server/mongodb.ts";
import {
  assertAdminActor,
  type AdminActor,
} from "../../admin-auth/server/actor.ts";
import { LearnerRequest } from "../../learner-requests/server/model.ts";
import { TutorApplication } from "../../tutor-applications/server/model.ts";
import { buildTutorFilter } from "../matching.ts";
import {
  REQUEST_STAGES,
  TUTOR_STAGES,
  escapeRegex,
  type parseConnectionListParams,
  type parseMatchParams,
  type parseRequestListParams,
  type parseTutorListParams,
} from "../validation.ts";
import { Connection } from "./connection-model.ts";

function paged<T>(
  items: T[],
  total: number,
  page: number,
  size: number,
): Paged<T> {
  const pages = Math.max(1, Math.ceil(total / size));
  const first = items.length ? (page - 1) * size + 1 : 0;
  return {
    items,
    total,
    page,
    pages,
    first,
    last: items.length ? first + items.length - 1 : 0,
  };
}

/** Clamp a requested page to the last real page for the given total. */
function clampPage(page: number, total: number, size: number) {
  return Math.min(page, Math.max(1, Math.ceil(total / size)));
}

function search(q: string, fields: string[]) {
  const pattern = new RegExp(escapeRegex(q), "i");
  return { $or: fields.map((field) => ({ [field]: pattern })) };
}

function id(value: string) {
  return mongoose.isValidObjectId(value) ? value : null;
}

/* ------------------------------- lists ------------------------------- */

type Filter = Record<string, unknown>;

/** Filters other than the status tab, shared by the list and its tab counts. */
function requestFilter(params: ReturnType<typeof parseRequestListParams>) {
  const filter: Filter = {};
  if (params.q)
    Object.assign(filter, search(params.q, ["referenceCode", "fullName"]));
  if (params.assignedTo) filter.assignedTo = params.assignedTo;
  if (params.goal) filter.goal = params.goal;
  if (params.format) filter.format = params.format;
  return filter;
}

function tutorFilter(params: ReturnType<typeof parseTutorListParams>) {
  const filter: Filter = {};
  if (params.q)
    Object.assign(filter, search(params.q, ["referenceCode", "fullName"]));
  if (params.accepting === "yes") filter.acceptingStudents = true;
  if (params.accepting === "no") filter.acceptingStudents = { $ne: true };
  if (params.area) filter.teachingAreas = params.area;
  if (params.format) filter.format = params.format;
  return filter;
}

function connectionFilter(
  params: ReturnType<typeof parseConnectionListParams>,
) {
  const filter: Filter = {};
  if (params.q)
    Object.assign(filter, search(params.q, ["requestCode", "tutorCode"]));
  if (params.status) filter.status = params.status;
  if (params.confirmed) filter.confirmedAt = { $ne: null };
  return filter;
}

const paymentFilter = (payment: "NOT_DUE" | "UNPAID" | "PAID") =>
  payment === "NOT_DUE"
    ? { paymentStatus: { $in: ["NOT_DUE", null] } }
    : { paymentStatus: payment };

async function countBy(
  model: typeof LearnerRequest,
  filter: Filter,
  field: string,
) {
  const rows = (await model.aggregate([
    { $match: filter },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ])) as { _id: unknown; count: number }[];
  return rows;
}

/** Counts for the status tabs, with every other filter applied. */
export async function countRequestTabs(
  actor: AdminActor,
  params: ReturnType<typeof parseRequestListParams>,
) {
  assertAdminActor(actor);
  await connectToDatabase();
  const rows = await countBy(LearnerRequest, requestFilter(params), "status");
  const counts: Record<string, number> = { all: 0 };
  for (const row of rows) {
    const status = normalizeStatus("learner", row._id);
    counts[status] = (counts[status] ?? 0) + row.count;
    counts.all! += row.count;
  }
  return counts;
}

export async function countTutorTabs(
  actor: AdminActor,
  params: ReturnType<typeof parseTutorListParams>,
) {
  assertAdminActor(actor);
  await connectToDatabase();
  const rows = await countBy(
    TutorApplication as unknown as typeof LearnerRequest,
    tutorFilter(params),
    "status",
  );
  const counts: Record<string, number> = { all: 0 };
  for (const row of rows) {
    const status = normalizeStatus("tutor", row._id);
    counts[status] = (counts[status] ?? 0) + row.count;
    counts.all! += row.count;
  }
  return counts;
}

export async function countConnectionTabs(
  actor: AdminActor,
  params: ReturnType<typeof parseConnectionListParams>,
) {
  assertAdminActor(actor);
  await connectToDatabase();
  const rows = await countBy(
    Connection as unknown as typeof LearnerRequest,
    connectionFilter(params),
    "paymentStatus",
  );
  const counts: Record<string, number> = { all: 0, NOT_DUE: 0 };
  for (const row of rows) {
    const key =
      row._id === "UNPAID" || row._id === "PAID" ? row._id : "NOT_DUE";
    counts[key] = (counts[key] ?? 0) + row.count;
    counts.all! += row.count;
  }
  return counts;
}

export async function listRequests(
  actor: AdminActor,
  params: ReturnType<typeof parseRequestListParams>,
  size = params.size,
) {
  assertAdminActor(actor);
  await connectToDatabase();
  const filter = requestFilter(params);
  if (params.stage) filter.status = { $in: REQUEST_STAGES[params.stage] };
  if (params.status) filter.status = params.status;
  if (params.overdue) {
    filter.status = "NEW";
    filter.createdAt = { $lt: new Date(Date.now() - RESPONSE_SLA_MS) };
  }
  const total = await LearnerRequest.countDocuments(filter);
  const page = clampPage(params.page, total, size);
  const items = (await LearnerRequest.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * size)
    .limit(size)
    .lean()) as unknown as RequestDoc[];
  return paged(items, total, page, size);
}

export async function listTutors(
  actor: AdminActor,
  params: ReturnType<typeof parseTutorListParams>,
  size = params.size,
) {
  assertAdminActor(actor);
  await connectToDatabase();
  const filter = tutorFilter(params);
  if (params.stage) filter.status = { $in: TUTOR_STAGES[params.stage] };
  if (params.status) filter.status = params.status;
  const total = await TutorApplication.countDocuments(filter);
  const page = clampPage(params.page, total, size);
  const items = (await TutorApplication.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * size)
    .limit(size)
    .lean()) as unknown as TutorDoc[];
  return paged(items, total, page, size);
}

export async function listConnections(
  actor: AdminActor,
  params: ReturnType<typeof parseConnectionListParams>,
  size = params.size,
) {
  assertAdminActor(actor);
  await connectToDatabase();
  const filter = connectionFilter(params);
  if (params.payment) Object.assign(filter, paymentFilter(params.payment));
  const total = await Connection.countDocuments(filter);
  const page = clampPage(params.page, total, size);
  const items = (await Connection.find(filter)
    .sort({ statusUpdatedAt: -1, _id: -1 })
    .skip((page - 1) * size)
    .limit(size)
    .lean()) as unknown as ConnectionDoc[];

  // Names are looked up only for the rows on this page.
  const [requests, tutors] = await Promise.all([
    LearnerRequest.find({ _id: { $in: items.map((item) => item.request) } })
      .select("fullName")
      .lean(),
    TutorApplication.find({ _id: { $in: items.map((item) => item.tutor) } })
      .select("fullName")
      .lean(),
  ]);
  const learnerNames = new Map(
    requests.map((doc) => [String(doc._id), String(doc.fullName)]),
  );
  const tutorNames = new Map(
    tutors.map((doc) => [String(doc._id), String(doc.fullName)]),
  );
  return paged(
    items.map((item) => ({
      ...item,
      learnerName: learnerNames.get(String(item.request)) ?? "—",
      tutorName: tutorNames.get(String(item.tutor)) ?? "—",
    })),
    total,
    page,
    size,
  );
}

/* ------------------------------ details ------------------------------ */

export async function getRequest(actor: AdminActor, value: string) {
  assertAdminActor(actor);
  if (!id(value)) return null;
  await connectToDatabase();
  return (await LearnerRequest.findById(
    value,
  ).lean()) as unknown as RequestDoc | null;
}

export async function getTutor(actor: AdminActor, value: string) {
  assertAdminActor(actor);
  if (!id(value)) return null;
  await connectToDatabase();
  return (await TutorApplication.findById(
    value,
  ).lean()) as unknown as TutorDoc | null;
}

export async function getConnection(actor: AdminActor, value: string) {
  assertAdminActor(actor);
  if (!id(value)) return null;
  await connectToDatabase();
  const connection = (await Connection.findById(
    value,
  ).lean()) as unknown as ConnectionDoc | null;
  if (!connection) return null;
  const [request, tutor] = await Promise.all([
    LearnerRequest.findById(connection.request).lean(),
    TutorApplication.findById(connection.tutor).lean(),
  ]);
  return {
    connection,
    request: request as unknown as RequestDoc | null,
    tutor: tutor as unknown as TutorDoc | null,
  };
}

export async function connectionsForRequest(
  actor: AdminActor,
  requestId: string,
) {
  assertAdminActor(actor);
  await connectToDatabase();
  const items = (await Connection.find({ request: requestId })
    .sort({ createdAt: -1 })
    .lean()) as unknown as ConnectionDoc[];
  const tutors = await TutorApplication.find({
    _id: { $in: items.map((item) => item.tutor) },
  })
    .select("fullName")
    .lean();
  const names = new Map(
    tutors.map((doc) => [String(doc._id), String(doc.fullName)]),
  );
  return items.map((item) => ({
    ...item,
    otherName: names.get(String(item.tutor)) ?? "—",
  }));
}

export async function connectionsForTutor(actor: AdminActor, tutorId: string) {
  assertAdminActor(actor);
  await connectToDatabase();
  const items = (await Connection.find({ tutor: tutorId })
    .sort({ createdAt: -1 })
    .lean()) as unknown as ConnectionDoc[];
  const requests = await LearnerRequest.find({
    _id: { $in: items.map((item) => item.request) },
  })
    .select("fullName")
    .lean();
  const names = new Map(
    requests.map((doc) => [String(doc._id), String(doc.fullName)]),
  );
  return items.map((item) => ({
    ...item,
    otherName: names.get(String(item.request)) ?? "—",
  }));
}

/* ------------------------- manual matching ------------------------- */

const MATCH_PAGE_SIZE = 10;

export async function findTutorCandidates(
  actor: AdminActor,
  request: RequestDoc,
  options: ReturnType<typeof parseMatchParams>,
) {
  assertAdminActor(actor);
  await connectToDatabase();
  const base = options.showAll
    ? {}
    : buildTutorFilter(
        {
          goal: request.goal,
          currentLevel: request.currentLevel,
          format: request.format,
          budgetMax: request.budgetMax,
          availabilitySlots: request.availabilitySlots,
        },
        options.soft,
      );
  // Only profiles the team marked as eligible can ever be introduced.
  const filter = { ...base, status: "ELIGIBLE", acceptingStudents: true };
  const total = await TutorApplication.countDocuments(filter);
  const page = clampPage(options.page, total, MATCH_PAGE_SIZE);
  const items = (await TutorApplication.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .skip((page - 1) * MATCH_PAGE_SIZE)
    .limit(MATCH_PAGE_SIZE)
    .lean()) as unknown as TutorDoc[];

  const existing = (await Connection.find({
    request: request._id,
    tutor: { $in: items.map((item) => item._id) },
  })
    .select("tutor status")
    .lean()) as unknown as Pick<ConnectionDoc, "_id" | "tutor" | "status">[];
  const byTutor = new Map(existing.map((item) => [String(item.tutor), item]));
  const eligibleTotal = await TutorApplication.countDocuments({
    status: "ELIGIBLE",
    acceptingStudents: true,
  });
  return {
    ...paged(items, total, page, MATCH_PAGE_SIZE),
    eligibleTotal,
    existing: byTutor,
  };
}

/* ------------------------------ dashboard ------------------------------ */

async function countByStatus(
  model: typeof LearnerRequest,
  known: readonly string[],
) {
  const rows = (await model.aggregate([
    { $group: { _id: "$status", n: { $sum: 1 } } },
  ])) as { _id: string | null; n: number }[];
  const result: Record<string, number> = Object.fromEntries(
    known.map((s) => [s, 0]),
  );
  for (const row of rows) {
    // Old records without a known status are still "new".
    const key = row._id && known.includes(row._id) ? row._id : known[0]!;
    result[key] = (result[key] ?? 0) + row.n;
  }
  return result;
}

export async function getDashboard(actor: AdminActor) {
  assertAdminActor(actor);
  await connectToDatabase();
  const overdueBefore = new Date(Date.now() - RESPONSE_SLA_MS);
  const [learners, tutors, connections, overdue, contact, waiting] =
    await Promise.all([
      countByStatus(LearnerRequest, learnerStatuses),
      countByStatus(
        TutorApplication as unknown as typeof LearnerRequest,
        tutorStatuses,
      ),
      countByStatus(
        Connection as unknown as typeof LearnerRequest,
        connectionStatuses,
      ),
      LearnerRequest.countDocuments({
        status: "NEW",
        createdAt: { $lt: overdueBefore },
      }),
      LearnerRequest.aggregate([
        { $match: { contactedAt: { $ne: null } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            onTime: {
              $sum: {
                $cond: [
                  {
                    $lte: [
                      { $subtract: ["$contactedAt", "$createdAt"] },
                      RESPONSE_SLA_MS,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]) as Promise<{ total: number; onTime: number }[]>,
      // Oldest first: the request closest to (or past) its 24-hour mark.
      LearnerRequest.find({ status: "NEW" })
        .sort({ createdAt: 1 })
        .limit(8)
        .select(
          "referenceCode fullName goal format createdAt status contactedAt",
        )
        .lean() as unknown as Promise<RequestDoc[]>,
    ]);
  const sum = (counts: Record<string, number>) =>
    Object.values(counts).reduce((total, n) => total + n, 0);
  return {
    learners,
    tutors,
    connections,
    totals: {
      learners: sum(learners),
      tutors: sum(tutors),
      connections: sum(connections),
    },
    overdue,
    contacted: {
      total: contact[0]?.total ?? 0,
      onTime: contact[0]?.onTime ?? 0,
    },
    waiting,
  };
}

/* --------------------------- notifications --------------------------- */

const NOTIFICATION_LIMIT = 6;

/**
 * Work waiting for the team, read from the saved statuses: requests not yet
 * contacted, tutor profiles not yet reviewed and confirmed connections whose
 * fee is not recorded. Nothing is stored; "read" is tracked by the browser.
 */
export async function getNotifications(
  actor: AdminActor,
): Promise<AdminNotification[]> {
  assertAdminActor(actor);
  await connectToDatabase();
  const overdueBefore = Date.now() - RESPONSE_SLA_MS;
  const [requests, tutors, unpaid] = await Promise.all([
    LearnerRequest.find({ status: "NEW" })
      .sort({ createdAt: -1 })
      .limit(NOTIFICATION_LIMIT)
      .select("referenceCode fullName createdAt")
      .lean(),
    TutorApplication.find({ status: "NEW" })
      .sort({ createdAt: -1 })
      .limit(NOTIFICATION_LIMIT)
      .select("referenceCode fullName createdAt")
      .lean(),
    Connection.find({
      paymentStatus: "UNPAID",
      status: { $in: ["CONFIRMED", "STARTED"] },
    })
      .sort({ confirmedAt: -1 })
      .limit(NOTIFICATION_LIMIT)
      .select("requestCode tutorCode confirmedAt")
      .lean(),
  ]);
  const items: AdminNotification[] = [
    ...requests.map((doc) => {
      const at = new Date(doc.createdAt);
      return {
        id: `request-${String(doc._id)}`,
        title:
          at.getTime() < overdueBefore
            ? "Learner request past 24 hours"
            : "New learner request",
        message: `${doc.fullName} is waiting to be contacted.`,
        context: String(doc.referenceCode),
        href: `/admin/requests/${String(doc._id)}`,
        at: at.toISOString(),
      };
    }),
    ...tutors.map((doc) => ({
      id: `tutor-${String(doc._id)}`,
      title: "New tutor profile",
      message: `${doc.fullName} sent a profile to review.`,
      context: String(doc.referenceCode),
      href: `/admin/tutors/${String(doc._id)}`,
      at: new Date(doc.createdAt).toISOString(),
    })),
    ...unpaid.map((doc) => ({
      id: `fee-${String(doc._id)}`,
      title: "Connection fee not received",
      message: "Both sides agreed. No payment is recorded yet.",
      context: `${doc.requestCode} ↔ ${doc.tutorCode}`,
      href: `/admin/connections/${String(doc._id)}`,
      at: new Date(doc.confirmedAt ?? Date.now()).toISOString(),
    })),
  ];
  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, NOTIFICATION_LIMIT * 2);
}

/** Counts shown as badges beside the sidebar links. */
export async function getNavCounts(actor: AdminActor) {
  assertAdminActor(actor);
  await connectToDatabase();
  const [requests, overdue, tutors] = await Promise.all([
    LearnerRequest.countDocuments({ status: "NEW" }),
    LearnerRequest.countDocuments({
      status: "NEW",
      createdAt: { $lt: new Date(Date.now() - RESPONSE_SLA_MS) },
    }),
    TutorApplication.countDocuments({ status: "NEW" }),
  ]);
  return { requests, overdue, tutors };
}
