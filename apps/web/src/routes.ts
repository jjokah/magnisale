import type { PostMeta, Tag } from "./blog/meta";

// The kinds of page the site has.
export type Route =
  | { kind: "home" }
  // The blog index, or one topic's posts when `tag` is set.
  | { kind: "blog"; tag: Tag | null }
  | { kind: "post"; post: PostMeta };

// Trailing slashes, as GitHub Pages serves each page from folder/index.html.
export const blogPath = "/blog/";
export const postPath = (slug: string) => `/blog/${slug}/`;
export const tagPath = (slug: string) => `/blog/tags/${slug}/`;
