import type { AppType } from "@magnisale/api/types";
import { hc } from "hono/client";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const OFFLINE = "We could not reach Magnisale. Check your connection and try again.";

// The API refuses state-changing requests without this header (CSRF defence).
export const api = hc<AppType>(window.location.origin, {
  headers: { "x-magnisale-csrf": "1" },
  init: { credentials: "same-origin" },
}).api.v1;

type JsonResponse = { ok: boolean; status: number; json(): Promise<unknown> };
type Body<R> = R extends { json(): Promise<infer T> } ? T : never;
// Every failure from the API has the shape { detail }.
type Success<R> = Exclude<Body<R>, { detail: string }>;

/** Awaits a typed API call: returns the success body, or throws an `ApiError`. */
export async function call<R extends JsonResponse>(request: Promise<R>): Promise<Success<R>> {
  let response: R;
  try {
    response = await request;
  } catch {
    throw new ApiError(0, OFFLINE);
  }
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new ApiError(response.status, data?.detail ?? "Something went wrong. Please try again.");
  }
  return (await response.json()) as Success<R>;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
