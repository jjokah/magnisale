import { ArrowRight, Check } from "lucide-react";
import { Button } from "../components/Button";
import { IconTile } from "../components/IconTile";
import { SectionHeader } from "../components/SectionHeader";
import { solutions } from "../content";

export function Solutions() {
  return (
    <section id="solutions" className="section bg-surface-subtle">
      <div className="wrap">
        <SectionHeader eyebrow={solutions.eyebrow} title={solutions.title} lede={solutions.lede} align="center" />

        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:mt-12">
          {solutions.items.map((item) => (
            <li key={item.title} className="card reveal-scroll flex flex-col gap-4 p-6 lg:p-8">
              <div className="flex items-center gap-4">
                <IconTile icon={item.icon} />
                <h3 className="t-h3">{item.title}</h3>
              </div>
              <p className="text-fg-muted">{item.body}</p>
              <ul className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
                {item.examples.map((example) => (
                  <li key={example} className="flex items-start gap-3 text-ui font-medium">
                    <Check size={18} strokeWidth={2} aria-hidden="true" className="mt-0.5 flex-none text-action" />
                    {example}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="reveal-scroll mt-6 flex flex-col items-start gap-4 rounded-lg border border-blue-100 bg-action-tint p-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="t-h4">{solutions.other.text}</p>
          <Button href="#contact" variant="secondary" className="flex-none">
            {solutions.other.link}
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
