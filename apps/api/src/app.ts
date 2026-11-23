import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import type { AppDeps, AppEnv } from "./context.js";
import { limitBody, requireCsrfHeader } from "./middleware/security.js";
import { accountRoutes, authHandler } from "./routes/auth.js";
import { companyRoutes } from "./routes/company.js";
import { profilerRoutes } from "./routes/profiler.js";

/** The typed API. Chained, so the platform's client knows every route. */
export const v1Routes = new Hono<AppEnv>()
  .use(requireCsrfHeader)
  .get("/health", async (c) => {
    await c.var.deps.pool.query("select 1");
    return c.json({ status: "ok" as const });
  })
  // Public: the sign-in screen needs this before anyone is signed in.
  .get("/meta", (c) => c.json({ google: c.var.deps.auth.options.socialProviders?.google !== undefined }))
  .route("/account", accountRoutes)
  .route("/company", companyRoutes)
  .route("/profile", profilerRoutes);

export const apiRoutes = new Hono<AppEnv>().route("/api/v1", v1Routes);

export function createApp(deps: AppDeps) {
  const app = new Hono<AppEnv>();

  app.use(async (c, next) => {
    c.set("deps", deps);
    await next();
  });
  // Only JSON and images come from here: the platform's pages are served by Caddy.
  app.use(
    secureHeaders({
      contentSecurityPolicy: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
      strictTransportSecurity: deps.env.NODE_ENV === "production" ? "max-age=15552000; includeSubDomains" : false,
    }),
  );
  // Anything without its own limit, such as a large body sent to a read route.
  app.use("/api/v1/*", async (c, next) => {
    if (c.req.path.endsWith("/company/logo") || c.req.path.endsWith("/profile/fields")) return next();
    return limitBody(64 * 1024)(c, next);
  });

  app.route("/api/auth", authHandler);
  app.route("/", apiRoutes);

  app.notFound((c) => c.json({ detail: "Not found." }, 404));
  app.onError((error, c) => {
    if (error instanceof HTTPException && error.status < 500) {
      return c.json({ detail: error.message }, error.status);
    }
    deps.log.error("Unhandled error", error);
    return c.json({ detail: "Something went wrong on our side. Please try again." }, 500);
  });

  return app;
}
