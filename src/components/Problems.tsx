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
    <section id="problems" className="py-20 sm:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="section-label mb-3">Does This Sound Familiar?</p>
          <h2 className="section-heading mb-5">
            Most Attic Problems Stay Hidden Until They Get Expensive
          </h2>
          <p className="section-subheading mx-auto">
            These are the situations most homeowners notice first. What's causing them is usually hidden above your ceiling.
          </p>
        </div>

        {/* Problem cards */}
        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className={`card p-7 group hover:-translate-y-1 transition-all duration-200 reveal ${delayClasses[i]} ${cardsVisible ? 'reveal-visible' : ''}`}
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors duration-200 border border-brand-100">
                  <Icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{problem.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{problem.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bridge into Services */}
        <div
          ref={bridgeRef as React.RefObject<HTMLDivElement>}
          className={`text-center mt-14 reveal ${bridgeVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-neutral-500 mb-2">Most of these don't start as big problems. They build quietly over time.</p>
          <p className="text-neutral-400 text-sm mb-6">Below are the specific things that actually fix each one of them.</p>
          <a href="tel:9728046456" className="btn-primary min-h-[52px] px-8">
            <Phone className="w-4 h-4" />
            Call Stephen Now
          </a>
          <p className="text-neutral-400 text-xs mt-3">Free estimates, no obligation.</p>
        </div>
      </div>
    </section>
  );
}
