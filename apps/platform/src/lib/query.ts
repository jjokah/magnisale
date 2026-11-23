import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

export const ME_KEY = ["me"] as const;

// A session that ends mid-visit sends the person back to sign-in, from any request.
function handleError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) queryClient.setQueryData(ME_KEY, null);
}

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
    },
  },
});
