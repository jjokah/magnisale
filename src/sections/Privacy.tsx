import { IconTile } from "../components/IconTile";
import { SectionHeader } from "../components/SectionHeader";
import { privacy } from "../content";

export function Privacy() {
  return (
    <section id="data-privacy" className="section border-t border-line">
      <div className="wrap grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
        <SectionHeader eyebrow={privacy.eyebrow} title={privacy.title} lede={privacy.lede} />
        <ul className="flex flex-col gap-6 rounded-lg border border-blue-100 bg-action-tint p-5 sm:p-6">
          {privacy.points.map((point) => (
            <li key={point.title} className="flex gap-4">
              <IconTile icon={point.icon} tone="white" />
              <div className="flex flex-col gap-1">
                <h3 className="t-h4">{point.title}</h3>
                <p className="text-ui text-ink-600">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
