// Builds public/*.html from src/ and posts/. No framework: string templates
// with {{placeholders}}, Markdown via `marked`. Output is committed, so any
// static host can serve public/ without running this.

import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const POSTS = join(ROOT, "posts");
const PUBLIC = join(ROOT, "public");
const SITE = "https://magnisale.com";

const SITE_TITLE = "Magnisale | AI-Powered Business Systems";
const SITE_DESCRIPTION =
  "Magnisale builds intelligent AI systems for modern businesses: from chatbots and custom models to automation workflows and personal AI agents.";
const BLOG_DESCRIPTION =
  "Insights on sales automation, outreach strategy, and revenue growth from the Magnisale team.";

const read = (path) => readFile(join(SRC, path), "utf8");
const [layout, head, header, footer, landing] = await Promise.all([
  read("layout.html"),
  read("partials/head.html"),
  read("partials/header.html"),
  read("partials/footer.html"),
  read("index.html"),
]);

// Single-pass replacement: inserted values are never re-scanned.
function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`Missing template value: {{${key}}}`);
    return vars[key];
  });
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

// ── Posts ────────────────────────────────────────────────────────────────
function parseFrontMatter(raw, file) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`${file}: missing front matter`);
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim();
    data[m[1]] = value.startsWith("[") ? JSON.parse(value) : value.replace(/^"(.*)"$/, "$1");
  }
  for (const key of ["title", "date", "excerpt"]) {
    if (!data[key]) throw new Error(`${file}: front matter needs "${key}"`);
  }
  return { data, body: raw.slice(match[0].length) };
}

const posts = [];
for (const file of (await readdir(POSTS)).filter((f) => f.endsWith(".md"))) {
  const { data, body } = parseFrontMatter(await readFile(join(POSTS, file), "utf8"), file);
  posts.push({
    slug: file.replace(/\.md$/, ""),
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    tags: Array.isArray(data.tags) ? data.tags : [],
    html: marked.parse(body, { gfm: true }),
  });
}
posts.sort((a, b) => b.date.localeCompare(a.date));
const tags = [...new Set(posts.flatMap((p) => p.tags))].sort();

// ── Page assembly ────────────────────────────────────────────────────────
const year = String(new Date().getFullYear());
const latestPosts = posts
  .slice(0, 3)
  .map((p) => `        <a class="chip-link" href="/blog/${p.slug}/">${esc(p.title)}</a>`)
  .join("\n");
const footerHtml = fill(footer, { year, latestPosts });

function page({ path, title, description, content, ogType = "website", mainClass = "", staticNav = true }) {
  return fill(layout, {
    head: fill(head, { title: esc(title), description: esc(description), url: SITE + path, ogType }),
    header: fill(header, { navClass: staticNav ? "is-static" : "" }),
    mainClass,
    content,
    footer: footerHtml,
  });
}

const outputs = new Map();
const emit = (path, html) => outputs.set(path, html);

// Landing
emit("/", page({ path: "/", title: SITE_TITLE, description: SITE_DESCRIPTION, content: landing, staticNav: false }));

// Blog index + tag pages
const tagChips = (active) =>
  [`<a class="chip${active ? "" : " is-active"}" href="/blog/"${active ? "" : ' aria-current="page"'}>All</a>`]
    .concat(
      tags.map(
        (t) =>
          `<a class="chip${t === active ? " is-active" : ""}" href="/blog/tag/${encodeURIComponent(t)}/"${t === active ? ' aria-current="page"' : ""}>${esc(t)}</a>`,
      ),
    )
    .join("");

const postRow = (p) => `
      <li class="post-row">
        <a href="/blog/${p.slug}/">
          <p class="eyebrow post-row__meta"><time datetime="${p.date}">${formatDate(p.date)}</time>${p.tags.map((t) => ` &middot; ${esc(t)}`).join("")}</p>
          <h2 class="post-row__title">${esc(p.title)}</h2>
          <p class="post-row__excerpt">${esc(p.excerpt)}</p>
        </a>
      </li>`;

function blogIndex(activeTag) {
  const list = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;
  return `
<div class="wrap">
  <a class="eyebrow back-link" href="/">&larr; Magnisale</a>
  <h1 class="h2">${activeTag ? `Blog: ${esc(activeTag)}` : "Blog"}<svg class="i px" aria-hidden="true"><use href="/assets/icons.svg#px-blog"/></svg></h1>
  <p class="lede">Technology updates, sales insights, and news from the Magnisale team.</p>
  <nav class="chips" aria-label="Filter posts by tag">${tagChips(activeTag)}</nav>
  ${list.length ? `<ol class="post-list">${list.map(postRow).join("")}\n  </ol>` : `<p class="empty">No posts yet.</p>`}
</div>`;
}

emit("/blog/", page({ path: "/blog/", title: "Blog | Magnisale", description: BLOG_DESCRIPTION, content: blogIndex(), mainClass: "paper blog" }));
for (const tag of tags) {
  const path = `/blog/tag/${encodeURIComponent(tag)}/`;
  emit(path, page({ path, title: `Posts tagged “${tag}” | Magnisale Blog`, description: BLOG_DESCRIPTION, content: blogIndex(tag), mainClass: "paper blog" }));
}

// Posts
for (const p of posts) {
  const path = `/blog/${p.slug}/`;
  const content = `
<article class="wrap wrap--narrow">
  <a class="eyebrow back-link" href="/blog/">&larr; All posts</a>
  <div class="chips">${p.tags.map((t) => `<a class="chip" href="/blog/tag/${encodeURIComponent(t)}/">${esc(t)}</a>`).join("")}</div>
  <h1 class="post__title">${esc(p.title)}</h1>
  <p class="eyebrow"><time datetime="${p.date}">${formatDate(p.date)}</time></p>
  <div class="prose">
${p.html}
  </div>
  <div class="post__end"><a class="btn btn--outline" href="/blog/">&larr; All posts</a></div>
</article>`;
  emit(path, page({ path, title: `${p.title} | Magnisale Blog`, description: p.excerpt, content, ogType: "article", mainClass: "paper post" }));
}

// 404
emit(
  "/404.html",
  page({
    path: "/404.html",
    title: "Page not found | Magnisale",
    description: SITE_DESCRIPTION,
    mainClass: "blue",
    content: `
<section class="wrap notfound">
  <p class="eyebrow">Error 404</p>
  <h1 class="h1">Page not found</h1>
  <p>The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
  <div class="hero__actions"><a class="btn btn--white" href="/">Back to home</a><a class="btn btn--ghost" href="/blog/">Read the blog</a></div>
</section>`,
  }),
);

// ── Write ────────────────────────────────────────────────────────────────
await rm(join(PUBLIC, "blog"), { recursive: true, force: true });
for (const [path, html] of outputs) {
  const file = path.endsWith(".html") ? join(PUBLIC, path) : join(PUBLIC, path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

const sitemapUrls = [...outputs.keys()].filter((p) => p !== "/404.html");
const lastmod = new Map(posts.map((p) => [`/blog/${p.slug}/`, p.date]));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((p) => `  <url><loc>${SITE}${p}</loc>${lastmod.has(p) ? `<lastmod>${lastmod.get(p)}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`;
await writeFile(join(PUBLIC, "sitemap.xml"), sitemap);

console.log(`Built ${outputs.size} pages (${posts.length} posts, ${tags.length} tags) into public/`);
