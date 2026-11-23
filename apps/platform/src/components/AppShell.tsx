import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { authCall, authClient, useMe } from "../lib/auth";
import { Logo } from "./Logo";

const NAV = [
  { to: "/profiler", label: "Profile" },
  { to: "/settings", label: "Settings" },
] as const;

const navLink = "flex min-h-11 items-center rounded-md px-3 text-ui font-semibold transition-colors";

export function AppShell() {
  const me = useMe();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const signOut = useMutation({
    mutationFn: () => authCall(authClient.signOut()),
    onSuccess: async () => {
      queryClient.clear();
      await navigate({ to: "/sign-in", replace: true });
    },
  });

  // A session that ended mid-visit.
  if (me.data === null) return <Navigate to="/sign-in" replace />;

  return (
    <div className="min-h-dvh bg-surface-subtle">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="wrap flex h-16 items-center gap-4 sm:gap-8">
          <Logo />
          <nav aria-label="Main" className="flex flex-1 items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navLink}
                activeProps={{ className: "bg-action-tint text-action" }}
                inactiveProps={{ className: "text-fg-muted hover:text-fg" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="hidden max-w-48 truncate text-small text-fg-muted md:block">{me.data?.company?.name}</span>
          <button
            type="button"
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            aria-label="Sign out"
            title="Sign out"
            className="flex size-11 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
          >
            <LogOut size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </header>
      <main className="wrap py-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
