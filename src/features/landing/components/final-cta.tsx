"use client";

import Link from "next/link";
import { useRef } from "react";

import { LEARNER_REQUEST_HREF, finalCta } from "@/features/landing/content";
import { useReducedMotion } from "@/features/landing/hooks/use-reduced-motion";
import { useScrollProgress } from "@/features/landing/hooks/use-scroll-progress";
import {
  PRIVACY_HREF,
  TERMS_HREF,
  TUTOR_APPLICATION_HREF,
  site,
} from "@/shared/config/site";

import { BrandLogo } from "./brand-logo";
import { ArrowUpRight, Check, Facebook } from "./icons";
import styles from "./landing.module.css";
import { ConnectOrb } from "./mockups";

/**
 * Closing scene: a phone grows into the centre of the screen while the three
 * request details fly in and settle on it. The CTA itself never depends on
 * the animation; with reduced motion the scene shows its final state.
 */
export function FinalCta() {
  const scene = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useScrollProgress(scene, { mode: "sticky", disabled: reduced, rest: 1 });

  return (
    <section className={styles.finalCta} aria-labelledby="final-cta-title">
      <div ref={scene} className={styles.ctaScene}>
        <div className={styles.ctaSticky}>
          <div className={`${styles.shell} ${styles.ctaHeading}`}>
            <span className={styles.sectionNo}>{finalCta.label}</span>
            <h2 id="final-cta-title">
              <span>{finalCta.title[0]}</span>
              <span>
                <em>{finalCta.title[1]}</em>
              </span>
            </h2>
            <p>{finalCta.text}</p>
            <div className={styles.ctaActions}>
              <Link
                className={`${styles.button} ${styles.buttonPrimary}`}
                href={LEARNER_REQUEST_HREF}
              >
                {finalCta.cta} <ArrowUpRight />
              </Link>
              <a
                className={`${styles.button} ${styles.buttonGhost}`}
                href={site.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook /> {finalCta.secondary}
                <span className={styles.srOnly}> (mở trong thẻ mới)</span>
              </a>
            </div>
          </div>
          <div className={styles.ctaStage} aria-hidden="true">
            <span className={styles.ctaAura} />
            <span className={styles.ctaRibbon} />
            <div className={styles.ctaPhone}>
              <span className={styles.heroPhoneNotch} />
              <div className={styles.ctaScreen}>
                <ConnectOrb />
                <div className={styles.ctaSlots}>
                  {finalCta.chips.map((chip) => (
                    <span key={chip.label}>
                      <small>{chip.label}</small>
                      {chip.value}
                    </span>
                  ))}
                </div>
                <span className={styles.ctaCode}>
                  <Check /> Đã gửi yêu cầu
                </span>
              </div>
            </div>
            {finalCta.chips.map((chip, index) => (
              <span
                key={chip.label}
                className={styles.ctaChip}
                data-side={index}
              >
                <small>{chip.label}</small>
                {chip.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const footerLinks = [
  { href: "/#quy-trinh", label: "Cách mình hoạt động" },
  { href: "/#danh-cho-ai", label: "Dành cho người học & gia sư" },
  { href: "/#cau-hoi", label: "Câu hỏi thường gặp" },
  { href: LEARNER_REQUEST_HREF, label: "Tìm gia sư cho mình" },
  { href: TUTOR_APPLICATION_HREF, label: "Đăng ký làm gia sư" },
];

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.shell} ${styles.footerGrid}`}>
        <div className={styles.footerBrand}>
          <BrandLogo variant="footer" label="Gia Sư Nhà Mình, về trang chủ" />
          <p>{site.description}</p>
          <a
            className={styles.footerSocial}
            href={site.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook /> Facebook Gia Sư Nhà Mình
            <span className={styles.srOnly}> (mở trong thẻ mới)</span>
          </a>
        </div>
        <nav aria-label="Thông tin">
          <h2>Thông tin</h2>
          <ul>
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Pháp lý và liên hệ">
          <h2>Pháp lý & liên hệ</h2>
          <ul>
            <li>
              <Link href={PRIVACY_HREF}>Chính sách bảo mật</Link>
            </li>
            <li>
              <Link href={TERMS_HREF}>Điều khoản sử dụng</Link>
            </li>
            <li>
              <a href={site.url}>{site.domain}</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className={`${styles.shell} ${styles.footerBottom}`}>
        <span>© 2026 Gia Sư Nhà Mình. Bảo lưu mọi quyền.</span>
        <span>Đúng người, đúng cách, đúng lúc.</span>
      </div>
    </footer>
  );
}
