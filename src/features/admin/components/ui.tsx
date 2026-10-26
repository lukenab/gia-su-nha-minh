import type { ReactNode } from "react";

import Link from "next/link";

import type { HistoryEntry, Paged } from "@/features/admin/types";

import { formatDateTime } from "@/shared/lib/format";
import {
  describeSla,
  normalizeStatus,
  statusLabel,
  type ResponseSla,
  type WorkflowKind,
} from "@/shared/lib/workflow";

import styles from "./admin.module.css";
import { IconAlert, IconEmpty } from "./icons";

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

export function SlaBadge({ sla }: { sla: ResponseSla }) {
  const tone =
    sla.kind === "overdue" || sla.kind === "late"
      ? "toneDanger"
      : sla.kind === "waiting"
        ? "toneWarn"
        : sla.kind === "met"
          ? "toneGood"
          : "toneMuted";
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {describeSla(sla)}
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
      <IconEmpty />
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
        <IconAlert width={20} height={20} />
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
    <nav className={styles.pager} aria-label="Phân trang">
      <p>
        Hiển thị {result.first}–{result.last} trên {result.total} {noun}
      </p>
      <div className={styles.pagerButtons}>
        {prev ? (
          <Link
            className={`${styles.button} ${styles.buttonQuiet}`}
            href={hrefWith(path, params, { page: result.page - 1 })}
            rel="prev"
          >
            ← Trước
          </Link>
        ) : (
          <span
            className={`${styles.button} ${styles.buttonQuiet}`}
            aria-disabled="true"
            style={{ opacity: 0.5 }}
          >
            ← Trước
          </span>
        )}
        <span className={styles.pagerLabel}>
          Trang {result.page}/{result.pages}
        </span>
        {next ? (
          <Link
            className={`${styles.button} ${styles.buttonQuiet}`}
            href={hrefWith(path, params, { page: result.page + 1 })}
            rel="next"
          >
            Sau →
          </Link>
        ) : (
          <span
            className={`${styles.button} ${styles.buttonQuiet}`}
            aria-disabled="true"
            style={{ opacity: 0.5 }}
          >
            Sau →
          </span>
        )}
      </div>
    </nav>
  );
}

export function FilterBar({
  action,
  q,
  searchLabel,
  fields,
  clearHref,
  hidden,
}: {
  action: string;
  q: string;
  searchLabel: string;
  fields: {
    name: string;
    label: string;
    value?: string;
    options: { value: string; label: string }[];
  }[];
  clearHref: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form className={styles.filters} method="get" action={action} role="search">
      {hidden &&
        Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <div className={`${styles.field} ${styles.search}`}>
        <label htmlFor="filter-q">{searchLabel}</label>
        <input
          id="filter-q"
          className={styles.input}
          type="search"
          name="q"
          defaultValue={q}
          maxLength={60}
          placeholder="Ví dụ GSNM-2026 hoặc tên"
        />
      </div>
      {fields.map((field) => (
        <div className={styles.field} key={field.name}>
          <label htmlFor={`filter-${field.name}`}>{field.label}</label>
          <select
            id={`filter-${field.name}`}
            className={styles.select}
            name={field.name}
            defaultValue={field.value ?? ""}
          >
            <option value="">Tất cả</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          Lọc
        </button>
        <Link
          className={`${styles.button} ${styles.buttonQuiet}`}
          href={clearHref}
        >
          Xóa lọc
        </Link>
      </div>
    </form>
  );
}

export function HistoryList({
  kind,
  entries,
  emptyText,
}: {
  kind: WorkflowKind;
  entries: HistoryEntry[] | undefined;
  emptyText: string;
}) {
  const sorted = [...(entries ?? [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  if (!sorted.length) return <p className={styles.mutedText}>{emptyText}</p>;
  return (
    <ol className={styles.timeline}>
      {sorted.map((entry, index) => (
        <li key={`${String(entry.at)}-${index}`}>
          <strong>
            {entry.from
              ? `${statusLabel(kind, entry.from)} → ${statusLabel(kind, entry.to)}`
              : statusLabel(kind, entry.to)}
          </strong>
          <span>
            {formatDateTime(entry.at)} · {entry.by}
          </span>
          {entry.note && <p>{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}

export { styles as adminStyles };
