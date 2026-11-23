// Types and helpers for posts, with no build-time imports, so components that
// reach the browser can use them.
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

export function postsTagged(posts: PostMeta[], slug: string): PostMeta[] {
  return posts.filter((post) => post.tags.some((tag) => tag.slug === slug));
}

// "20 November 2026". Read and printed in UTC, so a reader's time zone cannot
// move the date.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: string): string {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}
