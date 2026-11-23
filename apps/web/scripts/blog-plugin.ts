// Turns each Markdown post in content/blog/ into a module at build time, so no
// Markdown parser reaches the browser:
//   post.md?meta  exports the frontmatter (loaded on every page, for lists)
//   post.md       exports the post's HTML (its own chunk, loaded on its page)
// A mistake in a post stops the build with a message naming the file, so
// nothing broken goes live.
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { Marked, type Token } from "marked";
import { parse } from "yaml";
import type { Plugin } from "vite";
import type { PostMeta } from "../src/blog/posts";

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

const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

function parsePost(file: string, source: string) {
  const slug = basename(file, ".md");
  const fail = (message: string): never => {
    throw new Error(`content/blog/${slug}.md: ${message}`);
  };

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fail("the filename is the address, so use lowercase letters, numbers and hyphens only");
  }
  if (slug === "tags") fail('"tags" is reserved for the topic pages; choose another filename');

  const match = source.replace(/^﻿/, "").match(frontmatter);
  if (!match) fail("start the file with frontmatter between two --- lines (see content/blog/example.md)");
  const [whole, yaml] = match!;

  let data: Record<string, unknown>;
  try {
    data = parse(yaml) ?? {};
  } catch (error) {
    return fail(`the frontmatter is not valid YAML (${(error as Error).message})`);
  }

  const text = (key: string) => {
    const value = data[key];
    if (typeof value !== "string" || value.trim() === "") fail(`add a "${key}"`);
    return (value as string).trim();
  };

  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    fail('write "date" as YYYY-MM-DD, for example 2026-11-20');
  }

  const rawTags = data.tags ?? [];
  if (!Array.isArray(rawTags) || rawTags.some((tag) => typeof tag !== "string" || tag.trim() === "")) {
    fail('write "tags" as a list of words, for example [Customer support, WhatsApp]');
  }
  const tags = (rawTags as string[]).map((label) => {
    const tagSlug = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!tagSlug) fail(`the tag "${label}" needs at least one letter or number`);
    return { slug: tagSlug, label: label.trim() };
  });

  if (data.draft !== undefined && typeof data.draft !== "boolean") fail('"draft" is either true or false');

  const meta: PostMeta = {
    slug,
    title: text("title"),
    description: text("description"),
    date: date as string,
    tags,
    draft: data.draft === true,
  };

  const tokens = marked.lexer(source.replace(/^﻿/, "").slice(whole.length));
  if (tokens.some((token: Token) => token.type === "heading" && token.depth === 1)) {
    fail("start headings at ##: the title is the page's only top-level heading");
  }

  return { meta, tokens };
}

export function blog(): Plugin {
  let build = false;
  return {
    name: "magnisale-blog",
    enforce: "pre",
    configResolved(config) {
      build = config.command === "build";
    },
    async load(id) {
      const [file, query] = id.split("?");
      if (!file.endsWith(".md") || !file.replace(/\\/g, "/").includes("/content/blog/")) return null;

      const { meta, tokens } = parsePost(file, await readFile(file, "utf8"));
      // A build leaves drafts out entirely: no listing and no text.
      const hidden = build && meta.draft;

      if (query === "meta") return `export default ${JSON.stringify(hidden ? null : meta)};`;
      return `export default ${JSON.stringify(hidden ? "" : marked.parser(tokens))};`;
    },
  };
}
