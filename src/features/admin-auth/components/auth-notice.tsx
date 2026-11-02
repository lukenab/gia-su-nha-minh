"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
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
    if (!url.searchParams.has("error") && !url.searchParams.has("status"))
      return;
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
      {tone === "error" ? (
        <CircleAlert aria-hidden="true" />
      ) : (
        <CircleCheck aria-hidden="true" />
      )}
      <p>{children}</p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss message"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
