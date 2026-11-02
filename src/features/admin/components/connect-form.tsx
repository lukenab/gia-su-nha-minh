"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";

import { sendAdminJson } from "./api-client";
import { Dialog } from "./detail-controls";
import styles from "./detail.module.css";

/**
 * Records that the team is reviewing this tutor for this request. Nothing
 * is sent to either person; a dialog asks for an optional first note.
 */
export function ConnectForm({
  requestId,
  tutorId,
  tutorName,
}: {
  requestId: string;
  tutorId: string;
  tutorName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    <>
      <button
        type="button"
        className={`${styles.action} ${styles.actionPrimary}`}
        onClick={() => setOpen(true)}
      >
        Propose
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Propose ${tutorName}`}
        description="Records that the team is considering this tutor for the request. Nobody is contacted and the request status does not change."
      >
        <form className={styles.dialogForm} onSubmit={submit}>
          <label className={styles.dialogField}>
            First note (optional)
            <textarea
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={busy}
              autoFocus
            />
          </label>
          {error && (
            <p role="alert" className={styles.dialogError}>
              {error}
            </p>
          )}
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.action}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.action} ${styles.actionPrimary}`}
              disabled={busy}
            >
              {busy ? "Saving..." : "Propose tutor"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

const FILTERS = [
  { name: "level", label: "Teaches this level" },
  { name: "slots", label: "Overlapping time slots" },
  { name: "fee", label: "Within budget" },
  { name: "all", label: "Include content or format mismatches" },
] as const;

/** Optional criteria as toggle chips; each change applies at once. */
export function MatchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function toggle(name: string, on: boolean) {
    const next = new URLSearchParams(params.toString());
    if (on) next.set(name, "1");
    else next.delete(name);
    next.delete("page");
    const query = next.toString();
    startTransition(() =>
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  }

  return (
    <fieldset className={styles.chips} data-pending={pending || undefined}>
      <legend className={styles.srOnly}>Optional criteria</legend>
      {FILTERS.map((filter) => {
        const on = params.get(filter.name) === "1";
        return (
          <label
            key={filter.name}
            className={`${styles.chip} ${on ? styles.chipOn : ""}`}
          >
            <input
              type="checkbox"
              checked={on}
              onChange={(event) => toggle(filter.name, event.target.checked)}
            />
            {on && <Check size={13} aria-hidden="true" />}
            {filter.label}
          </label>
        );
      })}
    </fieldset>
  );
}
