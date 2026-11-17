import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { cta, nav } from "../content";

export function Nav() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <nav aria-label="Main" className="wrap flex h-16 items-center justify-between lg:h-20">
        <Logo className="text-action" />

        <ul className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="py-3 text-ui font-medium text-ink-600 transition-[color] duration-140 ease-standard hover:text-fg"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <Button href={cta.href} variant="secondary" size="sm" className="hidden lg:inline-flex">
          {cta.label}
        </Button>

        <button
          ref={toggle}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(!open)}
          className="-mr-2 flex size-11 items-center justify-center rounded-md lg:hidden"
        >
          {open ? (
            <X size={24} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Menu size={24} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </nav>

      {open && (
        <div id="menu" className="reveal absolute inset-x-0 [animation-duration:var(--duration-base)] top-full border-b border-line bg-surface shadow-lg lg:hidden">
          <ul className="wrap flex flex-col py-4">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)} className="flex h-12 items-center text-body font-medium">
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
      )}
    </header>
  );
}
