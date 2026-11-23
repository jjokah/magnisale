import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

// One Markdown file per post. A mistake in a post stops the build with a
// message naming the file, so nothing broken goes live. The rules that need the
// post's text are in src/blog/posts.ts.
const blog = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: "./src/content/blog",
    // The filename is the address, kept exactly as written so it can be checked.
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    title: z.string({ error: 'add a "title"' }).trim().min(1, 'add a "title"'),
    description: z.string({ error: 'add a "description"' }).trim().min(1, 'add a "description"'),
    date: z
      .union([z.date(), z.string()], { error: 'write "date" as YYYY-MM-DD, for example 2026-11-20' })
      .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
      .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)), {
        error: 'write "date" as YYYY-MM-DD, for example 2026-11-20',
      }),
    tags: z
      .array(z.string().trim().min(1), { error: 'write "tags" as a list of words, for example [Customer support, WhatsApp]' })
      .default([]),
    draft: z.boolean({ error: '"draft" is either true or false' }).default(false),
  }),
});

export const collections = { blog };
