import { Star, Quote } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const reviews = [
  {
    name: 'Andy Ohasiri',
    timeAgo: '10 months ago',
    rating: 5,
    text: 'I called a few companies for a quote. I eventually picked Rodents Exterm. I was totally impressed with the work they did. And they saved me a lot of money. I will recommend them to everyone.',
  },
  {
    name: 'Elijah James',
    timeAgo: '7 months ago',
    rating: 5,
    text: 'Excellent work, fast, and fair price. Highly recommend for insulation and pest control needs.',
  },
  {
    name: 'Platinum Graphix',
    timeAgo: 'a year ago',
    rating: 5,
    text: 'Rodents Exterm and Insulation LLC Fort Worth... highly recommend! Great service and professional work done by Juan.',
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: cardsRef, visible: cardsVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  return (
    <section id="reviews" className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background photo — same overlay treatment as Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/Success_image07.JPG"
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
          <p className="text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">What Customers Say</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Trusted By DFW Customers
          </h2>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Most people don't think about their attic until something feels off. Here's what they say after getting it handled properly.
          </p>
          {/* Google badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-5 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-white font-semibold text-sm">5.0</span>
            <span className="w-px h-4 bg-white/30" />
            <span className="text-neutral-300 text-sm">Rated on Google</span>
          </div>
        </div>

        {/* Review cards */}
        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
        >
          {reviews.map((review, i) => (
            <div
              key={review.name}
              className={`bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl shadow-md review-card-hover transition-all duration-300 p-8 flex flex-col gap-5 reveal ${(['', 'reveal-delay-1', 'reveal-delay-2'] as const)[i]} ${cardsVisible ? 'reveal-visible' : ''}`}
            >
              <Quote className="w-9 h-9 text-brand-400/50 flex-shrink-0 review-quote-icon" />

              <p className="text-neutral-200 text-base leading-[1.75] flex-1 italic">
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="pt-5 border-t border-white/15 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white">{review.name}</div>
                  <div className="text-neutral-400 text-xs mt-0.5 font-medium">{review.timeAgo}</div>
                </div>
                <StarRating count={review.rating} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA + bridge into Service Areas */}
        <div
          ref={ctaRef as React.RefObject<HTMLDivElement>}
          className={`text-center mt-12 reveal ${ctaVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-neutral-300 text-sm mb-2">More reviews available on our Google Business profile.</p>
          <p className="text-neutral-400 text-xs mb-6">Serving Fort Worth and the DFW area. See if we cover your neighborhood below.</p>
          <a
            href="tel:9728046456"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 btn-luxury-glow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Juan Now
          </a>
        </div>
      </div>
    </section>
  );
}
