import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Problems', href: '#problems' },
  { label: 'Services', href: '#services' },
  { label: 'Wildlife', href: '#wildlife' },
  { label: 'Process', href: '#process' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">

          {/* Logo + company name */}
          <a href="#home" className="flex items-center gap-3 flex-shrink-0 min-h-[44px] group">
            <img
              src="/logo/black_logo.PNG"
              alt="Rodents Exterm & Insulation LLC"
              className="h-12 sm:h-14 lg:h-[60px] w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-110"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-neutral-900 text-sm sm:text-base lg:text-[15px] tracking-tight">Rodents Exterm</span>
              <span className="font-normal text-neutral-700 text-xs sm:text-sm lg:text-[13px] tracking-tight">& Insulation LLC</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link text-sm font-medium text-neutral-700 hover:text-brand-500 px-3.5 py-2 rounded-lg transition-colors duration-150 min-h-[44px] flex items-center"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:9728046456"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 min-h-[44px] btn-luxury-glow"
            >
              <Phone className="w-4 h-4" />
              Call Steven Now
            </a>
          </div>

          {/* Mobile: call + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href="tel:9728046456"
              className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-3.5 py-2 rounded-xl text-sm transition-all duration-200 active:scale-95 min-h-[44px]"
              aria-label="Call now"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xs:inline">Call</span>
            </a>
            <button
              className="p-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — smooth slide */}
      <div
        className={`lg:hidden border-t border-neutral-100 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center text-base font-medium text-neutral-700 hover:text-brand-500 hover:bg-neutral-50 px-4 py-3.5 rounded-xl transition-colors min-h-[52px]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="px-4 pb-5 pt-1 border-t border-neutral-100">
          <a
            href="tel:9728046456"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-4 rounded-xl text-base transition-all duration-200 w-full min-h-[52px]"
          >
            <Phone className="w-5 h-5" />
            Call Steven Now
          </a>
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 mt-3 border-2 border-brand-500 text-brand-500 font-semibold px-5 py-3.5 rounded-xl text-sm transition-all duration-200 w-full min-h-[52px]"
          >
            Request Free Estimate
          </a>
        </div>
      </div>
    </header>
  );
}
