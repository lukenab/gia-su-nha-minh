import type { ReactNode } from "react";

import { FileSearch, TriangleAlert } from "lucide-react";
import Link from "next/link";

import type { Paged } from "@/features/admin/types";

import {
  describeSla,
  formatDuration,
  responseSla,
  normalizeStatus,
  statusLabel,
  type ResponseSla,
  type WorkflowKind,
} from "@/shared/lib/workflow";

import styles from "./admin.module.css";

const tones: Record<WorkflowKind, Record<string, string>> = {
  learner: {
    NEW: "toneWarn",
    CONTACTED: "toneInfo",
    SEARCHING: "toneInfo",
    INTRODUCED: "toneProgress",
    STARTED: "toneGood",
    CLOSED: "toneMuted",
  },
  tutor: {
    NEW: "toneWarn",
    REVIEWING: "toneInfo",
    ELIGIBLE: "toneGood",
    INELIGIBLE: "toneMuted",
  },
  connection: {
    REVIEWING: "toneInfo",
    CONFIRMED: "toneGood",
    INTRODUCED: "toneProgress",
    STARTED: "toneGood",
    DECLINED: "toneMuted",
  },
};

export function StatusBadge({
  kind,
  status,
  large,
}: {
  kind: WorkflowKind;
  status: unknown;
  large?: boolean;
}) {
  const value = normalizeStatus(kind, status);
  return (
    <span
      className={`${styles.badge} ${styles[tones[kind][value] ?? "toneMuted"]} ${large ? styles.badgeLarge : ""}`}
    >
      {statusLabel(kind, value)}
    </span>
  );
}

/** The 24-hour mark: a red pill only while a request is overdue. */
export function SlaBadge({ sla }: { sla: ResponseSla }) {
  const tone =
    sla.kind === "overdue"
      ? "toneDanger"
      : sla.kind === "waiting"
        ? "toneWarn"
        : sla.kind === "met"
          ? "toneGood"
          : sla.kind === "late"
            ? "toneWarn"
            : "toneMuted";
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {describeSla(sla)}
    </span>
  );
}

/**
 * A request's status in one cell. The 24-hour mark only matters while the
 * request is still New, so it is shown then and nowhere else.
 */
export function RequestStatus({
  status,
  createdAt,
  contactedAt,
}: {
  status: unknown;
  createdAt: Date | string;
  contactedAt?: Date | string | null;
}) {
  const value = normalizeStatus("learner", status);
  if (value !== "NEW") return <StatusBadge kind="learner" status={value} />;
  const sla = responseSla({ status: value, createdAt, contactedAt });
  return (
    <span className={styles.statusCell}>
      <StatusBadge kind="learner" status={value} />
      {sla.kind === "overdue" ? (
        <span className={`${styles.badge} ${styles.toneDanger}`}>
          Overdue {formatDuration(sla.ms)}
        </span>
      ) : sla.kind === "waiting" ? (
        <span className={styles.slaText}>{formatDuration(sla.ms)} left</span>
      ) : null}
    </span>
  );
}

/** A tutor's status with what matters next: availability or review progress. */
export function TutorStatus({
  status,
  accepting,
  reviewed,
}: {
  status: unknown;
  accepting?: boolean | null;
  reviewed: number;
}) {
  const value = normalizeStatus("tutor", status);
  const detail =
    value === "ELIGIBLE"
      ? accepting === true
        ? "Taking learners"
        : accepting === false
          ? "Paused"
          : "Availability not confirmed"
      : value === "REVIEWING"
        ? `${reviewed}/3 checked`
        : null;
  return (
    <span className={styles.statusCell}>
      <StatusBadge kind="tutor" status={value} />
      {detail && <span className={styles.slaText}>{detail}</span>}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className={styles.pageHeader}>
      <div>
        {back && (
          <Link className={styles.link} href={back.href}>
            ← {back.label}
          </Link>
        )}
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.card}>
      {(title || action) && (
        <div className={styles.cardHead}>
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <FileSearch aria-hidden="true" />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <div className={styles.emptyActions}>{action}</div>}
    </div>
  );
}

export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.notice} ${styles.noticeDanger}`} role="alert">
      <span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
        <TriangleAlert size={20} aria-hidden="true" />
        {children}
      </span>
    </div>
  );
}

export function DefList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className={styles.dl}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function hrefWith(
  path: string,
  params: Record<string, string | number | boolean | undefined | null>,
  overrides: Record<string, string | number | undefined | null> = {},
) {
  const query = new URLSearchParams();
  const merged = { ...params, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === false
    )
      continue;
    query.set(key, value === true ? "1" : String(value));
  }
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

export function Pagination<T>({
  result,
  path,
  params,
  noun,
}: {
  result: Paged<T>;
  path: string;
  params: Record<string, string | number | boolean | undefined | null>;
  noun: string;
}) {
  if (!result.total) return null;
  const prev = result.page > 1;
  const next = result.page < result.pages;
  return (
    <nav className={styles.pager} aria-label="Pagination">
      <p>
        Showing {result.first}–{result.last} of {result.total} {noun}
      </p>
      <div className={styles.pagerButtons}>
        {prev ? (
          <Link
            className={`${styles.button} ${styles.buttonQuiet}`}
            href={hrefWith(path, params, { page: result.page - 1 })}
            rel="prev"
          >
            ← Previous
          </Link>
        ) : (
          <span
            className={`${styles.button} ${styles.buttonQuiet}`}
            aria-disabled="true"
            style={{ opacity: 0.5 }}
          >
            ← Previous
          </span>
        )}
        <span className={styles.pagerLabel}>
          Page {result.page}/{result.pages}
        </span>
        {next ? (
          <Link
            className={`${styles.button} ${styles.buttonQuiet}`}
            href={hrefWith(path, params, { page: result.page + 1 })}
            rel="next"
          >
            Next →
          </Link>
        ) : (
          <span
            className={`${styles.button} ${styles.buttonQuiet}`}
            aria-disabled="true"
            style={{ opacity: 0.5 }}
          >
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}

export { styles as adminStyles };
