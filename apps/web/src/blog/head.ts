import { blog, site } from "../content";
import { blogPath, postPath, tagPath, type Route } from "../routes";
import { posts } from "./posts";

// The head tags that differ from page to page. The home page keeps the ones
// written in index.html; for the blog's pages the prerender step replaces the
// block between the <!-- page-meta --> markers with these.

const attr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const absolute = (path: string) => new URL(path, site.url).href;

export function headTags(route: Route): string | null {
  if (route.kind === "home") return null;

  let title: string;
  let description: string;
  let path: string;
  const extra: string[] = [];

  if (route.kind === "post") {
    const { post } = route;
    title = `${post.title} | ${site.name}`;
    description = post.description;
    path = postPath(post.slug);
    extra.push(`<meta property="article:published_time" content="${post.date}" />`);
    for (const tag of post.tags) extra.push(`<meta property="article:tag" content="${attr(tag.label)}" />`);
  } else if (route.tag) {
    title = `${route.tag.label} | ${blog.feedTitle}`;
    description = blog.topicLede(route.tag.label);
    path = tagPath(route.tag.slug);
  } else {
    title = `${blog.eyebrow} | ${site.name}`;
    description = blog.lede;
    path = blogPath;
  }

  const url = absolute(path);
  return [
    `<title>${attr(title)}</title>`,
    `<meta name="description" content="${attr(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${route.kind === "post" ? "article" : "website"}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    ...extra,
  ].join("\n    ");
}

// Lets browsers and feed readers find the RSS feed from any page.
export const feedLink =
  posts.length > 0
    ? `<link rel="alternate" type="application/rss+xml" title="${attr(blog.feedTitle)}" href="${blogPath}rss.xml" />`
    : null;
