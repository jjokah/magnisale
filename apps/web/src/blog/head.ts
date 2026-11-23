import { blog, site } from "../content/site";
import { blogPath, postPath, tagPath, type Route } from "../routes";

// The head tags that differ from page to page.

const attr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const absolute = (path: string) => new URL(path, site.url).href;

const HOME_TITLE = "Magnisale | AI agents that take the routine work off your team";
const HOME_DESCRIPTION =
  "Magnisale designs, builds and maintains AI agents and automated workflows for businesses in Nigeria: customer support, sales outreach and operations, with your team in control.";
const HOME_SOCIAL_DESCRIPTION =
  "AI agents and automated workflows for businesses in Nigeria, built around the way your business already runs.";

export function headTags(route: Route): string {
  let title: string;
  let description: string;
  let socialDescription: string;
  let path: string;
  const extra: string[] = [];

  if (route.kind === "home") {
    title = HOME_TITLE;
    description = HOME_DESCRIPTION;
    socialDescription = HOME_SOCIAL_DESCRIPTION;
    path = "/";
  } else if (route.kind === "post") {
    const { post } = route;
    title = `${post.title} | ${site.name}`;
    description = socialDescription = post.description;
    path = postPath(post.slug);
    extra.push(`<meta property="article:published_time" content="${post.date}" />`);
    for (const tag of post.tags) extra.push(`<meta property="article:tag" content="${attr(tag.label)}" />`);
  } else if (route.tag) {
    title = `${route.tag.label} | ${blog.feedTitle}`;
    description = socialDescription = blog.topicLede(route.tag.label);
    path = tagPath(route.tag.slug);
  } else {
    title = `${blog.eyebrow} | ${site.name}`;
    description = socialDescription = blog.lede;
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
    `<meta property="og:description" content="${attr(socialDescription)}" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(socialDescription)}" />`,
    ...extra,
  ].join("\n    ");
}

// Lets browsers and feed readers find the RSS feed from any page.
export const feedLink = `<link rel="alternate" type="application/rss+xml" title="${attr(blog.feedTitle)}" href="${blogPath}rss.xml" />`;
