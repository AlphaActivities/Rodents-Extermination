import { Search, FileText, Hammer, CheckCircle } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Inspection',
    description: 'We come out, go into the attic, and tell you exactly what we find. Current insulation condition, any rodent activity, air leaks, and anything else worth knowing. No charge for this step.',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Plan',
    description: 'We walk you through what needs to be done, what materials will be used, and what it will cost. You decide whether to move forward. There is no pressure and no obligation.',
  },
  {
    number: '03',
    icon: Hammer,
    title: 'Cleanup And Prep',
    description: 'Old or contaminated insulation is removed and disposed of properly. If the attic needs sanitizing, that happens here. The space is fully prepared before any new material goes in.',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Insulation And Restoration',
    description: 'New insulation is installed to the right coverage and R-value. Air sealing is completed. We clean up before we leave, and we walk you through the finished work before we go.',
  },
];

const delayClasses = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3'] as const;

export default function Process() {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: stepsRef, visible: stepsVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  return (
    <section id="process" className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background photo — same overlay treatment as Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/Success_image04.JPG"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-neutral-950/70" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Simple Steps, Clear Communication
          </h2>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Here's what actually happens when you decide to get your attic checked and fixed properly.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={stepsRef as React.RefObject<HTMLDivElement>}
          className="relative"
        >
          {/* Connector line — desktop only, animate with scaleX */}
          <div
            className={`hidden lg:block absolute top-16 left-0 right-0 h-px bg-white/20 mx-28 origin-left transition-transform duration-700 ease-out ${stepsVisible ? 'scale-x-100' : 'scale-x-0'}`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`relative flex flex-col items-center text-center reveal ${delayClasses[index]} ${stepsVisible ? 'reveal-visible' : ''}`}
                >
                  <div className="relative z-10 w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center shadow-lg mb-6 ring-4 ring-white">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <span className="text-xs font-bold text-brand-400 tracking-widest uppercase mb-2">
                    Step {step.number}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-neutral-300 text-sm leading-relaxed">{step.description}</p>

                  {index < steps.length - 1 && (
                    <div className="lg:hidden w-px h-8 bg-white/20 mt-8" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA banner + bridge into Video */}
        <div
          ref={ctaRef as React.RefObject<HTMLDivElement>}
          className={`mt-16 bg-brand-500 rounded-2xl p-7 sm:p-10 text-center reveal ${ctaVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-xl font-bold text-white mb-2">The first step is free.</p>
          <p className="text-blue-100 mb-2 text-sm leading-relaxed max-w-md mx-auto">
            Call Steven to schedule an inspection and get a clear picture of what is happening in your attic.
          </p>
          <p className="text-blue-100/60 text-xs mb-7">No pressure, just a clear plan</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm sm:max-w-none mx-auto w-full">
            <a
              href="tel:9728046456"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-600 hover:bg-brand-50 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg active:scale-95 w-full sm:w-auto min-h-[52px]"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Steven Now
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:border-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-sm w-full sm:w-auto min-h-[52px]"
            >
              Request Free Estimate
            </a>
          </div>
        </div>

        {/* Bridge into Video */}
        <div className={`mt-12 text-center reveal reveal-delay-1 ${ctaVisible ? 'reveal-visible' : ''}`}>
          <p className="text-neutral-400 text-sm">You don't have to guess what's happening at any step.</p>
        </div>
      </div>
    </section>
  );
}
