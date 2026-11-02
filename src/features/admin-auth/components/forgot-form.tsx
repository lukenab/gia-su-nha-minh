"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import { AuthAlert } from "@/features/admin-auth/components/auth-layout";
import styles from "@/features/admin-auth/components/auth.module.css";

export function ForgotPasswordForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error);
      }
      setSent(true);
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "Could not send the request. Please try again.",
      );
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <>
        <AuthAlert tone="ok">
          If {email} has access, an email with a password link has been sent.
          The link is valid for 30 minutes.
        </AuthAlert>
        <p className={styles.cardFooter}>
          No email? Check your spam folder or{" "}
          <button
            type="button"
            className={styles.textLink}
            onClick={() => setSent(false)}
          >
            send it again
          </button>
          .
        </p>
        <p className={styles.cardFooter}>
          <Link className={styles.textLink} href="/admin/login">
            ← Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <form className={styles.form} onSubmit={submit}>
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-email`}>
            Email
          </label>
          <input
            id={`${id}-email`}
            className={styles.input}
            type="email"
            inputMode="email"
            autoComplete="username"
            required
            autoFocus
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
        </div>
        <button
          type="submit"
          className={`${styles.button} ${styles.primary}`}
          disabled={busy}
        >
          {busy ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <p className={styles.cardFooter}>
        <Link className={styles.textLink} href="/admin/login">
          ← Back to sign in
        </Link>
      </p>
    </>
  );
}
