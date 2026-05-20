import { useEffect, useRef, useState } from 'react';

export function useReveal<T extends Element = HTMLDivElement>(onVisible?: () => void) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // For reduced-motion users show content immediately, but still run the
    // observer so the analytics callback fires at the correct scroll position
    // rather than all at once on page load.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setVisible(true);
      // fall through — observer still fires onVisible at intersection
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reducedMotion) setVisible(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  // onVisible is intentionally excluded — it is a stable callback reference
  // and we only want this effect to run once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, visible } as const;
}
