import type { Status } from "../content";

const tones: Record<Status, { badge: string; dot: string }> = {
  neutral: { badge: "bg-ink-100 text-ink-600", dot: "bg-ink-500" },
  success: { badge: "bg-success-tint text-success", dot: "bg-success" },
  warning: { badge: "bg-warning-tint text-warning-strong", dot: "bg-warning" },
};

// A pill with a dot and a word: status is never shown by colour alone.
export function StatusBadge({ status, children }: { status: Status; children: string }) {
  const tone = tones[status];
  return (
    <span
      className={`inline-flex h-7 flex-none items-center gap-2 rounded-pill px-3 text-caption font-semibold ${tone.badge}`}
    >
      <span className={`size-2 rounded-pill ${tone.dot}`} />
      {children}
    </span>
  );
}
