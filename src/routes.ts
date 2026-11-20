import { loadBody, posts, tags, type PostMeta, type Tag } from "./blog/posts";

// The pages the site has. Every link between them is a full page load, so
// there is no client-side router: the address decides the page once, before
// the browser hydrates it.
export type Route =
  | { kind: "home" }
  // The blog index, or one topic's posts when `tag` is set.
  | { kind: "blog"; tag: Tag | null }
  | { kind: "post"; post: PostMeta; html: string };

// Trailing slashes, as GitHub Pages serves each page from folder/index.html.
export const blogPath = "/blog/";
export const postPath = (slug: string) => `/blog/${slug}/`;
export const tagPath = (slug: string) => `/blog/tags/${slug}/`;

// Every page the build writes. The blog's pages exist once there is a post.
export function paths(): string[] {
  if (posts.length === 0) return ["/"];
  return ["/", blogPath, ...posts.map((post) => postPath(post.slug)), ...tags.map((tag) => tagPath(tag.slug))];
}

// Any address that is not a page resolves to the home page, because that is
// what GitHub Pages serves there (404.html is a copy of it).
export async function resolveRoute(path: string): Promise<Route> {
  const parts = path.replace(/index\.html$/, "").split("/").filter(Boolean);

  if (parts[0] === "blog" && posts.length > 0) {
    if (parts.length === 1) return { kind: "blog", tag: null };
    if (parts.length === 2) {
      const post = posts.find((item) => item.slug === parts[1]);
      if (post) return { kind: "post", post, html: await loadBody(post.slug) };
    }
    if (parts.length === 3 && parts[1] === "tags") {
      const tag = tags.find((item) => item.slug === parts[2]);
      if (tag) return { kind: "blog", tag };
    }
  }
  return { kind: "home" };
}
