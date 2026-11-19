# Magnisale

The website for **Magnisale**: AI agents and automated workflows for businesses in Nigeria.

It is a single page built with React, Vite and Tailwind CSS v4, prerendered to static HTML at build time. There is no backend: enquiries arrive through an on-page form (posted to [Web3Forms](https://web3forms.com), which forwards them by email), WhatsApp, or email.

The look, type, components and voice follow the **Magnisale Design System 1.1**. When the two disagree, the design system is right and the site should change.

## Before going live

Each of these is a field in `src/content.ts`. Until it is filled in, the part of the page that needs it stays hidden, so nothing half-finished ships.

| Field | What it switches on |
|---|---|
| `site.whatsapp` | Your number, digits only in international format (`2348012345678`). Turns on every "Chat on WhatsApp" button and the footer link. |
| `site.formKey` | A Web3Forms access key, created with the inbox that should receive enquiries. Turns on the enquiry form in the contact section. Without it, that section offers email instead. |

Lines marked `TO CONFIRM` or `TO ADD` in `content.ts` are claims to check before they go live: the list of tools, naming the Nigeria Data Protection Act, and FAQ answers on project length and what happens after the three months of maintenance.

## Structure

```
index.html              Page shell: meta and social tags, font preloads
src/
  content.ts            Every word on the page. Edit copy here.
  styles.css            Design tokens (@theme) and the shared classes: type, buttons, layout
  App.tsx               Section order
  sections/             Nav, Hero, WorkflowExample, Tools, Solutions, Process, Privacy,
                        Faq, Contact, Footer, MobileCta
  components/           Logo, Button, IconTile, StatusBadge, SectionHeader, EnquiryForm,
                        StructuredData (JSON-LD built from content.ts)
  hooks/                useActiveSection (highlights the nav link for the section on screen)
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
- `dist/404.html` is a copy of the page, so old links such as `/blog/…` land on the site instead of an error page.
