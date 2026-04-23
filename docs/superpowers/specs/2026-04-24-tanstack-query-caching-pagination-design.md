# TanStack Query Caching + Pagination

**Date:** 2026-04-24
**Status:** Approved

## Problem

All data-fetching hooks (`use-incidents`, `use-kb`, `use-tech-specs`, `use-rules`) use raw `useState` + `useEffect` + `fetch`. Every page navigation triggers a full refetch with a loading spinner, even for data the user just viewed seconds ago. Additionally, the API layer supports pagination parameters (`page`, `page_size`) and returns `PaginatedResponse<T>`, but there is no pagination UI — all list pages render the first page only with no controls.

## Solution

1. Adopt **TanStack Query v5** as the client-side caching layer.
2. Add a shared **Pagination** UI component.
3. Wire pagination controls into all list pages.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Caching library | TanStack Query v5 | Native mutation/query coupling, cache invalidation, stale-while-revalidate. SWR lacks built-in mutation tracking needed for 4 CRUD resource types. |
| Pagination style | Classic numbered (`< 1 2 ... N >`) + page size selector | Enterprise standard, maps directly to existing `PaginatedResponse` contract. |
| Stale time | 2 minutes | Balanced freshness vs. API load. Mutations always invalidate immediately. |
| Garbage collection time | 5 minutes | Keeps inactive cache entries around slightly longer than stale time so back-navigation stays instant. |

---

## 1. Dependencies

Install `@tanstack/react-query` v5. No other new packages.

## 2. Query Provider

Add a `QueryClientProvider` in the dashboard layout (`app/(dashboard)/layout.tsx`). The provider wraps the existing layout content.

**Default options:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,       // 2 min
      gcTime: 5 * 60 * 1000,           // 5 min
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
```

The `QueryClient` instance must be created outside the component (module-level) or inside a `useRef`/`useState` to avoid re-creation on re-renders.

## 3. Query Key Convention

Structured keys enabling precise invalidation:

| Resource | List key | Detail key |
|----------|----------|------------|
| Incidents | `["incidents", filters]` | `["incidents", id]` |
| KB Articles | `["kb", filters]` | `["kb", id]` |
| Tech Specs | `["tech-specs", filters]` | `["tech-specs", id]` |
| Rules | `["rules", filters]` | `["rules", id]` |
| Services | `["services"]` | N/A |
| Teams | `["teams"]` | N/A |

**Invalidation rule:** mutations (create, update, delete) call `queryClient.invalidateQueries({ queryKey: ["<resource>"] })`, which invalidates all queries starting with that key prefix — both lists (regardless of filters) and individual items.

Services and teams are reference data and use a longer stale time (10 min) since they rarely change.

## 4. Hook Refactor

Replace all 4 resource hook files to use `useQuery` and `useMutation` from TanStack Query. The existing API functions in `lib/api/*` become `queryFn` / `mutationFn` with zero changes.

### Pattern (incidents as example, identical for kb, tech-specs, rules):

```typescript
export function useIncidents(filters?: IncidentFilters) {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: () => getIncidents(filters),
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ["incidents", id],
    queryFn: () => getIncident(id),
  });
}

export function useIncidentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["incidents"] });

  const create = useMutation({
    mutationFn: (data: IncidentFormData) => createIncident(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IncidentFormData }) =>
      updateIncident(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
```

**Return value mapping:** `useQuery` returns `{ data, isLoading, error, refetch }` which matches the current hook signatures. Consuming components need minimal changes — the main difference is `error` becomes an `Error` object instead of a `string`, so error rendering adjusts to `error.message`.

### Hooks NOT changed:

- `use-ask.ts` — RAG queries are not cacheable (unique per query, no pagination). Stays as manual `useState` + `fetch`.
- `use-auth.ts` — Supabase auth state, unrelated.

## 5. Pagination Component

New shared component: `components/ui/Pagination.tsx`

### Props

```typescript
interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
```

### Renders

- **"Showing X-Y of Z"** summary text (left side)
- **Page size selector** dropdown using `PAGE_SIZE_OPTIONS` from constants (right side)
- **Previous / Next** buttons, disabled at boundaries
- **Numbered page buttons** with ellipsis for large ranges: `1 2 ... 5 [6] 7 ... 20`
  - Always show first and last page
  - Show 1 sibling on each side of the current page
  - Ellipsis when gap > 1

### Styling

Uses existing shadcn `Button` component with `variant="outline"` and `size="sm"`. Active page uses `variant="default"`. Consistent with the app's design language — no new CSS or custom styled components.

## 6. List Page Integration

Each list page (`/incidents`, `/kb`, `/tech-specs`, `/settings/rules`):

1. Adds `page` and `pageSize` to its filter state (defaulting to `1` and `DEFAULT_PAGE_SIZE`)
2. Passes them into the hook (which includes them in the query key)
3. Renders the `Pagination` component below the table/cards
4. `onPageChange` updates the page filter; `onPageSizeChange` resets page to 1 and updates page size

Because TanStack Query caches by query key (which includes filters + page), navigating back to a previously viewed page is instant — no loading spinner, no refetch (until stale time expires).

## 7. Files Changed

| File | Change type |
|------|-------------|
| `package.json` | Add `@tanstack/react-query` dependency |
| `app/(dashboard)/layout.tsx` | Wrap with `QueryClientProvider` |
| `hooks/use-incidents.ts` | Rewrite to TanStack Query |
| `hooks/use-kb.ts` | Rewrite to TanStack Query |
| `hooks/use-tech-specs.ts` | Rewrite to TanStack Query |
| `hooks/use-rules.ts` | Rewrite to TanStack Query |
| `components/ui/Pagination.tsx` | New shared component |
| `app/(dashboard)/incidents/page.tsx` | Add pagination state + UI |
| `app/(dashboard)/kb/page.tsx` | Add pagination state + UI |
| `app/(dashboard)/tech-specs/page.tsx` | Add pagination state + UI |
| `app/(dashboard)/settings/rules/page.tsx` | Add pagination state + UI |

### Files NOT changed

- `lib/api/*` — API functions stay as-is, they become `queryFn`s directly
- `lib/types/*` — filter types already have `page` and `page_size`
- `lib/constants.ts` — already has `DEFAULT_PAGE_SIZE` and `PAGE_SIZE_OPTIONS`
- `hooks/use-ask.ts` — RAG queries are not cacheable
- `hooks/use-auth.ts` — unrelated

## 8. Migration Notes

- Consuming components that read `error` as a string need to adjust to `error.message` (TanStack Query wraps errors as `Error` objects)
- The `useMutation` return shape differs from current hooks: instead of `{ create, update, remove, isLoading, error }`, each mutation is its own object with `.mutateAsync()`, `.isPending`, `.error`. Consuming components adjust accordingly.
- `refetch` is still available from `useQuery` for manual refresh scenarios.
