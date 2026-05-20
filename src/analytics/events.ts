declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

function sendEvent(eventName: string, params: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', eventName, params);
    return;
  }
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

// ── Phone CTA ──────────────────────────────────────────────
export function trackCall(placement: string, section: string, label?: string) {
  sendEvent('clicked_call', {
    event_category: 'conversion',
    placement,
    section,
    ...(label ? { label } : {}),
  });
}

// ── Navigation ─────────────────────────────────────────────
export function trackNavClick(section: string, source: string) {
  sendEvent('clicked_nav', {
    event_category: 'engagement',
    section,
    source,
  });
}

// ── Section visibility ─────────────────────────────────────
export function trackSectionView(sectionName: string) {
  sendEvent('viewed_section', {
    event_category: 'engagement',
    section_name: sectionName,
  });
}

// ── Contact form ───────────────────────────────────────────
export function trackFormEngaged() {
  sendEvent('engaged_contact_form', {
    event_category: 'engagement',
  });
}

export function trackServiceSelected(serviceName: string) {
  sendEvent('selected_service_type', {
    event_category: 'engagement',
    service_name: serviceName,
  });
}

export function trackFormSubmit(serviceName: string, hasMessage: boolean) {
  sendEvent('submitted_contact_form', {
    event_category: 'conversion',
    service_name: serviceName,
    has_message: hasMessage,
    submission_id: null,
  });
}

export function trackFormSuccess() {
  sendEvent('viewed_form_success', {
    event_category: 'engagement',
  });
}

export function trackSubmitAnother() {
  sendEvent('clicked_submit_another', {
    event_category: 'engagement',
  });
}

// ── FAQ ────────────────────────────────────────────────────
export function trackFaqOpen(questionSlug: string) {
  sendEvent('opened_faq', {
    event_category: 'engagement',
    question_slug: questionSlug,
  });
}

// ── Video ──────────────────────────────────────────────────
export function trackVideoPlay(videoTitle: string, videoSlug: string) {
  sendEvent('played_video', {
    event_category: 'engagement',
    video_title: videoTitle,
    video_slug: videoSlug,
  });
}

export function trackVideoComplete(videoTitle: string, videoSlug: string) {
  sendEvent('completed_video', {
    event_category: 'engagement',
    video_title: videoTitle,
    video_slug: videoSlug,
  });
}

// ── Scroll milestones ──────────────────────────────────────
export function trackScrollMilestone(percent: number) {
  sendEvent('scroll_milestone', {
    event_category: 'engagement',
    percent,
  });
}

// ── Mobile menu ────────────────────────────────────────────
export function trackMobileMenuOpen() {
  sendEvent('opened_mobile_menu', {
    event_category: 'engagement',
  });
}

export function trackMobileMenuClose() {
  sendEvent('closed_mobile_menu', {
    event_category: 'engagement',
  });
}
