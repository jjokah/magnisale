import { Lockup, Wordmark } from "@magnisale/ui";

// On the home page it scrolls back to the top; elsewhere it leads home.
export function Logo({
  home,
  variant = "lockup",
  className = "",
}: {
  home: boolean;
  variant?: "lockup" | "wordmark";
  className?: string;
}) {
  return (
    <a
      href={home ? "#top" : "/"}
      aria-label={home ? "Magnisale, back to top" : "Magnisale home"}
      className={`flex min-h-11 items-center gap-[7px] lg:gap-2 ${className}`}
    >
      {variant === "lockup" ? <Lockup /> : <Wordmark />}
    </a>
  );
}
