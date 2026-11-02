"use client";

import { useId, useState, type FormEvent } from "react";

import { AuthAlert } from "@/features/admin-auth/components/auth-layout";
import styles from "@/features/admin-auth/components/auth.module.css";
import { PasswordInput } from "@/features/admin-auth/components/password-input";

export function ResetPasswordForm({
  token,
  needsName,
}: {
  token: string;
  needsName: boolean;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (password.length < 10)
      return setError("The password needs at least 10 characters.");
    if (password !== confirm)
      return setError("The two passwords do not match.");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name }),
      });
      if (response.ok) {
        window.location.assign("/admin/login?status=password_set");
        return;
      }
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Could not set the password. Please try again.");
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    }
    setBusy(false);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {needsName && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-name`}>
            Display name
          </label>
          <input
            id={`${id}-name`}
            className={styles.input}
            autoComplete="name"
            required
            minLength={2}
            maxLength={60}
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={busy}
            aria-describedby={`${id}-name-hint`}
          />
          <p id={`${id}-name-hint`} className={styles.hint}>
            Shown in the handling history, for example “Thanh Trà”.
          </p>
        </div>
      )}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-password`}>
          New password
        </label>
        <PasswordInput
          id={`${id}-password`}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          disabled={busy}
          autoFocus={!needsName}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-confirm`}>
          Confirm password
        </label>
        <PasswordInput
          id={`${id}-confirm`}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          disabled={busy}
          invalid={Boolean(confirm) && confirm !== password}
        />
      </div>
      <button
        type="submit"
        className={`${styles.button} ${styles.primary}`}
        disabled={busy}
      >
        {busy ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
