import type { Status } from "../content";

// "working" is the one status a step passes through but never ends on.
export type BadgeStatus = Status | "working";

const tones: Record<BadgeStatus, { badge: string; dot: string }> = {
  neutral: { badge: "bg-ink-100 text-ink-600", dot: "bg-ink-500" },
  working: { badge: "bg-blue-100 text-blue-700", dot: "bg-action dot-pulse" },
  success: { badge: "bg-success-tint text-success", dot: "bg-success" },
  warning: { badge: "bg-warning-tint text-warning-strong", dot: "bg-warning" },
};

// A pill with a dot and a word: status is never shown by colour alone.
// `still` stops the "Working" pulse, for when the example is paused.
// No colour transition: the word changes at once, so the colour does too,
// and a badge never shows "Queued" in the green of "Done".
export function StatusBadge({ status, still = false, children }: { status: BadgeStatus; still?: boolean; children: string }) {
  const tone = tones[status];
  return (
    <span
      className={`inline-flex h-7 flex-none items-center gap-2 rounded-pill px-3 text-caption font-semibold ${tone.badge}`}
    >
      <span className={`size-2 rounded-pill ${tone.dot} ${still ? "animate-none" : ""}`} />
      {children}
    </span>
  );
}
