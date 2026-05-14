import { Zap, Thermometer, AlertTriangle, Rat, Wind, Eye, Phone } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const problems = [
  {
    icon: Zap,
    title: 'High Energy Bills',
    description: 'If your heating and cooling costs keep climbing, compromised attic insulation is often the culprit. Air escapes through gaps and degraded material, and your HVAC runs longer to compensate.',
  },
  {
    icon: Thermometer,
    title: 'Hot Rooms',
    description: 'That one bedroom that never cools down is a sign your attic insulation is not doing its job. Poor coverage creates temperature inconsistencies throughout the home.',
  },
  {
    icon: AlertTriangle,
    title: 'Old Or Damaged Insulation',
    description: 'Insulation that is more than 15 years old, was disturbed by past work, or got wet loses most of its effectiveness. Old does not always mean adequate.',
  },
  {
    icon: Rat,
    title: 'Rodent Contamination',
    description: 'Rodents nest, burrow, and leave behind droppings and urine inside attic insulation. Beyond the structural damage, this creates a real indoor air quality concern for your family.',
  },
  {
    icon: Wind,
    title: 'Uncomfortable Indoor Air',
    description: 'A contaminated or poorly sealed attic pushes allergens and stale air into the occupied spaces below. Many property owners do not realize the connection until after cleanup.',
  },
  {
    icon: Eye,
    title: 'Hidden Attic Problems',
    description: 'Most attic damage is invisible from your living space. Problems build quietly over months and years. A professional inspection is the only way to know what is actually up there.',
  },
];

const delayClasses = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5'] as const;

export default function Problems() {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: cardsRef, visible: cardsVisible } = useReveal();
  const { ref: bridgeRef, visible: bridgeVisible } = useReveal();

  return (
    <section id="problems" className="py-20 sm:py-28 bg-neutral-900 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">Does This Sound Familiar?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
            Most Attic Problems Stay Hidden Until They Get Expensive
          </h2>
          <p className="text-neutral-400 text-base max-w-2xl mx-auto leading-relaxed">
            These are the situations most homeowners notice first. What's causing them is usually hidden above your ceiling.
          </p>
        </div>

        {/* Problem cards */}
        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className={`group relative rounded-2xl p-px reveal ${delayClasses[i]} ${cardsVisible ? 'reveal-visible' : ''}`}
                style={{
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(30,58,138,0.15) 50%, rgba(37,99,235,0.08) 100%)',
                }}
              >
                {/* Inner card */}
                <div className="relative rounded-2xl bg-neutral-800/90 backdrop-blur-sm p-7 h-full overflow-hidden transition-all duration-300 group-hover:bg-neutral-800">
                  {/* Glow on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at top left, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
                    aria-hidden="true"
                  />

                  {/* Icon */}
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(30,58,138,0.35) 100%)', boxShadow: '0 0 0 1px rgba(37,99,235,0.3)' }}
                  >
                    <Icon className="w-5 h-5 text-brand-400 group-hover:text-brand-300 transition-colors duration-300" />
                  </div>

                  {/* Text */}
                  <h3 className="text-base font-semibold text-white mb-2 leading-snug">{problem.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors duration-300">{problem.description}</p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-7 right-7 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bridge into Services */}
        <div
          ref={bridgeRef as React.RefObject<HTMLDivElement>}
          className={`text-center mt-14 reveal ${bridgeVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-neutral-300 mb-2">Most of these don't start as big problems. They build quietly over time.</p>
          <p className="text-neutral-500 text-sm mb-6">Below are the specific things that actually fix each one of them.</p>
          <a href="tel:9728046456" className="btn-primary min-h-[52px] px-8">
            <Phone className="w-4 h-4" />
            Call Steven Now
          </a>
          <p className="text-neutral-500 text-xs mt-3">Free estimates, no obligation.</p>
        </div>
      </div>
    </section>
  );
}
