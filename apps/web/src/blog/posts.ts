// The blog's posts, read from the content collection at build time. Post HTML
// comes from `marked`, so no Markdown parser reaches the browser. A mistake in
// a post stops the build with a message naming the file.
import { getCollection } from "astro:content";
import { Marked, type Token } from "marked";
import type { PostMeta, Tag } from "./meta";

const marked = new Marked({
  gfm: true,
  renderer: {
    // Images load as the reader reaches them.
    image({ href, title, text }) {
      const titleAttr = title ? ` title="${escape(title)}"` : "";
      return `<img src="${escape(href)}" alt="${escape(text)}"${titleAttr} loading="lazy" decoding="async" />`;
    },
  },
});

function escape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function tagFrom(label: string, fail: (message: string) => never): Tag {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) fail(`the tag "${label}" needs at least one letter or number`);
  return { slug, label };
}

export interface Blog {
  /** Newest first. Drafts appear in development only. */
  posts: PostMeta[];
  /** Every topic, in alphabetical order. */
  tags: Tag[];
  html(slug: string): string;
}

async function read(): Promise<Blog> {
  const entries = await getCollection("blog");
  const bodies = new Map<string, string>();
  const all: PostMeta[] = [];

  for (const entry of entries) {
    const slug = entry.id;
    const fail = (message: string): never => {
      throw new Error(`src/content/blog/${slug}.md: ${message}`);
    };
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      fail("the filename is the address, so use lowercase letters, numbers and hyphens only");
    }
    if (slug === "tags") fail('"tags" is reserved for the topic pages; choose another filename');

    const tokens = marked.lexer(entry.body ?? "");
    if (tokens.some((token: Token) => token.type === "heading" && token.depth === 1)) {
      fail("start headings at ##: the title is the page's only top-level heading");
    }

    // A build leaves drafts out entirely: no listing and no text.
    if (import.meta.env.PROD && entry.data.draft) continue;

    all.push({ ...entry.data, slug, tags: entry.data.tags.map((label) => tagFrom(label, fail)) });
    bodies.set(slug, marked.parser(tokens));
  }

  // Plain comparisons, not localeCompare, so the order is the same everywhere.
  const posts = all.sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.slug < b.slug ? -1 : 1));

  // A topic's label comes from the newest post that uses it.
  const tags = [
    ...posts
      .flatMap((post) => post.tags)
      .reduce((known, tag) => (known.has(tag.slug) ? known : known.set(tag.slug, tag)), new Map<string, Tag>())
      .values(),
  ].sort((a, b) => (a.slug < b.slug ? -1 : 1));

  return { posts, tags, html: (slug) => bodies.get(slug) ?? "" };
}

let cached: Promise<Blog> | undefined;

/** Read once per build. In development, re-read so edits to a post show up. */
export function loadBlog(): Promise<Blog> {
  if (import.meta.env.DEV) return read();
  cached ??= read();
  return cached;
}
