import { Phone, ClipboardList } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

export default function FinalCTA() {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: phoneRef, visible: phoneVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background photo — same overlay treatment as Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/Success_image06.JPG"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-neutral-950/70" />
        {/* Ambient orb A — top-left */}
        <div
          className="cta-orb-a absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)' }}
        />
        {/* Ambient orb B — bottom-right */}
        <div
          className="cta-orb-b absolute -bottom-32 -right-32 w-[560px] h-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.10) 0%, transparent 65%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-brand-200 font-semibold text-sm uppercase tracking-widest mb-5">Take The First Step</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Know What's Actually Happening In Your Attic
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed mb-4 max-w-2xl mx-auto">
            One quick inspection can show you what's working, what's not, and what it would take to fix it properly.
          </p>
          <p className="text-blue-100/60 text-sm mb-12">No obligation. Just a clear picture of what's up there.</p>
        </div>

        {/* Phone display */}
        <div
          ref={phoneRef as React.RefObject<HTMLDivElement>}
          className={`inline-flex items-center gap-3 sm:gap-4 bg-white/10 border border-white/20 rounded-2xl px-5 sm:px-7 py-4 sm:py-5 mb-8 sm:mb-10 shadow-inner w-full max-w-xs sm:max-w-sm mx-auto reveal reveal-scale ${phoneVisible ? 'reveal-visible' : ''}`}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-blue-100/70 text-xs font-semibold uppercase tracking-widest mb-0.5">Call or Text Juan Directly</div>
            <div className="text-white font-bold text-xl sm:text-2xl tracking-wide">(972) 804-6456</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          ref={ctaRef as React.RefObject<HTMLDivElement>}
          className={`flex flex-col sm:flex-row gap-4 justify-center max-w-sm sm:max-w-none mx-auto w-full reveal ${ctaVisible ? 'reveal-visible' : ''}`}
        >
          <a
            href="tel:9728046456"
            className="inline-flex items-center justify-center gap-2 bg-white text-brand-600 hover:bg-brand-50 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 text-base w-full sm:w-auto min-h-[52px] btn-luxury-glow"
          >
            <Phone className="w-5 h-5" />
            Call Juan Now
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:border-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-base w-full sm:w-auto min-h-[52px]"
          >
            <ClipboardList className="w-5 h-5" />
            Request Free Estimate
          </a>
        </div>

        {/* Trust reassurances */}
        <div className={`flex flex-wrap items-center justify-center gap-6 mt-14 pt-10 border-t border-white/20 reveal reveal-delay-1 ${ctaVisible ? 'reveal-visible' : ''}`}>
          {['No Obligation', 'Free Inspection', 'Residential & Commercial', 'Owner-Operated'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-blue-100 text-sm">
              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
