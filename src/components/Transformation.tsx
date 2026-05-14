import { X, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';

const jobs = [
  {
    label: 'Job 1',
    before: {
      src: '/images/before_2.JPG',
      alt: 'Before second job — damaged insulation and attic debris',
      objectPosition: 'center',
    },
    after: {
      src: '/images/after_2.JPG',
      alt: 'After second job — fresh insulation installed and attic restored',
      objectPosition: 'left top',
    },
  },
  {
    label: 'Job 2',
    before: {
      src: '/images/before_1.jpg',
      alt: 'Before attic insulation cleanup and rodent contamination restoration',
      objectPosition: 'center',
    },
    after: {
      src: '/images/after_1.jpg',
      alt: 'After attic insulation restoration with clean coverage',
      objectPosition: 'left',
    },
  },
  {
    label: 'Commercial',
    before: {
      src: '/images/commercial_before.webp',
      alt: 'Commercial ceiling before insulation liner installation',
      objectPosition: 'center',
    },
    after: {
      src: '/images/commercial_after_liner.webp',
      alt: 'Completed commercial ceiling insulation liner installation',
      objectPosition: 'center',
    },
  },
];

const beforePoints = [
  'Old insulation with reduced R-value',
  'Rodent droppings and nesting debris',
  'Damaged and disturbed attic areas',
  'Open entry points left unsealed',
  'Higher energy loss through the ceiling',
  'No clear picture of attic condition',
];

const afterPoints = [
  'Cleaner attic space, properly prepared',
  'Fresh insulation coverage installed to spec',
  'Entry points identified and addressed',
  'Improved comfort throughout the home',
  'More confidence in the condition of your home',
  'Clear documentation of the work completed',
];

export default function Transformation() {
  const [activeJob, setActiveJob] = useState(0);
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: beforeRef, visible: beforeVisible } = useReveal();
  const { ref: afterRef, visible: afterVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  return (
    <section className="py-20 sm:py-28 bg-neutral-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-brand-400 font-semibold text-sm uppercase tracking-widest mb-4">The Difference</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            From Contaminated And Inefficient<br className="hidden sm:block" /> To Clean, Insulated, And Restored
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            This is the difference between an attic that's been properly handled, and one that hasn't.
          </p>
        </div>

        {/* Job switcher tabs */}
        <div className={`flex justify-center mb-8 reveal reveal-delay-1 ${headerVisible ? 'reveal-visible' : ''}`}>
          <div className="inline-flex bg-neutral-800 border border-neutral-700 rounded-2xl p-1.5 gap-1">
            {jobs.map((job, i) => (
              <button
                key={job.label}
                onClick={() => setActiveJob(i)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeJob === i
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {job.label}
              </button>
            ))}
          </div>
        </div>

        {/* Before / After cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Before card */}
          <div
            ref={beforeRef as React.RefObject<HTMLDivElement>}
            className={`bg-neutral-800 rounded-3xl overflow-hidden border border-neutral-700 shadow-2xl reveal-left ${beforeVisible ? 'reveal-visible' : ''}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {jobs.map((job, i) => (
                <img
                  key={i}
                  src={job.before.src}
                  alt={job.before.alt}
                  className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-500 ${
                    activeJob === i ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ objectPosition: job.before.objectPosition }}
                />
              ))}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 bg-red-500/90 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                  <X className="w-3.5 h-3.5" />
                  Before
                </span>
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center bg-black/50 backdrop-blur-sm text-white/70 text-xs font-medium px-2.5 py-1 rounded-full">
                  {jobs[activeJob].label}
                </span>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-2">What We Find</h3>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                Most attics that have not been inspected in years look something like this. The problems are real, but they are fixable.
              </p>
              <ul className="space-y-3">
                {beforePoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-neutral-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* After card */}
          <div
            ref={afterRef as React.RefObject<HTMLDivElement>}
            className={`bg-neutral-800 rounded-3xl overflow-hidden border border-brand-500/30 shadow-2xl ring-1 ring-brand-500/20 reveal-right reveal-delay-1 ${afterVisible ? 'reveal-visible' : ''}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {jobs.map((job, i) => (
                <img
                  key={i}
                  src={job.after.src}
                  alt={job.after.alt}
                  className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-500 ${
                    activeJob === i ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ objectPosition: job.after.objectPosition }}
                />
              ))}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 bg-green-500/90 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                  After
                </span>
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center bg-black/50 backdrop-blur-sm text-white/70 text-xs font-medium px-2.5 py-1 rounded-full">
                  {jobs[activeJob].label}
                </span>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-2">What We Leave Behind</h3>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                A cleaner attic, proper insulation, and a clear record of everything that was done. That is the goal on every job.
              </p>
              <ul className="space-y-3">
                {afterPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-neutral-200 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-500/15 border border-green-400/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Bridge into Process + CTA */}
        <div
          ref={ctaRef as React.RefObject<HTMLDivElement>}
          className={`text-center mt-14 space-y-6 reveal ${ctaVisible ? 'reveal-visible' : ''}`}
        >
          <div>
            <p className="text-neutral-300 text-base mb-1">This is what most homeowners don't see until after the work is done.</p>
            <p className="text-neutral-500 text-sm">Below is exactly how we get there, step by step.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm sm:max-w-none mx-auto w-full">
            <a
              href="tel:9728046456"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto min-h-[52px]"
            >
              Call Steven Now
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-100 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto min-h-[52px]"
            >
              Request Free Estimate
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <p className="text-neutral-500 text-xs">Residential attic work. Clear inspection before any work begins.</p>
        </div>
      </div>
    </section>
  );
}
