import { SectionHeader } from "../components/SectionHeader";
import { process } from "../content";

export function Process() {
  const { included } = process;
  return (
    <section id="how-we-work" className="section">
      <div className="wrap">
        <SectionHeader eyebrow={process.eyebrow} title={process.title} lede={process.lede} />
        <div className="mt-8 grid gap-6 lg:mt-12 lg:grid-cols-4">
          <ol className="grid gap-6 md:grid-cols-3 lg:col-span-3">
            {process.steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3 rounded-lg bg-surface-subtle p-6">
                <span aria-hidden="true" className="t-eyebrow flex h-11 items-center text-action">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="t-h3">{step.title}</h3>
                <p className="text-fg-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <aside className="flex flex-col gap-3 rounded-lg bg-surface-inverse p-6 text-white">
            <p className="t-eyebrow flex h-11 items-center text-accent">{included.eyebrow}</p>
            <h3 className="t-h3">{included.title}</h3>
            <p className="text-ink-200">{included.body}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
