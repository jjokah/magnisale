import { ArrowRight } from "lucide-react";
import { IconTile } from "../components/IconTile";
import { SectionHeader } from "../components/SectionHeader";
import { solutions } from "../content";

export function Solutions() {
  return (
    <section id="solutions" className="section bg-surface-subtle">
      <div className="wrap">
        <SectionHeader eyebrow={solutions.eyebrow} title={solutions.title} lede={solutions.lede} />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {solutions.items.map((item) => (
            <li key={item.title} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-6 shadow-sm">
              <IconTile icon={item.icon} />
              <h3 className="t-h3">{item.title}</h3>
              <p className="text-fg-muted">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1">
          {solutions.other.text}
          <a href="#contact" className="link min-h-11">
            {solutions.other.link}
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}
