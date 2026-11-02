"use client";

import { useEffect, useRef } from "react";

import { type StripCard, strip } from "@/features/landing/content";
import { useReducedMotion } from "@/features/landing/hooks/use-reduced-motion";

import styles from "./landing.module.css";
import {
  BrowserFrame,
  PhoneChatScreen,
  PhoneFrame,
  PhoneRequestScreen,
  PhoneSuccessScreen,
  TutorMatchScreen,
  WebFormScreen,
} from "./mockups";

const DESKTOP = "(min-width: 861px)";

function CardVisual({ id }: { id: StripCard["id"] }) {
  switch (id) {
    case "web-form":
      return (
        <BrowserFrame
          className={styles.stripBrowser}
          url="giasunhaminh.id.vn/get-started"
        >
          <WebFormScreen />
        </BrowserFrame>
      );
    case "phone-form":
      return (
        <PhoneFrame className={styles.stripPhone}>
          <PhoneRequestScreen />
        </PhoneFrame>
      );
    case "phone-code":
      return (
        <PhoneFrame className={styles.stripPhone}>
          <PhoneSuccessScreen />
        </PhoneFrame>
      );
    case "contact":
      return (
        <PhoneFrame className={styles.stripPhone}>
          <PhoneChatScreen />
        </PhoneFrame>
      );
    case "meet":
      return <TutorMatchScreen />;
  }
}

/**
 * Dark band of product cards. On desktop, vertical scrolling drives a
 * horizontal track inside a sticky viewport. On small screens or with reduced
 * motion it becomes a native, swipeable scroll-snap row.
 */
export function Showcase() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = section.current;
    const row = track.current;
    if (!element || !row) return;
    const media = window.matchMedia(DESKTOP);
    let frame = 0;
    let overflow = 0;

    const measure = () => {
      overflow = Math.max(0, row.scrollWidth - row.clientWidth);
      if (media.matches && !reduced) {
        element.dataset.pinned = "true";
        row.tabIndex = -1;
        element.style.setProperty(
          "--pin-height",
          `${overflow + window.innerHeight}px`,
        );
      } else {
        delete element.dataset.pinned;
        row.tabIndex = 0;
        element.style.removeProperty("--pin-height");
        row.style.removeProperty("--x");
      }
      update();
    };
    const update = () => {
      frame = 0;
      if (element.dataset.pinned !== "true") return;
      const pin = element.querySelector<HTMLElement>("[data-pin]");
      if (!pin) return;
      const rect = pin.getBoundingClientRect();
      const distance = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      row.style.setProperty("--x", `${(-progress * overflow).toFixed(1)}px`);
      element.style.setProperty("--p", progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(row);
    media.addEventListener("change", measure);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      media.removeEventListener("change", measure);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [reduced]);

  return (
    <section
      ref={section}
      className={styles.showcase}
      id="trai-nghiem"
      aria-labelledby="showcase-title"
    >
      <div className={styles.showcasePin} data-pin>
        <div className={styles.showcaseSticky}>
          <div className={`${styles.shell} ${styles.showcaseHeading}`}>
            <div>
              <span className={`${styles.sectionNo} ${styles.sectionNoLight}`}>
                {strip.label}
              </span>
              <h2 id="showcase-title">
                {strip.title[0]} <em>{strip.title[1]}</em>
              </h2>
            </div>
            <p>{strip.intro}</p>
          </div>
          <div
            ref={track}
            className={styles.stripTrack}
            role="region"
            aria-label="Các bước trải nghiệm, có thể cuộn ngang"
            tabIndex={0}
          >
            <ol className={styles.stripList}>
              {strip.cards.map((card, index) => (
                <li
                  key={card.id}
                  className={styles.stripCard}
                  data-reveal
                  style={{ "--d": `${index * 80}ms` } as React.CSSProperties}
                >
                  <div className={styles.stripVisual} data-kind={card.id}>
                    <CardVisual id={card.id} />
                  </div>
                  <div className={styles.stripCopy}>
                    <small>
                      0{index + 1} · {card.step}
                    </small>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className={`${styles.shell} ${styles.stripFooter}`}>
            <div className={styles.stripProgress} aria-hidden="true">
              <span />
            </div>
            <p className={styles.showcaseNote}>{strip.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
