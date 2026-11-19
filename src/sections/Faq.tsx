import { ArrowRight, Plus } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { faq } from "../content";

// Native <details> elements: they open without scripts, and sharing one
// `name` makes the browser close the others when one opens.
export function Faq() {
  return (
    <section id="faq" className="section bg-surface-subtle">
      <div className="wrap grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:gap-6">
          <SectionHeader eyebrow={faq.eyebrow} title={faq.title} lede={faq.lede} />
          <a href={faq.ask.href} className="link reveal-scroll min-h-11 self-start">
            {faq.ask.label}
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
        <div className="reveal-scroll flex flex-col gap-3">
          {faq.items.map((item) => (
            <details key={item.q} name="faq" className="faq group card">
              <summary className="flex min-h-16 items-center justify-between gap-4 rounded-lg px-5 py-4 sm:px-6">
                <h3 className="t-h4">{item.q}</h3>
                <Plus
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="flex-none text-action transition-transform duration-220 ease-standard group-open:rotate-45 motion-reduce:transition-none"
                />
              </summary>
              <p className="px-5 pb-5 text-fg-muted sm:px-6">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
