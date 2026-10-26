"use client";

import { useEffect, useState, type ReactNode } from "react";

import styles from "./auth.module.css";

/**
 * Message shown after a redirect (for example a failed Google sign-in).
 * The `error` and `status` query parameters are removed from the address bar
 * once it is shown, so reloading the page does not bring it back.
 */
export function AuthNotice({
  tone,
  children,
}: {
  tone: "error" | "ok";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("error") && !url.searchParams.has("status")) return;
    url.searchParams.delete("error");
    url.searchParams.delete("status");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  if (!open) return null;
  return (
    <div
      className={`${styles.notice} ${tone === "error" ? styles.noticeError : styles.noticeOk}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {tone === "error" ? (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.01" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12.5 2.5 2.5 4.5-5" />
          </>
        )}
      </svg>
      <p>{children}</p>
      <button type="button" onClick={() => setOpen(false)} aria-label="Đóng thông báo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
