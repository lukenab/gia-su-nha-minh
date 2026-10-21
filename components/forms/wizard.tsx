"use client";

import { useEffect, useRef } from "react";

import { ArrowUpRight, Check } from "@/components/landing/icons";

import styles from "./form.module.css";

export type WizardStep = { id: string; title: string; description: string };

type WizardProps = {
  steps: WizardStep[];
  current: number;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
  submitLabel: string;
  formError?: string;
  children: React.ReactNode;
};

/**
 * Multi-step form frame: progress indicator, step heading and navigation.
 * Moving between steps focuses the new heading so keyboard and screen reader
 * users land at the start of the step.
 */
export function Wizard({
  steps,
  current,
  onBack,
  onNext,
  submitting,
  submitLabel,
  formError,
  children,
}: WizardProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const step = steps[current];
  const isLast = current === steps.length - 1;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [current]);

  return (
    <form
      className={styles.panel}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onNext();
      }}
    >
      <ol className={styles.progress} aria-label="Tiến độ">
        {steps.map((item, index) => (
          <li
            key={item.id}
            data-state={
              index < current ? "done" : index === current ? "current" : "todo"
            }
            aria-current={index === current ? "step" : undefined}
          >
            <span className={styles.progressDot} aria-hidden="true">
              {index < current ? <Check /> : index + 1}
            </span>
            <span className={styles.progressLabel}>{item.title}</span>
          </li>
        ))}
      </ol>
      <div
        className={styles.progressBar}
        role="progressbar"
        aria-label="Tiến độ hoàn thành"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={`Bước ${current + 1} trên ${steps.length}`}
      >
        <span style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>

      <div className={styles.stepHead}>
        <small>
          Bước {current + 1}/{steps.length}
        </small>
        <h2 ref={heading} tabIndex={-1}>
          {step.title}
        </h2>
        <p>{step.description}</p>
      </div>

      <div className={styles.stepBody} key={step.id}>
        {children}
      </div>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <div className={styles.nav}>
        {current > 0 ? (
          <button type="button" className={styles.back} onClick={onBack}>
            ← Quay lại
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className={styles.next} disabled={submitting}>
          {submitting ? "Đang gửi…" : isLast ? submitLabel : "Tiếp tục"}
          {!submitting && <ArrowUpRight />}
        </button>
      </div>
    </form>
  );
}

/** Focus the first field that has an error, after React has rendered it. */
export function focusFirstError(ids: string[]) {
  requestAnimationFrame(() => {
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) {
        element.focus();
        element.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
    }
  });
}
