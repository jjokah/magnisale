import { Logo } from "../components/Logo";
import { nav, site } from "../content";

const linkClass = "flex min-h-11 items-center text-ui font-medium underline-offset-4 hover:underline";

export function Footer() {
  return (
    <footer className="on-dark bg-surface-inverse text-white">
      <div className="wrap grid gap-12 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:py-16">
        <div className="flex flex-col items-start gap-6">
          <Logo />
          <p className="max-w-[30rem] text-ink-300">{site.about}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="t-eyebrow mb-2 text-ink-300">Explore</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={linkClass}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="t-eyebrow mb-2 text-ink-300">Contact</h2>
          <ul>
            <li>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
            </li>
            {site.social.map((item) => (
              <li key={item.href}>
                <a href={item.href} rel="noopener" className={linkClass}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-700 py-6">
          <p className="text-small text-ink-300">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {site.name}
          </p>
          <p className="t-eyebrow text-accent">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
