import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { meQuery } from "../lib/auth";

// Pages that work without an account. Someone signed in skips sign-in and
// sign-up; a reset link and the welcome step work either way.
const OPEN_WHEN_SIGNED_IN = ["/reset-password", "/welcome"];

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context, location }) => {
    if (OPEN_WHEN_SIGNED_IN.includes(location.pathname)) return;
    const me = await context.queryClient.fetchQuery(meQuery);
    if (me) throw redirect({ to: me.needsOnboarding ? "/welcome" : "/profiler", replace: true });
  },
  component: Outlet,
});
