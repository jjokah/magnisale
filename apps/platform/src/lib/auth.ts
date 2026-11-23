import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "./api";

export interface Me {
  user: { id: string; email: string; name: string; isStaff: boolean };
  organization: { id: string; name: string } | null;
  needsOnboarding: boolean;
}

export const ME_KEY = ["me"] as const;

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<Me | null> => {
      try {
        return await api.get<Me>("/auth/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
  });
}

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: () => api.get<{ google: boolean }>("/meta"),
    staleTime: Infinity,
  });
}
