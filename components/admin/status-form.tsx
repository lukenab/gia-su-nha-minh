"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import styles from "./admin.module.css";
import { sendAdminJson } from "./api-client";

export type StatusOption = { value: string; label: string; needsNote: boolean };

/**
 * Moves a record to its next status. Remounted (key = current status) after
 * each successful save, so the form always reflects what is stored.
 */
export function StatusForm({
  endpoint,
  current,
  options,
  noteHelp,
  suggestion,
  lockedReason,
}: {
  endpoint: string;
  current: string;
  options: StatusOption[];
  noteHelp?: string;
  suggestion?: { to: string; text: string };
  lockedReason?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [to, setTo] = useState(options[0]?.value ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const submitting = useRef(false);

  if (!options.length) {
    return (
      <p className={styles.mutedText}>
        {lockedReason ?? "Đây là trạng thái cuối, không thể chuyển tiếp."}
      </p>
    );
  }

  const selected = options.find((option) => option.value === to);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return; // ignore repeated clicks while saving
    submitting.current = true;
    setBusy(true);
    setError("");
    setDone("");
    const result = await sendAdminJson(endpoint, "PATCH", {
      from: current,
      to,
      note,
    });
    if (result.ok) {
      setDone(`Đã chuyển sang “${selected?.label ?? to}”.`);
      setNote("");
      router.refresh();
    } else {
      setError(result.error);
      if (result.status === 409) router.refresh();
    }
    submitting.current = false;
    setBusy(false);
  }

  return (
    <form className={styles.formGrid} onSubmit={submit} noValidate>
      {suggestion &&
        options.some((option) => option.value === suggestion.to) && (
          <div className={styles.notice}>
            <span>{suggestion.text}</span>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonQuiet}`}
              onClick={() => setTo(suggestion.to)}
            >
              Chọn trạng thái này
            </button>
          </div>
        )}
      <div className={styles.field}>
        <label htmlFor={`${id}-to`}>Chuyển sang</label>
        <select
          id={`${id}-to`}
          className={styles.select}
          value={to}
          onChange={(event) => setTo(event.target.value)}
          disabled={busy}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor={`${id}-note`}>
          {selected?.needsNote
            ? "Lý do (bắt buộc)"
            : "Ghi chú (không bắt buộc)"}
        </label>
        <textarea
          id={`${id}-note`}
          className={styles.textarea}
          value={note}
          maxLength={1000}
          onChange={(event) => setNote(event.target.value)}
          disabled={busy}
          aria-required={selected?.needsNote || undefined}
        />
        {noteHelp && <small>{noteHelp}</small>}
      </div>
      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={busy}
        >
          {busy ? "Đang lưu..." : "Cập nhật trạng thái"}
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
