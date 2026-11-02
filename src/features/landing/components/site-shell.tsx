import { bodyFont, displayFont } from "@/features/landing/fonts";

import { AdminShortcut } from "./admin-shortcut";
import { LandingFooter } from "./final-cta";
import { LandingHeader } from "./landing-header";
import styles from "./landing.module.css";
import { RevealController } from "./reveal-controller";

const ROOT_ID = "trang-chu";

/**
 * Shared public layout: brand fonts, skip link, header and footer.
 * Used by the home page, the request forms and the legal pages.
 */
export function SiteShell({
  children,
  mainClassName,
  before,
}: {
  children: React.ReactNode;
  mainClassName?: string;
  before?: React.ReactNode;
}) {
  return (
    <div
      id={ROOT_ID}
      className={`${displayFont.variable} ${bodyFont.variable} ${styles.page}`}
    >
      <a className={styles.skipLink} href="#noi-dung">
        Bỏ qua để đến nội dung chính
      </a>
      {before}
      <RevealController rootId={ROOT_ID} />
      <LandingHeader />
      <main id="noi-dung" tabIndex={-1} className={mainClassName}>
        {children}
      </main>
      <LandingFooter />
      <AdminShortcut />
    </div>
  );
}
