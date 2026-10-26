"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import styles from "./admin.module.css";
import { sendAdminJson } from "./api-client";

/** Records that the team is reviewing this tutor for this request. */
export function ConnectForm({
  requestId,
  tutorId,
}: {
  requestId: string;
  tutorId: string;
}) {
  const router = useRouter();
  const id = useId();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    const result = await sendAdminJson("/api/admin/connections", "POST", {
      requestId,
      tutorId,
      note,
    });
    if (result.ok && typeof result.data.id === "string") {
      router.push(`/admin/connections/${result.data.id}`);
      return; // keep the button locked while navigating
    }
    if (!result.ok) {
      setError(result.error);
      if (result.status === 409) router.refresh();
    }
    submitting.current = false;
    setBusy(false);
  }

  return (
    <form onSubmit={submit}>
      <div className={styles.connectRow}>
        <div className={styles.field}>
          <label htmlFor={`${id}-note`}>Ghi chú ban đầu (không bắt buộc)</label>
          <input
            id={`${id}-note`}
            className={styles.input}
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            disabled={busy}
          />
        </div>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={busy}
        >
          {busy ? "Đang tạo..." : "Ghi nhận kết nối"}
        </button>
      </div>
      {error && (
        <p
          className={`${styles.message} ${styles.messageError}`}
          role="alert"
          style={{ marginTop: 10 }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
