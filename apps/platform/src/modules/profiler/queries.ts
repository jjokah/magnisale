import type { ProfileView } from "@magnisale/profiler";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, call } from "../../lib/api";

export const PROFILE_KEY = ["profile"] as const;

export const profileQuery = queryOptions({
  queryKey: PROFILE_KEY,
  // Field values are a union the JSON type helper cannot follow, so the shared
  // type is applied here, once.
  queryFn: async () => (await call(api.profile.$get())) as unknown as ProfileView,
});

export function useSaveField(path: string, onSaved: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: unknown) => call(api.profile.fields.$patch({ json: { path, value } })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      onSaved();
    },
  });
}

export function useLogo() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
  const upload = useMutation({
    mutationFn: (file: File) => call(api.company.logo.$post({ form: { file } })),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: () => call(api.company.logo.$delete()),
    onSuccess: refresh,
  });
  return { upload, remove };
}
