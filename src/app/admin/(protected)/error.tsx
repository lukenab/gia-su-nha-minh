"use client";

import styles from "@/features/admin/components/admin.module.css";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className={styles.card} role="alert">
      <div className={styles.empty}>
        <h3>This page could not be shown</h3>
        <p>
          Something went wrong while loading the data. Nothing you saved was
          lost. Try again, or come back later if the error continues.
        </p>
        <div className={styles.emptyActions}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={reset}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
