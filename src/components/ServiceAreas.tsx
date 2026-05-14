import { MapPin, Phone } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const cities = [
  'Fort Worth',
  'Dallas',
  'Arlington',
  'Irving',
  'Grand Prairie',
  'Haltom City',
  'North Richland Hills',
  'Euless',
  'Bedford',
  'Mansfield',
  'Burleson',
  'Crowley',
];

export default function ServiceAreas() {
  const { ref: headingRef, visible: headingVisible } = useReveal();
  const { ref: chipsRef, visible: chipsVisible } = useReveal();
  const { ref: mapRef, visible: mapVisible } = useReveal();

  return (
    <section className="py-20 sm:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: content */}
          <div>
            <div
              ref={headingRef as React.RefObject<HTMLDivElement>}
              className={`reveal ${headingVisible ? 'reveal-visible' : ''}`}
            >
              <p className="section-label mb-3">Service Area</p>
              <h2 className="section-heading mb-5">
                Serving Fort Worth And Surrounding DFW Communities
              </h2>
              <p className="section-subheading mb-3">
                We work throughout Fort Worth and the surrounding DFW area. If you're nearby, we can take a look at your attic.
              </p>
              <p className="text-neutral-600 text-sm mb-8 sm:mb-10">
                If your city isn't listed, call to confirm. We cover more ground than what's shown here.
              </p>
            </div>

            {/* City chips */}
            <div
              ref={chipsRef as React.RefObject<HTMLDivElement>}
              className="flex flex-wrap gap-2 sm:gap-2.5 mb-8 sm:mb-10"
            >
              {cities.map((city, i) => {
                const delay = i < 6
                  ? (['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5'] as const)[i]
                  : '';
                return (
                  <span
                    key={city}
                    className={`inline-flex items-center gap-1.5 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium px-3 sm:px-4 py-2 rounded-full shadow-sm reveal ${delay} ${chipsVisible ? 'reveal-visible' : ''}`}
                  >
                    <MapPin className="w-3 h-3 text-brand-500 flex-shrink-0" />
                    {city}
                  </span>
                );
              })}
              <span className={`inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-600 text-sm font-medium px-3 sm:px-4 py-2 rounded-full reveal reveal-delay-5 ${chipsVisible ? 'reveal-visible' : ''}`}>
                + More Areas
              </span>
            </div>

            <a
              href="tel:9728046456"
              className={`inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-semibold text-sm transition-colors min-h-[44px] reveal ${chipsVisible ? 'reveal-visible' : ''}`}
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              Call to confirm your area
            </a>

            {/* Bridge into FAQ */}
            <div className={`mt-10 pt-8 border-t border-neutral-200 reveal reveal-delay-1 ${chipsVisible ? 'reveal-visible' : ''}`}>
              <p className="text-neutral-700 text-sm">Have questions before reaching out? The most common ones, including what it costs and whether you even need it, are answered just below.</p>
            </div>
          </div>

          {/* Right: service area map */}
          <div
            ref={mapRef as React.RefObject<HTMLDivElement>}
            className={`relative rounded-3xl overflow-hidden border border-neutral-200 shadow-md h-64 sm:h-80 lg:aspect-[4/3] lg:h-auto reveal-right ${mapVisible ? 'reveal-visible' : ''}`}
          >
            <img
              src="/images/Service-areas.png"
              alt="Service area map showing Fort Worth TX and surrounding DFW communities"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
