"use client";
/*
 * Agreement and fee for a connection: a summary with one action each, and
 * the form in a dialog. Writes go to the existing operation APIs, which
 * check the revision so a stale page cannot record twice.
 */
import { CircleCheck, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

import { formatDateTime, formatVnd } from "@/shared/lib/format";

import { sendAdminJson } from "./api-client";
import { Dialog } from "./detail-controls";
import styles from "./detail.module.css";
import { Toast } from "./toast";

function OperationForm({
  endpoint,
  body,
  children,
  label,
  danger,
  onDone,
}: {
  endpoint: string;
  body: () => unknown;
  children: ReactNode;
  label: string;
  danger?: boolean;
  onDone: (message: string) => void;
}) {
  const router = useRouter();
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    const result = await sendAdminJson(endpoint, "PATCH", body());
    setBusy(false);
    locked.current = false;
    if (result.ok) {
      onDone("Changes saved.");
      router.refresh();
    } else {
      setError(result.error);
      if (result.status === 409) router.refresh();
    }
  }
  return (
    <form onSubmit={submit} className={styles.dialogForm}>
      <fieldset disabled={busy} className={styles.dialogFieldset}>
        {children}
      </fieldset>
      {error && (
        <p role="alert" className={styles.dialogError}>
          {error}
        </p>
      )}
      <div className={styles.dialogActions}>
        <button
          type="submit"
          className={`${styles.action} ${danger ? styles.actionDanger : styles.actionPrimary}`}
          disabled={busy}
        >
          {busy ? "Saving..." : label}
        </button>
      </div>
    </form>
  );
}

function Party({ label, at }: { label: string; at: string | null }) {
  return (
    <li className={at ? styles.partyDone : undefined}>
      {at ? (
        <CircleCheck size={16} aria-hidden="true" />
      ) : (
        <Circle size={16} aria-hidden="true" />
      )}
      <span>
        <strong>{label}</strong>
        <span className={styles.muted}>
          {at ? `Agreed ${formatDateTime(at)}` : "Not confirmed"}
        </span>
      </span>
    </li>
  );
}

export function AgreementPanel({
  id,
  revision,
  learnerAt,
  tutorAt,
  status,
}: {
  id: string;
  revision: number;
  learnerAt: string | null;
  tutorAt: string | null;
  status: string;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [side, setSide] = useState(learnerAt ? "tutor" : "learner");
  const [note, setNote] = useState("");
  const canRecord =
    (!learnerAt || !tutorAt) && ["INTRODUCED", "STARTED"].includes(status);

  return (
    <div className={styles.block}>
      <div className={styles.blockHead}>
        <h3>Agreement to start</h3>
        <span className={styles.muted}>
          {Number(Boolean(learnerAt)) + Number(Boolean(tutorAt))}/2 confirmed
        </span>
      </div>
      <ul className={styles.parties}>
        <Party label="Learner" at={learnerAt} />
        <Party label="Tutor" at={tutorAt} />
      </ul>
      {canRecord ? (
        <button
          type="button"
          className={styles.action}
          onClick={() => setOpen(true)}
        >
          Record agreement
        </button>
      ) : (
        !learnerAt &&
        !tutorAt && (
          <p className={styles.blockHint}>
            Agreements can be recorded once the tutor is introduced.
          </p>
        )
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Record agreement"
        description="Record each side separately, only after they have agreed to start lessons."
      >
        <OperationForm
          endpoint={`/api/admin/connections/${id}/confirmation`}
          body={() => ({ side, revision, note })}
          label="Record agreement"
          onDone={(message) => {
            setOpen(false);
            setToast(message);
          }}
        >
          <label className={styles.dialogField}>
            Side that agreed
            <select value={side} onChange={(e) => setSide(e.target.value)}>
              {!learnerAt && <option value="learner">Learner</option>}
              {!tutorAt && <option value="tutor">Tutor</option>}
            </select>
          </label>
          <label className={styles.dialogField}>
            What was confirmed, and through which channel
            <textarea
              required
              minLength={3}
              maxLength={500}
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </OperationForm>
      </Dialog>
      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
}

export function FeePanel({
  id,
  revision,
  status,
  confirmedAt,
  paidAt,
  method,
  reference,
  amount,
}: {
  id: string;
  revision: number;
  status: string;
  confirmedAt: string | null;
  paidAt: string | null;
  method: string;
  reference: string;
  amount: number;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [payMethod, setPayMethod] = useState("transfer");
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");
  const [paidOn, setPaidOn] = useState("");
  const paid = status === "PAID";
  const state = paid ? "Paid" : confirmedAt ? "Due" : "Not due";

  return (
    <div className={styles.block}>
      <div className={styles.blockHead}>
        <h3>Connection fee</h3>
        <span
          className={`${styles.pill} ${paid ? styles.pillGood : confirmedAt ? styles.pillWarn : ""}`}
        >
          {state}
        </span>
      </div>
      <p className={styles.feeAmount}>{formatVnd(amount)}</p>
      <p className={styles.blockHint}>
        {paid
          ? `Received ${paidAt ? formatDateTime(paidAt) : ""} · ${method === "transfer" ? "Bank transfer" : "Cash"}${reference ? ` · ${reference}` : ""}`
          : confirmedAt
            ? "Due now: both sides have agreed."
            : "Due only after both sides agree to start."}
      </p>
      {confirmedAt && (
        <button
          type="button"
          className={paid ? styles.actionLink : styles.action}
          onClick={() => setOpen(true)}
        >
          {paid ? "Reverse payment" : "Record payment"}
        </button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={paid ? "Reverse payment" : "Record payment"}
        description={
          paid
            ? "Use this only when the payment was recorded by mistake. It does not refund anyone."
            : `Record the ${formatVnd(amount)} received from the learner.`
        }
      >
        <OperationForm
          endpoint={`/api/admin/connections/${id}/payment`}
          body={() => ({
            action: paid ? "reverse" : "receive",
            revision,
            method: payMethod,
            reference: ref,
            paidOn: paidOn ? new Date(paidOn).toISOString() : "",
            note,
          })}
          label={paid ? "Reverse payment" : "Record payment"}
          danger={paid}
          onDone={(message) => {
            setOpen(false);
            setToast(message);
          }}
        >
          {!paid && (
            <>
              <label className={styles.dialogField}>
                Method
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="transfer">Bank transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </label>
              <label className={styles.dialogField}>
                Time received
                <input
                  type="datetime-local"
                  required
                  value={paidOn}
                  onChange={(e) => setPaidOn(e.target.value)}
                />
              </label>
              <label className={styles.dialogField}>
                Transaction reference or description
                <input
                  required={payMethod === "transfer"}
                  minLength={payMethod === "transfer" ? 3 : undefined}
                  maxLength={120}
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                />
              </label>
            </>
          )}
          <label className={styles.dialogField}>
            {paid ? "Reason for reversing" : "Reconciliation note"}
            <textarea
              required
              minLength={3}
              maxLength={500}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </OperationForm>
      </Dialog>
      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
}
