# TanStack Query Caching + Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw useState/useEffect data fetching with TanStack Query v5 for caching and add numbered pagination UI to all list pages.

**Architecture:** Install TanStack Query, add QueryClientProvider to the dashboard layout, rewrite 4 hook files to use useQuery/useMutation, create a shared Pagination component, and wire pagination controls into 4 list pages. The existing API layer (`lib/api/*`) stays untouched — those functions become `queryFn`/`mutationFn` directly.

**Tech Stack:** @tanstack/react-query v5, existing shadcn Button component for pagination UI.

**Spec:** `docs/superpowers/specs/2026-04-24-tanstack-query-caching-pagination-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add `@tanstack/react-query` dependency |
| `src/lib/query-client.ts` | Create | QueryClient singleton with default options |
| `src/components/providers/QueryProvider.tsx` | Create | Client component wrapping QueryClientProvider |
| `src/app/(dashboard)/layout.tsx` | Modify | Wrap children with QueryProvider |
| `src/hooks/use-incidents.ts` | Rewrite | TanStack Query hooks, same external API |
| `src/hooks/use-kb.ts` | Rewrite | TanStack Query hooks, same external API |
| `src/hooks/use-tech-specs.ts` | Rewrite | TanStack Query hooks, same external API |
| `src/hooks/use-rules.ts` | Rewrite | TanStack Query hooks, same external API |
| `src/components/ui/Pagination.tsx` | Create | Shared pagination component |
| `src/app/(dashboard)/incidents/page.tsx` | Modify | Add pagination state + Pagination component |
| `src/app/(dashboard)/kb/page.tsx` | Modify | Add pagination state + Pagination component |
| `src/app/(dashboard)/tech-specs/page.tsx` | Modify | Add pagination state + Pagination component |
| `src/app/(dashboard)/settings/rules/page.tsx` | Modify | Add pagination state + Pagination component, remove manual refetch |

### Files NOT changed

- `src/lib/api/*` — API functions stay as-is
- `src/lib/types/*` — filter types already have `page` and `page_size`
- `src/lib/constants.ts` — already has `DEFAULT_PAGE_SIZE` and `PAGE_SIZE_OPTIONS`
- `src/hooks/use-ask.ts` — RAG queries are not cacheable
- `src/hooks/use-auth.ts` — Supabase auth, unrelated
- All incident/kb/tech-spec detail, edit, and new pages — their mutation calling patterns (`await create(data)`, `await update(id, data)`, `await remove(id)`) are preserved by the hook wrappers

---

## Task 1: Install TanStack Query and create QueryClient

**Files:**
- Modify: `package.json`
- Create: `src/lib/query-client.ts`
- Create: `src/components/providers/QueryProvider.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Install @tanstack/react-query**

```bash
npm install @tanstack/react-query
```

- [ ] **Step 2: Create the QueryClient singleton**

Create `src/lib/query-client.ts`:

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
```

- [ ] **Step 3: Create the QueryProvider client component**

Create `src/components/providers/QueryProvider.tsx`:

```tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 4: Wrap dashboard layout with QueryProvider**

Modify `src/app/(dashboard)/layout.tsx` from:

```tsx
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

to:

```tsx
import { AppShell } from "@/components/layout/AppShell";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  );
}
```

- [ ] **Step 5: Verify the app still builds**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/query-client.ts src/components/providers/QueryProvider.tsx src/app/\(dashboard\)/layout.tsx
git commit -m "feat: add TanStack Query provider and QueryClient config"
```

---

## Task 2: Rewrite use-incidents hook

**Files:**
- Rewrite: `src/hooks/use-incidents.ts`

The hook must preserve the same external API so that consuming components (`incidents/page.tsx`, `incidents/new/page.tsx`, `incidents/[id]/page.tsx`, `incidents/[id]/edit/page.tsx`, `(dashboard)/page.tsx`) require zero changes.

Current consumer patterns to preserve:
- `useIncidents(filters)` returns `{ data, isLoading, error, refetch }` where `data` is `PaginatedResponse<Incident> | null` and `error` is `string | null`
- `useIncident(id)` returns `{ data, isLoading, error }` where `data` is `Incident | null` and `error` is `string | null`
- `useIncidentMutations()` returns `{ create, update, remove, isLoading, error }` where:
  - `create(data: IncidentFormData)` returns `Promise<Incident>`
  - `update(id: string, data: IncidentFormData)` returns `Promise<Incident>`
  - `remove(id: string)` returns `Promise<void>`

- [ ] **Step 1: Rewrite use-incidents.ts**

Replace `src/hooks/use-incidents.ts` with:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Incident,
  IncidentFilters,
  IncidentFormData,
  PaginatedResponse,
} from "@/lib/types";
import {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
} from "@/lib/api/incidents";

export function useIncidents(filters?: IncidentFilters) {
  const query = useQuery<PaginatedResponse<Incident>>({
    queryKey: ["incidents", filters],
    queryFn: () => getIncidents(filters),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch incidents" : null,
    refetch: query.refetch,
  };
}

export function useIncident(id: string) {
  const query = useQuery<Incident>({
    queryKey: ["incidents", id],
    queryFn: () => getIncident(id),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch incident" : null,
  };
}

export function useIncidentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["incidents"] });

  const createMutation = useMutation({
    mutationFn: (data: IncidentFormData) => createIncident(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IncidentFormData }) =>
      updateIncident(id, data),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: invalidate,
  });

  return {
    create: (data: IncidentFormData) => createMutation.mutateAsync(data),
    update: (id: string, data: IncidentFormData) =>
      updateMutation.mutateAsync({ id, data }),
    remove: (id: string) => removeMutation.mutateAsync(id),
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending,
    error:
      createMutation.error?.message ??
      updateMutation.error?.message ??
      removeMutation.error?.message ??
      null,
  };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds. All incident pages still compile without changes.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-incidents.ts
git commit -m "feat: rewrite use-incidents hook with TanStack Query"
```

---

## Task 3: Rewrite use-kb hook

**Files:**
- Rewrite: `src/hooks/use-kb.ts`

Same pattern as incidents. Consumer patterns to preserve:
- `useKbArticles(filters)` returns `{ data, isLoading, error, refetch }`
- `useKbArticle(id)` returns `{ data, isLoading, error }`
- `useKbArticleMutations()` returns `{ create, update, remove, isLoading, error }` where:
  - `create(data: KbArticleFormData)` returns `Promise<KbArticle>`
  - `update(id: string, data: KbArticleFormData)` returns `Promise<KbArticle>`
  - `remove(id: string)` returns `Promise<void>`

- [ ] **Step 1: Rewrite use-kb.ts**

Replace `src/hooks/use-kb.ts` with:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  KbArticle,
  KbArticleFilters,
  KbArticleFormData,
  PaginatedResponse,
} from "@/lib/types";
import {
  getKbArticles,
  getKbArticle,
  createKbArticle,
  updateKbArticle,
  deleteKbArticle,
} from "@/lib/api/kb";

export function useKbArticles(filters?: KbArticleFilters) {
  const query = useQuery<PaginatedResponse<KbArticle>>({
    queryKey: ["kb", filters],
    queryFn: () => getKbArticles(filters),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch KB articles" : null,
    refetch: query.refetch,
  };
}

export function useKbArticle(id: string) {
  const query = useQuery<KbArticle>({
    queryKey: ["kb", id],
    queryFn: () => getKbArticle(id),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch KB article" : null,
  };
}

export function useKbArticleMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["kb"] });

  const createMutation = useMutation({
    mutationFn: (data: KbArticleFormData) => createKbArticle(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: KbArticleFormData }) =>
      updateKbArticle(id, data),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteKbArticle(id),
    onSuccess: invalidate,
  });

  return {
    create: (data: KbArticleFormData) => createMutation.mutateAsync(data),
    update: (id: string, data: KbArticleFormData) =>
      updateMutation.mutateAsync({ id, data }),
    remove: (id: string) => removeMutation.mutateAsync(id),
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending,
    error:
      createMutation.error?.message ??
      updateMutation.error?.message ??
      removeMutation.error?.message ??
      null,
  };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds. All KB pages still compile without changes.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-kb.ts
git commit -m "feat: rewrite use-kb hook with TanStack Query"
```

---

## Task 4: Rewrite use-tech-specs hook

**Files:**
- Rewrite: `src/hooks/use-tech-specs.ts`

Same pattern. Consumer patterns to preserve:
- `useTechSpecs(filters)` returns `{ data, isLoading, error, refetch }`
- `useTechSpec(id)` returns `{ data, isLoading, error }`
- `useTechSpecMutations()` returns `{ create, update, remove, isLoading, error }` where:
  - `create(data: TechSpecFormData)` returns `Promise<TechSpec>`
  - `update(id: string, data: TechSpecFormData)` returns `Promise<TechSpec>`
  - `remove(id: string)` returns `Promise<void>`

- [ ] **Step 1: Rewrite use-tech-specs.ts**

Replace `src/hooks/use-tech-specs.ts` with:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TechSpec,
  TechSpecFilters,
  TechSpecFormData,
  PaginatedResponse,
} from "@/lib/types";
import {
  getTechSpecs,
  getTechSpec,
  createTechSpec,
  updateTechSpec,
  deleteTechSpec,
} from "@/lib/api/tech-specs";

export function useTechSpecs(filters?: TechSpecFilters) {
  const query = useQuery<PaginatedResponse<TechSpec>>({
    queryKey: ["tech-specs", filters],
    queryFn: () => getTechSpecs(filters),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch tech specs" : null,
    refetch: query.refetch,
  };
}

export function useTechSpec(id: string) {
  const query = useQuery<TechSpec>({
    queryKey: ["tech-specs", id],
    queryFn: () => getTechSpec(id),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch tech spec" : null,
  };
}

export function useTechSpecMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tech-specs"] });

  const createMutation = useMutation({
    mutationFn: (data: TechSpecFormData) => createTechSpec(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TechSpecFormData }) =>
      updateTechSpec(id, data),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteTechSpec(id),
    onSuccess: invalidate,
  });

  return {
    create: (data: TechSpecFormData) => createMutation.mutateAsync(data),
    update: (id: string, data: TechSpecFormData) =>
      updateMutation.mutateAsync({ id, data }),
    remove: (id: string) => removeMutation.mutateAsync(id),
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending,
    error:
      createMutation.error?.message ??
      updateMutation.error?.message ??
      removeMutation.error?.message ??
      null,
  };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds. All tech spec pages still compile without changes.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-tech-specs.ts
git commit -m "feat: rewrite use-tech-specs hook with TanStack Query"
```

---

## Task 5: Rewrite use-rules hook

**Files:**
- Rewrite: `src/hooks/use-rules.ts`
- Modify: `src/app/(dashboard)/settings/rules/new/page.tsx`
- Modify: `src/app/(dashboard)/settings/rules/[id]/edit/page.tsx`

Rules has a `toggle` mutation and 2 consuming pages that destructure `isLoading` from `useRuleMutations()`. The hook wrapper preserves this.

Current consumer patterns:
- `useRules(filters)` returns `{ data, isLoading, error, refetch }`
- `useRule(id)` returns `{ data, isLoading, error }`
- `useRuleMutations()` returns `{ create, update, remove, toggle, isLoading, error }` where:
  - `create(data: RuleFormData)` returns `Promise<Rule>`
  - `update(id: string, data: RuleFormData)` returns `Promise<Rule>`
  - `remove(id: string)` returns `Promise<void>`
  - `toggle(id: string, is_enabled: boolean)` returns `Promise<Rule>`
  - `isLoading` — used by `rules/new/page.tsx` and `rules/[id]/edit/page.tsx` as `isSubmitting`

- [ ] **Step 1: Rewrite use-rules.ts**

Replace `src/hooks/use-rules.ts` with:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Rule, RuleFilters, RuleFormData, PaginatedResponse } from "@/lib/types";
import {
  getRules,
  getRule,
  createRule,
  updateRule,
  deleteRule,
  toggleRule,
} from "@/lib/api/rules";

export function useRules(filters?: RuleFilters) {
  const query = useQuery<PaginatedResponse<Rule>>({
    queryKey: ["rules", filters],
    queryFn: () => getRules(filters),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch rules" : null,
    refetch: query.refetch,
  };
}

export function useRule(id: string) {
  const query = useQuery<Rule>({
    queryKey: ["rules", id],
    queryFn: () => getRule(id),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch rule" : null,
  };
}

export function useRuleMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["rules"] });

  const createMutation = useMutation({
    mutationFn: (data: RuleFormData) => createRule(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RuleFormData }) =>
      updateRule(id, data),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteRule(id),
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_enabled }: { id: string; is_enabled: boolean }) =>
      toggleRule(id, is_enabled),
    onSuccess: invalidate,
  });

  return {
    create: (data: RuleFormData) => createMutation.mutateAsync(data),
    update: (id: string, data: RuleFormData) =>
      updateMutation.mutateAsync({ id, data }),
    remove: (id: string) => removeMutation.mutateAsync(id),
    toggle: (id: string, is_enabled: boolean) =>
      toggleMutation.mutateAsync({ id, is_enabled }),
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      toggleMutation.isPending,
    error:
      createMutation.error?.message ??
      updateMutation.error?.message ??
      removeMutation.error?.message ??
      toggleMutation.error?.message ??
      null,
  };
}
```

- [ ] **Step 2: Update rules/page.tsx — remove manual refetch after toggle**

In `src/app/(dashboard)/settings/rules/page.tsx`, the `handleToggle` function currently calls `refetch()` after toggling. With TanStack Query, the `onSuccess: invalidate` in the hook already triggers a refetch. Remove the manual `refetch()` call.

Change the `handleToggle` function from:

```typescript
  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggle(id, enabled);
      refetch();
    } catch {
      toast.error("Failed to update rule. Please try again.");
    }
  };
```

to:

```typescript
  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggle(id, enabled);
    } catch {
      toast.error("Failed to update rule. Please try again.");
    }
  };
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds. All rules pages still compile. The `isLoading` destructuring in `rules/new/page.tsx` (line 15) and `rules/[id]/edit/page.tsx` (line 17) continues to work because the hook still returns `isLoading`.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/use-rules.ts src/app/\(dashboard\)/settings/rules/page.tsx
git commit -m "feat: rewrite use-rules hook with TanStack Query"
```

---

## Task 6: Create Pagination component

**Files:**
- Create: `src/components/ui/Pagination.tsx`

- [ ] **Step 1: Create the Pagination component**

Create `src/components/ui/Pagination.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: summary + page size */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing {start}-{end} of {total}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

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
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds. Component compiles without errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Pagination.tsx
git commit -m "feat: add shared Pagination component"
```

---

## Task 7: Add pagination to incidents list page

**Files:**
- Modify: `src/app/(dashboard)/incidents/page.tsx`

- [ ] **Step 1: Add pagination state and Pagination component**

Replace `src/app/(dashboard)/incidents/page.tsx` with:

```tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { Pagination } from "@/components/ui/Pagination";
import { useIncidents } from "@/hooks/use-incidents";
import { slideUp } from "@/lib/animations";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { IncidentFilters as IncidentFiltersType } from "@/lib/types";

export default function IncidentsPage() {
  const [filters, setFilters] = useState<IncidentFiltersType>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const stableFilters = useMemo(
    () => ({ ...filters, page, page_size: pageSize }),
    [filters, page, pageSize],
  );
  const { data, isLoading, error, refetch } = useIncidents(stableFilters);

  const incidents = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleFiltersChange = (newFilters: IncidentFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Incidents</h1>
            <p className="text-sm text-muted-foreground">
              {total} incident{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button render={<Link href="/incidents/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Incident
        </Button>
      </div>

      {/* Filters */}
      <IncidentFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Table + Pagination */}
      {!isLoading && !error && (
        <>
          <IncidentTable incidents={incidents} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/incidents/page.tsx
git commit -m "feat: add pagination to incidents list page"
```

---

## Task 8: Add pagination to KB list page

**Files:**
- Modify: `src/app/(dashboard)/kb/page.tsx`

- [ ] **Step 1: Add pagination state and Pagination component**

In `src/app/(dashboard)/kb/page.tsx`, make these changes:

1. Add imports for `Pagination` and `DEFAULT_PAGE_SIZE`:

```typescript
import { Pagination } from "@/components/ui/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
```

2. Add pagination state after the existing `filters` state:

```typescript
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
```

3. Include pagination in the `apiFilters` memo — add `page` and `pageSize` to the dependency array and set them in the filter object. Change the `useMemo` to:

```typescript
const apiFilters = useMemo<KbArticleFilters>(() => {
  const f: KbArticleFilters = { page, page_size: pageSize };

  if (activeTab === "published") {
    f.status = ["published"];
  } else if (activeTab === "drafts") {
    f.status = ["draft"];
  }

  if (filters.status !== "all") {
    f.status = [filters.status as KbArticleStatus];
  }

  if (filters.category !== "all") {
    f.category = [filters.category as KbArticleCategory];
  }

  if (filters.search) {
    f.search = filters.search;
  }

  return f;
}, [activeTab, filters, page, pageSize]);
```

4. Reset page to 1 when tab or filters change. Wrap the `setActiveTab` and `setFilters` calls. Change the `Tabs` `onValueChange` to:

```typescript
onValueChange={(val) => { setActiveTab(val); setPage(1); }}
```

And change `ArticleFilters onFiltersChange` to:

```typescript
onFiltersChange={(f) => { setFilters(f); setPage(1); }}
```

5. Add the `Pagination` component after the articles grid, inside the `TabsContent`, after the empty state. Add it right before the closing `</TabsContent>` tag, inside a fragment wrapping the existing content. The full `TabsContent` section becomes:

```tsx
<TabsContent value={activeTab}>
  {isLoading ? (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ) : error ? (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm text-destructive">{error}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => refetch()}
      >
        Retry
      </Button>
    </div>
  ) : articles.length > 0 ? (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {articles.map((article) => (
          <motion.div key={article.id} variants={staggerItem}>
            <ArticleCard article={article} />
          </motion.div>
        ))}
      </motion.div>
      <div className="mt-6">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data?.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>
    </>
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12 flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {activeTab === "drafts" ? (
          <FileText className="h-8 w-8 text-muted-foreground" />
        ) : (
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-medium text-foreground">
        No articles found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {filters.search || filters.category !== "all" || filters.status !== "all"
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Get started by creating your first knowledge base article."}
      </p>
      {!filters.search && filters.category === "all" && filters.status === "all" && (
        <Button className="mt-4" render={<Link href="/kb/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Article
        </Button>
      )}
    </motion.div>
  )}
</TabsContent>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/kb/page.tsx
git commit -m "feat: add pagination to KB list page"
```

---

## Task 9: Add pagination to tech specs list page

**Files:**
- Modify: `src/app/(dashboard)/tech-specs/page.tsx`

- [ ] **Step 1: Add pagination state and Pagination component**

In `src/app/(dashboard)/tech-specs/page.tsx`, make the same changes as the KB page:

1. Add imports:

```typescript
import { Pagination } from "@/components/ui/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
```

2. Add pagination state after `filters`:

```typescript
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
```

3. Include pagination in the `apiFilters` memo:

```typescript
const apiFilters = useMemo<TechSpecFilters>(() => {
  const f: TechSpecFilters = { page, page_size: pageSize };

  if (activeTab === "published") {
    f.status = ["published"];
  } else if (activeTab === "drafts") {
    f.status = ["draft"];
  }

  if (filters.status !== "all") {
    f.status = [filters.status as "draft" | "published" | "archived"];
  }

  if (filters.category !== "all") {
    f.category = [filters.category as TechSpecCategory];
  }

  if (filters.search) {
    f.search = filters.search;
  }

  return f;
}, [activeTab, filters, page, pageSize]);
```

4. Reset page on tab/filter change. Change `Tabs onValueChange` to:

```typescript
onValueChange={(val) => { setActiveTab(val); setPage(1); }}
```

Change `SpecFilters onFiltersChange` to:

```typescript
onFiltersChange={(f) => { setFilters(f); setPage(1); }}
```

5. Add `Pagination` after the specs grid. Replace the `TabsContent` section with:

```tsx
<TabsContent value={activeTab}>
  {isLoading ? (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ) : error ? (
    <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-destructive">{error}</p>
      <Button className="mt-4" variant="outline" onClick={refetch}>
        Retry
      </Button>
    </div>
  ) : specs.length > 0 ? (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {specs.map((spec) => (
          <motion.div key={spec.id} variants={staggerItem}>
            <SpecCard spec={spec} />
          </motion.div>
        ))}
      </motion.div>
      <div className="mt-6">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data?.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>
    </>
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12 flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {activeTab === "drafts" ? (
          <FileText className="h-8 w-8 text-muted-foreground" />
        ) : (
          <FileCode className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-medium text-foreground">
        No specs found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {filters.search || filters.category !== "all" || filters.status !== "all"
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Get started by creating your first technical specification."}
      </p>
      {!filters.search && filters.category === "all" && filters.status === "all" && (
        <Button className="mt-4" render={<Link href="/tech-specs/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Spec
        </Button>
      )}
    </motion.div>
  )}
</TabsContent>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/tech-specs/page.tsx
git commit -m "feat: add pagination to tech specs list page"
```

---

## Task 10: Add pagination to rules list page

**Files:**
- Modify: `src/app/(dashboard)/settings/rules/page.tsx`

- [ ] **Step 1: Add pagination state and Pagination component**

In `src/app/(dashboard)/settings/rules/page.tsx`, make these changes:

1. Add imports:

```typescript
import { Pagination } from "@/components/ui/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
```

2. Add pagination state after `activeTab`:

```typescript
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
```

3. Include pagination in the `filters` memo:

```typescript
const filters = useMemo<RuleFilters | undefined>(() => {
  const f: RuleFilters = { page, page_size: pageSize };
  if (activeTab === "rag_behavior") f.category = ["rag_behavior"];
  if (activeTab === "agent_guardrail") f.category = ["agent_guardrail"];
  return f;
}, [activeTab, page, pageSize]);
```

4. Reset page on tab change. Change `Tabs onValueChange` to:

```typescript
onValueChange={(val) => { if (val) { setActiveTab(val as FilterTab); setPage(1); } }}
```

5. Add `Pagination` after the rules list. Inside the `TabsContent`, after the rules map, add:

```tsx
{rules.length > 0 && (
  <div className="mt-6">
    <Pagination
      page={page}
      pageSize={pageSize}
      total={data?.total ?? 0}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
    />
  </div>
)}
```

The full `TabsContent` becomes:

```tsx
<TabsContent value={activeTab}>
  <motion.div
    key={activeTab}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
    className="space-y-3 mt-4"
  >
    {rules.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShieldCheck className="size-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          No rules found in this category.
        </p>
      </div>
    ) : (
      <>
        {rules.map((rule) => (
          <RuleCard key={rule.id} rule={rule} onToggle={handleToggle} />
        ))}
        <div className="mt-6">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data?.total ?? 0}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        </div>
      </>
    )}
  </motion.div>
</TabsContent>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/settings/rules/page.tsx
git commit -m "feat: add pagination to rules list page"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run type check**

```bash
npm run type-check
```

Expected: no TypeScript errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no lint errors.

- [ ] **Step 3: Run full build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Manual smoke test**

```bash
npm run dev
```

Test in browser:
1. Navigate to `/incidents` — should see pagination controls below the table
2. Click page 2 — data updates, page button highlights
3. Navigate to `/kb` — should see pagination controls
4. Navigate back to `/incidents` — should load instantly from cache (no spinner)
5. Create a new incident — after redirect, the incidents list should show the new item (cache invalidated)
6. Change page size dropdown — should reset to page 1 and update results
