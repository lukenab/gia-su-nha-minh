/*
 * Pure calculations behind the admin overview: time ranges, the reply-time
 * chart, the matching funnel and open demand against available tutors. No
 * database or Next.js imports, so the numbers can be unit-tested. Every
 * figure comes from saved statuses and timestamps; nothing is estimated.
 */
import { RESPONSE_SLA_MS } from "../../shared/lib/workflow.ts";
import { areasForGoal } from "./matching.ts";

export const RANGES = { "7d": 7, "30d": 30, "90d": 90 } as const;
export type RangeKey = keyof typeof RANGES;
export const DEFAULT_RANGE: RangeKey = "30d";

export function parseRange(value: unknown): RangeKey {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw in RANGES
    ? (raw as RangeKey)
    : DEFAULT_RANGE;
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** Vietnam has no daylight saving time, so a fixed offset is exact. */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Start of the Vietnam calendar day that contains `time`. */
export function startOfVietnamDay(time: number) {
  return Math.floor((time + VN_OFFSET_MS) / DAY_MS) * DAY_MS - VN_OFFSET_MS;
}

export type Window = { start: Date; end: Date };

/** The selected range ending now, and the equal range just before it. */
export function windowsFor(range: RangeKey, now = new Date()) {
  const length = RANGES[range] * DAY_MS;
  const end = now.getTime();
  return {
    current: { start: new Date(end - length), end: new Date(end) },
    previous: {
      start: new Date(end - 2 * length),
      end: new Date(end - length),
    },
  };
}

const inside = (value: Date | string | null | undefined, window: Window) => {
  if (!value) return false;
  const time = new Date(value).getTime();
  return time >= window.start.getTime() && time < window.end.getTime();
};

/* ------------------------------ KPIs ------------------------------ */

export type ReplyRecord = {
  createdAt: Date | string;
  contactedAt?: Date | string | null;
  status?: unknown;
};

/** Share of requests contacted within 24 hours, by contact time in window. */
export function replyRate(records: readonly ReplyRecord[], window: Window) {
  const contacted = records.filter((item) => inside(item.contactedAt, window));
  const onTime = contacted.filter(
    (item) =>
      new Date(item.contactedAt!).getTime() -
        new Date(item.createdAt).getTime() <=
      RESPONSE_SLA_MS,
  ).length;
  return {
    total: contacted.length,
    onTime,
    rate: contacted.length ? onTime / contacted.length : null,
  };
}

export function countInside(
  values: readonly (Date | string | null | undefined)[],
  window: Window,
) {
  return values.filter((value) => inside(value, window)).length;
}

export function sumInside(
  rows: readonly { at?: Date | string | null; amount?: number | null }[],
  window: Window,
) {
  return rows
    .filter((row) => inside(row.at, window))
    .reduce((total, row) => total + (row.amount ?? 0), 0);
}

/* --------------------------- reply chart --------------------------- */

export type ReplyBucket = {
  label: string;
  start: string;
  onTime: number;
  late: number;
  notContacted: number;
};

const dayLabel = (time: number) =>
  new Date(time).toLocaleDateString("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
  });

/**
 * Requests received per day (7 and 30 days) or per week (90 days), split by
 * what happened next: contacted within 24 hours, contacted later, or not
 * contacted (yet, or closed without a recorded contact).
 */
export function replyBuckets(
  records: readonly ReplyRecord[],
  range: RangeKey,
  now = new Date(),
): ReplyBucket[] {
  const days = RANGES[range];
  const size = range === "90d" ? 7 : 1;
  const count = Math.ceil(days / size);
  const lastStart = startOfVietnamDay(now.getTime()) - (size - 1) * DAY_MS;
  const buckets = [...Array(count).keys()].map((index) => {
    const start = lastStart - (count - 1 - index) * size * DAY_MS;
    return {
      label: dayLabel(start),
      start: new Date(start).toISOString(),
      onTime: 0,
      late: 0,
      notContacted: 0,
    };
  });
  const first = new Date(buckets[0]!.start).getTime();
  for (const record of records) {
    const created = new Date(record.createdAt).getTime();
    const index = Math.floor((created - first) / (size * DAY_MS));
    const bucket = buckets[index];
    if (!bucket || created > now.getTime()) continue;
    if (!record.contactedAt) bucket.notContacted += 1;
    else if (
      new Date(record.contactedAt).getTime() - created <=
      RESPONSE_SLA_MS
    )
      bucket.onTime += 1;
    else bucket.late += 1;
  }
  return buckets;
}

/* ----------------------------- funnel ----------------------------- */

export type FunnelConnection = {
  request: unknown;
  introducedAt?: Date | string | null;
  confirmedAt?: Date | string | null;
  paymentStatus?: string | null;
};

export type FunnelStage = { key: string; label: string; count: number };

/**
 * Requests received in the range and how far each one got. A request counts
 * at a stage when any of its connections reached it.
 */
export function matchingFunnel(
  requests: readonly { _id: unknown; contactedAt?: Date | string | null }[],
  connections: readonly FunnelConnection[],
): FunnelStage[] {
  const ids = new Set(requests.map((item) => String(item._id)));
  const reached = (test: (item: FunnelConnection) => boolean) =>
    new Set(
      connections
        .filter((item) => ids.has(String(item.request)) && test(item))
        .map((item) => String(item.request)),
    ).size;
  return [
    { key: "received", label: "Requests received", count: requests.length },
    {
      key: "contacted",
      label: "Contacted",
      count: requests.filter((item) => item.contactedAt).length,
    },
    {
      key: "introduced",
      label: "Introduced",
      count: reached((item) => Boolean(item.introducedAt)),
    },
    {
      key: "confirmed",
      label: "Agreed",
      count: reached((item) => Boolean(item.confirmedAt)),
    },
    {
      key: "paid",
      label: "Fee received",
      count: reached((item) => item.paymentStatus === "PAID"),
    },
  ];
}

/* ------------------------- demand vs supply ------------------------- */

/** Goals that map to a teaching area; "unsure" and "other" cannot be matched. */
export const MATCHABLE_GOALS = [
  "communication",
  "ielts",
  "toeic",
  "foundation",
  "work",
] as const;

export type DemandRow = {
  goal: string;
  requests: number;
  tutors: number;
};

/**
 * Open requests (not yet introduced to a tutor) per goal against tutors who
 * are eligible, taking learners and teach that area.
 */
export function demandAgainstTutors(
  openGoals: readonly string[],
  tutorAreas: readonly (readonly string[] | null | undefined)[],
): DemandRow[] {
  return MATCHABLE_GOALS.map((goal) => {
    const areas = areasForGoal(goal) ?? [];
    return {
      goal,
      requests: openGoals.filter((value) => value === goal).length,
      tutors: tutorAreas.filter((list) =>
        areas.some((area) => list?.includes(area)),
      ).length,
    };
  });
}
