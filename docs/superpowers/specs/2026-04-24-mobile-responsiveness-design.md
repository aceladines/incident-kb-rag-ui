# Mobile Responsiveness — Design Spec

**Date:** 2026-04-24
**Target:** 360px minimum width (covers ~98% of modern devices)
**Strategy:** Hybrid — progressive collapse for tables, stacking for layouts, simplified controls on mobile

---

## Scope

Every section of the app must be usable without horizontal scrolling or layout breakage at 360px. This spec covers all pages, components, and layout structures.

---

## 1. AppShell & Sidebar

**Problem:** Framer Motion hardcodes `marginLeft: 240px` (or 64px collapsed) on the content wrapper, conflicting with Tailwind's `md:ml-60` responsive class. On mobile (<768px), the sidebar is hidden but the animated margin still applies via inline style.

**Fix:**
- Make the motion `marginLeft` animation conditional on `md:` breakpoint — only animate on desktop. On mobile, margin is always 0.
- Use a `useMediaQuery` or `window.matchMedia` check (768px) to gate the animation.
- Ensure the mobile Sheet sidebar overlay works correctly with no margin on the content area.

---

## 2. Dashboard — Stats & Charts

**Problem:** `ChartCards` uses `flex h-[210px]` with three charts side-by-side. Too cramped on mobile. Stats grid jumps from 1 col to 3 at `sm:`.

**Fix — Charts:**
- Desktop (≥768px): Keep current 3-across flex layout.
- Mobile (<768px): Two donuts side-by-side in a row, area chart full-width below. Use `flex flex-col md:flex-row` on the outer container, and wrap the two donuts in their own `flex` row.
- Remove hardcoded `h-[210px]` on the container — let charts define their own height. Use `h-[180px]` per chart on mobile.

**Fix — Stats:**
- Keep `grid-cols-1 sm:grid-cols-3` — three small stat cards work at 360px when stacked, and 3 across at sm (640px) is fine.

---

## 3. Incident Table — Progressive Collapse

**Problem:** Table has 6 columns. Fixed `w-[35%]` on title. Team and Services columns hidden at `lg:/xl:` but no intermediate hiding for tablets.

**Fix:**
- **Always visible (all sizes):** Title, Severity, Status
- **Hidden below `md:` (768px):** Updated timestamp
- **Hidden below `lg:` (1024px):** Team
- **Hidden below `xl:` (1280px):** Services
- Remove hardcoded `w-[35%]` from title column — use `w-full` or auto sizing.
- Add `truncate` and `max-w-[200px] sm:max-w-none` to title cell to prevent overflow on small screens.

---

## 4. Filter Components (Incidents, KB, Tech Specs)

**Problem:** IncidentFilters uses `min-w-[200px]` on search input and inline dropdowns that overflow on small phones. KB/Tech Spec filters have `w-[160px]` fixed-width select triggers.

**Fix — IncidentFilters:**
- Search input: `w-full` on mobile, `flex-1 min-w-[200px] max-w-sm` on `sm:` and up.
- Filter dropdowns: wrap naturally with `flex flex-wrap gap-2`. Each dropdown trigger should be auto-width, not fixed.
- Layout: `flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center`.

**Fix — ArticleFilters & SpecFilters:**
- Remove fixed `w-[160px]` / `w-[140px]` from select triggers. Use `w-full sm:w-[160px]`.
- Stack search + selects vertically on mobile, row on `sm:`.

---

## 5. Detail Pages (Incidents, KB, Tech Specs)

**Problem:** `lg:grid-cols-[1fr_300px]` sidebar layout. On mobile, sidebar stacks full-width below content, creating a long scroll.

**Fix:**
- Keep `grid-cols-1 lg:grid-cols-[1fr_300px]` — sidebar stacks below on mobile. This is already the behavior.
- On mobile, reorder so metadata sidebar appears **above** the content body using `order-first lg:order-last` on the sidebar div (verify each detail page's grid structure — apply where the sidebar contains scannable metadata like category/tags/status). Users see key metadata at a glance before scrolling into the markdown body.
- Ensure header action buttons (Edit/Delete) use `flex flex-wrap gap-2` so they wrap gracefully on narrow screens.

---

## 6. Card Grids (KB List, Tech Specs List)

**Problem:** Grid jumps from `grid-cols-1` to `md:grid-cols-2` — no `sm:` breakpoint. Tablets at 640-767px show single column when two would fit.

**Fix:**
- Change to `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`.
- Cards already handle their own internal layout well — no changes needed inside cards.

---

## 7. Settings Page Tables

**Problem:** Service catalog and team tables have no responsive column hiding. Horizontal scroll on mobile.

**Fix:**
- Add `overflow-x-auto` wrapper on table containers as a safety net.
- Hide description columns below `md:` using `hidden md:table-cell`.

---

## 8. Pagination

**Problem:** Page number buttons create a long horizontal row. On mobile, this wraps awkwardly.

**Fix:**
- Desktop (≥640px): Show full page number buttons as today.
- Mobile (<640px): Show only Prev/Next buttons with a "3 / 12" page indicator between them. Hide individual page number buttons.
- Use `hidden sm:flex` on the page buttons container, and `flex sm:hidden` on the simplified mobile pagination.

---

## 9. Navbar

**Problem:** Page title has no truncation. `px-6` padding is generous for 360px screens.

**Fix:**
- Add `truncate` to the page title text.
- Change padding to `px-3 sm:px-6`.

---

## 10. Auth Layout

**Problem:** Left branding panel and right form panel split 50/50 even on tablets where the branding panel is wasted space.

**Fix:**
- Already uses `flex-col md:flex-row` — this is fine. The left panel hides on mobile (`hidden md:flex`). No changes needed unless the left panel is showing on mobile — verify and fix if so.

---

## 11. Source Cards (Ask Page)

**Problem:** `max-w-[240px]` on source card title can overflow on very small screens.

**Fix:**
- Change to `max-w-full` and add `truncate` to the title text.
- Source cards should be `w-full` in their container, not inline-flex with fixed constraints.

---

## 12. SourceTypeToggle (Ask Page)

**Fix:**
- Ensure toggle buttons wrap on mobile. Use `flex flex-wrap` on the container.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/AppShell.tsx` | Conditional margin animation based on viewport |
| `src/components/layout/Navbar.tsx` | Truncate title, reduce mobile padding |
| `src/components/dashboard/ChartCards.tsx` | Responsive chart stacking, remove fixed height |
| `src/components/dashboard/SeverityDonutChart.tsx` | Responsive height |
| `src/components/dashboard/StatusDonutChart.tsx` | Responsive height |
| `src/components/dashboard/VolumeAreaChart.tsx` | Responsive height |
| `src/components/incidents/IncidentTable.tsx` | Progressive column hiding, remove fixed width |
| `src/components/incidents/IncidentFilters.tsx` | Responsive filter layout |
| `src/components/kb/ArticleFilters.tsx` | Remove fixed select widths |
| `src/components/tech-specs/SpecFilters.tsx` | Remove fixed select widths |
| `src/components/ask/SourceCard.tsx` | Remove fixed max-width |
| `src/components/ask/SourceTypeToggle.tsx` | Flex wrap |
| `src/app/(dashboard)/page.tsx` | Dashboard chart grid responsive |
| `src/app/(dashboard)/kb/page.tsx` | Add sm:grid-cols-2 |
| `src/app/(dashboard)/tech-specs/page.tsx` | Add sm:grid-cols-2 |
| `src/app/(dashboard)/incidents/[id]/page.tsx` | Sidebar reorder on mobile |
| `src/app/(dashboard)/kb/[id]/page.tsx` | Sidebar reorder on mobile |
| `src/app/(dashboard)/tech-specs/[id]/page.tsx` | Sidebar reorder on mobile |
| `src/app/(dashboard)/settings/page.tsx` | Table overflow + column hiding |
| `src/components/ui/Pagination.tsx` | Simplified mobile pagination |
| `src/hooks/use-media-query.ts` | New hook for viewport detection (AppShell) |

---

## Out of Scope

- Form component internals (already stack vertically, work fine on mobile)
- Rich text editor toolbar (third-party component, would need its own investigation)
- Auth pages (already responsive with `md:flex-row`)
- Rule cards and rule list (already use reasonable flex layouts)
