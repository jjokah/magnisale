import { IconTile } from "../components/IconTile";
import { SectionHeader } from "../components/SectionHeader";
import { privacy } from "../content";

// The page's one dark band, so the privacy promises read as a statement.
export function Privacy() {
  return (
    <section id="data-privacy" className="on-dark band-dark section text-white">
      <div className="wrap grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-24">
          <SectionHeader eyebrow={privacy.eyebrow} title={privacy.title} lede={privacy.lede} tone="dark" />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {privacy.points.map((point) => (
            <li
              key={point.title}
              className="reveal-scroll flex gap-4 rounded-lg border border-white/10 bg-white/5 p-5 sm:flex-col sm:gap-3 sm:p-6"
            >
              <IconTile icon={point.icon} tone="dark" />
              <div className="flex flex-col gap-1 sm:gap-3">
                <h3 className="t-h4">{point.title}</h3>
                <p className="text-ui text-ink-300">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
