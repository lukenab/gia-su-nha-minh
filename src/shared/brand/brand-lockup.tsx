import { useId } from "react";

import { interLatin } from "@/features/admin/fonts";

import styles from "./brand-lockup.module.css";

/** Admin-only identity: spaced B Flow symbol with the Nexus Workspace wordmark. */
export function BrandLockup({
  tone = "auto",
  symbolOnly = false,
}: {
  tone?: "auto" | "dark";
  symbolOnly?: boolean;
}) {
  const gradientId = useId();
  return (
    <span
      className={`${interLatin.variable} ${styles.lockup}`}
      data-tone={tone}
      aria-hidden="true"
    >
      <svg
        className={styles.mark}
        viewBox="0 0 64 64"
        fill="none"
        focusable="false"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="8"
            y1="8"
            x2="56"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop className={styles.start} />
            <stop className={styles.middle} offset=".45" />
            <stop className={styles.end} offset="1" />
          </linearGradient>
        </defs>
        <g className={styles.ribbons} fill={`url(#${gradientId})`}>
          {[0, 90, 180, 270].map((angle, index) => (
            <path
              key={angle}
              d="M10.90 30.58 Q8.00 29.00 10.33 26.67 L28.67 8.33 Q31.00 6.00 31.00 9.30 L31.00 19.70 Q31.00 23.00 28.67 25.33 L21.33 32.67 Q19.00 35.00 16.10 33.42 Z"
              transform={`rotate(${angle} 32 32) translate(21 22) scale(.92) translate(-21 -22)`}
              opacity={index % 2 ? 0.94 : 1}
            />
          ))}
        </g>
      </svg>
      {!symbolOnly && (
        <span className={styles.wordmark}>
          <span className={styles.name}>NEXUS</span>
          <span className={styles.descriptor}>WORKSPACE</span>
        </span>
      )}
    </span>
  );
}
