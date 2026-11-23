import type { Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { createMiddleware } from "hono/factory";
import proxyaddr from "proxy-addr";
import type { IncomingMessage } from "node:http";
import type { AppEnv } from "../context.js";

/**
 * Session cookies are SameSite=Lax. On top of that, every state-changing call
 * to /api/v1 must carry a custom header, which another site cannot add without
 * a CORS preflight, and this API allows no cross-origin requests. Better Auth
 * checks the Origin of its own routes.
 */
export const requireCsrfHeader = createMiddleware<AppEnv>(async (c, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method) && c.req.header("x-magnisale-csrf") !== "1") {
    return c.json({ detail: "Request refused." }, 403);
  }
  await next();
});

/**
 * The visitor's address: walks X-Forwarded-For from the right through trusted
 * proxies and stops at the first address that is not one, so a client cannot
 * forge its way to a fresh rate-limit bucket.
 */
export function clientAddress(c: Context<AppEnv>): string {
  const peer = c.env?.incoming?.socket?.remoteAddress ?? "127.0.0.1";
  const trust = c.var.deps.env.TRUST_PROXY;
  if (!trust) return peer;
  const forwarded = c.req.header("x-forwarded-for");
  const request = {
    socket: { remoteAddress: peer },
    headers: forwarded ? { "x-forwarded-for": forwarded } : {},
  } as unknown as IncomingMessage;
  return proxyaddr(request, trust.split(",").map((entry) => entry.trim()));
}

export const limitBody = (maxSize: number) =>
  bodyLimit({
    maxSize,
    onError: (c) => c.json({ detail: "That is too large to upload." }, 413),
  });
