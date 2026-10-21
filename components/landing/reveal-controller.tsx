"use client";

import { useEffect } from "react";

import { useReducedMotion } from "./use-reduced-motion";

/**
 * Enables blur/fade-in reveals for elements marked with `data-reveal`.
 * Content stays visible without JavaScript or with reduced motion, because
 * the hidden starting state only applies once `data-motion="on"` is set.
 */
export function RevealController({ rootId }: { rootId: string }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    if (reduced || !("IntersectionObserver" in window)) {
      root.removeAttribute("data-motion");
      return;
    }
    root.setAttribute("data-motion", "on");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-in", "true");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    root
      .querySelectorAll("[data-reveal]:not([data-in])")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [reduced, rootId]);

  return null;
}
