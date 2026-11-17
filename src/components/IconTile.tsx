import type { LucideIcon } from "lucide-react";

// Feature icons sit in a 44 px tile: Blue 50 on white, white on a callout.
export function IconTile({ icon: Icon, tone = "tint" }: { icon: LucideIcon; tone?: "tint" | "white" }) {
  const bg = tone === "tint" ? "bg-action-tint" : "bg-white";
  return (
    <span className={`flex size-11 flex-none items-center justify-center rounded-md text-action ${bg}`}>
      <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}
