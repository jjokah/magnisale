import { Logo } from "../components/Logo";
import { privacyNotice as notice } from "../content/privacy";

export function Privacy() {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="wrap flex h-16 items-center border-b border-line">
        <Logo to="/" />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="t-h1">{notice.title}</h1>
        {notice.draft && (
          <p className="mt-4 rounded-md bg-warning-tint px-4 py-3 text-small font-medium text-warning-strong">
            This is a draft for the pilot and may change before launch.
          </p>
        )}
        {notice.sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="t-h3">{section.heading}</h2>
            {section.body.map((line) => (
              <p key={line} className="mt-3">
                {line}
              </p>
            ))}
          </section>
        ))}
        <section className="mt-8">
          <h2 className="t-h3">Contact</h2>
          <p className="mt-3">
            For anything about your data, email{" "}
            <a href={`mailto:${notice.contactEmail}`} className="font-semibold text-action underline underline-offset-4">
              {notice.contactEmail}
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
