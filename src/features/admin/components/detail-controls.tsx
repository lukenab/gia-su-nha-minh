"use client";

import { Check, Copy, Ellipsis, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { sendAdminJson } from "./api-client";
import styles from "./detail.module.css";
import { DropdownMenu } from "./dropdown-menu";
import { Toast } from "./toast";

/* ------------------------------ copy ------------------------------ */

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => setCopied(true));
      }}
    >
      {copied ? (
        <Check size={13} aria-hidden="true" />
      ) : (
        <Copy size={13} aria-hidden="true" />
      )}
    </button>
  );
}

/* ------------------------------ dialog ------------------------------ */

/**
 * Native modal dialog (focus trap, Escape and focus return come from the
 * browser). `open` is controlled by the caller.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.dialogHead}>
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className={styles.dialogClose}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      {description && <div className={styles.dialogText}>{description}</div>}
      {open && children}
    </dialog>
  );
}

/* --------------------------- status actions --------------------------- */

type Kind = "learner" | "tutor" | "connection";
export type StatusChoice = { value: string; label: string; needsNote: boolean };

const VERBS: Record<Kind, Record<string, string>> = {
  learner: {
    CONTACTED: "Mark as contacted",
    SEARCHING: "Start matching",
    INTRODUCED: "Mark introduced",
    STARTED: "Mark as learning",
    CLOSED: "Close request",
  },
  tutor: {
    REVIEWING: "Start review",
    ELIGIBLE: "Approve",
    INELIGIBLE: "Reject",
  },
  connection: {
    REVIEWING: "Reopen",
    INTRODUCED: "Mark introduced",
    STARTED: "Mark as learning",
    DECLINED: "End connection",
  },
};
const DANGER = new Set(["CLOSED", "INELIGIBLE", "DECLINED"]);

/**
 * The next step as one button, other moves in a menu. Every move opens a
 * dialog first, where a reason is required for closing-type moves.
 */
export function StatusActions({
  kind,
  endpoint,
  current,
  options,
  primary,
  help = {},
  reopenLabel,
}: {
  kind: Kind;
  endpoint: string;
  current: string;
  options: StatusChoice[];
  primary?: string;
  /** Extra guidance shown in the dialog, by target status. */
  help?: Record<string, string>;
  /** Overrides the verb for REVIEWING when moving back (tutor profiles). */
  reopenLabel?: string;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<StatusChoice | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const verb = (choice: StatusChoice) =>
    choice.value === "REVIEWING" && reopenLabel
      ? reopenLabel
      : (VERBS[kind][choice.value] ?? `Move to ${choice.label}`);
  const main = options.find((option) => option.value === primary);
  const rest = options.filter((option) => option !== main);

  function open(choice: StatusChoice) {
    setTarget(choice);
    setNote("");
    setError("");
  }

  async function confirm(event: FormEvent) {
    event.preventDefault();
    if (!target || busy) return;
    if (target.needsNote && note.trim().length < 3) {
      setError("Please give a reason (at least 3 characters).");
      return;
    }
    setBusy(true);
    setError("");
    const result = await sendAdminJson(endpoint, "PATCH", {
      from: current,
      to: target.value,
      note,
    });
    setBusy(false);
    if (result.ok) {
      setToast(`Moved to “${target.label}”.`);
      setTarget(null);
      router.refresh();
    } else {
      setError(result.error);
      if (result.status === 409) router.refresh();
    }
  }

  if (!options.length) return null;
  return (
    <>
      {main && (
        <button
          type="button"
          className={`${styles.action} ${DANGER.has(main.value) ? styles.actionDanger : styles.actionPrimary}`}
          onClick={() => open(main)}
        >
          {verb(main)}
        </button>
      )}
      {rest.length > 0 && (
        <DropdownMenu
          label="More status changes"
          triggerLabel="More status changes"
          triggerClassName={`${styles.action} ${main ? styles.actionIcon : ""}`}
          trigger={
            main ? (
              <Ellipsis size={16} aria-hidden="true" />
            ) : (
              <span>Change status</span>
            )
          }
          groups={[
            rest
              .filter((choice) => !DANGER.has(choice.value))
              .map((choice) => ({
                label: verb(choice),
                onSelect: () => open(choice),
              })),
            rest
              .filter((choice) => DANGER.has(choice.value))
              .map((choice) => ({
                label: verb(choice),
                tone: "danger" as const,
                onSelect: () => open(choice),
              })),
          ].filter((group) => group.length)}
        />
      )}
      <Dialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={target ? verb(target) : ""}
        description={target ? help[target.value] : undefined}
      >
        {target && (
          <form className={styles.dialogForm} onSubmit={confirm}>
            <label className={styles.dialogField}>
              {target.needsNote ? "Reason (required)" : "Note (optional)"}
              <textarea
                value={note}
                maxLength={1000}
                rows={4}
                required={target.needsNote}
                onChange={(event) => setNote(event.target.value)}
                disabled={busy}
                autoFocus
              />
              <small>Saved with this change in the activity history.</small>
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
                onClick={() => setTarget(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.action} ${DANGER.has(target.value) ? styles.actionDanger : styles.actionPrimary}`}
                disabled={busy}
              >
                {busy ? "Saving..." : verb(target)}
              </button>
            </div>
          </form>
        )}
      </Dialog>
      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </>
  );
}

/* ------------------------- inline properties ------------------------- */

/**
 * A property that saves as soon as it changes, with Undo in the toast. The
 * server checks the value the page showed, so two people changing it at
 * once get a conflict instead of a silent overwrite.
 */
function useInlineSave() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    undo?: () => void;
  } | null>(null);

  async function save(
    endpoint: string,
    body: unknown,
    message: string,
    undo?: () => void,
  ) {
    setBusy(true);
    setError("");
    const result = await sendAdminJson(endpoint, "PATCH", body);
    setBusy(false);
    if (result.ok) {
      setToast({ message, undo });
      router.refresh();
      return true;
    }
    setError(result.error);
    if (result.status === 409) router.refresh();
    return false;
  }
  return { busy, error, toast, setToast, save };
}

export function AssigneeSelect({
  id,
  current,
  operators,
}: {
  id: string;
  current: string;
  operators: { email: string; name: string }[];
}) {
  const { busy, error, toast, setToast, save } = useInlineSave();
  const endpoint = `/api/admin/requests/${id}/assignment`;
  const nameOf = (email: string) =>
    operators.find((o) => o.email === email)?.name ?? (email || "nobody");

  function change(next: string) {
    void save(
      endpoint,
      { email: next, expected: current },
      next ? `Assigned to ${nameOf(next)}.` : "Unassigned.",
      () => {
        setToast(null);
        void save(
          endpoint,
          { email: current, expected: next },
          current ? `Assigned back to ${nameOf(current)}.` : "Unassigned.",
        );
      },
    );
  }

  return (
    <>
      <select
        className={styles.inlineSelect}
        aria-label="Assignee"
        value={current}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
      >
        <option value="">Unassigned</option>
        {current && !operators.some((o) => o.email === current) && (
          <option value={current}>{current} (no longer authorised)</option>
        )}
        {operators.map((o) => (
          <option key={o.email} value={o.email}>
            {o.name}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className={styles.inlineError}>
          {error}
        </p>
      )}
      {toast && (
        <Toast
          message={toast.message}
          actionLabel={toast.undo ? "Undo" : undefined}
          onAction={toast.undo}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}

export function AvailabilitySelect({
  id,
  current,
}: {
  id: string;
  current: boolean | null;
}) {
  const { busy, error, toast, setToast, save } = useInlineSave();
  const endpoint = `/api/admin/tutors/${id}/availability`;
  const label = (value: boolean) => (value ? "Taking learners" : "Paused");

  function change(value: string) {
    if (!value) return;
    const next = value === "yes";
    void save(
      endpoint,
      { accepting: next, expected: current },
      `${label(next)}.`,
      // An unrecorded value cannot be restored, so Undo needs a known one.
      current === null
        ? undefined
        : () => {
            setToast(null);
            void save(
              endpoint,
              { accepting: current, expected: next },
              `${label(current)} again.`,
            );
          },
    );
  }

  return (
    <>
      <select
        className={styles.inlineSelect}
        aria-label="Taking new learners"
        value={current === null ? "" : current ? "yes" : "no"}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
      >
        {current === null && <option value="">Not confirmed</option>}
        <option value="yes">Taking learners</option>
        <option value="no">Paused</option>
      </select>
      {current === null && (
        <p className={styles.inlineHint}>
          Confirm with the tutor before setting this.
        </p>
      )}
      {error && (
        <p role="alert" className={styles.inlineError}>
          {error}
        </p>
      )}
      {toast && (
        <Toast
          message={toast.message}
          actionLabel={toast.undo ? "Undo" : undefined}
          onAction={toast.undo}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
