import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { createDeps } from "./context.js";
import { loadEnv } from "./env.js";

const env = loadEnv();
const deps = createDeps(env);
const app = createApp(deps);

// In production only Caddy can reach this port: compose publishes no other.
const hostname = env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
const server = serve({ fetch: app.fetch, port: env.PORT, hostname }, ({ port }) => {
  deps.log.info(`API listening on http://${hostname}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => {
      void deps.pool.end().then(() => process.exit(0));
    });
  });
}
