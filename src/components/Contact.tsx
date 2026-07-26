import { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { supabase } from '../lib/supabase';
import {
  trackCall,
  trackFormEngaged,
  trackServiceSelected,
  trackFormSubmit,
  trackFormSuccess,
  trackSubmitAnother,
  trackSectionView,
} from '../analytics';

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, opts: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      }) => number;
      reset: (id?: number) => void;
      getResponse: (id?: number) => string;
      ready: (cb: () => void) => void;
    };
    __onRecaptchaLoad?: () => void;
    __recaptchaApiReady?: boolean;
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;

const services = [
  'Attic Insulation',
  'Radiant Barrier',
  'Rodent Control',
  'Wildlife Removal',
  'Sanitation & Cleanup',
  'Commercial Services',
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [recaptchaFailed, setRecaptchaFailed] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
    property_zip: '',
    bot_field: '',
  });
  const formStartedAtRef = useRef<string>('');
  const recaptchaWidgetIdRef = useRef<number | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const hasEngagedRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  const { ref: headerRef, visible: headerVisible } = useReveal(() => trackSectionView('contact'));
  const { ref: contactColRef, visible: contactColVisible } = useReveal();
  const { ref: formColRef, visible: formColVisible } = useReveal();

  useEffect(() => {
    if (submitted) {
      trackFormSuccess();
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [submitted]);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 40;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRetry = () => {
      if (cancelled) return;
      attempts += 1;
      if (attempts > MAX_ATTEMPTS) {
        setRecaptchaFailed(true);
        return;
      }
      timer = setTimeout(renderWidget, 250);
    };

    const renderWidget = () => {
      if (cancelled) return;
      const container = recaptchaContainerRef.current;
      const grecaptcha = window.grecaptcha;
      if (!container || !grecaptcha || typeof grecaptcha.render !== 'function') {
        scheduleRetry();
        return;
      }
      if (recaptchaWidgetIdRef.current !== null) {
        setRecaptchaReady(true);
        return;
      }
      try {
        recaptchaWidgetIdRef.current = grecaptcha.render(container, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token: string) => {
            setRecaptchaToken(token);
            setRecaptchaError(false);
          },
          'expired-callback': () => setRecaptchaToken(''),
          'error-callback': () => setRecaptchaToken(''),
        });
        setRecaptchaReady(true);
      } catch {
        scheduleRetry();
      }
    };

    const onLoad = () => {
      if (cancelled) return;
      const grecaptcha = window.grecaptcha;
      if (grecaptcha && typeof grecaptcha.ready === 'function') {
        grecaptcha.ready(renderWidget);
      } else {
        renderWidget();
      }
    };

    if (window.__recaptchaApiReady) {
      onLoad();
    } else {
      window.addEventListener('recaptcha:loaded', onLoad, { once: true });
      scheduleRetry();
    }

    return () => {
      cancelled = true;
      window.removeEventListener('recaptcha:loaded', onLoad);
      if (timer) clearTimeout(timer);
      if (recaptchaWidgetIdRef.current !== null && recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = '';
      }
      recaptchaWidgetIdRef.current = null;
      setRecaptchaReady(false);
    };
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'phone' ? formatPhone(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
    if (error) setError(null);
    if (e.target.name === 'service' && e.target.value !== '') {
      trackServiceSelected(e.target.value);
    }
  };

  const handleFocus = () => {
    if (!hasEngagedRef.current) {
      hasEngagedRef.current = true;
      trackFormEngaged();
    }
    if (!formStartedAtRef.current) {
      formStartedAtRef.current = new Date().toISOString();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement)?.blur();

    if (form.bot_field) {
      return;
    }

    if (!recaptchaToken) {
      setRecaptchaError(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-lead`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email || undefined,
            service_name: form.service,
            message: form.message,
            property_zip: form.property_zip,
            landing_page: window.location.href,
            page_path: window.location.pathname,
            referrer: document.referrer || undefined,
            recaptcha_token: recaptchaToken,
            bot_field: form.bot_field,
            form_started_at: formStartedAtRef.current,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        const msg = result?.error || 'Something went wrong. Please try again or call (972) 804-6456.';
        setError(msg);
        if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
          window.grecaptcha.reset(recaptchaWidgetIdRef.current);
        }
        setRecaptchaToken('');
        return;
      }

      trackFormSubmit(form.service, form.message.length > 0);
      setSubmitted(true);
      setRecaptchaToken('');
      if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
        window.grecaptcha.reset(recaptchaWidgetIdRef.current);
      }
    } catch {
      setError('Something went wrong while submitting your request. Please try again or call us directly at (972) 804-6456.');
      if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
        window.grecaptcha.reset(recaptchaWidgetIdRef.current);
      }
      setRecaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-12 sm:mb-16 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="section-label mb-3">Get In Touch</p>
          <h2 className="section-heading mb-5">
            Request Your Free Estimate
          </h2>
          <p className="section-subheading mx-auto">
            The fastest way to get clarity is a quick call. You can also send your details below and we'll follow up.
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Column 1: Contact info (phone first) ── */}
          <div
            ref={contactColRef as React.RefObject<HTMLDivElement>}
            className={`space-y-4 lg:space-y-5 reveal-left ${contactColVisible ? 'reveal-visible' : ''}`}
          >
            {/* Call card */}
            <div className="bg-brand-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Call Steven Guerrero Directly</h3>
              <p className="text-blue-100 text-sm mb-1 leading-relaxed">
                Calling is the fastest way to get scheduled. Steven answers personally and can walk you through your attic situation before any commitment.
              </p>
              <p className="text-blue-100/60 text-xs mb-5 sm:mb-6">Free estimates for residential and commercial attic work.</p>
              <a
                href="tel:9728046456"
                onClick={() => trackCall('contact_call_card', 'contact')}
                className="flex items-center justify-center gap-2 bg-white text-brand-600 hover:bg-brand-50 font-bold px-5 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm text-sm w-full min-h-[52px]"
              >
                <Phone className="w-4 h-4" />
                (972) 804-6456
              </a>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-100">
                <Mail className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900 text-sm mb-0.5">Email</div>
                <a href="mailto:rodentsexterminsulationllc@gmail.com" className="text-neutral-500 text-sm hover:text-brand-500 transition-colors duration-200">rodentsexterminsulationllc@gmail.com</a>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-100">
                <MapPin className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900 text-sm mb-0.5">Service Area</div>
                <div className="text-neutral-500 text-sm">Fort Worth &amp; DFW Area, TX</div>
              </div>
            </div>
          </div>

          {/* ── Column 2–3: Form ── */}
          <div
            ref={formColRef as React.RefObject<HTMLDivElement>}
            className={`lg:col-span-2 reveal-right reveal-delay-1 ${formColVisible ? 'reveal-visible' : ''}`}
          >
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
              {!submitted && (
                <div className="mb-6 pb-6 border-b border-neutral-100">
                  <h3 className="font-bold text-neutral-900 text-lg mb-1">Or Submit A Request Online</h3>
                  <p className="text-neutral-400 text-sm">Fill out the form and we will follow up to schedule your free inspection.</p>
                </div>
              )}
              {submitted ? (
                <div ref={successRef} className="flex flex-col items-center justify-center py-12 sm:py-14 text-center form-success-enter">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Request Received</h3>
                  <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
                    Thanks for reaching out. We will contact you to schedule your free inspection.
                  </p>
                  <button
                    className="mt-6 text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors min-h-[44px] px-4"
                    onClick={() => {
                      trackSubmitAnother();
                      setSubmitted(false);
                      hasEngagedRef.current = false;
                      formStartedAtRef.current = '';
                      setForm({ name: '', phone: '', email: '', service: '', message: '', property_zip: '', bot_field: '' });
                      setRecaptchaToken('');
                      setRecaptchaFailed(false);
                      if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
                        window.grecaptcha.reset(recaptchaWidgetIdRef.current);
                      }
                    }}
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Honeypot field — hidden from real users, bots will fill it */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                    <label htmlFor="bot_field">Leave this field empty</label>
                    <input
                      id="bot_field"
                      name="bot_field"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.bot_field}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="name">
                        Full Name <span className="text-red-400 font-normal">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        aria-required="true"
                        value={form.name}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder="Your full name"
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-neutral-50 hover:bg-white min-h-[48px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="phone">
                        Phone Number <span className="text-red-400 font-normal">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        aria-required="true"
                        value={form.phone}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder="(555) 000-0000"
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-neutral-50 hover:bg-white min-h-[48px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      placeholder="your@email.com"
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-neutral-50 hover:bg-white min-h-[48px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="service">
                        Service Needed <span className="text-red-400 font-normal">*</span>
                      </label>
                      <select
                        id="service"
                        name="service"
                        required
                        aria-required="true"
                        value={form.service}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-neutral-50 hover:bg-white min-h-[48px]"
                      >
                        <option value="">Select a service...</option>
                        {services.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="property_zip">
                        Property ZIP Code <span className="text-red-400 font-normal">*</span>
                      </label>
                      <input
                        id="property_zip"
                        name="property_zip"
                        type="text"
                        inputMode="numeric"
                        pattern="\d{5}"
                        maxLength={5}
                        required
                        aria-required="true"
                        value={form.property_zip}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder="75001"
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-neutral-50 hover:bg-white min-h-[48px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="message">
                      Briefly describe what you are seeing, hearing, or experiencing at the property. <span className="text-red-400 font-normal">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      aria-required="true"
                      minLength={10}
                      maxLength={1500}
                      value={form.message}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      placeholder="Describe what you are seeing, hearing, or experiencing at the property..."
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none bg-neutral-50 hover:bg-white"
                    />
                  </div>

                  {/* reCAPTCHA v2 checkbox */}
                  <div>
                    <div ref={recaptchaContainerRef} className="min-h-[78px]" aria-label="Spam verification" />
                    {RECAPTCHA_SITE_KEY && !recaptchaReady && !recaptchaFailed && (
                      <p className="text-neutral-400 text-xs mt-1.5" role="status">Loading verification…</p>
                    )}
                    {recaptchaError && (
                      <p className="text-red-500 text-sm mt-1.5" role="alert">Please complete the spam check to submit.</p>
                    )}
                    {(!RECAPTCHA_SITE_KEY || recaptchaFailed) && (
                      <p className="text-neutral-400 text-xs mt-1.5">Verification unavailable. Please call (972) 804-6456.</p>
                    )}
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center leading-relaxed">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary justify-center py-4 text-base rounded-xl min-h-[52px] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request For Free Estimate
                      </>
                    )}
                  </button>

                  <p className="text-neutral-600 text-xs text-center pt-1">
                    We will only use your contact information to follow up on this request.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
