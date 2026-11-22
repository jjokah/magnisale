import { Link } from "react-router-dom";

// The mark is three rounded bars and its shape never changes (design system,
// board 01). It takes the colour of its parent: blue on white, white on blue
// or ink, nothing else.
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 388 358" fill="currentColor" aria-hidden="true" className={className}>
      <rect x="0" y="61" width="104" height="236" rx="20" />
      <rect x="124" y="0" width="140" height="358" rx="20" />
      <rect x="284" y="61" width="104" height="236" rx="20" />
    </svg>
  );
}

// The lockup: the mark plus the name in Exo 2 Medium, tracked 0.08em, with a
// gap of one side bar's width.
export function Logo({ to = "/profile" }: { to?: string }) {
  return (
    <Link to={to} aria-label="Magnisale home" className="flex min-h-11 items-center gap-[7px] text-action lg:gap-2">
      <Mark className="h-6 w-auto lg:h-7" />
      <span className="font-display text-[0.8125rem] leading-none font-medium tracking-[0.08em] text-fg lg:text-[0.9375rem]">
        MAGNISALE
      </span>
    </Link>
  );
}
