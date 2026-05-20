import { trackScrollMilestone } from './events';

const MILESTONES = [25, 50, 75, 90] as const;

export function initScrollTracking(): () => void {
  if (import.meta.env.DEV) return () => {};

  const fired = new Set<number>();
  let rafId: number | null = null;

  function check() {
    rafId = null;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = (window.scrollY / docHeight) * 100;
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      const milestone = MILESTONES[i];
      if (pct >= milestone && !fired.has(milestone)) {
        fired.add(milestone);
        trackScrollMilestone(milestone);
      }
    }
  }

  function onScroll() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(check);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', onScroll);
    if (rafId !== null) cancelAnimationFrame(rafId);
  };
}
