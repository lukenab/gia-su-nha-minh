"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import styles from "./admin.module.css";
import { sendAdminJson } from "./api-client";

export type ReviewView = {
  check: "identity" | "certificates" | "experience";
  title: string;
  hint: string;
  reviewed: boolean;
  summary: string; // e.g. "Đã xem xét ngày 21/10/2026 bởi Thanh Trà"
  note: string;
};

function ReviewRow({
  endpoint,
  view,
  today,
  editable,
}: {
  endpoint: string;
  view: ReviewView;
  today: string;
  editable: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const [date, setDate] = useState(today);
  const [note, setNote] = useState(view.note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const submitting = useRef(false);

  async function save(reviewed: boolean, event?: FormEvent) {
    event?.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    setDone("");
    const result = await sendAdminJson(endpoint, "PATCH", {
      check: view.check,
      reviewed,
      note,
      ...(reviewed ? { reviewedOn: date } : {}),
    });
    if (result.ok) {
      setDone(reviewed ? "Đã ghi nhận." : "Đã bỏ ghi nhận.");
      router.refresh();
    } else {
      setError(result.error);
    }
    submitting.current = false;
    setBusy(false);
  }

  return (
    <li className={styles.review}>
      <div className={styles.reviewHead}>
        <h3>{view.title}</h3>
        <span
          className={`${styles.badge} ${view.reviewed ? styles.toneGood : styles.toneMuted}`}
        >
          {view.reviewed ? "Đã xem xét" : "Chưa xem xét"}
        </span>
      </div>
      <p className={styles.mutedText}>{view.hint}</p>
      {view.reviewed && (
        <p className={styles.reviewNote}>
          <strong>{view.summary}</strong>
          {view.note ? ` — ${view.note}` : ""}
        </p>
      )}
      {editable && (
        <form
          className={styles.formGrid}
          onSubmit={(event) => save(true, event)}
        >
          <div className={styles.field}>
            <label htmlFor={`${id}-date`}>Ngày xem xét</label>
            <input
              id={`${id}-date`}
              className={styles.input}
              type="date"
              value={date}
              max={today}
              required
              onChange={(event) => setDate(event.target.value)}
              disabled={busy}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-note`}>Đã xem xét những gì</label>
            <textarea
              id={`${id}-note`}
              className={styles.textarea}
              value={note}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              disabled={busy}
              placeholder="Ví dụ: đối chiếu giấy tờ, gọi xác nhận, xem bản gốc chứng chỉ"
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={busy}
            >
              {busy
                ? "Đang lưu..."
                : view.reviewed
                  ? "Cập nhật ghi nhận"
                  : "Ghi nhận đã xem xét"}
            </button>
            {view.reviewed && (
              <button
                type="button"
                className={`${styles.button} ${styles.buttonDanger}`}
                disabled={busy}
                onClick={() => save(false)}
              >
                Bỏ ghi nhận
              </button>
            )}
          </div>
        </form>
      )}
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
    </li>
  );
}

export function TutorReviewForm({
  endpoint,
  views,
  today,
  editable,
  lockedReason,
}: {
  endpoint: string;
  views: ReviewView[];
  today: string;
  editable: boolean;
  lockedReason?: string;
}) {
  return (
    <>
      {!editable && lockedReason && (
        <p
          className={`${styles.notice} ${styles.noticeWarn}`}
          style={{ marginBottom: 14 }}
        >
          {lockedReason}
        </p>
      )}
      <ul
        className={styles.reviewList}
        style={{ margin: 0, padding: 0, listStyle: "none" }}
      >
        {views.map((view) => (
          <ReviewRow
            key={`${view.check}-${view.reviewed}-${view.summary}`}
            endpoint={endpoint}
            view={view}
            today={today}
            editable={editable}
          />
        ))}
      </ul>
    </>
  );
}
