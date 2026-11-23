import type { LucideIcon } from "lucide-react";

const tones = {
  tint: "bg-action-tint text-action",
  white: "bg-white text-action",
  dark: "bg-white/10 text-blue-300",
};

// Feature icons sit in a 44 px tile: Blue 50 on white, white on a callout,
// translucent white on ink.
export function IconTile({ icon: Icon, tone = "tint" }: { icon: LucideIcon; tone?: keyof typeof tones }) {
  return (
    <span className={`flex size-11 flex-none items-center justify-center rounded-md ${tones[tone]}`}>
      <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}
