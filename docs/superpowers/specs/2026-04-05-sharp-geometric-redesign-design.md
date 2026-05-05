# Sharp Geometric Redesign — Design Spec

**Date:** 2026-04-05
**Status:** Approved

## Summary

Complete visual overhaul of the Incident KB frontend from the current corporate admin aesthetic to a Sharp Geometric direction — grid patterns, bold typography, uppercase mono labels, strong borders, and a technical personality inspired by Vercel/GitHub Copilot. Includes font swap to Space Grotesk + JetBrains Mono, split-screen auth pages, tighter animations, and a `nativeButton` bug fix.

---

## 1. Global Theme

### Colors (dark mode primary)

| Token | Current | New | Notes |
|---|---|---|---|
| `--background` | `oklch(0.13 0.015 260)` (dark slate) | `#09090b` | True black |
| `--card` | `oklch(0.17 0.015 260)` | `#111113` | Charcoal surface |V
| `--border` | `oklch(0.25 0.015 260)` | `#222222` | Sharp, visible |
| `--input` | `oklch(0.25 0.015 260)` | `#0a0a0c` | Sunken black |
| `--primary` | `oklch(0.60 0.19 25)` | `#dc2626` | Sharper red |
| `--primary-foreground` | `oklch(0.98 0 0)` | `#ffffff` | Pure white |
| `--muted-foreground` | `oklch(0.60 0.015 260)` | `#555555` | Neutral gray |
| `--foreground` | `oklch(0.93 0.008 260)` | `#fafafa` | Near-white |
| `--ring` | `oklch(0.60 0.19 25)` | `#dc2626` | Matches primary |
| `--radius` | `0.5rem` | `0.375rem` | Sharper corners (6px) |

Light mode: derive from the same palette — white background, `#fafafa` cards, `#e5e5e5` borders, same red primary. Keep the structural contrast ratios.

Sidebar tokens follow the same shift: `--sidebar` → `#09090b`, `--sidebar-border` → `#222222`, etc.

### Typography

- **Sans (headings + body):** Space Grotesk via `next/font/google`
  - Headings: weight 700–800, letter-spacing `-0.5px` to `-1.2px`
  - Body: weight 400–500, standard tracking
  - Periods at end of short page headings: "Sign in." / "Dashboard." / "Incidents."
- **Mono (labels + metadata):** JetBrains Mono via `next/font/google`
  - Labels: weight 600, `10–11px`, uppercase, letter-spacing `0.8–1.2px`
  - Metadata/timestamps: weight 400, `11–12px`
- **CSS variables:** `--font-sans` → Space Grotesk, `--font-mono` → JetBrains Mono

### Signature Elements

- **Grid pattern:** CSS `background-image` with thin `rgba(255,255,255,0.03)` lines at `40px` intervals. Used on auth pages and optionally on empty states.
- **Red accent line:** `2px` height `linear-gradient(90deg, #dc2626, transparent)` at top of cards, positioned absolutely with `border-radius: 0 0 2px 2px`.
- **Uppercase mono labels:** All form field labels, category markers, metadata headers rendered in JetBrains Mono uppercase.

---

## 2. Auth Pages (Login + Signup)

### Layout Structure

Full-viewport-height split screen:
- **Left panel (branding):** `flex: 1`, background `#09090b`
- **Right panel (form):** `flex: 1`, background `#111113`, `border-left: 1px solid #222`
- **Mobile (< 768px):** Stacks vertically — branding becomes compact header strip, form below

### Left Panel

- CSS grid pattern overlay (full panel)
- Bottom gradient: `linear-gradient(to top, rgba(220,38,38,0.08), transparent)` covering bottom ~120px
- **Top-left:** Logo — bordered square (`2px solid #dc2626`, `border-radius: 8px`) containing "IK" in red JetBrains Mono 800 + "INCIDENT KB" uppercase mono label in `#888`
- **Bottom-left:** Tagline — "Resolve faster.\nKnow more." in Space Grotesk 700, `~24px`, white. Subtitle below in `#444`, `13px`

### Right Panel

- Form centered vertically, max-width `~380px`, generous padding (`40px`)
- **Heading:** "Sign in." — Space Grotesk 800, `28px`, letter-spacing `-0.8px`
- **Subtitle:** "Access your dashboard" — `#444`, `13px`
- **Fields:** uppercase JetBrains Mono labels ("EMAIL", "PASSWORD"), `10px`, `#555`. Inputs: `#0a0a0c` background, `1px solid #2a2a2e` border, `border-radius: 8px`
- **Submit:** `background: #dc2626`, `border-radius: 8px`, uppercase "SIGN IN", Space Grotesk 700
- **Footer:** "Don't have an account? Sign up" — `#555` text, red link

### Signup Page

Same split layout. Heading: "Create account." Adds "CONFIRM PASSWORD" field. Success/confirmation state renders in the right panel.

---

## 3. App Shell

### Sidebar

- Background: `#09090b`
- Border-right: `1px solid #222`
- Logo: same "IK" bordered monogram + "INCIDENT KB" uppercase mono
- Nav items: Space Grotesk 500, `13px`
  - Default: `#888` text, `#555` icons
  - Active: `#111113` background highlight, `#dc2626` icon, red left bar (keep existing `layoutId` spring animation)
- Collapse toggle: icon color change only, no hover background
- Collapsed tooltips: `#111113` background, `1px #222` border

### Navbar

- Background: `rgba(9,9,11,0.8)` with `backdrop-blur-md`
- Border-bottom: `1px solid #222`
- Page title: Space Grotesk 600, standard size
- Right side: theme toggle + user nav inherit new styling

### Dashboard

- Heading: "Dashboard." with period, Space Grotesk 800
- Subtitle: JetBrains Mono, `#555`, `11px`, uppercase
- **Stats cards:** `#111113` bg, `1px #222` border, red accent gradient line at top
  - Numbers: Space Grotesk 800, `28px`
  - Labels: JetBrains Mono uppercase, `11px`
  - Icon containers: bordered square (not filled rounded) with colored border
  - Hover: `border-color` transitions to `rgba(220,38,38,0.25)` — no translate or scale

---

## 4. Bug Fix

### Button `nativeButton` Error

**Problem:** `Button render={<Link>}` in the incidents page triggers Base UI warning: "A component that acts as a button expected a native `<button>` because the `nativeButton` prop is true."

**Fix:** In `components/ui/button.tsx`, detect when `render` prop is passed and forward `nativeButton={false}` to the Base UI `ButtonPrimitive`. This allows non-`<button>` elements (like Next.js `Link`) to be rendered without the warning.

---

## 5. Animation Updates

| Animation | Current | New |
|---|---|---|
| `slideUp` duration | `0.35s` | `0.25s` |
| `slideDown` duration | `0.35s` | `0.25s` |
| `slideInLeft` duration | `0.3s` | `0.2s` |
| `scaleIn` duration | `0.25s` | `0.2s` |
| `staggerChildren` delay | `0.06s` | `0.04s` |
| `delayChildren` | `0.1s` | `0.06s` |
| Card hover | `translate-y` + `scale` + `box-shadow` | `border-color` transition only |
| Auth left panel | none | Grid fade-in `0.4s`, tagline slide-up with stagger |
| Auth right panel | single `opacity+y` | Slide from `x: 20`, `0.1s` delay after left |

**Kept unchanged:**
- Sidebar `layoutId` spring animation (stiffness 350, damping 30)
- `AnimatePresence` for sidebar collapse text
- Framer Motion as the animation library

---

## 6. Files Changed

| File | Change |
|---|---|
| `src/app/globals.css` | Full theme overhaul — colors, radius, light/dark variables |
| `src/app/layout.tsx` | Swap Geist → Space Grotesk + JetBrains Mono |
| `src/app/(auth)/layout.tsx` | Rebuild as split-screen wrapper |
| `src/components/auth/LoginForm.tsx` | Rebuild for right-panel form with new styling |
| `src/components/auth/SignupForm.tsx` | Rebuild for right-panel form with new styling |
| `src/components/ui/button.tsx` | Add `nativeButton={false}` when `render` prop present |
| `src/components/layout/Sidebar.tsx` | Styling updates (colors, typography, hover states) |
| `src/components/layout/Navbar.tsx` | Styling updates |
| `src/app/(dashboard)/page.tsx` | Heading style update (period, mono subtitle) |
| `src/components/dashboard/StatsCards.tsx` | Card styling, icon containers, hover behavior |
| `src/lib/animations.ts` | Tighten durations, remove cardHover scale, add auth variants |
| `package.json` | Add `@fontsource/space-grotesk` if needed (or use `next/font/google`) |

**Not changed:** Incident pages, KB pages, Rules pages, Ask page, Settings page, API layer, hooks, types, mock data. These inherit the new theme via CSS variables automatically.
