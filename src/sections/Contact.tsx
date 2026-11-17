import { Button } from "../components/Button";
import { Mark } from "../components/Logo";
import { contact, cta, site } from "../content";

export function Contact() {
  return (
    <section id="contact" className="on-dark section bg-action text-white">
      <div className="wrap flex items-center justify-between gap-16">
        <div className="flex max-w-[47.5rem] flex-col gap-4 sm:gap-6">
          <p className="t-eyebrow text-blue-100">{contact.eyebrow}</p>
          <h2 className="t-h1">{contact.title}</h2>
          <p className="t-lede text-blue-100">{contact.body}</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <Button href={cta.href} variant="accent" size="lg">
              {cta.label}
            </Button>
            <a href={`mailto:${site.email}`} className="flex h-12 items-center justify-center font-semibold underline-offset-4 hover:underline">
              {site.email}
            </a>
          </div>
        </div>
        {/* The mark is the only brand graphic: whole, large and unaltered. */}
        <Mark className="hidden w-60 flex-none lg:block" />
      </div>
    </section>
  );
}
