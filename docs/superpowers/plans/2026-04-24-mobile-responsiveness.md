# Mobile Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every section of the app usable without horizontal scrolling or layout breakage at 360px minimum width.

**Architecture:** Pure CSS/Tailwind responsive fixes across existing components. One new `useMediaQuery` hook for the AppShell margin animation. No structural changes to component APIs or data flow.

**Tech Stack:** Tailwind CSS responsive utilities, React hooks, Framer Motion

---

### Task 1: Create useMediaQuery hook

**Files:**
- Create: `src/hooks/use-media-query.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// src/hooks/use-media-query.ts
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-media-query.ts
git commit -m "feat: add useMediaQuery hook for responsive viewport detection"
```

---

### Task 2: Fix AppShell margin animation

**Files:**
- Modify: `src/components/layout/AppShell.tsx`

The Framer Motion `animate={{ marginLeft }}` applies on all viewport sizes. On mobile (<768px), the sidebar is `hidden md:block`, but the inline `marginLeft` from the animation still takes effect, pushing content off-screen. The `style={{ marginLeft: undefined }}` override is a hack that doesn't reliably work.

- [ ] **Step 1: Update AppShell to use useMediaQuery**

Replace the entire `AppShell` component in `src/components/layout/AppShell.tsx` with:

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { MobileSidebar } from "./MobileSidebar";
import { useMediaQuery } from "@/hooks/use-media-query";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <TooltipProvider delay={0}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main content */}
        <motion.div
          initial={false}
          animate={{
            marginLeft: isDesktop
              ? sidebarCollapsed
                ? 64
                : 240
              : 0,
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-1 flex-col"
        >
          {/* Mobile header with hamburger */}
          <div className="flex items-center md:hidden">
            <div className="flex h-14 items-center px-2">
              <MobileSidebar />
            </div>
          </div>

          <Navbar />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
```

Key changes:
- Import and use `useMediaQuery("(min-width: 768px)")` to gate the margin animation
- `marginLeft` is `0` when `!isDesktop`
- Removed `className="md:ml-60"` (redundant now, animation handles it)
- Removed `style={{ marginLeft: undefined }}` hack

- [ ] **Step 2: Verify the dev server shows no errors**

Run: `npm run dev` — open at 360px and 1024px width. Sidebar should not push content on mobile.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppShell.tsx
git commit -m "fix: gate sidebar margin animation to desktop viewport only"
```

---

### Task 3: Fix Navbar mobile padding and title truncation

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Update Navbar classes**

In `src/components/layout/Navbar.tsx`, change line 47:

Old:
```tsx
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
```

New:
```tsx
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-6">
```

And change line 49 to add truncation:

Old:
```tsx
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
```

New:
```tsx
        <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "fix: reduce navbar padding on mobile and truncate long titles"
```

---

### Task 4: Make dashboard charts responsive

**Files:**
- Modify: `src/components/dashboard/ChartCards.tsx`

- [ ] **Step 1: Update ChartCards layout**

Replace the content of `src/components/dashboard/ChartCards.tsx` with:

```typescript
"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { SeverityDonutChart } from "@/components/dashboard/SeverityDonutChart";
import { StatusDonutChart } from "@/components/dashboard/StatusDonutChart";
import { VolumeAreaChart } from "@/components/dashboard/VolumeAreaChart";
import type { Incident } from "@/lib/types";

interface ChartCardsProps {
  incidents: Incident[];
}

export function ChartCards({ incidents }: ChartCardsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3 md:h-[210px] md:flex-row"
    >
      <div className="flex gap-3 md:contents">
        <motion.div variants={staggerItem} className="h-[200px] flex-1 md:h-auto">
          <SeverityDonutChart incidents={incidents} />
        </motion.div>
        <motion.div variants={staggerItem} className="h-[200px] flex-1 md:h-auto">
          <StatusDonutChart incidents={incidents} />
        </motion.div>
      </div>
      <motion.div variants={staggerItem} className="h-[200px] md:h-auto md:flex-[1.5]">
        <VolumeAreaChart incidents={incidents} />
      </motion.div>
    </motion.div>
  );
}
```

Key changes:
- Container: `flex flex-col md:h-[210px] md:flex-row` — stacks vertically on mobile, horizontal on desktop
- Two donuts wrapped in a `flex gap-3` div that uses `md:contents` to flatten into the parent flex on desktop
- Each chart gets `h-[200px]` on mobile (own height), `md:h-auto` on desktop (parent controls)
- Volume chart is full-width on mobile, `md:flex-[1.5]` on desktop

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/ChartCards.tsx
git commit -m "fix: stack dashboard charts vertically on mobile"
```

---

### Task 5: Fix IncidentTable progressive column hiding

**Files:**
- Modify: `src/components/incidents/IncidentTable.tsx`

- [ ] **Step 1: Update table header and cells**

In `src/components/incidents/IncidentTable.tsx`, make these changes:

Change the Title `TableHead` (line 62):

Old:
```tsx
            <TableHead className="w-[35%] px-4 py-3">Title</TableHead>
```

New:
```tsx
            <TableHead className="px-4 py-3">Title</TableHead>
```

Change the Created `TableHead` (line 67) to hide on mobile:

Old:
```tsx
            <TableHead className="px-4 py-3 text-right">Created</TableHead>
```

New:
```tsx
            <TableHead className="hidden px-4 py-3 text-right md:table-cell">Created</TableHead>
```

Change the Title `TableCell` (line 81) to add responsive max-width:

Old:
```tsx
              <TableCell className="max-w-0 px-4 py-3.5">
```

New:
```tsx
              <TableCell className="max-w-0 px-4 py-3.5 sm:max-w-none">
```

Change the Created `TableCell` (line 118) to hide on mobile:

Old:
```tsx
              <TableCell className="px-4 py-3.5 text-right text-sm text-muted-foreground whitespace-nowrap">
```

New:
```tsx
              <TableCell className="hidden px-4 py-3.5 text-right text-sm text-muted-foreground whitespace-nowrap md:table-cell">
```

- [ ] **Step 2: Commit**

```bash
git add src/components/incidents/IncidentTable.tsx
git commit -m "fix: hide timestamp column on mobile, remove fixed title width"
```

---

### Task 6: Fix IncidentFilters responsive layout

**Files:**
- Modify: `src/components/incidents/IncidentFilters.tsx`

- [ ] **Step 1: Update filter container and search input**

In `src/components/incidents/IncidentFilters.tsx`, change the outer container (line 72):

Old:
```tsx
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
```

New:
```tsx
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:min-w-[200px] sm:max-w-sm sm:flex-1">
```

- [ ] **Step 2: Commit**

```bash
git add src/components/incidents/IncidentFilters.tsx
git commit -m "fix: stack incident filters vertically on mobile"
```

---

### Task 7: Fix ArticleFilters and SpecFilters select widths

**Files:**
- Modify: `src/components/kb/ArticleFilters.tsx`
- Modify: `src/components/tech-specs/SpecFilters.tsx`

- [ ] **Step 1: Update ArticleFilters select triggers**

In `src/components/kb/ArticleFilters.tsx`, change the selects wrapper (line 77):

Old:
```tsx
      <div className="flex items-center gap-2">
```

New:
```tsx
      <div className="flex flex-wrap items-center gap-2">
```

Change the category SelectTrigger (line 87):

Old:
```tsx
          <SelectTrigger className="w-[160px]">
```

New:
```tsx
          <SelectTrigger className="w-full sm:w-[160px]">
```

Change the status SelectTrigger (line 107):

Old:
```tsx
          <SelectTrigger className="w-[140px]">
```

New:
```tsx
          <SelectTrigger className="w-full sm:w-[140px]">
```

- [ ] **Step 2: Update SpecFilters select triggers**

In `src/components/tech-specs/SpecFilters.tsx`, make the same changes:

Change the selects wrapper (line 78):

Old:
```tsx
      <div className="flex items-center gap-2">
```

New:
```tsx
      <div className="flex flex-wrap items-center gap-2">
```

Change the category SelectTrigger (line 88):

Old:
```tsx
          <SelectTrigger className="w-[160px]">
```

New:
```tsx
          <SelectTrigger className="w-full sm:w-[160px]">
```

Change the status SelectTrigger (line 108):

Old:
```tsx
          <SelectTrigger className="w-[140px]">
```

New:
```tsx
          <SelectTrigger className="w-full sm:w-[140px]">
```

- [ ] **Step 3: Commit**

```bash
git add src/components/kb/ArticleFilters.tsx src/components/tech-specs/SpecFilters.tsx
git commit -m "fix: make filter selects full-width on mobile"
```

---

### Task 8: Add sm breakpoint to card grids (KB & Tech Specs lists)

**Files:**
- Modify: `src/app/(dashboard)/kb/page.tsx`
- Modify: `src/app/(dashboard)/tech-specs/page.tsx`

- [ ] **Step 1: Update KB list grid**

In `src/app/(dashboard)/kb/page.tsx`, change the grid container (line 117):

Old:
```tsx
                className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
```

New:
```tsx
                className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
```

- [ ] **Step 2: Update Tech Specs list grid**

In `src/app/(dashboard)/tech-specs/page.tsx`, change the grid container (line 112):

Old:
```tsx
                className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
```

New:
```tsx
                className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/kb/page.tsx src/app/\(dashboard\)/tech-specs/page.tsx
git commit -m "fix: add sm:grid-cols-2 breakpoint to card grids"
```

---

### Task 9: Add sidebar reorder on detail pages

**Files:**
- Modify: `src/app/(dashboard)/kb/[id]/page.tsx`
- Modify: `src/app/(dashboard)/tech-specs/[id]/page.tsx`
- Modify: `src/app/(dashboard)/incidents/[id]/page.tsx`

On mobile, the metadata sidebar currently appears below the content (default grid flow). Reorder it above the content so users see category/status/tags before scrolling through a long markdown body.

- [ ] **Step 1: Update KB detail page sidebar ordering**

In `src/app/(dashboard)/kb/[id]/page.tsx`, change the sidebar div (line 168):

Old:
```tsx
        <div className="space-y-4">
```

New:
```tsx
        <div className="order-first space-y-4 lg:order-last">
```

- [ ] **Step 2: Update Tech Specs detail page sidebar ordering**

In `src/app/(dashboard)/tech-specs/[id]/page.tsx`, change the sidebar div (line 168):

Old:
```tsx
        <div className="space-y-4">
```

New:
```tsx
        <div className="order-first space-y-4 lg:order-last">
```

- [ ] **Step 3: Update Incident detail page sidebar ordering**

In `src/app/(dashboard)/incidents/[id]/page.tsx`, change the sidebar div (line 200):

Old:
```tsx
        <div className="space-y-6">
```

New:
```tsx
        <div className="order-first space-y-6 lg:order-last">
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/kb/\[id\]/page.tsx src/app/\(dashboard\)/tech-specs/\[id\]/page.tsx src/app/\(dashboard\)/incidents/\[id\]/page.tsx
git commit -m "fix: show metadata sidebar above content on mobile detail pages"
```

---

### Task 10: Fix Settings page table overflow

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Add overflow wrapper and hide description on mobile**

In `src/app/(dashboard)/settings/page.tsx`, update the Service Catalog table. Change line 85:

Old:
```tsx
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {service.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
```

New:
```tsx
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {service.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
```

Do the same for the Teams table. Change line 120:

Old:
```tsx
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {team.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
```

New:
```tsx
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {team.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/settings/page.tsx
git commit -m "fix: hide description columns on mobile and add overflow wrapper to settings tables"
```

---

### Task 11: Simplify Pagination on mobile

**Files:**
- Modify: `src/components/ui/Pagination.tsx`

- [ ] **Step 1: Add mobile-simplified pagination**

In `src/components/ui/Pagination.tsx`, replace the page buttons section (lines 77-119) with a dual-render that shows full buttons on `sm:` and simplified on mobile:

Old:
```tsx
      {/* Right: page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                className="h-8 w-8 p-0"
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
```

New:
```tsx
      {/* Right: page buttons */}
      {totalPages > 1 && (
        <>
          {/* Mobile: simplified prev/next */}
          <div className="flex items-center gap-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 px-3"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 px-3"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {/* Desktop: full page buttons */}
          <div className="hidden items-center gap-1 sm:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageNumbers.map((p, i) =>
              p === "ellipsis" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  className="h-8 w-8 p-0"
                >
                  {p}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Pagination.tsx
git commit -m "fix: show simplified prev/next pagination on mobile"
```

---

### Task 12: Fix SourceCard and SourceTypeToggle on mobile

**Files:**
- Modify: `src/components/ask/SourceCard.tsx`
- Modify: `src/components/ask/SourceTypeToggle.tsx`

- [ ] **Step 1: Fix SourceCard width constraints**

In `src/components/ask/SourceCard.tsx`, change the card container (line 54):

Old:
```tsx
            "group inline-flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200",
```

New:
```tsx
            "group flex w-full items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200",
```

Change the title span (line 64):

Old:
```tsx
          <span className="text-sm font-medium text-foreground truncate max-w-[240px]">
```

New:
```tsx
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
```

- [ ] **Step 2: Fix SourceTypeToggle wrapping**

In `src/components/ask/SourceTypeToggle.tsx`, change the container (line 22):

Old:
```tsx
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-1">
```

New:
```tsx
    <div className="inline-flex flex-wrap items-center gap-0.5 rounded-lg bg-muted p-1">
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ask/SourceCard.tsx src/components/ask/SourceTypeToggle.tsx
git commit -m "fix: make source cards full-width and toggle buttons wrap on mobile"
```

---

### Task 13: Final verification

- [ ] **Step 1: Run type-check**

Run: `npm run type-check`
Expected: No TypeScript errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Manual spot-check at 360px**

Open `npm run dev` in the browser. Use devtools to set viewport to 360px width. Check each page:
- Dashboard: charts stack (donuts side-by-side, area below), stats cards stack
- Incidents list: table shows Title + Severity + Status only, no horizontal scroll
- KB list: cards are single column, filters stack vertically
- Tech Specs list: same as KB
- Incident detail: metadata sidebar appears above content
- KB detail: sidebar above content
- Tech Spec detail: sidebar above content
- Settings: description columns hidden, no overflow
- Ask page: source cards full-width, toggle wraps
- Pagination: shows Prev / 1 of N / Next

- [ ] **Step 5: Commit any fixes from spot-check if needed**

```bash
git add -A
git commit -m "fix: address mobile responsiveness spot-check issues"
```
