import { tools } from "../../content/site";

// A slim strip under the hero: the kinds of tools the AI agents plug into.
// Words and generic icons only, never another company's logo.
export function Tools() {
  return (
    <section aria-label={tools.label} className="border-t border-line">
      <div className="wrap flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:gap-10">
        <p className="t-eyebrow flex-none text-fg-muted">{tools.label}</p>
        <ul className="flex flex-wrap gap-2">
          {tools.items.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex h-10 items-center gap-2 rounded-pill border border-line bg-surface px-4 text-ui font-medium text-ink-700"
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="text-action" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
