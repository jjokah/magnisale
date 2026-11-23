import type { APIRoute } from "astro";
import { sitemap } from "../blog/feeds";
import { loadBlog } from "../blog/posts";

export const GET: APIRoute = async () => {
  const { posts } = await loadBlog();
  return new Response(sitemap(posts), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
