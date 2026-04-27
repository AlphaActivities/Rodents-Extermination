import { Wind, Trash2, Home, Bug, Lock, Search, ArrowRight } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const services = [
  {
    icon: Wind,
    title: 'Blown-In Insulation',
    description: 'We install blown-in insulation to the R-value your property actually needs. Done right, it creates consistent coverage across the attic floor and makes a real difference in comfort and efficiency year-round.',
    highlight: 'Most Requested',
    image: '/images/Success_image01.JPG',
  },
  {
    icon: Trash2,
    title: 'Insulation Removal',
    description: 'Old, wet, or rodent-damaged insulation has to come out before anything else can be done properly. We remove it completely, dispose of it safely, and leave the attic ready for the next step.',
    highlight: null,
    image: '/images/before_1.jpg',
  },
  {
    icon: Home,
    title: 'Attic Restoration',
    description: 'After rodent activity or long-term neglect, an attic needs more than new insulation. We sanitize, deodorize, seal entry points, and restore the space so you can feel confident in your property again.',
    highlight: null,
    image: '/images/after_1.jpg',
  },
  {
    icon: Bug,
    title: 'Rodent Damage Cleanup',
    description: 'Rodent droppings, urine, and nesting material inside insulation are a health concern, not just a mess. We remove contaminated material, treat the area, and document what we find.',
    highlight: null,
    image: '/images/rodents.jpg',
  },
  {
    icon: Lock,
    title: 'Air Sealing',
    description: 'Gaps and unsealed penetrations in the attic floor allow conditioned air to escape and pests to enter. Proper air sealing works alongside insulation to improve efficiency and tighten the home.',
    highlight: null,
    image: '/images/gaps.jpg',
  },
  {
    icon: Search,
    title: 'Attic Inspection',
    description: 'Before any work begins, we inspect the attic thoroughly and tell you exactly what we find. No pressure, no guesswork. Just a clear picture of what is up there and what, if anything, needs to be done.',
    highlight: 'Free',
    image: '/images/inspection.jpg',
  },
];

const delayClasses = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5'] as const;

export default function Services() {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: cardsRef, visible: cardsVisible } = useReveal();
  const { ref: bridgeRef, visible: bridgeVisible } = useReveal();

  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <div>
            <p className="section-label mb-3">What We Do</p>
            <h2 className="section-heading">
What Actually Fixes These Problems
            </h2>
          </div>
          <p className="section-subheading lg:text-right lg:max-w-sm">
            Each service below addresses a specific issue we commonly find in attics like yours.
          </p>
        </div>

        {/* Service cards */}
        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className={`relative rounded-2xl overflow-hidden group flex flex-col min-h-[320px] card-luxury-hover reveal ${delayClasses[i]} ${cardsVisible ? 'reveal-visible' : ''}`}
              >
                {/* Background image */}
                <img
                  src={service.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/65 z-10" />

                {/* Content */}
                <div className="relative z-20 p-7 flex flex-col flex-1">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center group-hover:bg-brand-600 transition-colors duration-200 shadow-sm">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {service.highlight && (
                      <span className="text-xs font-semibold bg-white/10 text-white border border-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {service.highlight}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-neutral-300 text-sm leading-relaxed flex-1">{service.description}</p>

                  <a
                    href="tel:9728046456"
                    className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold text-sm mt-6 group/link"
                  >
                    Call Juan Now
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform duration-150" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bridge into Transformation */}
        <div
          ref={bridgeRef as React.RefObject<HTMLDivElement>}
          className={`border-t border-neutral-100 pt-12 text-center reveal ${bridgeVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-neutral-500 text-base mb-1">Wondering what a finished job actually looks like?</p>
          <p className="text-neutral-400 text-sm">The before and after difference is something most homeowners have to see to believe.</p>
        </div>
      </div>
    </section>
  );
}
