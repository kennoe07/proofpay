"use client";

import { useEffect, useRef } from "react";

// Shows a number (like "11.00" or "1,250.50") and, the first time it scrolls into view,
// counts up to it from zero. The real value is in the HTML from the start, so search
// engines, scanners and visitors who prefer reduced motion just see the number.
export function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const target = Number(value.replace(/,/g, ""));
    if (!Number.isFinite(target) || target <= 0) return;
    const decimals = value.split(".")[1]?.length ?? 0;
    const format = (n: number) =>
      n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

    let frame = 0;
    let fallback = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      // Starts from zero only now, as its section begins fading in (see RevealOnScroll).
      el.textContent = format(0);
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = t < 1 ? format(target * eased) : value;
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      // Safety net: if animation frames are paused (background tab, some headless browsers),
      // still land on the real number.
      fallback = window.setTimeout(() => {
        cancelAnimationFrame(frame);
        el.textContent = value;
      }, duration + 250);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(fallback);
      el.textContent = value;
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
