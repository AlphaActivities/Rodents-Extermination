import { Phone, ClipboardList, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 lg:pt-[72px] overflow-hidden hero-shimmer">
      {/* Full-bleed background photo */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/Hero_background.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ objectPosition: '0% center' }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-neutral-950/70" />

        {/* Ambient light orb A — top-left warm glow */}
        <div
          className="hero-orb-a absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          }}
        />
        {/* Ambient light orb B — bottom-right cool glow */}
        <div
          className="hero-orb-b absolute -bottom-40 -right-20 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(96,165,250,0.09) 0%, transparent 65%)',
          }}
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: text content */}
          <div>
            {/* Location badge */}
            <div className="hero-badge inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="sm:hidden flex flex-col text-center leading-snug">
                <span>Serving Fort Worth &amp; DFW.</span>
                <span>Residential &amp; Commercial.</span>
              </span>
              <span className="hidden sm:inline">Serving Fort Worth &amp; DFW, Residential &amp; Commercial</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-5 sm:mb-6">
              <span className="hero-line-1 block">Cleaner Attics.</span>
              <span className="hero-line-2 block text-brand-400">Better Insulation.</span>
              <span className="hero-line-3 block">Comfortable Home.</span>
            </h1>

            {/* Subheadline */}
            <p className="hero-sub text-base sm:text-lg text-neutral-300 leading-relaxed mb-8 sm:mb-10 max-w-lg">
              Rodents Exterm &amp; Insulation LLC serves Fort Worth and DFW homes and businesses. We remove damaged insulation, restore attic spaces, and deliver professional insulation services for both residential and commercial properties.
            </p>

            {/* CTAs */}
            <div className="hero-ctas flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12">
              <a
                href="tel:9728046456"
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 text-base w-full sm:w-auto min-h-[52px] btn-luxury-glow"
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                Call Juan Now
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:border-brand-400 hover:text-brand-300 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-base bg-white/10 backdrop-blur-sm w-full sm:w-auto min-h-[52px]"
              >
                <ClipboardList className="w-5 h-5 flex-shrink-0" />
                Request Free Estimate
              </a>
            </div>

            {/* Trust badges — desktop only */}
            <div className="hero-trust hidden lg:flex flex-nowrap gap-x-4 gap-y-3 pt-6 sm:pt-8 border-t border-white/15">
              {[
                'Free Estimates',
                'Residential & Commercial',
                'Insulation Removal',
                'Attic Restoration',
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-neutral-300 text-xs whitespace-nowrap">
                  <svg className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: image + stat tiles */}
          <div className="flex flex-col gap-4">
            <div className="hero-card-float relative w-full aspect-[4/3] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              {/* Subtle gold rim light */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none z-10"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), 0 0 60px rgba(59,130,246,0.18)',
                }}
              />
              <img
                src="/images/Work_in_action.png"
                alt="Rodents Exterm and Insulation LLC team working on an attic project"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-4 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm z-20">
                Rodents Exterm &amp; Insulation
              </div>
            </div>

            {/* Stat tiles */}
            <div className="hero-tiles grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 shadow-sm px-5 py-4">
                <div className="text-brand-400 font-bold text-xl mb-0.5">Free</div>
                <div className="text-neutral-300 text-xs leading-snug">Inspection &amp; Estimate, No Obligation</div>
              </div>
              <div className="bg-brand-500 rounded-2xl px-5 py-4">
                <div className="text-white font-bold text-xl mb-0.5">DFW</div>
                <div className="text-blue-100 text-xs leading-snug">Fort Worth &amp; Surrounding Area</div>
              </div>
            </div>

            {/* Trust badges — mobile only */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 pt-4 border-t border-white/15 lg:hidden">
              {[
                'Free Estimates',
                'Residential & Commercial',
                'Insulation Removal',
                'Attic Restoration',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-neutral-300 text-sm">
                  <svg className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#problems"
        className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/50 hover:text-brand-400 transition-colors flex-col items-center gap-1"
        aria-label="Scroll to attic problems section"
      >
        <span className="text-xs font-medium tracking-widest uppercase" aria-hidden="true">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
