import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { Button } from "../components/Button";
import { cta, hero, whatsappCta, whatsappHref } from "../content";
import { WorkflowExample } from "./WorkflowExample";

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="wrap grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_27.5rem] lg:gap-12 lg:py-24 xl:grid-cols-[minmax(0,1fr)_33.75rem] xl:gap-16">
        <div className="reveal flex flex-col items-start gap-5 sm:gap-6">
          <p className="t-eyebrow inline-flex min-h-8 items-center gap-2 rounded-pill border border-blue-100 bg-action-tint px-3 py-2 text-action">
            <span aria-hidden="true" className="size-2 flex-none rounded-pill bg-action" />
            {hero.eyebrow}
          </p>
          <h1 className="t-display">{hero.title}</h1>
          <p className="t-lede max-w-[37.5rem]">{hero.lede}</p>

          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <Button href={cta.href} size="lg">
              {cta.label}
              <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
            </Button>
            {whatsappHref ? (
              <Button href={whatsappHref} variant="secondary" size="lg" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={20} strokeWidth={1.75} aria-hidden="true" />
                {whatsappCta}
              </Button>
            ) : (
              <a href={hero.secondary.href} className="link h-12 justify-center px-2 sm:h-14">
                {hero.secondary.label}
                <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
              </a>
            )}
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-small text-ink-600">
            {hero.trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={16} strokeWidth={2} aria-hidden="true" className="flex-none text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <WorkflowExample />
      </div>
    </section>
  );
}
