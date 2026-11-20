// Renders every page to HTML at build time, so each ships with its content
// and its own head tags. Runs after the client build (dist/) and the server
// build (dist-server/). Also writes the RSS feed and the sitemap.
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const placeholder = '<div id="root"></div>';
const headStart = "<!-- page-meta -->";
const headEnd = "<!-- /page-meta -->";

const server = await import(pathToFileURL(resolve("dist-server/entry-server.js")).href);
const template = await readFile(resolve("dist/index.html"), "utf8");
for (const marker of [placeholder, headStart, headEnd]) {
  if (!template.includes(marker)) throw new Error(`prerender: ${marker} not found in dist/index.html`);
}

function fill({ html, head }) {
  let page = template;
  if (head) {
    const start = page.indexOf(headStart) + headStart.length;
    page = `${page.slice(0, start)}\n    ${head}\n    ${page.slice(page.indexOf(headEnd))}`;
  }
  // Functions, so "$" sequences in the page text are not read as replacement patterns.
  if (server.feedLink) page = page.replace("</head>", () => `  ${server.feedLink}\n  </head>`);
  return page.replace(placeholder, () => `<div id="root">${html}</div>`);
}

const paths = server.paths();
for (const path of paths) {
  // "/" is dist/index.html; "/blog/x/" is dist/blog/x/index.html.
  const file = resolve("dist", `.${path}`, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, fill(await server.render(path)));
}

// GitHub Pages serves 404.html for unknown paths, so old links land on the home page.
await copyFile(resolve("dist/index.html"), resolve("dist/404.html"));

const feed = server.rss();
if (feed) await writeFile(resolve("dist/blog/rss.xml"), feed);
await writeFile(resolve("dist/sitemap.xml"), server.sitemap());

await rm(resolve("dist-server"), { recursive: true, force: true });

console.log(`prerendered ${paths.length} page(s), 404.html${feed ? ", blog/rss.xml" : ""} and sitemap.xml`);
