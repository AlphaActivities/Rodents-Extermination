import { UserCheck, DollarSign, Sparkles, Home, MessageCircle, Heart } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const reasons = [
  {
    icon: UserCheck,
    title: 'Hands-On Work',
    description: 'Steven Guerrero works every job personally. You are not dealing with a crew you have never met. The person you talk to is the person doing the work.',
  },
  {
    icon: DollarSign,
    title: 'Fair Pricing',
    description: 'Quotes are clear and upfront. You know the full cost before anything starts. No add-ons after the fact.',
  },
  {
    icon: Sparkles,
    title: 'Clean Work',
    description: 'We leave job sites the way we would want our own homes left. The attic work gets done and the rest of your house stays untouched.',
  },
  {
    icon: Home,
    title: 'Attic Specialists',
    description: 'We work on both homes and commercial properties. That focused expertise means every process, tool, and conversation is built around attic and insulation work specifically.',
  },
  {
    icon: MessageCircle,
    title: 'Clear Communication',
    description: 'You will not be left guessing. Questions get answered, timelines are communicated, and the scope of work is explained before anything begins.',
  },
  {
    icon: Heart,
    title: 'Real Problem Solving',
    description: 'We built this service around the real attic and insulation problems property owners face. Not a broad service list, but a focused solution to specific problems.',
  },
];

export default function WhyChooseUs() {
  const { ref: imageRef, visible: imageVisible } = useReveal();
  const { ref: headingRef, visible: headingVisible } = useReveal();
  const { ref: reasonsRef, visible: reasonsVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  return (
    <section className="py-20 sm:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left: branded image — hidden on mobile, shown on lg+ */}
          <div
            ref={imageRef as React.RefObject<HTMLDivElement>}
            className={`hidden lg:block reveal-left ${imageVisible ? 'reveal-visible' : ''}`}
            role="img"
            aria-label="Placeholder for owner or team photo"
          >
            {/* Wrapper with bottom padding to prevent accent card clipping */}
            <div className="relative pb-10 pr-10">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-neutral-200 shadow-lg">
                <img
                  src="/images/Success_image01.JPG"
                  alt="Completed attic insulation project by Rodents Exterm and Insulation LLC"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Accent card — desktop only, safe from clipping inside padded wrapper */}
              <div className="absolute bottom-0 right-0 bg-white rounded-2xl border border-neutral-200 shadow-xl p-5 w-[180px]">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center mb-3">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-neutral-900 text-sm leading-tight">Residential</div>
                <div className="font-bold text-neutral-900 text-sm leading-tight mb-1">&amp; Commercial</div>
                <div className="text-neutral-500 text-xs">Attic focused. Owner-operated.</div>
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div>
            <div
              ref={headingRef as React.RefObject<HTMLDivElement>}
              className={`reveal ${headingVisible ? 'reveal-visible' : ''}`}
            >
              <p className="section-label mb-3">Why Customers Choose Us</p>
              <h2 className="section-heading mb-5">
                Why Homeowners Trust The Work Once They See It
              </h2>
              <p className="section-subheading mb-8 sm:mb-10">
                We keep things simple, clear, and consistent from the first call to the final walkthrough.
              </p>
            </div>

            <div
              ref={reasonsRef as React.RefObject<HTMLDivElement>}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 sm:mb-10"
            >
              {reasons.map((reason, i) => {
                const Icon = reason.icon;
                const delay = i < 4 ? (['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3'] as const)[i] : 'reveal-delay-4';
                return (
                  <div
                    key={reason.title}
                    className={`flex gap-4 reveal ${delay} ${reasonsVisible ? 'reveal-visible' : ''}`}
                  >
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand-100">
                      <Icon className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm mb-1">{reason.title}</h3>
                      <p className="text-neutral-600 text-xs leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile image — shown only on mobile between reasons and CTAs */}
            <div className={`lg:hidden rounded-2xl overflow-hidden border border-neutral-200 shadow-sm mb-8 h-64 reveal ${reasonsVisible ? 'reveal-visible' : ''}`}>
              <img
                src="/images/Success_image01.JPG"
                alt="Completed attic insulation project by Rodents Exterm and Insulation LLC"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div
              ref={ctaRef as React.RefObject<HTMLDivElement>}
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 reveal ${ctaVisible ? 'reveal-visible' : ''}`}
            >
              <a
                href="tel:9728046456"
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto min-h-[52px]"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Steven Now
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto min-h-[52px]"
              >
                Request Free Estimate
              </a>
            </div>
            <p className={`text-neutral-500 text-xs mt-3 reveal reveal-delay-1 ${ctaVisible ? 'reveal-visible' : ''}`}>
              Free estimates for residential and commercial attic work.
            </p>

            {/* Bridge into Reviews */}
            <div className={`mt-10 pt-8 border-t border-neutral-200 reveal reveal-delay-2 ${ctaVisible ? 'reveal-visible' : ''}`}>
              <p className="text-neutral-600 text-sm">Do not just take our word for it. Here is what customers in DFW say after the job is done.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
