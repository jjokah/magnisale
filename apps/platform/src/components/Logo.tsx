import { Lockup } from "@magnisale/ui";
import { Link } from "@tanstack/react-router";

export function Logo({ to = "/profiler" }: { to?: "/" | "/profiler" }) {
  return (
    <Link to={to} aria-label="Magnisale home" className="flex min-h-11 items-center gap-[7px] text-action lg:gap-2">
      <Lockup />
    </Link>
  );
}
