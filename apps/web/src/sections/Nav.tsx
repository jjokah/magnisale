import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { blog, cta, footer, nav } from "../content";
import { useActiveSection } from "../hooks/useActiveSection";
import { mainNav, sectionOf } from "../navigation";
import type { Route } from "../routes";

const sectionIds = nav.map((item) => sectionOf(item.href)!);

export function Nav({ page }: { page: Route["kind"] }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const active = useActiveSection(sectionIds);

  // On the home page, the link for the section on screen; on the blog's
  // pages, the Blog link.
  const current = (href: string) => {
    if (href === blog.link.href) return page === "home" ? undefined : "true";
    return page === "home" && active === sectionOf(href) ? "location" : undefined;
  };

  // While the phone menu is open: Escape closes it, the page behind does not
  // scroll, tabbing out of the menu closes it (so focus never lands on the
  // page hidden behind it), and widening the window to the desktop layout
  // closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const onFocus = (event: FocusEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onDesktop = () => desktop.matches && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  return (
    <>
      {open && (
        <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-20 bg-ink-900/40 md:hidden" />
      )}
      {/* 95% white, so the bar stays near-white over the dark and blue bands. */}
      <header ref={header} className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-md">
        <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-4 lg:h-20">
          <Logo home={page === "home"} className="text-action" />

          <ul className="hidden items-center gap-6 md:flex lg:gap-8">
            {mainNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={current(item.href)}
                  className="relative py-3 text-ui font-medium text-ink-600 transition-[color] duration-140 ease-standard after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-pill after:bg-action after:transition-transform after:duration-220 after:ease-standard hover:text-fg motion-reduce:after:transition-none aria-[current]:text-fg aria-[current]:after:scale-x-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <Button href={cta.href} variant="secondary" size="sm" className="hidden md:inline-flex">
            {cta.label}
          </Button>

          <button
            ref={toggle}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen(!open)}
            className="-mr-2 flex size-11 items-center justify-center rounded-md md:hidden"
          >
            {open ? (
              <X size={24} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu size={24} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>

          {/* Inside the nav landmark, but positioned against the header. Scrolls
              on its own when the screen is too short for it, since the page
              behind is locked. */}
          <div
            id="menu"
            hidden={!open}
            className="reveal absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-line bg-surface shadow-lg [animation-duration:var(--duration-base)] md:hidden"
          >
            <ul className="wrap flex flex-col py-4">
              {[...mainNav, footer.contactLink].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={current(item.href)}
                    className="flex h-12 items-center text-body font-medium aria-[current]:font-semibold aria-[current]:text-action"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <Button href={cta.href} onClick={() => setOpen(false)} className="w-full">
                  {cta.label}
                </Button>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
