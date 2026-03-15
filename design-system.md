# Magnisale Design System v1.0

## COLORS

### Primary Scale
- `--primary-deep: #0A1A6E` — Backgrounds, depth
- `--primary-core: #1A3AF5` — Brand primary
- `--primary-mid: #3A6EFF` — Buttons, links
- `--primary-bright: #5B8FFF` — Highlights
- `--primary-light: #93B5FF` — Gradient ends

### Accent
- `--accent-cyan: #00E5FF` — Circuit glow accent
- `--accent-cyan-dim: #00B8D4` — Dimmed accent

### Neutrals
- `--neutral-900: #080E1F` — Page background
- `--neutral-800: #0F1A35` — Cards, panels
- `--neutral-700: #1C2B50` — Borders, dividers
- `--neutral-600: #2E4070` — Elevated borders
- `--neutral-400: #6B82AD` — Secondary text
- `--neutral-200: #C4CDE0` — Body text
- `--neutral-100: #E8EDF8` — Light text
- `--white: #FFFFFF`

### Gradients
- `--grad-primary: linear-gradient(160deg, #3A6EFF 0%, #0A1A6E 100%)` — Hero, CTA buttons
- `--grad-accent: linear-gradient(160deg, #00E5FF 0%, #1A3AF5 100%)` — Accent buttons, highlights
- `--grad-card: linear-gradient(160deg, #1A3AF5 0%, #0A1A6E 100%)` — Featured cards
- `--grad-light: linear-gradient(160deg, #93B5FF 0%, #3A6EFF 100%)` — Stat values, text gradients

---

## TYPOGRAPHY

### Fonts
- Display / Headings: **Exo 2** (Google Fonts)
- Body / UI: **DM Sans** (Google Fonts)

### Type Scale
| Role | Font | Size | Weight |
|------|------|------|--------|
| Display | Exo 2 | 48px | 800 |
| H1 | Exo 2 | 36px | 700 |
| H2 | Exo 2 | 28px | 700 |
| H3 | Exo 2 | 22px | 600 |
| H4 | Exo 2 | 17px | 600 |
| Body | DM Sans | 16px | 400 |
| Small | DM Sans | 13px | 400 |
| Caption/Label | DM Sans | 11px | 700, uppercase, 0.1em spacing |

### Color Usage
- Headlines: `--white`
- Body: `--neutral-200`
- Secondary: `--neutral-400`
- Labels/Captions: `--accent-cyan`

---

## SPACING

8-point base scale:
- `--space-1: 4px`
- `--space-2: 8px`
- `--space-3: 12px`
- `--space-4: 16px`
- `--space-5: 24px`
- `--space-6: 32px`
- `--space-7: 48px`
- `--space-8: 64px`
- `--space-9: 96px`

---

## BORDER RADIUS

- `--radius-sm: 6px` — Tags, small chips
- `--radius-md: 12px` — Cards, inputs
- `--radius-lg: 20px` — Large cards, modals
- `--radius-xl: 32px` — Hero sections
- `--radius-full: 9999px` — Pills, badges, buttons

---

## SHADOWS

- `--shadow-sm: 0 2px 8px rgba(26, 58, 245, 0.15)`
- `--shadow-md: 0 6px 24px rgba(26, 58, 245, 0.25)`
- `--shadow-lg: 0 16px 48px rgba(10, 26, 110, 0.35)`
- `--shadow-glow: 0 0 24px rgba(0, 229, 255, 0.4)` — Cyan glow on hover

---

## COMPONENTS

### Buttons
All buttons use: `font-family: Exo 2`, `font-weight: 600`, `border-radius: 9999px`

- **Primary** — bg: `--grad-primary`, text: white, padding: 12px 28px, shadow: `--shadow-md`. Hover: translateY(-2px) + `--shadow-glow`
- **Secondary** — bg: transparent, border: 1.5px `--primary-mid`, text: `--primary-bright`. Hover: bg rgba(58,110,255,0.12), border/text shift to `--accent-cyan`
- **Ghost** — bg: rgba(255,255,255,0.06), text: `--neutral-200`. Hover: bg rgba(255,255,255,0.12)
- **Accent** — bg: `--grad-accent`, text: `--neutral-900`, font-weight: 700, shadow: `--shadow-glow`

Sizes:
- Small: `padding: 8px 18px`, `font-size: 12px`
- Default: `padding: 12px 28px`, `font-size: 14px`
- Large: `padding: 16px 36px`, `font-size: 16px`

### Badges
All badges: `font-family: Exo 2`, `font-weight: 700`, `font-size: 11px`, `border-radius: 9999px`, `padding: 4px 10px`

- **Primary** — bg: rgba(58,110,255,0.2), text: `--primary-bright`, border: rgba(58,110,255,0.35)
- **Success** — bg: rgba(16,185,129,0.15), text: #34D399, border: rgba(16,185,129,0.3)
- **Warning** — bg: rgba(245,158,11,0.15), text: #FBBF24, border: rgba(245,158,11,0.3)
- **Danger** — bg: rgba(239,68,68,0.15), text: #F87171, border: rgba(239,68,68,0.3)
- **Cyan** — bg: rgba(0,229,255,0.1), text: `--accent-cyan`, border: rgba(0,229,255,0.3)

### Cards
- **Base** — bg: `--neutral-800`, border: 1px `--neutral-700`, radius: `--radius-lg`, padding: `--space-6`
- **Gradient** — bg: `--grad-card`, radius: `--radius-lg`, padding: `--space-6`. Add radial cyan glow top-right: `radial-gradient(circle, rgba(0,229,255,0.18) 0%, transparent 70%)`
- **Glass** — bg: rgba(26,58,245,0.12), border: 1px rgba(58,110,255,0.3), backdrop-filter: blur(10px)

### Inputs
- bg: `--neutral-800`, border: 1.5px `--neutral-600`, radius: `--radius-md`, padding: 12px 16px
- font: DM Sans 15px, color: white, placeholder: `--neutral-400`
- Focus: border `--primary-mid`, box-shadow: 0 0 0 3px rgba(58,110,255,0.15)

### Input Labels
- font: Exo 2, 12px, weight 600, letter-spacing 0.06em, color `--neutral-200`

### Stat Cards
- bg: `--neutral-800`, border: 1px `--neutral-700`, radius: `--radius-lg`
- Left accent bar: 3px wide, bg `--grad-primary`
- Value: Exo 2, 36px, weight 800, text uses `--grad-light` as gradient clip
- Label: DM Sans, 13px, `--neutral-400`

---

## MOTION

### Transitions
- Micro: `150ms ease`
- Default: `200ms ease`
- Smooth: `300ms ease`
- Spring (hover lift): `300ms cubic-bezier(0.34, 1.56, 0.64, 1)`
- Entrance: `400ms ease-out`

### Hover Lift (interactive cards)
```
transform: translateY(-8px) scale(1.02);
border-color: --primary-mid;
box-shadow: --shadow-lg + 0 0 30px rgba(58,110,255,0.2);
transition: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Glow Pulse (accent indicators)
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(0,229,255,0.3); }
  50%       { box-shadow: 0 0 30px rgba(0,229,255,0.7); }
}
animation: pulse-glow 2s ease-in-out infinite;
```

### Skeleton Shimmer (loading state)
```css
background: linear-gradient(90deg, #1C2B50 25%, #2E4070 50%, #1C2B50 75%);
background-size: 200% 100%;
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
animation: shimmer 1.5s infinite;
```

---

## LOGO USAGE

Three vertical bars, center taller than sides. Rounded corners. Blue-to-navy gradient on outer bars, cyan-to-blue gradient on center bar with circuit board detail overlay. Use simplified flat version (no circuit detail) at sizes below 32px.

---

## DARK MODE ONLY

This design system is dark-first. Do not apply on white/light backgrounds. For light contexts, use `--neutral-50: #F4F6FB` as background with `--primary-core` text and accents only.