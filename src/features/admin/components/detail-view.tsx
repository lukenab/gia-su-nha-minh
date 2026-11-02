/*
 * Layout for the admin record pages (request, tutor profile, connection):
 * a header that names the person, a main column of sections, a properties
 * column and one activity timeline. Server components.
 */
import type { ReactNode } from "react";

import {
  ArrowLeft,
  ArrowRightLeft,
  BadgeCheck,
  CircleDot,
  HandCoins,
  Handshake,
  NotebookPen,
  Plus,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { formatDateTime } from "@/shared/lib/format";

import { CopyButton } from "./detail-controls";
import styles from "./detail.module.css";
import { Ago } from "./list-view";

export { styles as detailStyles };

export function DetailHeader({
  back,
  title,
  code,
  meta,
  actions,
}: {
  back: { href: string; label: string };
  title: ReactNode;
  code: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <Link className={styles.back} href={back.href}>
        <ArrowLeft size={14} aria-hidden="true" />
        {back.label}
      </Link>
      <div className={styles.headerRow}>
        <div className={styles.headerCopy}>
          <h1>{title}</h1>
          <p className={styles.meta}>
            <span className={styles.code}>{code}</span>
            <CopyButton value={code} label="Copy reference code" />
            {meta && (
              <>
                <span aria-hidden="true">·</span>
                {meta}
              </>
            )}
          </p>
        </div>
        {actions && <div className={styles.headerActions}>{actions}</div>}
      </div>
    </header>
  );
}

export function DetailLayout({
  main,
  aside,
}: {
  main: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.main}>{main}</div>
      <aside className={styles.aside} aria-label="Properties">
        {aside}
      </aside>
    </div>
  );
}

export function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Label/value rows; a missing value shows as a muted dash. */
export function Fields({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className={styles.fields}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.value === "" || item.value == null ? (
              <span className={styles.muted}>—</span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Secondary fields, folded away until someone needs them. */
export function MoreDetails({ children }: { children: ReactNode }) {
  return (
    <details className={styles.more}>
      <summary>Show all details</summary>
      {children}
    </details>
  );
}

export function Properties({
  title = "Properties",
  items,
}: {
  title?: string;
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      <dl className={styles.properties}>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <span className={styles.muted}>{children}</span>;
}

/* ------------------------------ activity ------------------------------ */

export type ActivityKind =
  | "created"
  | "status"
  | "assignment"
  | "availability"
  | "review"
  | "agreement"
  | "payment"
  | "note";

export type ActivityItem = {
  kind: ActivityKind;
  at: Date | string;
  by?: string;
  text: ReactNode;
  note?: string;
};

const ICONS = {
  created: Plus,
  status: CircleDot,
  assignment: UserRound,
  availability: ArrowRightLeft,
  review: BadgeCheck,
  agreement: Handshake,
  payment: HandCoins,
  note: NotebookPen,
} as const;

/** Every recorded change in one timeline, newest first. */
export function Activity({
  items,
  now,
}: {
  items: ActivityItem[];
  now: number;
}) {
  const sorted = [...items].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  return (
    <Section title="Activity">
      {sorted.length ? (
        <ol className={styles.activity}>
          {sorted.map((item, index) => {
            const Icon = ICONS[item.kind];
            return (
              <li key={`${String(item.at)}-${index}`}>
                <span className={styles.activityIcon} aria-hidden="true">
                  <Icon size={14} />
                </span>
                <div>
                  <p>
                    {item.text}
                    {item.by && (
                      <span className={styles.muted}> · {item.by}</span>
                    )}
                    <span className={styles.muted}> · </span>
                    <span title={formatDateTime(item.at)}>
                      <Ago value={item.at} now={now} />
                    </span>
                  </p>
                  {item.note && (
                    <p className={styles.activityNote}>{item.note}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={styles.muted}>Nothing recorded yet.</p>
      )}
    </Section>
  );
}
