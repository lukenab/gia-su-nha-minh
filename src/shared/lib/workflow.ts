/*
 * Manual hand-over workflow used by /admin. Pure functions only (no database,
 * no Next.js imports) so the rules can be unit-tested and shared by the API,
 * the pages and the forms.
 */

export const WORKFLOW_KINDS = ["learner", "tutor", "connection"] as const;
export type WorkflowKind = (typeof WORKFLOW_KINDS)[number];

export const learnerStatuses = [
  "NEW",
  "CONTACTED",
  "SEARCHING",
  "INTRODUCED",
  "STARTED",
  "CLOSED",
] as const;
export type LearnerStatus = (typeof learnerStatuses)[number];

export const tutorStatuses = [
  "NEW",
  "REVIEWING",
  "ELIGIBLE",
  "INELIGIBLE",
] as const;
export type TutorStatus = (typeof tutorStatuses)[number];

export const connectionStatuses = [
  "REVIEWING",
  "INTRODUCED",
  "DECLINED",
  "CONFIRMED",
  "STARTED",
] as const;
export type ConnectionStatus = (typeof connectionStatuses)[number];

export type StatusOf = {
  learner: LearnerStatus;
  tutor: TutorStatus;
  connection: ConnectionStatus;
};

type StatusLabels = { [K in WorkflowKind]: Record<StatusOf[K], string> };

/** Labels shown in the admin area. */
export const statusLabels: StatusLabels = {
  learner: {
    NEW: "New",
    CONTACTED: "Contacted",
    SEARCHING: "Matching",
    INTRODUCED: "Introduced",
    STARTED: "Learning",
    CLOSED: "Closed",
  },
  tutor: {
    NEW: "New",
    REVIEWING: "In review",
    ELIGIBLE: "Approved",
    INELIGIBLE: "Rejected",
  },
  connection: {
    REVIEWING: "Proposed",
    INTRODUCED: "Introduced",
    CONFIRMED: "Agreed",
    DECLINED: "Ended",
    STARTED: "Learning",
  },
};

/** Vietnamese labels, kept for the CSV export the team opens in Excel. */
export const statusLabelsVi: StatusLabels = {
  learner: {
    NEW: "Mới nhận",
    CONTACTED: "Đã liên hệ",
    SEARCHING: "Đang tìm gia sư",
    INTRODUCED: "Đã giới thiệu",
    STARTED: "Đã bắt đầu học",
    CLOSED: "Đã đóng",
  },
  tutor: {
    NEW: "Mới nhận",
    REVIEWING: "Đang xem xét",
    ELIGIBLE: "Đủ điều kiện giới thiệu",
    INELIGIBLE: "Không đủ điều kiện",
  },
  connection: {
    REVIEWING: "Đang xem xét",
    INTRODUCED: "Đã giới thiệu",
    CONFIRMED: "Hai bên đã xác nhận",
    DECLINED: "Không tiếp tục",
    STARTED: "Đã bắt đầu học",
  },
};

/** Allowed next statuses. A status can never be skipped or set directly. */
export const transitions: {
  [K in WorkflowKind]: Record<StatusOf[K], readonly StatusOf[K][]>;
} = {
  learner: {
    NEW: ["CONTACTED", "CLOSED"],
    CONTACTED: ["SEARCHING", "CLOSED"],
    SEARCHING: ["INTRODUCED", "CLOSED"],
    INTRODUCED: ["STARTED", "SEARCHING", "CLOSED"],
    STARTED: ["CLOSED"],
    CLOSED: [],
  },
  tutor: {
    NEW: ["REVIEWING"],
    REVIEWING: ["ELIGIBLE", "INELIGIBLE"],
    ELIGIBLE: ["REVIEWING", "INELIGIBLE"],
    INELIGIBLE: ["REVIEWING"],
  },
  connection: {
    REVIEWING: ["INTRODUCED", "DECLINED"],
    INTRODUCED: ["CONFIRMED", "DECLINED"],
    CONFIRMED: ["STARTED", "DECLINED"],
    STARTED: [],
    DECLINED: ["REVIEWING"],
  },
};

/** Moving into these statuses must record a reason. */
const noteRequired: { [K in WorkflowKind]: readonly StatusOf[K][] } = {
  learner: ["CLOSED"],
  tutor: ["INELIGIBLE"],
  connection: ["DECLINED"],
};

export const statusValues: { [K in WorkflowKind]: readonly StatusOf[K][] } = {
  learner: learnerStatuses,
  tutor: tutorStatuses,
  connection: connectionStatuses,
};

export const initialStatus: { [K in WorkflowKind]: StatusOf[K] } = {
  learner: "NEW",
  tutor: "NEW",
  connection: "REVIEWING",
};

/** Records written before the workflow existed only carry NEW. */
export function normalizeStatus<K extends WorkflowKind>(
  kind: K,
  value: unknown,
): StatusOf[K] {
  const known = statusValues[kind] as readonly unknown[];
  return (known.includes(value) ? value : initialStatus[kind]) as StatusOf[K];
}

export function statusLabel<K extends WorkflowKind>(
  kind: K,
  value: unknown,
  labelSet: StatusLabels = statusLabels,
) {
  const labels = labelSet[kind] as Record<string, string>;
  return labels[normalizeStatus(kind, value)];
}

export function nextStatuses<K extends WorkflowKind>(
  kind: K,
  from: StatusOf[K],
): readonly StatusOf[K][] {
  return transitions[kind][from];
}

export function canTransition<K extends WorkflowKind>(
  kind: K,
  from: StatusOf[K],
  to: StatusOf[K],
) {
  return (transitions[kind][from] as readonly string[]).includes(to);
}

export function statusNeedsNote<K extends WorkflowKind>(
  kind: K,
  to: StatusOf[K],
) {
  return (noteRequired[kind] as readonly string[]).includes(to);
}

export const MIN_REASON_LENGTH = 3;

/* ------------------------------------------------------------------ */
/* 24-hour response commitment                                         */
/* ------------------------------------------------------------------ */

export const RESPONSE_SLA_MS = 24 * 60 * 60 * 1000;

export type ResponseSla =
  /** Not contacted yet and still inside the 24 hours. */
  | { kind: "waiting"; ms: number }
  /** Not contacted yet and past the 24 hours. */
  | { kind: "overdue"; ms: number }
  /** Contacted within 24 hours of the request. */
  | { kind: "met"; ms: number }
  /** Contacted after more than 24 hours. */
  | { kind: "late"; ms: number }
  /** Closed without a recorded contact, or no contact time was recorded. */
  | { kind: "none" };

/**
 * The form arriving in the database is NOT a contact. Only `contactedAt`,
 * written when the team marks the request as contacted, stops the clock.
 */
export function responseSla(input: {
  status: unknown;
  createdAt: Date | string | number;
  contactedAt?: Date | string | number | null;
  now?: Date | number;
}): ResponseSla {
  const created = new Date(input.createdAt).getTime();
  const now = new Date(input.now ?? Date.now()).getTime();
  if (Number.isNaN(created)) return { kind: "none" };

  if (input.contactedAt) {
    const elapsed = new Date(input.contactedAt).getTime() - created;
    return {
      kind: elapsed <= RESPONSE_SLA_MS ? "met" : "late",
      ms: Math.max(0, elapsed),
    };
  }
  if (normalizeStatus("learner", input.status) !== "NEW") {
    return { kind: "none" };
  }
  const remaining = created + RESPONSE_SLA_MS - now;
  return remaining >= 0
    ? { kind: "waiting", ms: remaining }
    : { kind: "overdue", ms: -remaining };
}

export function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  if (days > 0) return hours ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return rest ? `${hours}h ${rest}m` : `${hours}h`;
  return `${rest}m`;
}

export function describeSla(sla: ResponseSla) {
  switch (sla.kind) {
    case "waiting":
      return `${formatDuration(sla.ms)} left`;
    case "overdue":
      return `Overdue by ${formatDuration(sla.ms)}`;
    case "met":
      return `On time (${formatDuration(sla.ms)})`;
    case "late":
      return `Late (${formatDuration(sla.ms)})`;
    default:
      return "No contact recorded";
  }
}

/* ------------------------------------------------------------------ */
/* Helpers for the forms                                               */
/* ------------------------------------------------------------------ */

export function statusOptions<K extends WorkflowKind>(
  kind: K,
  from: StatusOf[K],
) {
  const labels = statusLabels[kind] as Record<string, string>;
  return nextStatuses(kind, from)
    .filter((value) => kind !== "connection" || value !== "CONFIRMED")
    .map((value) => ({
      value: value as string,
      label: labels[value as string] as string,
      needsNote: statusNeedsNote(kind, value),
    }));
}

/**
 * Connections never change a request on their own. This only proposes the
 * next request status so the team can confirm it in one click.
 */
export function suggestRequestStatus(
  requestStatus: LearnerStatus,
  connections: readonly string[],
): { to: LearnerStatus; text: string } | null {
  const has = (...wanted: string[]) =>
    connections.some((status) => wanted.includes(status));
  if (
    requestStatus === "SEARCHING" &&
    has("INTRODUCED", "CONFIRMED", "STARTED")
  ) {
    return {
      to: "INTRODUCED",
      text: "A tutor has been introduced for this request.",
    };
  }
  if (requestStatus === "INTRODUCED" && has("STARTED")) {
    return { to: "STARTED", text: "A connection has started lessons." };
  }
  if (
    requestStatus === "INTRODUCED" &&
    connections.length > 0 &&
    connections.every((status) => status === "DECLINED")
  ) {
    return {
      to: "SEARCHING",
      text: "No introduced tutor is continuing. You can go back to finding a tutor.",
    };
  }
  return null;
}
