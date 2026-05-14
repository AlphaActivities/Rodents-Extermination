import { Bird, Cat, Squirrel, Rat, Skull, Shield, AlertTriangle, Bone, ArrowRight, Phone } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const services = [
  {
    icon: Bird,
    title: 'Bird Removal',
    description: 'Birds nesting in attic vents, soffits, or rafters cause structural damage and leave behind droppings that carry health risks. Steven locates entry points, removes the birds, and seals access to prevent return.',
    highlight: null,
  },
  {
    icon: Cat,
    title: 'Raccoon Removal',
    description: 'Raccoons are strong and destructive. They tear through insulation, damage ductwork, and leave significant contamination behind. Early removal limits the repair work needed afterward.',
    highlight: 'Common',
  },
  {
    icon: Squirrel,
    title: 'Squirrel Removal',
    description: 'Squirrels chew through wood, wiring, and insulation to nest in attics. They enter through surprisingly small gaps and reproduce quickly. Removal and entry sealing stop the cycle.',
    highlight: null,
  },
  {
    icon: Rat,
    title: 'Rat Exterminator',
    description: 'Rats move fast and breed faster. Once inside an attic they contaminate insulation with droppings, urine, and nesting material. A professional approach removes the infestation and addresses what they leave behind.',
    highlight: 'High Risk',
  },
  {
    icon: Skull,
    title: 'Mice Exterminator',
    description: 'Mice are small enough to enter through gaps the width of a pencil. They nest inside insulation and chew wiring. Effective extermination requires finding every entry point, not just setting traps.',
    highlight: null,
  },
  {
    icon: Shield,
    title: 'Armadillo Trapping',
    description: 'Armadillos dig under foundations and around structures. While they do not typically enter attics, they cause real property damage and need to be humanely trapped and removed from the area.',
    highlight: null,
  },
  {
    icon: AlertTriangle,
    title: 'Skunk Trapping',
    description: 'Skunks den under structures and near foundations. Beyond the obvious odor risk, they carry disease and attract other wildlife. Humane trapping keeps the situation from escalating.',
    highlight: null,
  },
  {
    icon: Cat,
    title: 'Opossum Trapping',
    description: 'Opossums find their way into attics, crawl spaces, and under decks. They are relatively slow-moving but leave a mess behind. Trapping and removal is straightforward when done correctly.',
    highlight: null,
  },
  {
    icon: Bone,
    title: 'Dead Animal Removal',
    description: 'A dead animal inside a wall, attic, or crawl space creates serious odor and health concerns. Steven locates the source, removes it, and treats the area to eliminate the smell and contamination.',
    highlight: 'Urgent',
  },
];

const delayClasses = [
  '',
  'reveal-delay-1',
  'reveal-delay-2',
  'reveal-delay-3',
  'reveal-delay-4',
  'reveal-delay-5',
  'reveal-delay-6',
  'reveal-delay-7',
  'reveal-delay-7',
] as const;

export default function WildlifeServices() {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: cardsRef, visible: cardsVisible } = useReveal();
  const { ref: bridgeRef, visible: bridgeVisible } = useReveal();

  return (
    <section id="wildlife" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <div>
            <p className="text-brand-500 font-semibold text-sm uppercase tracking-widest mb-3">
              Wildlife &amp; Rodent Removal
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
              Animal Problems in Your Attic?<br className="hidden sm:block" /> Steven Handles That Too.
            </h2>
          </div>
          <p className="text-neutral-700 text-lg leading-relaxed lg:text-right lg:max-w-sm">
            From birds and raccoons to rats, mice, squirrels, skunks, armadillos, opossums, and dead animal removal, Steven helps remove the problem before it turns into damage.
          </p>
        </div>

        {/* Service cards */}
        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14"
        >
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className={`relative rounded-2xl overflow-hidden group flex flex-col min-h-[280px] card-luxury-hover reveal ${delayClasses[i]} ${cardsVisible ? 'reveal-visible' : ''}`}
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1117 100%)' }}
              >
                {/* Subtle top border accent */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

                {/* Content */}
                <div className="relative z-10 p-7 flex flex-col flex-1">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 bg-brand-500/20 border border-brand-500/30 rounded-xl flex items-center justify-center group-hover:bg-brand-500/30 group-hover:border-brand-500/50 transition-all duration-200">
                      <Icon className="w-6 h-6 text-brand-400" />
                    </div>
                    {service.highlight && (
                      <span className="text-xs font-semibold bg-white/10 text-white border border-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {service.highlight}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed flex-1">{service.description}</p>

                  <a
                    href="tel:9728046456"
                    className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold text-sm mt-6 group/link"
                  >
                    Call Steven Now
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform duration-150" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA bridge */}
        <div
          ref={bridgeRef as React.RefObject<HTMLDivElement>}
          className={`rounded-2xl p-8 sm:p-10 bg-neutral-50 text-center reveal ${bridgeVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-neutral-900 font-bold text-xl sm:text-2xl mb-3">
            Not sure what got into your attic?
          </p>
          <p className="text-neutral-600 text-base leading-relaxed max-w-2xl mx-auto mb-8">
            Call Steven and describe what you're hearing, seeing, or smelling. He can help determine whether you need removal, cleanup, insulation repair, or a full attic restoration.
          </p>
          <a
            href="tel:9728046456"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 min-h-[52px] btn-luxury-glow"
          >
            <Phone className="w-4 h-4" />
            Call Steven Now
          </a>
          <p className="text-neutral-600 text-xs mt-4">Free estimates. No pressure, just a clear plan.</p>
        </div>

      </div>
    </section>
  );
}