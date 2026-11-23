import { useEffect, useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "../components/Button";
import { EnquiryForm } from "../components/EnquiryForm";
import { Mark } from "../components/Logo";
import { contact, site, whatsappCta, whatsappHref } from "../content";

// The address as a link, with a button that copies it: a mailto link does
// nothing for a visitor with no mail app set up.
function Email() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      // No clipboard access: the address is still on screen to select.
    }
  };

  return (
    <span className="flex items-center justify-center gap-1">
      <a href={`mailto:${site.email}`} className="flex h-12 items-center font-semibold underline-offset-4 hover:underline">
        {site.email}
      </a>
      <button
        type="button"
        aria-label={contact.copy}
        onClick={copy}
        className="flex size-11 items-center justify-center rounded-md text-blue-100 transition-[color,background-color] duration-140 ease-standard hover:bg-white/10 hover:text-white"
      >
        {copied ? (
          <Check size={18} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Copy size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
      <span role="status" className="sr-only">
        {copied ? contact.copied : ""}
      </span>
    </span>
  );
}

export function Contact() {
  const hasForm = site.formKey !== "";

  return (
    <section id="contact" className="on-dark band-blue section text-white">
      <div className="wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="reveal-scroll flex flex-col gap-4 sm:gap-6">
          <p className="t-eyebrow text-blue-100">{contact.eyebrow}</p>
          <h2 className="t-h1">{contact.title}</h2>
          <p className="t-lede text-blue-100">{contact.body}</p>

          <ul className="flex flex-col gap-2 font-medium sm:flex-row sm:flex-wrap sm:gap-x-6">
            {contact.trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={18} strokeWidth={2} aria-hidden="true" className="flex-none text-blue-200" />
                {item}
              </li>
            ))}
          </ul>

          {/* One lime action on the blue: WhatsApp when there is a number,
              otherwise email when there is no form to send instead. */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {whatsappHref ? (
              <Button href={whatsappHref} variant="accent" size="lg" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={20} strokeWidth={1.75} aria-hidden="true" />
                {whatsappCta}
              </Button>
            ) : (
              !hasForm && (
                <Button href={`mailto:${site.email}`} variant="accent" size="lg">
                  {contact.emailCta}
                </Button>
              )
            )}
            <Email />
          </div>
        </div>

        {hasForm ? (
          <EnquiryForm />
        ) : (
          // Without the form, the mark fills the space: whole, large and unaltered.
          <Mark className="hidden w-60 flex-none justify-self-end lg:block" />
        )}
      </div>
    </section>
  );
}
