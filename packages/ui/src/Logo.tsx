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

// The lockup is the mark plus the name in Exo 2 Medium, capitals about 36% of
// the mark's height so the mark leads, tracked 0.08em. The gap, set by the
// parent, is one side bar's width (24 px mark: 13 px name, 7 px gap; 28 px
// mark: 15 px name, 8 px gap).
export function Lockup({ nameClassName = "" }: { nameClassName?: string }) {
  return (
    <>
      <Mark className="h-6 w-auto lg:h-7" />
      <span
        className={`font-display text-[0.8125rem] leading-none font-medium tracking-[0.08em] lg:text-[0.9375rem] ${nameClassName}`}
      >
        MAGNISALE
      </span>
    </>
  );
}

// The wordmark is the name alone, which the design system sets heavy: Exo 2
// Black, tracked 0.02em.
export function Wordmark() {
  return (
    <span className="font-display text-[1.25rem] leading-none font-black tracking-[0.02em] lg:text-[1.5rem]">
      MAGNISALE
    </span>
  );
}
