import { ArrowRight } from "lucide-react";
import { Button } from "../components/Button";
import { cta, hero } from "../content";
import { WorkflowExample } from "./WorkflowExample";

export function Hero() {
  return (
    <section
      id="top"
      className="wrap grid items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_27.5rem] lg:gap-12 lg:py-24 xl:grid-cols-[minmax(0,1fr)_33.75rem] xl:gap-16"
    >
      <div className="reveal flex flex-col gap-4 sm:gap-6">
        <p className="t-eyebrow text-action">{hero.eyebrow}</p>
        {/* Display size needs the full desktop column; laptops step down to H1. */}
        <h1 className="t-display lg:max-xl:text-h1">{hero.title}</h1>
        <p className="t-lede max-w-[37.5rem]">{hero.lede}</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Button href={cta.href} size="lg">
            {cta.label}
          </Button>
          <a href={hero.secondary.href} className="link h-12 justify-center px-2 sm:h-14">
            {hero.secondary.label}
            <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </div>
      <WorkflowExample />
    </section>
  );
}
