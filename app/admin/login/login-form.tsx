"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import { AuthAlert } from "@/components/admin/auth-layout";
import styles from "@/components/admin/auth.module.css";
import { PasswordInput } from "@/components/admin/password-input";

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
          "Không thể đăng nhập. Vui lòng thử lại.");
  } catch {
    return "Không thể kết nối tới máy chủ. Kiểm tra mạng rồi thử lại.";
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
          placeholder="ten@email.com"
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          aria-invalid={error ? true : undefined}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor={`${id}-password`}>
            Mật khẩu
          </label>
          <Link className={styles.textLink} href="/admin/forgot-password">
            Quên mật khẩu?
          </Link>
        </div>
        <PasswordInput
          id={`${id}-password`}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          disabled={busy}
          invalid={Boolean(error)}
        />
      </div>
      <button
        type="submit"
        className={`${styles.button} ${styles.primary}`}
        disabled={busy}
      >
        {busy ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
