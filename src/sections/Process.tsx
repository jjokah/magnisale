import { SectionHeader } from "../components/SectionHeader";
import { process } from "../content";

// A timeline: a rail down the left on phones, a line across the top from
// 1024 px. Maintenance is the last stop, marked as included in the fee.
//
// From 1024 px each step is a subgrid spanning the same five rows (marker,
// title, description, "You get", deliverable), so those line up across the
// columns however many lines each description takes. The text wrapper drops
// its box there, and its spacing moves onto the lines as margins.
export function Process() {
  return (
    <section id="how-we-work" className="section">
      <div className="wrap">
        <SectionHeader eyebrow={process.eyebrow} title={process.title} lede={process.lede} />

        <ol className="mt-10 grid lg:mt-12 lg:grid-cols-4">
          {process.steps.map((step, index) => {
            const last = index === process.steps.length - 1;
            return (
              <li
                key={step.title}
                className="reveal-scroll flex gap-5 lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:gap-0"
              >
                <div aria-hidden="true" className="flex flex-col items-center lg:mb-6 lg:flex-row">
                  <span
                    className={`t-eyebrow flex size-11 flex-none items-center justify-center rounded-pill ${
                      step.included ? "bg-surface-inverse text-white" : "border border-blue-200 bg-action-tint text-action"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {!last && <span className="my-2 w-px flex-1 bg-line lg:mx-4 lg:my-0 lg:h-px lg:w-auto" />}
                </div>

                <div className={`flex flex-col gap-2 lg:contents ${last ? "" : "pb-10"}`}>
                  <div className="flex min-h-11 flex-wrap items-center gap-3 lg:min-h-0 lg:pr-8">
                    <h3 className="t-h3">{step.title}</h3>
                    {step.included && (
                      <span className="t-eyebrow rounded-pill bg-surface-inverse px-3 py-1 text-accent">
                        {process.includedLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-fg-muted lg:mt-2 lg:pr-8">{step.body}</p>
                  <p className="t-eyebrow mt-3 text-fg-muted lg:mt-5 lg:pr-8">{process.getLabel}</p>
                  <p className="text-ui font-semibold lg:mt-2 lg:pr-8">{step.get}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
