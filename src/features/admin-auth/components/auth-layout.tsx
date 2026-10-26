import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import logoMark from "@/features/landing/brand/logo-mark.png";
import { bodyFont, displayFont } from "@/features/landing/fonts";

import styles from "./auth.module.css";

const YEAR = new Date().getFullYear();

/** Centred card used by the sign-in, forgot-password and reset pages. */
export function AuthLayout({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description?: ReactNode;
  /** Short line under the form, e.g. a link to set a first password. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`${displayFont.variable} ${bodyFont.variable}`}>
      <main className={styles.page}>
        <div className={styles.card}>
          <Link
            className={styles.illustration}
            href="/"
            aria-label="Gia Sư Nhà Mình, trang chủ"
          >
            <Image src={logoMark} alt="" priority sizes="56px" />
          </Link>
          <div className={styles.heading}>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {children}
          {footer && <div className={styles.cardFooter}>{footer}</div>}
        </div>
        <footer className={styles.pageFooter}>
          <span>© {YEAR} Gia Sư Nhà Mình</span>
          <Link href="/">Về trang chủ</Link>
        </footer>
      </main>
    </div>
  );
}

export function AuthAlert({
  tone,
  children,
}: {
  tone: "error" | "ok" | "info";
  children: ReactNode;
}) {
  const className =
    tone === "error"
      ? styles.alertError
      : tone === "ok"
        ? styles.alertOk
        : styles.alertInfo;
  return (
    <p
      className={`${styles.alert} ${className}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
