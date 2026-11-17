// Renders the page to HTML at build time so dist/index.html ships with its
// content. Runs after the client build (dist/) and the server build (dist-server/).
import { copyFile, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const placeholder = '<div id="root"></div>';
const page = resolve("dist/index.html");

const { render } = await import(pathToFileURL(resolve("dist-server/entry-server.js")).href);
const template = await readFile(page, "utf8");
if (!template.includes(placeholder)) {
  throw new Error(`prerender: ${placeholder} not found in dist/index.html`);
}

await writeFile(page, template.replace(placeholder, `<div id="root">${render()}</div>`));
// GitHub Pages serves 404.html for unknown paths, so old links land on the page.
await copyFile(page, resolve("dist/404.html"));
await rm(resolve("dist-server"), { recursive: true, force: true });

console.log("prerendered dist/index.html and dist/404.html");
