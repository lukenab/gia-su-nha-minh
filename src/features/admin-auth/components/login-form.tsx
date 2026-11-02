"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import { AuthAlert } from "@/features/admin-auth/components/auth-layout";
import styles from "@/features/admin-auth/components/auth.module.css";
import { PasswordInput } from "@/features/admin-auth/components/password-input";

async function post(url: string, body: unknown) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return response.ok
      ? null
      : ((data.error as string | undefined) ??
          "Could not sign in. Please try again.");
  } catch {
    return "Could not reach the server. Check your connection and try again.";
  }
}

export function PasswordLoginForm({ next = "/admin" }: { next?: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const problem = await post("/api/admin/login", { email, password });
    if (!problem) {
      window.location.assign(next);
      return;
    }
    setError(problem);
    setPassword("");
    setBusy(false);
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate={false}>
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
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
          value={email}
          placeholder="Enter your email address"
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          aria-invalid={error ? true : undefined}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor={`${id}-password`}>
            Password
          </label>
          <Link className={styles.textLink} href="/admin/forgot-password">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id={`${id}-password`}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={busy}
          invalid={Boolean(error)}
        />
      </div>
      <button
        type="submit"
        className={`${styles.button} ${styles.primary}`}
        disabled={busy}
      >
        {busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
