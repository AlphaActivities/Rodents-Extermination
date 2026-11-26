(() => {
  const overlay = '[role="dialog"][aria-label="Navigation menu"]';
  const opener = () => document.querySelector('button[aria-label="Open navigation"]');
  let active;
  new MutationObserver(() => {
    const dialog = document.querySelector(overlay);
    if (dialog === active) return;
    opener()?.setAttribute('aria-expanded', String(Boolean(dialog)));
    if (dialog) dialog.querySelector('.db-mobile-close')?.focus();
    else if (active) opener()?.focus();
    active = dialog;
  }).observe(document.body, {childList:true,subtree:true});
  matchMedia('(width >= 1024px)').addEventListener('change', event => {
    if (event.matches) active?.querySelector('.db-mobile-close')?.click();
  });
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      active.querySelector('.db-mobile-close')?.click();
    }
    if (event.key !== 'Tab') return;
    const controls = [...active.querySelectorAll('button, a[href]')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    const outside = !active.contains(document.activeElement);
    if (outside || document.activeElement === (event.shiftKey ? first : last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  });
})();
