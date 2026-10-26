"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import { AuthAlert } from "@/components/admin/auth-layout";
import styles from "@/components/admin/auth.module.css";
import { GoogleIcon } from "@/components/admin/google-icon";

export function SignUpForm() {
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
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <>
        <AuthAlert tone="ok">
          Nếu email này đã được cấp quyền, liên kết thiết lập tài khoản đã được
          gửi. Liên kết có hiệu lực trong 30 phút.
        </AuthAlert>
        <p className={styles.cardFooter}>
          Hãy kiểm tra hộp thư và thư rác. Bạn có thể{" "}
          <button
            type="button"
            className={styles.textLink}
            onClick={() => setSent(false)}
          >
            nhập email khác
          </button>
          .
        </p>
        <p className={styles.cardFooter}>
          <Link className={styles.textLink} href="/admin/login">
            Quay lại đăng nhập
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
            Email được cấp quyền
          </label>
          <input
            id={`${id}-email`}
            className={styles.input}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus
            placeholder="ten@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
          <span className={styles.hint}>
            Chỉ email được đội ngũ cấp quyền mới có thể hoàn tất đăng ký.
          </span>
        </div>
        <button
          type="submit"
          className={`${styles.button} ${styles.primary}`}
          disabled={busy}
        >
          {busy ? "Đang gửi..." : "Gửi liên kết đăng ký"}
        </button>
      </form>
      <div className={styles.divider}>Hoặc tiếp tục với</div>
      <form action="/api/admin/auth/google" method="get">
        <button type="submit" className={`${styles.button} ${styles.outline}`}>
          <GoogleIcon />
          Google
        </button>
      </form>
      <p className={styles.cardFooter}>
        Đã có tài khoản?{" "}
        <Link className={styles.textLink} href="/admin/login">
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
