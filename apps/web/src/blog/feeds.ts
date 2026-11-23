import { blog, site } from "../content/site";
import { blogPath, postPath } from "../routes";
import { absolute } from "./head";
import type { PostMeta } from "./meta";

// The RSS feed and the sitemap. Dates come from the posts, never the clock, so
// the same posts always build the same files.

const xml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const rfc822 = (date: string) => new Date(`${date}T00:00:00Z`).toUTCString();

export function rss(posts: PostMeta[]): string {
  const items = posts.map((post) => {
    const url = absolute(postPath(post.slug));
    return [
      "    <item>",
      `      <title>${xml(post.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(post.date)}</pubDate>`,
      `      <description>${xml(post.description)}</description>`,
      ...post.tags.map((tag) => `      <category>${xml(tag.label)}</category>`),
      "    </item>",
    ].join("\n");
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(blog.feedTitle)}</title>
    <link>${absolute(blogPath)}</link>
    <atom:link href="${absolute(`${blogPath}rss.xml`)}" rel="self" type="application/rss+xml" />
    <description>${xml(blog.lede)}</description>
    <language>en-gb</language>
    <lastBuildDate>${rfc822(posts[0]!.date)}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>
`;
}

// Topic pages are left out: they only list posts that are already here.
export function sitemap(posts: PostMeta[]): string {
  const urls = [{ loc: site.url, lastmod: null as string | null }];
  if (posts.length > 0) {
    urls.push({ loc: absolute(blogPath), lastmod: posts[0]!.date });
    for (const post of posts) urls.push({ loc: absolute(postPath(post.slug)), lastmod: post.date });
  }
  const entries = urls.map(({ loc, lastmod }) =>
    lastmod
      ? `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
      : `  <url>\n    <loc>${loc}</loc>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;
}
