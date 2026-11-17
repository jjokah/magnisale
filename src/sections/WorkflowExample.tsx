import type { CSSProperties } from "react";
import { IconTile } from "../components/IconTile";
import { StatusBadge } from "../components/StatusBadge";
import { workflow } from "../content";

// The hero's picture: one real-looking workflow instead of an illustration.
export function WorkflowExample() {
  return (
    <figure className="rounded-xl bg-surface-subtle p-4 sm:p-6">
      <figcaption className="t-eyebrow mb-4 text-fg-muted">{workflow.label}</figcaption>
      <ol className="flex flex-col">
        {workflow.steps.map((step, index) => (
          <li key={step.title} className="reveal" style={{ "--i": index + 2 } as CSSProperties}>
            {index > 0 && <span aria-hidden="true" className="ml-10 block h-4 w-0.5 bg-ink-300" />}
            {/* On phones the badge drops below the text; from 640 px it stays on the row. */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-5 py-4 sm:flex-nowrap">
              <IconTile icon={step.icon} />
              <div className="min-w-0 flex-1 basis-40 sm:basis-0">
                <p className="text-ui font-semibold">{step.title}</p>
                <p className="text-caption text-fg-muted">{step.by}</p>
              </div>
              <StatusBadge status={step.status}>{step.statusLabel}</StatusBadge>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
