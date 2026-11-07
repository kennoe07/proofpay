"use client";

import { useEffect } from "react";

// Fades landing page sections in as they scroll into view. Elements opt in with
// `data-reveal` (and an optional `--reveal-i` style for a stagger). The CSS only hides
// them while <html> has the "motion" class. The layout's head script sets it before first
// paint and removes it after 3 seconds unless this component has taken over (window.__reveal),
// so content never stays hidden. Skipped entirely when the visitor prefers reduced motion.
export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    (window as Window & { __reveal?: boolean }).__reveal = true;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    root.classList.add("motion");
    for (const el of document.querySelectorAll("[data-reveal]")) observer.observe(el);

    return () => {
      observer.disconnect();
      root.classList.remove("motion");
    };
  }, []);

  return null;
}
