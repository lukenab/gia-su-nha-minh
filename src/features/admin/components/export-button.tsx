"use client";
import { Download } from "lucide-react";

import styles from "./list.module.css";

/** Downloads the list as CSV with the filters currently in the address bar. */
export function ExportButton({
  kind,
}: {
  kind: "requests" | "tutors" | "connections";
}) {
  return (
    <a
      className={styles.headerButton}
      href={`/api/admin/export/${kind}`}
      onClick={(e) => {
        e.currentTarget.href = `/api/admin/export/${kind}${window.location.search}`;
      }}
    >
      <Download size={15} aria-hidden="true" />
      Export CSV
    </a>
  );
}
