import type { ReactNode } from "react";

import Link from "next/link";

import { adminFontVariables } from "@/features/admin/fonts";
import { BrandLockup } from "@/shared/brand/brand-lockup";

import styles from "./auth.module.css";

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
    <div className={adminFontVariables} lang="en">
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="auth-title">
          <Link
            className={styles.illustration}
            href="/"
            aria-label="Nexus Workspace, home page"
          >
            <BrandLockup symbolOnly />
          </Link>
          <div className={styles.heading}>
            <h1 id="auth-title">{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {children}
          {footer && <div className={styles.cardFooter}>{footer}</div>}
        </section>
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
