"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import styles from "./admin.module.css";
import { sendAdminJson } from "./api-client";

export function NoteForm({
  endpoint,
  initial,
  meta,
}: {
  endpoint: string;
  initial: string;
  meta?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [note, setNote] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    setDone("");
    const result = await sendAdminJson(endpoint, "PATCH", { note });
    if (result.ok) {
      setDone("Đã lưu ghi chú.");
      router.refresh();
    } else {
      setError(result.error);
    }
    submitting.current = false;
    setBusy(false);
  }

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      <div className={styles.field}>
        <label htmlFor={`${id}-note`}>Ghi chú nội bộ</label>
        <textarea
          id={`${id}-note`}
          className={styles.textarea}
          value={note}
          maxLength={2000}
          onChange={(event) => setNote(event.target.value)}
          disabled={busy}
        />
        <small>
          Chỉ đội ngũ nhìn thấy. {meta ?? "Chưa có ghi chú nào được lưu."}
        </small>
      </div>
      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonQuiet}`}
          disabled={busy || note.trim() === initial.trim()}
        >
          {busy ? "Đang lưu..." : "Lưu ghi chú"}
        </button>
      </div>
      <div aria-live="polite">
        {done && (
          <p className={`${styles.message} ${styles.messageOk}`}>{done}</p>
        )}
        {error && (
          <p
            className={`${styles.message} ${styles.messageError}`}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
