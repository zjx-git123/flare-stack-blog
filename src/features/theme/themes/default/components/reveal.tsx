import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in milliseconds before the transition starts */
  delay?: number;
  /** Vertical travel distance in pixels */
  fromY?: number;
}

/**
 * Scroll-triggered entrance animation (fade + rise).
 *
 * Elements are only visually hidden once JS is confirmed (via the `.js` class
 * added in the root document), so content stays visible for SSR, no-JS, and
 * `prefers-reduced-motion` users (see `.js .reveal` in the theme styles).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  fromY = 16,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", isVisible && "is-visible", className)}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          "--reveal-from-y": `${fromY}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
