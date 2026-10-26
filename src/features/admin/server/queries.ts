/*
 * Reads for the /admin pages. Pages call requireAdminPage() before using
 * these; nothing here is reachable from public routes.
 */
import mongoose from "mongoose";

import type { ConnectionDoc, Paged, RequestDoc, TutorDoc } from "../types.ts";

import {
  RESPONSE_SLA_MS,
  connectionStatuses,
  learnerStatuses,
  tutorStatuses,
} from "../../../shared/lib/workflow.ts";
import { connectToDatabase } from "../../../shared/server/mongodb.ts";
import { LearnerRequest } from "../../learner-requests/server/model.ts";
import { TutorApplication } from "../../tutor-applications/server/model.ts";
import { buildTutorFilter } from "../matching.ts";
import {
  PAGE_SIZE,
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

export async function listRequests(
  params: ReturnType<typeof parseRequestListParams>,
) {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (params.q)
    Object.assign(filter, search(params.q, ["referenceCode", "fullName"]));
  if (params.status) filter.status = params.status;
  if (params.goal) filter.goal = params.goal;
  if (params.format) filter.format = params.format;
  if (params.overdue) {
    filter.status = "NEW";
    filter.createdAt = { $lt: new Date(Date.now() - RESPONSE_SLA_MS) };
  }
  const total = await LearnerRequest.countDocuments(filter);
  const page = clampPage(params.page, total, PAGE_SIZE);
  const items = (await LearnerRequest.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean()) as unknown as RequestDoc[];
  return paged(items, total, page, PAGE_SIZE);
}

export async function listTutors(
  params: ReturnType<typeof parseTutorListParams>,
) {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (params.q)
    Object.assign(filter, search(params.q, ["referenceCode", "fullName"]));
  if (params.status) filter.status = params.status;
  if (params.area) filter.teachingAreas = params.area;
  if (params.format) filter.format = params.format;
  const total = await TutorApplication.countDocuments(filter);
  const page = clampPage(params.page, total, PAGE_SIZE);
  const items = (await TutorApplication.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean()) as unknown as TutorDoc[];
  return paged(items, total, page, PAGE_SIZE);
}

export async function listConnections(
  params: ReturnType<typeof parseConnectionListParams>,
) {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (params.q)
    Object.assign(filter, search(params.q, ["requestCode", "tutorCode"]));
  if (params.status) filter.status = params.status;
  const total = await Connection.countDocuments(filter);
  const page = clampPage(params.page, total, PAGE_SIZE);
  const items = (await Connection.find(filter)
    .sort({ statusUpdatedAt: -1, _id: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
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
    PAGE_SIZE,
  );
}

/* ------------------------------ details ------------------------------ */

export async function getRequest(value: string) {
  if (!id(value)) return null;
  await connectToDatabase();
  return (await LearnerRequest.findById(
    value,
  ).lean()) as unknown as RequestDoc | null;
}

export async function getTutor(value: string) {
  if (!id(value)) return null;
  await connectToDatabase();
  return (await TutorApplication.findById(
    value,
  ).lean()) as unknown as TutorDoc | null;
}

export async function getConnection(value: string) {
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

export async function connectionsForRequest(requestId: string) {
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

export async function connectionsForTutor(tutorId: string) {
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
  request: RequestDoc,
  options: ReturnType<typeof parseMatchParams>,
) {
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
  const filter = { ...base, status: "ELIGIBLE" };
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

export async function getDashboard() {
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
