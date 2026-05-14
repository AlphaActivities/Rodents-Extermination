import { Phone, Mail, MapPin } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Problems', href: '#problems' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
];

const atticServices = [
  { label: 'Blown-In Insulation', href: '#services' },
  { label: 'Insulation Removal', href: '#services' },
  { label: 'Attic Restoration', href: '#services' },
  { label: 'Rodent Damage Cleanup', href: '#services' },
  { label: 'Air Sealing', href: '#services' },
  { label: 'Attic Inspection', href: '#services' },
  { label: 'Radiant Barrier', href: '#services' },
  { label: 'Commercial Attic Services', href: '#services' },
];

const wildlifeServices = [
  { label: 'Bird Removal', href: '#wildlife' },
  { label: 'Raccoon Removal', href: '#wildlife' },
  { label: 'Squirrel Removal', href: '#wildlife' },
  { label: 'Rat Exterminator', href: '#wildlife' },
  { label: 'Mice Exterminator', href: '#wildlife' },
  { label: 'Armadillo Trapping', href: '#wildlife' },
  { label: 'Skunk Trapping', href: '#wildlife' },
  { label: 'Opossum Trapping', href: '#wildlife' },
  { label: 'Dead Animal Removal', href: '#wildlife' },
];

const serviceAreas = [
  'Fort Worth',
  'Dallas',
  'Arlington',
  'Irving',
  'Grand Prairie',
  'Haltom City',
  'North Richland Hills',
  'Mansfield',
  'Burleson',
  'Euless',
  'Bedford',
  'Crowley',
];

function FooterLink({ href, label, ariaLabel, showDot }: { href: string; label: string; ariaLabel?: string; showDot?: boolean }) {
  return (
    <li className="footer-row">
      <a
        href={href}
        aria-label={ariaLabel}
        className="footer-row-link text-neutral-400 hover:text-white text-sm transition-colors duration-200 py-2"
      >
        {showDot ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" aria-hidden="true" />
            {label}
          </span>
        ) : label}
      </a>
    </li>
  );
}

export default function Footer() {
  const { ref: footerRef, visible: footerVisible } = useReveal();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div
        ref={footerRef as React.RefObject<HTMLDivElement>}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b border-neutral-800 items-stretch">

          {/* Brand */}
          <div className={`sm:col-span-2 lg:col-span-1 flex flex-col reveal ${footerVisible ? 'reveal-visible' : ''}`}>
            <div className="flex justify-start mb-2">
              <img
                src="/logo/white_logo.PNG"
                alt="Rodents Exterm & Insulation LLC"
                className="h-28 w-auto object-contain transition-transform duration-300 ease-out hover:scale-110"
              />
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-3 text-balance">
              Owner-operated residential and commercial attic insulation and restoration in Fort Worth and the DFW Metroplex.
            </p>
            <ul className="space-y-1 mb-4">
              {[
                'Free estimates available',
                'Residential & commercial attic work',
                'Call to confirm your service area',
                'No pressure, just a clear plan',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-neutral-500 text-xs">
                  <svg className="w-3 h-3 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className={`flex flex-col reveal reveal-delay-1 ${footerVisible ? 'reveal-visible' : ''}`}>
            <h3 className="text-white font-semibold text-xs mb-6 uppercase tracking-widest">Navigation</h3>
            <ul className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <FooterLink key={link.href} href={link.href} label={link.label} showDot />
              ))}
            </ul>
          </div>

          {/* Attic Services */}
          <div className={`flex flex-col reveal reveal-delay-2 ${footerVisible ? 'reveal-visible' : ''}`}>
            <h3 className="text-white font-semibold text-xs mb-6 uppercase tracking-widest">Attic Services</h3>
            <ul className="flex flex-col gap-1">
              {atticServices.map((service) => (
                <FooterLink
                  key={service.label}
                  href={service.href}
                  label={service.label}
                  ariaLabel={`Learn more about ${service.label}`}
                />
              ))}
            </ul>
          </div>

          {/* Wildlife Services */}
          <div className={`flex flex-col reveal reveal-delay-3 ${footerVisible ? 'reveal-visible' : ''}`}>
            <h3 className="text-white font-semibold text-xs mb-6 uppercase tracking-widest">Wildlife Services</h3>
            <ul className="flex flex-col gap-1">
              {wildlifeServices.map((service) => (
                <FooterLink
                  key={service.label}
                  href={service.href}
                  label={service.label}
                  ariaLabel={`Learn more about ${service.label}`}
                />
              ))}
            </ul>
          </div>

          {/* Contact + Service Areas */}
          <div className={`flex flex-col reveal reveal-delay-4 ${footerVisible ? 'reveal-visible' : ''}`}>
            <h3 className="text-white font-semibold text-xs mb-6 uppercase tracking-widest">Contact</h3>
            <ul className="space-y-3 mb-5">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href="tel:9728046456"
                  className="text-neutral-400 hover:text-white text-sm transition-colors duration-200"
                  style={{ minHeight: 'unset' }}
                  aria-label="Call (972) 804-6456"
                >
                  (972) 804-6456
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-neutral-500 text-sm">Email coming soon</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-neutral-400 text-sm">Fort Worth, &amp; DFW Area</span>
              </li>
            </ul>

            <h3 className="text-white font-semibold text-xs mb-2.5 uppercase tracking-widest">Service Areas</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {serviceAreas.map((area) => (
                <li key={area} className="text-neutral-500 text-xs">{area}</li>
              ))}
              <li className="col-span-2 text-neutral-600 text-xs pt-0.5">& surrounding DFW communities</li>
            </ul>

            <a
              href="tel:9728046456"
              className="mt-auto inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm hover:-translate-y-0.5 shadow-sm min-h-[44px] self-start"
              aria-label="Call Rodents Exterm and Insulation LLC"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call Steven Now
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-xs reveal reveal-delay-5 ${footerVisible ? 'reveal-visible' : ''}`}>
          <p>&copy; {new Date().getFullYear()} Rodents Exterm &amp; Insulation LLC. All rights reserved.</p>
          <p>Fort Worth attic insulation &amp; restoration. Serving the DFW Metroplex.</p>
        </div>
      </div>
    </footer>
  );
}
