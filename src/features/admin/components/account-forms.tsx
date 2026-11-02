"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import styles from "./admin.module.css";
import { sendAdminJson } from "./api-client";
import { useAdminTheme, type ThemePreference } from "./use-admin-theme";

function Status({ done, error }: { done: string; error: string }) {
  return (
    <div aria-live="polite">
      {done && (
        <p className={`${styles.message} ${styles.messageOk}`}>{done}</p>
      )}
      {error && (
        <p className={`${styles.message} ${styles.messageError}`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function DisplayNameForm({ initial }: { initial: string }) {
  const router = useRouter();
  const id = useId();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setDone("");
    setError("");
    const result = await sendAdminJson("/api/admin/account/profile", "PATCH", {
      name,
    });
    if (result.ok) {
      setDone("Display name saved.");
      router.refresh();
    } else setError(result.error);
    submitting.current = false;
    setBusy(false);
  }

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      <div className={styles.field}>
        <label htmlFor={`${id}-name`}>Display name</label>
        <input
          id={`${id}-name`}
          className={styles.input}
          value={name}
          minLength={2}
          maxLength={60}
          required
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
        <small>
          Shown in the handling history from now on. Earlier entries keep the
          name used at the time.
        </small>
      </div>
      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={busy || name.trim() === initial.trim()}
        >
          {busy ? "Saving..." : "Save name"}
        </button>
      </div>
      <Status done={done} error={error} />
    </form>
  );
}

export function PasswordForm({ email }: { email: string }) {
  const id = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setDone("");
    if (next.length < 10)
      return setError("The new password needs at least 10 characters.");
    if (next !== confirm) return setError("The new passwords do not match.");
    submitting.current = true;
    setBusy(true);
    setError("");
    const result = await sendAdminJson("/api/admin/account/password", "POST", {
      current,
      next,
    });
    if (result.ok) {
      setDone("Password changed. Use it the next time you sign in.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } else setError(result.error);
    submitting.current = false;
    setBusy(false);
  }

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      {/* Lets password managers save the new password for this account. */}
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        hidden
      />
      <div className={styles.field}>
        <label htmlFor={`${id}-current`}>Current password</label>
        <input
          id={`${id}-current`}
          className={styles.input}
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          disabled={busy}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${id}-next`}>New password</label>
        <input
          id={`${id}-next`}
          className={styles.input}
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={next}
          onChange={(event) => setNext(event.target.value)}
          disabled={busy}
          aria-describedby={`${id}-hint`}
        />
        <small id={`${id}-hint`}>
          At least 10 characters. A phrase that is easy for you to remember but
          hard for others to guess works well.
        </small>
      </div>
      <div className={styles.field}>
        <label htmlFor={`${id}-confirm`}>Confirm new password</label>
        <input
          id={`${id}-confirm`}
          className={styles.input}
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          disabled={busy}
          aria-invalid={(Boolean(confirm) && confirm !== next) || undefined}
        />
      </div>
      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={busy}
        >
          {busy ? "Saving..." : "Change password"}
        </button>
      </div>
      <Status done={done} error={error} />
    </form>
  );
}

const APPEARANCE: { value: ThemePreference; label: string; hint: string }[] = [
  { value: "light", label: "Light", hint: "Always use the light theme." },
  { value: "dark", label: "Dark", hint: "Always use the dark theme." },
  {
    value: "system",
    label: "System",
    hint: "Follow this device's light or dark setting.",
  },
];

export function AppearanceForm() {
  const { preference, setPreference } = useAdminTheme();
  return (
    <fieldset className={styles.choiceGroup}>
      <legend className={styles.srOnly}>Theme</legend>
      {APPEARANCE.map((option) => (
        <label className={styles.choice} key={option.value}>
          <input
            type="radio"
            name="admin-theme"
            value={option.value}
            checked={preference === option.value}
            onChange={() => setPreference(option.value)}
          />
          <span>
            <strong>{option.label}</strong>
            <small>{option.hint}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
