"use client";

import type { RefObject } from "react";

import { useEffect } from "react";

type Mode =
  /** 0 when the element's top reaches the viewport top, 1 when its bottom reaches the viewport bottom (sticky scenes). */
  | "sticky"
  /** 0 when the element's top is at the viewport top, 1 when it has scrolled fully out (exit effects). */
  | "exit"
  /** 0 when the element enters at the bottom, 1 when it leaves at the top. */
  | "through";

/**
 * Writes scroll progress (0–1) to a CSS custom property on the element,
 * without re-rendering React. With `disabled` the value is pinned to `rest`.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  {
    mode,
    disabled = false,
    rest = 1,
    property = "--p",
  }: {
    mode: Mode;
    disabled?: boolean;
    rest?: number;
    property?: string;
  },
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (disabled) {
      element.style.setProperty(property, String(rest));
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const vh = window.innerHeight;
      let value: number;
      if (mode === "sticky") {
        value = -rect.top / Math.max(rect.height - vh, 1);
      } else if (mode === "exit") {
        value = -rect.top / Math.max(rect.height, 1);
      } else {
        value = (vh - rect.top) / Math.max(rect.height + vh, 1);
      }
      element.style.setProperty(
        property,
        Math.min(1, Math.max(0, value)).toFixed(4),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, mode, disabled, rest, property]);
}
