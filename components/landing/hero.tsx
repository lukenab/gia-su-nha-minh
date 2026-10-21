"use client";

import Link from "next/link";
import { useRef } from "react";

import { BrandMark } from "./brand-logo";
import { LEARNER_REQUEST_HREF, hero, heroGoals } from "./content";
import { ArrowDown, ArrowUpRight } from "./icons";
import styles from "./landing.module.css";
import { ConnectOrb } from "./mockups";
import { useReducedMotion } from "./use-reduced-motion";
import { useScrollProgress } from "./use-scroll-progress";

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useScrollProgress(section, { mode: "exit", disabled: reduced, rest: 0 });

  return (
    <section ref={section} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroGlow} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={`${styles.shell} ${styles.heroLayout}`}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>
            <i aria-hidden="true" />
            {hero.kicker}
          </span>
          <h1 id="hero-title" className={styles.heroTitle}>
            {hero.titleLines.map((line, index) => (
              <span key={line} className={styles.heroLine}>
                <span style={{ animationDelay: `${0.1 + index * 0.12}s` }}>
                  {index === 1 ? <em>{line}</em> : line}
                </span>{" "}
              </span>
            ))}
          </h1>
          <p className={styles.heroLead}>{hero.lead}</p>
          <div className={styles.heroActions}>
            <Link
              className={`${styles.button} ${styles.buttonPrimary}`}
              href={LEARNER_REQUEST_HREF}
            >
              {hero.primaryCta} <ArrowUpRight />
            </Link>
            <Link
              className={`${styles.button} ${styles.buttonGhost}`}
              href="/#quy-trinh"
            >
              {hero.secondaryCta} <ArrowDown />
            </Link>
          </div>
          <nav
            className={styles.heroGoals}
            aria-label="Chọn nhanh mục tiêu học"
          >
            <span>{hero.goalsLabel}</span>
            <ul>
              {heroGoals.map((goal) => (
                <li key={goal.key}>
                  <Link href={goal.href}>{goal.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <figure className={styles.heroVisual}>
          <div className={styles.heroPhoneWrap}>
            <div className={styles.heroPhone} aria-hidden="true">
              <span className={styles.heroPhoneNotch} />
              <div className={styles.heroPhoneScreen}>
                <div className={styles.heroPhoneTop}>
                  <BrandMark className={styles.heroPhoneLogo} />
                  <span>Gia Sư Nhà Mình</span>
                </div>
                <small>YÊU CẦU CỦA BẠN</small>
                <ConnectOrb />
                <strong>Tìm gia sư phù hợp</strong>
                <ol className={styles.heroPhoneSteps}>
                  <li>Kể mình nghe</li>
                  <li>Mình tìm cho bạn</li>
                  <li>Bạn chọn, bạn quyết</li>
                </ol>
                <span className={styles.heroPhoneButton}>Bắt đầu ngay →</span>
              </div>
            </div>
            <ul className={styles.heroNotes} aria-hidden="true">
              {hero.phoneNotes.map((note, index) => (
                <li
                  key={note.label}
                  style={{ animationDelay: `${1.1 + index * 0.18}s` }}
                >
                  <small>{note.label}</small>
                  {note.value}
                </li>
              ))}
            </ul>
          </div>
        </figure>
      </div>
      <div className={`${styles.shell} ${styles.trustBar}`}>
        <ul>
          {hero.trust.map((item) => (
            <li key={item.value}>
              <strong>{item.value}</strong>
              <small>{item.label}</small>
            </li>
          ))}
        </ul>
      </div>
      <a className={styles.scrollCue} href="#vi-sao">
        Cuộn để khám phá <ArrowDown />
      </a>
    </section>
  );
}
