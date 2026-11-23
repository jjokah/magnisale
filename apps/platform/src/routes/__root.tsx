import { ErrorNote } from "@magnisale/ui";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Navigate, Outlet } from "@tanstack/react-router";

function Loading() {
  return (
    <p role="status" className="p-8 text-center text-fg-muted">
      Loading…
    </p>
  );
}

function LoadFailed() {
  return (
    <div className="mx-auto max-w-md p-8">
      <ErrorNote message="We could not reach Magnisale. Check your connection and refresh the page." />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: Outlet,
  pendingComponent: Loading,
  errorComponent: LoadFailed,
  notFoundComponent: () => <Navigate to="/profiler" replace />,
});
