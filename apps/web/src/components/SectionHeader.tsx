type Props = {
  eyebrow: string;
  title: string;
  lede: string;
  // "dark" for a header on ink: lime eyebrow, pale lede.
  tone?: "light" | "dark";
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, lede, tone = "light", align = "left" }: Props) {
  const dark = tone === "dark";
  const centred = align === "center" ? "mx-auto items-center text-center" : "";
  return (
    <header className={`reveal-scroll flex max-w-[47.5rem] flex-col gap-4 ${centred}`}>
      <p className={`t-eyebrow ${dark ? "text-accent" : "text-action"}`}>{eyebrow}</p>
      <h2 className="t-h1">{title}</h2>
      <p className={`t-lede ${dark ? "text-ink-300" : ""}`}>{lede}</p>
    </header>
  );
}
