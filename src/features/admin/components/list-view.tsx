/*
 * Building blocks for the admin list pages (requests, tutors, connections):
 * status tabs with counts, the table frame, two-line cells and relative
 * times. Server components; the interactive parts are in list-controls.tsx.
 */
import type { ReactNode } from "react";

import Link from "next/link";

import { formatDateTime } from "@/shared/lib/format";

import styles from "./list.module.css";

export { styles as listStyles };

export type ListTab = {
  key: string;
  label: string;
  count: number;
  href: string;
  active: boolean;
};

export function ListTabs({ label, tabs }: { label: string; tabs: ListTab[] }) {
  return (
    <nav className={styles.tabs} aria-label={label}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          scroll={false}
        >
          {tab.label}
          <span className={styles.tabCount}>{tab.count}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Toolbar, table and footer in one bordered frame. */
export function ListFrame({
  toolbar,
  notice,
  children,
  footer,
}: {
  toolbar: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={styles.frame}>
      {toolbar}
      {notice}
      <div className={styles.tableWrap}>{children}</div>
      {footer}
    </section>
  );
}

/**
 * The first cell of a row: a link that covers the whole row, so a click
 * anywhere opens the record while keyboard users still tab to one link.
 */
export function PrimaryCell({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <span className={styles.primary}>
      <Link href={href} className={styles.rowLink}>
        {title}
      </Link>
      {subtitle && <span className={styles.code}>{subtitle}</span>}
    </span>
  );
}

export function TwoLine({ main, sub }: { main: ReactNode; sub?: ReactNode }) {
  return (
    <span className={styles.twoLine}>
      <span>{main}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </span>
  );
}

export function Empty({ children = "—" }: { children?: ReactNode }) {
  return <span className={styles.empty}>{children}</span>;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** The time a list page is rendered, shared by every row on it. */
export function renderTime() {
  return Date.now();
}

/** "5 days ago", with the exact time on hover. */
export function Ago({
  value,
  now,
}: {
  value: Date | string | null | undefined;
  now: number;
}) {
  if (!value) return <Empty />;
  const date = new Date(value);
  const minutes = Math.round((date.getTime() - now) / 60_000);
  let text: string;
  if (Math.abs(minutes) < 60) text = relative.format(minutes, "minute");
  else if (Math.abs(minutes) < 1440)
    text = relative.format(Math.round(minutes / 60), "hour");
  else if (Math.abs(minutes) < 43_200)
    text = relative.format(Math.round(minutes / 1440), "day");
  else text = formatDateTime(date).split(",")[0] ?? "";
  return (
    <time
      className={styles.ago}
      dateTime={date.toISOString()}
      title={formatDateTime(date)}
    >
      {text}
    </time>
  );
}

export function Initials({ name }: { name: string }) {
  const words = name
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean);
  const letters =
    words.length > 1
      ? `${words[0]![0]}${words[words.length - 1]![0]}`
      : (words[0] ?? "?").slice(0, 2);
  return (
    <span className={styles.initials} aria-hidden="true">
      {letters.toUpperCase()}
    </span>
  );
}

export function ListEmpty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.listEmpty}>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}
