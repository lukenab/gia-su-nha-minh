"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import styles from "./overview.module.css";

export type QueueRow = {
  id: string;
  href: string;
  code: string;
  name: string;
  meta: string;
  badge?: { text: string; tone: "danger" | "warn" | "muted" };
};

export type QueueTab = {
  key: string;
  label: string;
  total: number;
  viewAll: string;
  empty: string;
  rows: QueueRow[];
};

/** Work waiting for the team, oldest first, in tabs (WAI-ARIA tabs pattern). */
export function AttentionQueue({ tabs }: { tabs: QueueTab[] }) {
  const id = useId();
  const [active, setActive] = useState(
    () => tabs.find((tab) => tab.total > 0)?.key ?? tabs[0]?.key ?? "",
  );
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.key === active);
    const move = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    let next = -1;
    if (move) next = (index + move + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    setActive(tabs[next]!.key);
    buttons.current[next]?.focus();
  }

  if (!current) return null;
  return (
    <div className={styles.queue}>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Needs attention"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-${tab.key}`}
            aria-selected={tab.key === active}
            aria-controls={`${id}-panel`}
            tabIndex={tab.key === active ? 0 : -1}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
            <span className={styles.tabCount}>{tab.total}</span>
          </button>
        ))}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-${current.key}`}
        className={styles.queuePanel}
      >
        {current.rows.length ? (
          <>
            <ul className={styles.queueList}>
              {current.rows.map((row) => (
                <li key={row.id}>
                  <Link href={row.href} className={styles.queueRow}>
                    <span className={styles.queueCode}>{row.code}</span>
                    <span className={styles.queueMain}>
                      <strong>{row.name}</strong>
                      <span>{row.meta}</span>
                    </span>
                    {row.badge && (
                      <span
                        className={`${styles.queueBadge} ${styles[`badge-${row.badge.tone}`]}`}
                      >
                        {row.badge.text}
                      </span>
                    )}
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className={styles.queueArrow}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            {current.total > current.rows.length && (
              <Link className={styles.queueMore} href={current.viewAll}>
                View all {current.total}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )}
          </>
        ) : (
          <p className={styles.queueEmpty}>
            <CircleCheck size={18} aria-hidden="true" />
            {current.empty}
          </p>
        )}
      </div>
    </div>
  );
}
