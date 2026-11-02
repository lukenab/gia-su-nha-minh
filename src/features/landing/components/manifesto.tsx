"use client";

import { useRef } from "react";

import { type BentoItem, bento, manifesto } from "@/features/landing/content";
import { useReducedMotion } from "@/features/landing/hooks/use-reduced-motion";
import { useScrollProgress } from "@/features/landing/hooks/use-scroll-progress";

import { Check, Clock, Lock, User } from "./icons";
import styles from "./landing.module.css";

const words = manifesto.text.split(" ");

/** Statement that inks in word by word as the visitor scrolls, then a bento grid. */
export function Manifesto() {
  const scene = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useScrollProgress(scene, { mode: "sticky", disabled: reduced, rest: 1 });

  return (
    <section
      className={styles.manifesto}
      id="vi-sao"
      aria-labelledby="manifesto-title"
    >
      <div
        ref={scene}
        className={styles.manifestoScene}
        style={{ "--n": words.length } as React.CSSProperties}
      >
        <div className={`${styles.shell} ${styles.manifestoSticky}`}>
          <span className={styles.sectionNo}>{manifesto.label}</span>
          <h2 id="manifesto-title" className={styles.manifestoText}>
            <span className={styles.srOnly}>{manifesto.text}</span>
            <span aria-hidden="true">
              {words.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className={styles.manifestoWord}
                  style={{ "--i": index } as React.CSSProperties}
                >
                  {word}{" "}
                </span>
              ))}
            </span>
          </h2>
        </div>
      </div>
      <div className={`${styles.shell} ${styles.bento}`}>
        {bento.map((item, index) => (
          <article
            key={item.id}
            className={`${styles.bentoCard} ${styles[`bento_${item.id}`]}`}
            data-reveal
            style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
          >
            <BentoVisual id={item.id} />
            <div>
              <small>{item.eyebrow}</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BentoVisual({ id }: { id: BentoItem["id"] }) {
  if (id === "time") {
    return (
      <div className={styles.bentoForm} aria-hidden="true">
        <span className={styles.bentoTimer}>
          <Clock /> ~ 3 phút
        </span>
        {["Mục tiêu", "Trình độ", "Hình thức", "Ngân sách", "Thời gian"].map(
          (label, index) => (
            <span
              key={label}
              style={{ "--d": `${index * 120}ms` } as React.CSSProperties}
            >
              <Check /> {label}
            </span>
          ),
        )}
      </div>
    );
  }
  if (id === "account") {
    return (
      <div className={styles.bentoIcon} aria-hidden="true">
        <Lock />
        <i />
      </div>
    );
  }
  if (id === "reply") {
    return (
      <div className={styles.bentoReply} aria-hidden="true">
        <strong>24</strong>
        <span>giờ</span>
      </div>
    );
  }
  return (
    <ul className={styles.bentoChecks} aria-hidden="true">
      {["Danh tính", "Chứng chỉ", "Kinh nghiệm"].map((label) => (
        <li key={label}>
          <span>
            <User />
          </span>
          {label}
          <Check />
        </li>
      ))}
    </ul>
  );
}
