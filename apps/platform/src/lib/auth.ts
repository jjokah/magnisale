import { queryOptions, useQuery } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import { api, ApiError, call } from "./api";
import { ME_KEY, queryClient } from "./query";

export const authClient = createAuthClient({ basePath: "/api/auth" });

const FRIENDLY: Record<string, string> = {
  USER_ALREADY_EXISTS: "An account with this email already exists. Try signing in.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account with this email already exists. Try signing in.",
  INVALID_EMAIL_OR_PASSWORD: "That email and password do not match.",
  INVALID_EMAIL: "Enter a valid email address.",
  PASSWORD_TOO_SHORT: "Use at least 10 characters for your password.",
  PASSWORD_TOO_LONG: "Keep your password under 128 characters.",
  INVALID_TOKEN: "This link has expired or was already used. Ask for a new one.",
};

type AuthResult<T> = { data: T; error: null } | { data: null; error: { status: number; code?: string; message?: string } };

/** Unwraps a Better Auth call into its data, or an `ApiError` in plain words. */
export async function authCall<T>(request: Promise<AuthResult<T>>): Promise<T> {
  let result: AuthResult<T>;
  try {
    result = await request;
  } catch {
    throw new ApiError(0, "We could not reach Magnisale. Check your connection and try again.");
  }
  if (result.error) {
    const { status, code, message } = result.error;
    if (status === 429) throw new ApiError(429, "Too many attempts. Please try again in a few minutes.");
    throw new ApiError(status, (code && FRIENDLY[code]) || message || "Something went wrong. Please try again.");
  }
  return result.data as T;
}

async function fetchMe() {
  try {
    return await call(api.account.me.$get());
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export type Me = NonNullable<Awaited<ReturnType<typeof fetchMe>>>;

export const meQuery = queryOptions({ queryKey: ME_KEY, queryFn: fetchMe, staleTime: 60_000 });

export const useMe = () => useQuery(meQuery);

/** Reads who is signed in afresh, after anything that changes it. */
export const refreshMe = () => queryClient.fetchQuery({ ...meQuery, staleTime: 0 });

export const metaQuery = queryOptions({
  queryKey: ["meta"],
  queryFn: () => call(api.meta.$get()),
  staleTime: Infinity,
});
