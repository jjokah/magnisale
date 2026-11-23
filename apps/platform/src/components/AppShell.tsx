import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useMe } from "../lib/auth";
import { Logo } from "./Logo";

const NAV = [
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  const me = useMe();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const signOut = useMutation({
    mutationFn: () => api.post("/auth/sign-out"),
    onSuccess: () => {
      queryClient.clear();
      navigate("/sign-in", { replace: true });
    },
  });

  return (
    <div className="min-h-dvh bg-surface-subtle">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="wrap flex h-16 items-center gap-4 sm:gap-8">
          <Logo />
          <nav aria-label="Main" className="flex flex-1 items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-11 items-center rounded-md px-3 text-ui font-semibold transition-colors ${
                    isActive ? "bg-action-tint text-action" : "text-fg-muted hover:text-fg"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <span className="hidden max-w-48 truncate text-small text-fg-muted md:block">
            {me.data?.organization?.name}
          </span>
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
