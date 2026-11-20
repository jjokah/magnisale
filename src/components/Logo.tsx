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

// Lockup: mark plus wordmark in Exo 2 Medium, capitals half the mark's height.
// On the home page it scrolls back to the top; elsewhere it leads home.
export function Logo({ home, className = "" }: { home: boolean; className?: string }) {
  return (
    <a
      href={home ? "#top" : "/"}
      aria-label={home ? "Magnisale, back to top" : "Magnisale home"}
      className={`flex min-h-11 items-center gap-2 ${className}`}
    >
      <Mark className="h-6 w-auto lg:h-7" />
      <span className="font-display text-[1.0625rem] leading-none font-medium tracking-[0.07em] lg:text-[1.25rem]">
        MAGNISALE
      </span>
    </a>
  );
}
