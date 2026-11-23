# Magnisale

The website for **Magnisale**: AI agents and automated workflows for businesses in Nigeria.

It is the home page plus a blog, built with React, Vite and Tailwind CSS v4 and prerendered to static HTML at build time. There is no backend: enquiries arrive through an on-page form (posted to [Web3Forms](https://web3forms.com), which forwards them by email), WhatsApp, or email.

The look, type, components and voice follow the **Magnisale Design System 1.1**. When the two disagree, the design system is right and the site should change.

## Before going live

Each of these is a field in `src/content.ts`. Until it is filled in, the part of the page that needs it stays hidden, so nothing half-finished ships.

| Field | What it switches on |
|---|---|
| `site.whatsapp` | Your number, digits only in international format (`2348012345678`). Turns on every "Chat on WhatsApp" button and the footer link. |
| `site.formKey` | A Web3Forms access key, created with the inbox that should receive enquiries. Turns on the enquiry form in the contact section. Without it, that section offers email instead. |
| `content/blog/*.md` | The first published post. Turns on the Blog link (main nav, phone menu and footer), the `/blog/` pages, the RSS feed and the blog's entries in the sitemap. |

Lines marked `TO CONFIRM` or `TO ADD` in `content.ts` are claims to check before they go live: the list of tools, naming the Nigeria Data Protection Act, FAQ answers on project length and what happens after the three months of maintenance, and the blog's title, lede and closing call to action (the `blog` export).

## Writing a blog post

Each post is one Markdown file in `content/blog/`. The filename is the address: `content/blog/whatsapp-order-questions.md` is published at `/blog/whatsapp-order-questions/`. Use lowercase words joined by hyphens. `tags` is reserved.

A post starts with a few fields between `---` lines:

```md
---
title: "Answering WhatsApp order questions with an AI agent"
description: "One sentence. Used on the blog index, in search results and in the RSS feed."
date: 2026-11-20
tags: [Customer support, WhatsApp]
draft: true
---
```

| Field | |
|---|---|
| `title` | Required. The post's heading and page title. |
| `description` | Required. One sentence, used on the post's card, as the meta description and in the feed. |
| `date` | Required, as `YYYY-MM-DD`. Posts are listed newest first. |
| `tags` | Optional. Write each one in sentence case, as it should appear. Each tag gets a page at `/blog/tags/<tag>/`. |
| `draft` | Optional. `true` shows the post in `npm run dev` only and keeps it out of the build entirely. |

- Start headings at `##`. The post title is the page's only top-level heading.
- Images go in `public/blog/<slug>/` and are linked as `/blog/<slug>/photo.jpg`, with alt text.
- `content/blog/example.md` is a draft that shows every format: headings, lists, quotes, links, code, tables and images. Copy it to start a post, then run `npm run dev` and open `/blog/` to preview.
- A mistake in a post, such as a missing title, a date in the wrong format or a `#` heading, stops the build with a message naming the file. Nothing broken goes live.
- To publish, push to `main`. The site rebuilds, and the post appears on `/blog/`, in `/blog/rss.xml` and in `/sitemap.xml`.

## Structure

```
index.html              HTML shell: meta and social tags, font preloads. The page-specific
                        head tags sit between <!-- page-meta --> markers, which the
                        prerender replaces on blog pages
content/blog/           Blog posts, one Markdown file each
src/
  content.ts            Every word on the site. Edit copy here.
  styles.css            Design tokens (@theme) and the shared classes: type, buttons, layout, .prose
  App.tsx               Page shell: nav, the page for the address, footer
  routes.ts             Which page an address shows, and every path the build writes
  navigation.ts         The main nav, plus Blog once there is a post
  pages/                Home (section order), BlogList, BlogPost
  sections/             Nav, Hero, WorkflowExample, Tools, Solutions, Process, Privacy,
                        Faq, Contact, Footer, MobileCta
  components/           Logo, Button, IconTile, StatusBadge, SectionHeader, EnquiryForm, PostCard,
                        StructuredData (JSON-LD built from content.ts and the posts)
  blog/                 posts.ts (the post list, tags and dates), head.ts (each page's title
                        and social tags), feeds.ts (the RSS feed and the sitemap)
  hooks/                useActiveSection (highlights the nav link for the section on screen)
  main.tsx              Browser entry (hydrates the prerendered page)
  entry-server.tsx      Build-time entry used by the prerender step
scripts/
  blog-plugin.ts        Turns posts into modules at build time: the frontmatter for lists, and
                        each post's HTML as its own chunk. Checks every post.
  prerender.mjs         Writes every page into dist/, plus 404.html, blog/rss.xml and sitemap.xml
public/                 Served as-is: favicon, social image, robots.txt, fonts. The sitemap is
                        generated at build time.
```

## Commands

```bash
npm install
npm run dev        # develop at http://localhost:5173
npm run build      # type-check, build and prerender into dist/
npm run preview    # serve the built site at http://localhost:4173
```

## Working with the design system

- **Tokens** are the `@theme` block in `src/styles.css`, copied from the design system's Tokens board. Tailwind's default colours, type sizes, radii and shadows are switched off, so only design-system values exist as utilities (`bg-action`, `text-fg-muted`, `rounded-lg`, `shadow-sm`).
- **Type** uses the classes `t-display`, `t-h1` to `t-h4`, `t-lede` and `t-eyebrow`. Heading sizes are fluid (`clamp()`), scaling between the phone and desktop sizes. Section titles use `t-h1`.
- **Surfaces** (new in 1.1): `.card` for raised surfaces with a hover state, `.hero` for the glow and dot grid, `.band-dark` and `.band-blue` for full-width sections, `shadow-glow` for the hero example only.
- **Motion** (new in 1.1): `.reveal` plays once on load (above the fold); `.reveal-scroll` rises in as it scrolls into view, in CSS alone, where the browser supports scroll-driven animation. Both respect reduced motion. The hero example plays only when motion is allowed, and has a pause button.
- **Forms** (new in 1.1): `.field` wraps a label and an `.input`; inputs are 48 px tall with 16 px text.
- **Spacing** uses the 4 px base. Use steps 1, 2, 3, 4, 5, 6, 8, 10, 12, 16 and 24 only.
- **Colour**: one blue primary action per screen. Lime appears once per surface, on blue or ink only, never as text on white.
- **Icons** are [Lucide](https://lucide.dev), stroke 1.75 at 24 px.
- **Copy**: sentence case, "we" and "you", British spelling, outcome first, "AI agents" not "bots", and only numbers we can stand behind.

## Fonts

Three self-hosted files in `public/fonts/`, all under the SIL Open Font License (`OFL.txt`). `styles.css` also defines size-matched Arial fallbacks for Exo 2 and DM Sans, so text keeps its line breaks while the fonts load.

- **Exo 2** (variable) for headings and the wordmark
- **DM Sans** (variable) for body and interface text
- **JetBrains Mono** (500 only) for eyebrows and labels

## Deploy

The site is hosted on **GitHub Pages** at `magnisale.com`. `.github/workflows/pages.yml` builds the site and publishes `dist/` on every push to `main`.

- In the repo settings, Pages **Source** is set to *GitHub Actions*, and the custom domain is set to `magnisale.com`.
- DNS lives at Namecheap: four `A` records on `@` point to GitHub Pages, and `www` is a CNAME to `jjokah.github.io`.
- The site uses root-relative paths (`/fonts/…`, `/assets/…`), so it only renders correctly on the custom domain, not at `jjokah.github.io/magnisale/`.
- `dist/404.html` is a copy of the home page, so unknown addresses (links to the old site, for example) land on the home page instead of an error page.
