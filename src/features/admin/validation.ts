import { z } from "zod";

import {
  teachingAreaLabels,
  goalLabels,
  formatLabels,
  keysOf,
} from "../../shared/lib/options.ts";
import {
  MIN_REASON_LENGTH,
  connectionStatuses,
  learnerStatuses,
  tutorStatuses,
} from "../../shared/lib/workflow.ts";

/** Rows per list page; 25 by default, as in most admin tables. */
export const PAGE_SIZES = [25, 50, 100] as const;
export const PAGE_SIZE: number = PAGE_SIZES[0];

export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i);

const note = (max: number) => z.string().trim().max(max).default("");

export const learnerStatusChangeSchema = z.object({
  from: z.enum(learnerStatuses),
  to: z.enum(learnerStatuses),
  note: note(1000),
});
export const tutorStatusChangeSchema = z.object({
  from: z.enum(tutorStatuses),
  to: z.enum(tutorStatuses),
  note: note(1000),
});
export const connectionStatusChangeSchema = z.object({
  from: z.enum(connectionStatuses),
  to: z.enum(connectionStatuses),
  note: note(1000),
});

export const internalNoteSchema = z.object({
  note: z.string().trim().max(2000),
});

export const tutorReviewSchema = z.object({
  check: z.enum(["identity", "certificates", "experience"]),
  reviewed: z.boolean(),
  note: note(500),
  /** yyyy-mm-dd, the day the review was done. Defaults to today. */
  reviewedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const createConnectionSchema = z.object({
  requestId: objectIdSchema,
  tutorId: objectIdSchema,
  note: note(500),
});

export { MIN_REASON_LENGTH };

/* ---------------- list query strings ---------------- */

type Params = Record<string, string | string[] | undefined>;

function single(params: Params, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
) {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

function parsePage(params: Params) {
  const page = Number.parseInt(single(params, "page") ?? "1", 10);
  return Number.isFinite(page) && page >= 1 ? Math.min(page, 10_000) : 1;
}

function parsePageSize(params: Params) {
  const size = Number(single(params, "size"));
  return (PAGE_SIZES as readonly number[]).includes(size) ? size : PAGE_SIZE;
}

function parseQuery(params: Params) {
  return (single(params, "q") ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
}

/**
 * List tabs group statuses by the work they need. `status` still narrows to
 * one exact status (filters and links from the overview use it).
 */
export const REQUEST_STAGES = {
  new: ["NEW"],
  active: ["CONTACTED", "SEARCHING", "INTRODUCED"],
  learning: ["STARTED"],
  closed: ["CLOSED"],
} as const;
export const TUTOR_STAGES = {
  review: ["NEW", "REVIEWING"],
  approved: ["ELIGIBLE"],
  rejected: ["INELIGIBLE"],
} as const;
export type RequestStage = keyof typeof REQUEST_STAGES;
export type TutorStage = keyof typeof TUTOR_STAGES;

export function parseRequestListParams(params: Params) {
  return {
    page: parsePage(params),
    size: parsePageSize(params),
    q: parseQuery(params),
    status: oneOf(single(params, "status"), learnerStatuses),
    stage: oneOf(
      single(params, "stage"),
      Object.keys(REQUEST_STAGES) as RequestStage[],
    ),
    assignedTo: (single(params, "assignedTo") ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 120),
    goal: oneOf(single(params, "goal"), keysOf(goalLabels)),
    format: oneOf(single(params, "format"), keysOf(formatLabels)),
    overdue: single(params, "overdue") === "1",
  };
}

export function parseTutorListParams(params: Params) {
  return {
    page: parsePage(params),
    size: parsePageSize(params),
    q: parseQuery(params),
    status: oneOf(single(params, "status"), tutorStatuses),
    stage: oneOf(
      single(params, "stage"),
      Object.keys(TUTOR_STAGES) as TutorStage[],
    ),
    accepting: oneOf(single(params, "accepting"), ["yes", "no"] as const),
    area: oneOf(single(params, "area"), keysOf(teachingAreaLabels)),
    format: oneOf(single(params, "format"), [
      "online",
      "in_person",
      "either",
    ] as const),
  };
}

export function parseConnectionListParams(params: Params) {
  return {
    page: parsePage(params),
    size: parsePageSize(params),
    q: parseQuery(params),
    status: oneOf(single(params, "status"), connectionStatuses),
    confirmed: single(params, "confirmed") === "1",
    payment: oneOf(single(params, "payment"), [
      "NOT_DUE",
      "UNPAID",
      "PAID",
    ] as const),
  };
}

export function parseMatchParams(params: Params) {
  return {
    page: parsePage(params),
    soft: {
      level: single(params, "level") === "1",
      slots: single(params, "slots") === "1",
      fee: single(params, "fee") === "1",
    },
    showAll: single(params, "all") === "1",
  };
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
