import { Logo } from "../Logo";
import { footer, site, whatsappHref } from "../../content/site";
import { mainNavFor } from "../../navigation";

const linkClass = "flex min-h-11 items-center text-ui font-medium underline-offset-4 hover:underline";
const external = { target: "_blank", rel: "noopener noreferrer" };

export function Footer({ home, hasBlog }: { home: boolean; hasBlog: boolean }) {
  const mainNav = mainNavFor(hasBlog);

  return (
    <footer className="on-dark bg-surface-inverse text-white">
      <div className="wrap grid gap-12 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:py-16">
        <div className="flex flex-col items-start gap-4">
          <Logo home={home} variant="wordmark" />
          <p className="max-w-[30rem] text-ink-300">{site.about}</p>
        </div>

        <nav aria-label="Footer">
          <p className="t-eyebrow mb-2 text-ink-300">{footer.explore}</p>
          <ul>
            {[...mainNav, footer.contactLink].map((item) => (
              <li key={item.href}>
                <a href={item.href} className={linkClass}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="t-eyebrow mb-2 text-ink-300">{footer.contact}</p>
          <ul>
            <li>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
            </li>
            {whatsappHref && (
              <li>
                <a href={whatsappHref} {...external} className={linkClass}>
                  {footer.whatsapp}
                </a>
              </li>
            )}
            {site.social.map((item) => (
              <li key={item.href}>
                <a href={item.href} {...external} className={linkClass}>
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
            © <span data-current-year>{__BUILD_YEAR__}</span> {site.name}
          </p>
          <p className="t-eyebrow text-accent">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
