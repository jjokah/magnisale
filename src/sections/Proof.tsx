import { SectionHeader } from "../components/SectionHeader";
import { proof } from "../content";

// Client results and testimonials. Renders nothing until content.ts has real
// ones: the page never shows a placeholder quote.
export function Proof() {
  const count = proof.items.length;
  if (count === 0) return null;

  const columns =
    count === 1 ? "mx-auto max-w-[47.5rem]" : count === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="results" className="section">
      <div className="wrap">
        <SectionHeader eyebrow={proof.eyebrow} title={proof.title} lede={proof.lede} align="center" />
        <ul className={`mt-8 grid gap-6 lg:mt-12 ${columns}`}>
          {proof.items.map((item) => (
            <li key={item.quote} className="card reveal-scroll flex">
              <figure className="flex w-full flex-col gap-4 p-6 lg:p-8">
                {item.result && <p className="t-h3 text-action">{item.result}</p>}
                <blockquote className="text-body-lg">“{item.quote}”</blockquote>
                <figcaption className="mt-auto border-t border-line pt-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-small text-fg-muted">{item.role}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
