import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const faqs = [
  {
    question: 'How do I know if my attic insulation needs replacement?',
    answer: 'Common signs include rising energy bills without an obvious cause, rooms that are consistently too hot or too cold, insulation that is more than 15 to 20 years old, or any history of water intrusion or rodent activity in the attic. The most reliable way to know is a direct inspection. We come out, assess the condition of the insulation, and give you an honest answer. There is no charge for the inspection.',
  },
  {
    question: 'Can rodent activity damage insulation?',
    answer: 'Yes, significantly. Rodents and wildlife nest and burrow inside attic insulation, compressing and tearing it apart over time. They leave behind droppings and urine that saturate the material and create an air quality concern throughout the property. Contaminated insulation cannot simply be cleaned or patched. It needs to be fully removed, the attic sanitized, and fresh insulation installed.',
  },
  {
    question: 'Do I need insulation removal before new insulation is installed?',
    answer: 'In many cases, yes. If your existing insulation is contaminated from rodent activity, water damaged, severely compressed, or below an acceptable R-value, installing new insulation on top of it does not solve the problem. We assess the existing material during inspection and recommend removal only when it is actually necessary. We will explain exactly why before any work begins.',
  },
  {
    question: 'Do you offer free estimates?',
    answer: 'Yes. We come out, inspect the attic, and walk you through exactly what we find and what we recommend. The cost of any work is clearly explained before anything starts. There is no obligation to move forward after the estimate, and no pressure to decide on the spot.',
  },
  {
    question: 'Can I call directly to schedule?',
    answer: 'Yes, and calling is the fastest way to get on the schedule. Steven answers personally and can typically get you scheduled within a few days. You can also submit a request through the contact form on this page and we will follow up promptly to confirm.',
  },
  {
    question: 'Do you remove live animals from the attic?',
    answer: 'Yes. Steven can help with birds, raccoons, squirrels, rats, mice, skunks, armadillos, and opossums that get into attics, walls, crawl spaces, or other problem areas. The best first step is to call and describe what you are hearing, seeing, or smelling so he can guide the inspection.',
  },
  {
    question: 'What types of wildlife or pests do you handle?',
    answer: 'Steven helps with bird removal, raccoon removal, squirrel removal, rat extermination, mice extermination, armadillo trapping, skunk trapping, opossum trapping, and dead animal removal. Mole removal is not listed as a current service.',
  },
  {
    question: 'What happens after wildlife is removed from my attic?',
    answer: 'After the animal issue is handled, the next step is checking for droppings, nesting, urine contamination, torn insulation, entry points, and odor. If the insulation is damaged, Steven can help with cleanup, insulation removal, air sealing, and attic restoration.',
  },
  {
    question: 'Do you offer dead animal removal?',
    answer: 'Yes. If there is a strong odor or signs that an animal may have died inside the attic, wall, or crawl space, Steven can inspect the area and help with dead animal removal and cleanup recommendations.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl overflow-hidden border transition-all duration-200 ${open ? 'border-brand-200 shadow-sm' : 'border-neutral-200'}`}>
      <button
        className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-150 ${open ? 'bg-brand-50' : 'bg-white hover:bg-neutral-50'}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? `Collapse: ${question}` : `Expand: ${question}`}
      >
        <span className="font-semibold text-neutral-900 text-sm sm:text-base">{question}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-brand-500' : 'text-neutral-500'}`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-6 pb-6 pt-2 bg-white border-t border-neutral-100">
          <p className={`text-neutral-600 text-sm leading-relaxed faq-answer-text ${open ? 'faq-answer-visible' : ''}`}>{answer}</p>
        </div>
      </div>
    </div>
  );
}

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

export default function FAQ() {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: listRef, visible: listVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="section-label mb-3">Common Questions</p>
          <h2 className="section-heading mb-5">
            Frequently Asked Questions
          </h2>
          <p className="section-subheading mx-auto">
            These are the questions most homeowners ask once they realize something might be going on above their ceiling.
          </p>
        </div>

        {/* Accordion */}
        <div
          ref={listRef as React.RefObject<HTMLDivElement>}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <div
              key={faq.question}
              className={`reveal ${delayClasses[i]} ${listVisible ? 'reveal-visible' : ''}`}
            >
              <FAQItem question={faq.question} answer={faq.answer} />
            </div>
          ))}
        </div>

        <div
          ref={ctaRef as React.RefObject<HTMLDivElement>}
          className={`mt-12 text-center reveal ${ctaVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-neutral-600 text-sm mb-2">Have a question that is not listed here?</p>
          <p className="text-neutral-500 text-sm mb-6">A quick call is the fastest way to get a straight answer about your specific situation.</p>
          <a href="tel:9728046456" className="btn-primary btn-luxury-glow">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Steven Now
          </a>
          <p className="text-neutral-500 text-xs mt-3">No pressure, just a clear plan</p>
        </div>
      </div>
    </section>
  );
}
