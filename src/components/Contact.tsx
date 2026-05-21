import { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import {
  trackCall,
  trackFormEngaged,
  trackServiceSelected,
  trackFormSubmit,
  trackFormSuccess,
  trackSubmitAnother,
  trackSectionView,
} from '../analytics';
import { supabase } from '../lib/supabase';

const services = [
  'Blown-In Insulation',
  'Insulation Removal',
  'Attic Restoration',
  'Rodent Damage Cleanup',
  'Air Sealing',
  'Attic Inspection',
  'Wildlife / Rodent Removal',
  'Not Sure / Other',
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
  });
  const hasEngagedRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  const { ref: headerRef, visible: headerVisible } = useReveal(() => trackSectionView('contact'));
  const { ref: contactColRef, visible: contactColVisible } = useReveal();
  const { ref: formColRef, visible: formColVisible } = useReveal();

  // Fire viewed_form_success and scroll to success state on mobile
  useEffect(() => {
    if (submitted) {
      trackFormSuccess();
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [submitted]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement)?.blur();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('leads').insert([
      {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        service_name: form.service,
        message: form.message || null,
        landing_page: window.location.href,
        page_path: window.location.pathname,
        referrer: document.referrer || null,
      },
    ]);

    if (insertError) {
      console.error('Supabase lead insert failed:', insertError);
      setError('Something went wrong. Please try again or call Steven directly at (972) 804-6456.');
      setLoading(false);
      return;
    }

    // Analytics fires only after confirmed DB insert
    trackFormSubmit(form.service, form.message.length > 0);
    setSubmitted(true);
    setLoading(false);
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

        {/*
          Layout:
          - Mobile: phone card → email/location info → form (stacked)
          - Desktop: left sidebar (phone + info) | right 2-col form
          The phone card is always rendered first in DOM order so it appears first on mobile.
        */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Column 1: Contact info (phone first) ── */}
          <div
            ref={contactColRef as React.RefObject<HTMLDivElement>}
            className={`space-y-4 lg:space-y-5 reveal-left ${contactColVisible ? 'reveal-visible' : ''}`}
          >
            {/* Call card — primary, full prominence on mobile */}
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
                <div className="text-neutral-500 text-sm">Email coming soon</div>
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
              {/* Form heading */}
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
                      setForm({ name: '', phone: '', email: '', service: '', message: '' });
                    }}
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
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
                    <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      placeholder="Describe your situation or any questions you have about your attic..."
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none bg-neutral-50 hover:bg-white"
                    />
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
