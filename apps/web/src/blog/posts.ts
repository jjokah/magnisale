// The blog's posts: the Markdown files in content/blog/, which
// scripts/blog-plugin.ts turns into modules at build time.
export type Tag = { slug: string; label: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  // YYYY-MM-DD
  date: string;
  tags: Tag[];
  draft: boolean;
};

// The frontmatter of every post, small enough to load on every page. The build
// turns a draft into null, so drafts show in development only.
const metas = import.meta.glob<PostMeta | null>("/content/blog/*.md", {
  query: "?meta",
  import: "default",
  eager: true,
});

// Each post's HTML is its own chunk, fetched only on that post's page.
const bodies = import.meta.glob<string>("/content/blog/*.md", { import: "default" });

// Newest first. Plain comparisons, not localeCompare, so the order cannot
// differ between the build and the browser.
export const posts: PostMeta[] = Object.values(metas)
  .filter((post): post is PostMeta => post !== null)
  .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.slug < b.slug ? -1 : 1));

// Every topic, in alphabetical order. A topic's label comes from the newest
// post that uses it.
export const tags: Tag[] = [
  ...posts
    .flatMap((post) => post.tags)
    .reduce((all, tag) => (all.has(tag.slug) ? all : all.set(tag.slug, tag)), new Map<string, Tag>())
    .values(),
].sort((a, b) => (a.slug < b.slug ? -1 : 1));

export function postsTagged(slug: string): PostMeta[] {
  return posts.filter((post) => post.tags.some((tag) => tag.slug === slug));
}

export function loadBody(slug: string): Promise<string> {
  const load = bodies[`/content/blog/${slug}.md`];
  return load ? load() : Promise.resolve("");
}

// "20 November 2026". Read and printed in UTC, so a reader's time zone cannot
// move the date and the browser always matches the prerendered page.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: string): string {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}
