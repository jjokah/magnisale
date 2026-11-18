import { Quote } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { proof, type Testimonial } from "../content";

// Client results and testimonials. Renders nothing until content.ts has real
// ones: the page never shows a placeholder quote. One testimonial is shown as
// a featured quote; two or more as a grid of cards.
export function Proof() {
  const count = proof.items.length;
  if (count === 0) return null;

  return (
    <section id="results" className="section">
      <div className="wrap">
        <SectionHeader eyebrow={proof.eyebrow} title={proof.title} lede={proof.lede} align="center" />
        {count === 1 ? <Featured item={proof.items[0]} /> : <Cards items={proof.items} />}
      </div>
    </section>
  );
}

function Featured({ item }: { item: Testimonial }) {
  return (
    <figure className="reveal-scroll mx-auto mt-8 flex max-w-[47.5rem] flex-col items-center text-center lg:mt-12">
      <Quote aria-hidden="true" className="size-10 text-action" strokeWidth={1.75} />
      {item.result && <p className="t-eyebrow mt-6 text-action">{item.result}</p>}
      <blockquote className="mt-6 font-display text-h3 font-medium text-balance">“{item.quote}”</blockquote>
      <figcaption className="mt-8 flex items-center gap-3 text-left">
        <Initials name={item.name} />
        <div>
          <p className="font-semibold">{item.name}</p>
          <p className="text-small text-fg-muted">{item.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function Cards({ items }: { items: Testimonial[] }) {
  const columns = items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={`mt-8 grid gap-6 lg:mt-12 ${columns}`}>
      {items.map((item) => (
        <li key={item.quote} className="card reveal-scroll flex">
          <figure className="flex w-full flex-col gap-4 p-6 lg:p-8">
            {item.result && <p className="t-h3 text-action">{item.result}</p>}
            <blockquote className="text-body-lg">“{item.quote}”</blockquote>
            <figcaption className="mt-auto flex items-center gap-3 border-t border-line pt-4">
              <Initials name={item.name} />
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-small text-fg-muted">{item.role}</p>
              </div>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

// A circle with the client's initials, in place of a photo.
function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-100 font-display text-ui font-semibold text-blue-700"
    >
      {initials}
    </span>
  );
}
