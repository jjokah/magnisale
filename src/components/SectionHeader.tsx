export function SectionHeader({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <header className="flex max-w-[47.5rem] flex-col gap-4">
      <p className="t-eyebrow text-action">{eyebrow}</p>
      <h2 className="t-h2">{title}</h2>
      <p className="t-lede">{lede}</p>
    </header>
  );
}
