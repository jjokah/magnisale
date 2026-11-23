// The platform imports this with `import type`, so no server code reaches it.
import type { apiRoutes } from "./app.js";

export type AppType = typeof apiRoutes;
