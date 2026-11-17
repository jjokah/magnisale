import { useEffect, useRef, useState, type ComponentProps } from "react";
import { CircleCheck } from "lucide-react";
import { Button } from "./Button";
import { contact, site } from "../content";

type State = "idle" | "sending" | "sent" | "failed";

// Posts to the form service in site.formEndpoint. Without scripts the form
// still submits as an ordinary POST; with them it reports the result in place.
export function EnquiryForm() {
  const { form } = contact;
  const [state, setState] = useState<State>("idle");
  const sentHeading = useRef<HTMLHeadingElement>(null);

  // The form is replaced by the confirmation, so move focus there with it.
  useEffect(() => {
    if (state === "sent") sentHeading.current?.focus();
  }, [state]);

  const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    // The service uses "email" as the reply-to address.
    if (data.contact?.includes("@")) data.email = data.contact;
    setState("sending");
    try {
      const response = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const result: { success?: boolean } = await response.json();
      setState(response.ok && result.success ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  const card = "on-light reveal-scroll rounded-xl bg-surface p-6 text-fg shadow-lg sm:p-8";

  if (state === "sent") {
    return (
      <div role="status" className={`${card} flex flex-col items-start gap-4`}>
        <CircleCheck size={40} strokeWidth={1.75} aria-hidden="true" className="text-success" />
        <h3 ref={sentHeading} tabIndex={-1} className="t-h3 outline-none">
          {form.sentTitle}
        </h3>
        <p className="text-fg-muted">{form.sentBody}</p>
      </div>
    );
  }

  const sending = state === "sending";
  return (
    <form action={site.formEndpoint} method="POST" onSubmit={onSubmit} className={`${card} flex flex-col gap-5`}>
      <h3 className="t-h3">{form.title}</h3>

      <input type="hidden" name="access_key" value={site.formKey} />
      <input type="hidden" name="subject" value={form.subject} />
      <input type="hidden" name="from_name" value={`${site.name} website`} />
      {/* Left empty by people, filled in by spam scripts; the service drops those. */}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="enquiry-name">{form.name}</label>
          <input id="enquiry-name" name="name" required autoComplete="name" className="input" />
        </div>
        <div className="field">
          <label htmlFor="enquiry-business">{form.business}</label>
          <input id="enquiry-business" name="business" required autoComplete="organization" className="input" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="enquiry-contact">{form.contact}</label>
        <input id="enquiry-contact" name="contact" required className="input" />
      </div>
      <div className="field">
        <label htmlFor="enquiry-message">{form.message}</label>
        <textarea
          id="enquiry-message"
          name="message"
          required
          rows={4}
          aria-describedby="enquiry-message-hint"
          className="input"
        />
        <p id="enquiry-message-hint" className="text-caption text-fg-muted">
          {form.messageHint}
        </p>
      </div>

      {state === "failed" && (
        <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-ui text-danger">
          {form.failed}{" "}
          <a href={`mailto:${site.email}`} className="font-semibold underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" disabled={sending} className="w-full">
          {sending ? form.sending : form.submit}
        </Button>
        <p className="text-center text-caption text-fg-muted">{form.note}</p>
      </div>
    </form>
  );
}
