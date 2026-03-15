# Magnisale

A marketing landing page for **Magnisale**, an AI-powered business systems agency. Built with Next.js 16, React 19, and Tailwind CSS v4, featuring smooth scroll, animated backgrounds, and polished micro-interactions.

## Tech Stack

| Tool | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | App framework (App Router) |
| [React 19](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Motion](https://motion.dev) | Animations & entrance effects |
| [Lenis](https://lenis.darkroom.engineering) | Smooth scrolling |
| [Lucide React](https://lucide.dev) | Icons |

## Project Structure

```
magnisale/
├── app/
│   ├── layout.tsx        # Root layout, fonts, smooth scroll provider
│   ├── page.tsx          # Landing page (composes all sections)
│   └── globals.css       # Global styles, CSS variables, keyframes
├── components/
│   ├── Navbar.tsx        # Sticky nav with scroll-aware opacity
│   ├── Hero.tsx          # Animated hero with magnetic CTA button
│   ├── Services.tsx      # 2×2 service card grid with hover effects
│   ├── WhyMagnisale.tsx  # Value proposition section
│   ├── CTA.tsx           # Call-to-action section
│   ├── Footer.tsx        # Site footer
│   ├── CustomCursor.tsx  # Custom cursor that reacts to hover targets
│   └── SmoothScrollProvider.tsx  # Lenis smooth scroll setup
└── public/               # Static assets
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Features

- **Animated gradient mesh**: CSS `@keyframes` orbs drifting in the background, no canvas required
- **Staggered entrance animations**: sections reveal with `motion/react` `whileInView` variants
- **Magnetic CTA button**: primary button shifts slightly toward the cursor on hover
- **Smooth scrolling**: Lenis provides buttery-smooth scroll throughout
- **Custom cursor**: cursor morphs when hovering interactive elements
- **Reduced-motion support**: animations are disabled when the OS `prefers-reduced-motion` setting is on

## Deployment

The project includes a `vercel.json` config. Deploy to Vercel in one command:

```bash
npx vercel
```

Or connect the repository in the [Vercel dashboard](https://vercel.com/new) for automatic deployments on every push.
