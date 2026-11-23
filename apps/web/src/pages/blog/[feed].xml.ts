import type { APIRoute } from "astro";
import { rss } from "../../blog/feeds";
import { loadBlog } from "../../blog/posts";

// A dynamic route so that the feed exists only once there is a post.
export async function getStaticPaths() {
  const { posts } = await loadBlog();
  return posts.length > 0 ? [{ params: { feed: "rss" } }] : [];
}

export const GET: APIRoute = async () => {
  const { posts } = await loadBlog();
  return new Response(rss(posts), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
