import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { meQuery } from "../lib/auth";

export const Route = createFileRoute("/_shell")({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.fetchQuery(meQuery);
    if (!me) throw redirect({ to: "/sign-in", replace: true });
    if (me.needsOnboarding) throw redirect({ to: "/welcome", replace: true });
  },
  component: AppShell,
});
