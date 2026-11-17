# Magnisale

The website for **Magnisale**: AI agents and automated workflows for businesses in Nigeria.

It is a single page built with React, Vite and Tailwind CSS v4, prerendered to static HTML at build time. There is no backend; enquiries go to `hello@magnisale.com` through `mailto:` links.

The look, type, components and voice follow the **Magnisale Design System 1.0**. When the two disagree, the design system is right and the site should change.

## Structure

```
index.html              Page shell: meta and social tags, font preloads
src/
  content.ts            Every word on the page. Edit copy here.
  styles.css            Design tokens (@theme) and the shared classes: type, buttons, layout
  App.tsx               Section order
  sections/             Nav, Hero, WorkflowExample, Solutions, Process, Privacy, Contact, Footer
  components/           Logo, Button, IconTile, StatusBadge, SectionHeader
  main.tsx              Browser entry (hydrates the prerendered page)
  entry-server.tsx      Build-time entry used by the prerender step
scripts/prerender.mjs   Writes the rendered page into dist/index.html and dist/404.html
public/                 Served as-is: favicon, social image, robots.txt, sitemap.xml, fonts
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
- **Type** uses the classes `t-display`, `t-h1` to `t-h4`, `t-lede` and `t-eyebrow`. They switch to the phone sizes below 640 px.
- **Spacing** uses the 4 px base. Use steps 1, 2, 3, 4, 5, 6, 8, 10, 12, 16 and 24 only.
- **Colour**: one blue primary action per screen. Lime appears once per surface, on blue or ink only, never as text on white.
- **Icons** are [Lucide](https://lucide.dev), stroke 1.75 at 24 px.
- **Copy**: sentence case, "we" and "you", British spelling, outcome first, "AI agents" not "bots", and only numbers we can stand behind.

## Fonts

Three self-hosted files in `public/fonts/`, all under the SIL Open Font License (`OFL.txt`):

- **Exo 2** (variable) for headings and the wordmark
- **DM Sans** (variable) for body and interface text
- **JetBrains Mono** (500 only) for eyebrows and labels

## Deploy

The site is hosted on **GitHub Pages** at `magnisale.com`. `.github/workflows/pages.yml` builds the site and publishes `dist/` on every push to `main`.

- In the repo settings, Pages **Source** is set to *GitHub Actions*, and the custom domain is set to `magnisale.com`.
- DNS lives at Namecheap: four `A` records on `@` point to GitHub Pages, and `www` is a CNAME to `jjokah.github.io`.
- The site uses root-relative paths (`/fonts/…`, `/assets/…`), so it only renders correctly on the custom domain, not at `jjokah.github.io/magnisale/`.
- `dist/404.html` is a copy of the page, so old links such as `/blog/…` land on the site instead of an error page.
