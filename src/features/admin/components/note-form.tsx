"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import styles from "./admin.module.css";
import { sendAdminJson } from "./api-client";
import detail from "./detail.module.css";

export function NoteForm({
  endpoint,
  initial,
  meta,
  hideLabel = false,
}: {
  endpoint: string;
  initial: string;
  meta?: string;
  /** The surrounding panel already names the note. */
  hideLabel?: boolean;
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
      setDone("Note saved.");
      router.refresh();
    } else {
      setError(result.error);
    }
    submitting.current = false;
    setBusy(false);
  }

  return (
    <form className={detail.noteForm} onSubmit={submit}>
      <label
        htmlFor={`${id}-note`}
        className={hideLabel ? styles.srOnly : detail.noteLabel}
      >
        Internal note
      </label>
      <textarea
        id={`${id}-note`}
        className={detail.noteInput}
        value={note}
        rows={3}
        maxLength={2000}
        placeholder="Add a note for the team"
        onChange={(event) => setNote(event.target.value)}
        disabled={busy}
      />
      <div className={detail.noteFoot}>
        <small>Only the team can see this. {meta ?? ""}</small>
        {/* Save appears only once there is something to save. */}
        {(busy || note.trim() !== initial.trim()) && (
          <button
            type="submit"
            className={`${detail.action} ${detail.actionPrimary}`}
            disabled={busy}
          >
            {busy ? "Saving..." : "Save"}
          </button>
        )}
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
