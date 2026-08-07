import { useEffect, useRef } from "react";

/**
 * Fixed 1px reading-progress bar pinned to the top edge of the viewport.
 *
 * Scroll progress is written to a CSS variable directly (no React re-renders),
 * matching the codebase pattern used by BackgroundLayer.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
      barRef.current?.style.setProperty("--scroll-progress-top", String(progress));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-foreground/50"
        style={{ transform: "scaleX(var(--scroll-progress-top, 0))" }}
      />
    </div>
  );
}
