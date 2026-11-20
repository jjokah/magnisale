import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { headTags } from "./blog/head";
import { resolveRoute } from "./routes";

// Used by scripts/prerender.mjs at build time only.
export async function render(path: string) {
  const route = await resolveRoute(path);
  const html = renderToString(
    <StrictMode>
      <App route={route} />
    </StrictMode>,
  );
  return { html, head: headTags(route) };
}

export { paths } from "./routes";
export { feedLink } from "./blog/head";
export { rss, sitemap } from "./blog/feeds";
