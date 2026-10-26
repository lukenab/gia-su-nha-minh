"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./admin-shortcut.module.css";

/**
 * A small shortcut that only appears for a signed-in team member. Visitors
 * never see it, and the public pages stay statically rendered.
 */
export function AdminShortcut() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/session", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setVisible(data?.authenticated === true))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!visible) return null;
  return (
    <Link className={styles.shortcut} href="/admin">
      Vào quản trị
    </Link>
  );
}
