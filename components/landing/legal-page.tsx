import Link from "next/link";

import styles from "./landing.module.css";
import { SiteShell } from "./site-shell";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <SiteShell mainClassName={styles.legal}>
      <article className={styles.legalArticle}>
        <p className={styles.legalUpdated}>Cập nhật ngày {updated}</p>
        <h1>{title}</h1>
        <div className={styles.legalBody}>{children}</div>
        <Link className={styles.legalBack} href="/">
          ← Quay lại trang chủ
        </Link>
      </article>
    </SiteShell>
  );
}
