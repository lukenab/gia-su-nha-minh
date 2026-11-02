"use client";

import { CircleCheck, Circle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import { sendAdminJson } from "./api-client";
import styles from "./detail.module.css";

export type ReviewView = {
  check: "identity" | "certificates" | "experience";
  title: string;
  hint: string;
  reviewed: boolean;
  summary: string; // e.g. "Reviewed on 21/10/2026 by Thanh Trà"
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
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState(view.note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  async function save(reviewed: boolean, event?: FormEvent) {
    event?.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    const result = await sendAdminJson(endpoint, "PATCH", {
      check: view.check,
      reviewed,
      note,
      ...(reviewed ? { reviewedOn: date } : {}),
    });
    if (result.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
    submitting.current = false;
    setBusy(false);
  }

  return (
    <li className={`${styles.check} ${view.reviewed ? styles.checkDone : ""}`}>
      <div className={styles.checkHead}>
        {view.reviewed ? (
          <CircleCheck size={18} aria-hidden="true" />
        ) : (
          <Circle size={18} aria-hidden="true" />
        )}
        <div className={styles.checkCopy}>
          <h3>
            {view.title}
            <span className={styles.srOnly}>
              {view.reviewed ? " (reviewed)" : " (not reviewed)"}
            </span>
          </h3>
          <p className={styles.muted}>
            {view.reviewed ? view.summary : view.hint}
          </p>
          {view.reviewed && view.note && (
            <p className={styles.checkNote}>{view.note}</p>
          )}
        </div>
        {editable && !open && (
          <button
            type="button"
            className={styles.actionLink}
            onClick={() => setOpen(true)}
            aria-expanded={open}
          >
            {view.reviewed ? "Edit" : "Record"}
          </button>
        )}
      </div>
      {editable && open && (
        <form className={styles.checkForm} onSubmit={(e) => save(true, e)}>
          <label className={styles.dialogField} htmlFor={`${id}-date`}>
            Review date
            <input
              id={`${id}-date`}
              type="date"
              value={date}
              max={today}
              required
              onChange={(event) => setDate(event.target.value)}
              disabled={busy}
            />
          </label>
          <label className={styles.dialogField} htmlFor={`${id}-note`}>
            What was reviewed
            <textarea
              id={`${id}-note`}
              value={note}
              maxLength={500}
              rows={3}
              onChange={(event) => setNote(event.target.value)}
              disabled={busy}
              placeholder="e.g. checked documents, confirmed by phone, saw the original certificate"
            />
          </label>
          {error && (
            <p role="alert" className={styles.dialogError}>
              {error}
            </p>
          )}
          <div className={styles.checkActions}>
            {view.reviewed && (
              <button
                type="button"
                className={`${styles.actionLink} ${styles.actionLinkDanger}`}
                disabled={busy}
                onClick={() => save(false)}
              >
                Remove record
              </button>
            )}
            <button
              type="button"
              className={styles.action}
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.action} ${styles.actionPrimary}`}
              disabled={busy}
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}

/** The three review steps as a checklist with progress. */
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
  const done = views.filter((view) => view.reviewed).length;
  return (
    <>
      <div className={styles.progress}>
        <span>
          <strong>
            {done}/{views.length}
          </strong>{" "}
          verified
        </span>
        <span
          className={styles.progressTrack}
          role="progressbar"
          aria-label="Review progress"
          aria-valuemin={0}
          aria-valuemax={views.length}
          aria-valuenow={done}
        >
          <span style={{ width: `${(done / views.length) * 100}%` }} />
        </span>
      </div>
      {!editable && lockedReason && (
        <p className={styles.locked}>
          <Lock size={14} aria-hidden="true" />
          {lockedReason}
        </p>
      )}
      <ul className={styles.checklist}>
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
