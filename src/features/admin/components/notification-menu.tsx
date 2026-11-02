"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { AdminSummary } from "./use-admin-summary";

import styles from "./admin.module.css";

const SEEN_KEY = "gsnm-admin-notifications-seen";

function readSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    return "";
  }
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

/**
 * Work waiting for the team (see useAdminSummary), refreshed on navigation
 * and when the menu opens. "Read" only remembers, in this browser, the
 * newest item already seen.
 */
export function NotificationMenu({
  summary: { items, failed, reload },
}: {
  summary: AdminSummary;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDetailsElement>(null);
  const [seen, setSeen] = useState(readSeen);

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (ref.current?.open && !ref.current.contains(event.target as Node))
        ref.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const unread = (items ?? []).filter((item) => item.at > seen).length;

  function markAllRead() {
    const newest = items?.[0]?.at;
    if (!newest) return;
    try {
      localStorage.setItem(SEEN_KEY, newest);
    } catch {
      /* kept for this page only */
    }
    setSeen(newest);
  }

  return (
    <details
      className={styles.notificationMenu}
      ref={ref}
      onToggle={(event) => {
        if (event.currentTarget.open) reload();
      }}
    >
      <summary
        className={`${styles.iconButton} ${styles.headerControl} ${styles.notificationControl}`}
        aria-label={`Notifications, ${unread} unread`}
      >
        <Bell size={15} aria-hidden="true" />
        {unread > 0 && (
          <span className={styles.notificationIndicator} aria-hidden="true" />
        )}
      </summary>
      <section
        className={styles.notificationPopover}
        aria-label="Notifications"
      >
        <div className={styles.notificationHeading}>
          <h2>
            Notifications{" "}
            <span className={styles.countBadge} aria-live="polite">
              {unread}
            </span>
          </h2>
          <button
            type="button"
            className={styles.notificationMarkAll}
            disabled={!unread}
            onClick={markAllRead}
          >
            <CheckCheck size={14} aria-hidden="true" />
            Mark all as read
          </button>
        </div>
        {failed && !items ? (
          <p className={styles.notificationEmpty} role="alert">
            Could not load notifications. Please try again.
          </p>
        ) : !items ? (
          <p className={styles.notificationEmpty}>Loading...</p>
        ) : !items.length ? (
          <p className={styles.notificationEmpty}>
            Nothing is waiting for the team.
          </p>
        ) : (
          <ul className={styles.notificationList}>
            {items.map((item) => {
              const isUnread = item.at > seen;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`${styles.notificationItem} ${isUnread ? styles.notificationUnread : ""}`}
                  >
                    <span className={styles.notificationCopy}>
                      <strong>{item.title}</strong>
                      <span>{item.message}</span>
                      <span className={styles.notificationMeta}>
                        <span>{item.context}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={item.at}>{timeAgo(item.at)}</time>
                      </span>
                    </span>
                    {isUnread && (
                      <span className={styles.notificationDot}>
                        <span className={styles.srOnly}>Unread</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </details>
  );
}
