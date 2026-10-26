"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import { AuthAlert } from "@/components/admin/auth-layout";
import styles from "@/components/admin/auth.module.css";

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
          : "Chưa thể gửi yêu cầu. Vui lòng thử lại.",
      );
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <>
        <AuthAlert tone="ok">
          Nếu {email} có quyền truy cập, một email kèm liên kết đặt mật khẩu đã
          được gửi. Liên kết có hiệu lực trong 30 phút.
        </AuthAlert>
        <p className={styles.cardFooter}>
          Không nhận được email? Kiểm tra thư rác hoặc{" "}
          <button
            type="button"
            className={styles.textLink}
            onClick={() => setSent(false)}
          >
            gửi lại
          </button>
          .
        </p>
        <p className={styles.cardFooter}>
          <Link className={styles.textLink} href="/admin/login">
            ← Quay lại đăng nhập
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
            placeholder="ten@email.com"
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
          {busy ? "Đang gửi..." : "Gửi liên kết"}
        </button>
      </form>
      <p className={styles.cardFooter}>
        <Link className={styles.textLink} href="/admin/login">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </>
  );
}
