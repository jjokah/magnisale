import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { cta, footer, nav } from "../content";
import { useActiveSection } from "../hooks/useActiveSection";

const sectionIds = nav.map((item) => item.href.slice(1));

export function Nav() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(sectionIds);

  // While the phone menu is open: Escape closes it, the page behind does not
  // scroll, and widening the window to the desktop layout closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onDesktop = () => desktop.matches && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  return (
    <>
      {open && (
        <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-20 bg-ink-900/40 md:hidden" />
      )}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
        <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-4 lg:h-20">
          <Logo className="text-action" />

          <ul className="hidden items-center gap-6 md:flex lg:gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={active === item.href.slice(1) ? "location" : undefined}
                  className="relative py-3 text-ui font-medium text-ink-600 transition-[color] duration-140 ease-standard after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-pill after:bg-action after:transition-transform after:duration-220 after:ease-standard hover:text-fg aria-[current]:text-fg aria-[current]:after:scale-x-100"
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
        </nav>

        <div
          id="menu"
          hidden={!open}
          className="reveal absolute inset-x-0 top-full border-b border-line bg-surface shadow-lg [animation-duration:var(--duration-base)] md:hidden"
        >
          <ul className="wrap flex flex-col py-4">
            {[...nav, footer.contactLink].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center text-body font-medium"
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
      </header>
    </>
  );
}
