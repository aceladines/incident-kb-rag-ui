# Incident KB RAG UI — Full Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete frontend application for the Incident Knowledge Base RAG portal — authentication, layout, dashboard, incident CRUD, KB article CRUD, RAG query interface, rules management, and settings.

**Architecture:** Next.js 14 App Router with TypeScript strict mode. Supabase handles authentication (email/password). API layer with mock mode for development. All pages server-rendered where possible, client components for interactive elements. Framer Motion for animations. Red-accented dark/light theme via shadcn/ui CSS variables.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, react-hook-form + zod, framer-motion, next-themes, react-markdown + remark-gfm

---

## Phase 1: Scaffolding & Configuration

### Task 1: Scaffold Next.js and Install Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.local`, `.env.example`, `.prettierrc`, `.prettierignore`, `.editorconfig`, `.nvmrc`, `.gitignore`

- [ ] **Step 1:** Run `npx create-next-app@latest` with TypeScript, Tailwind, ESLint, App Router, src dir
- [ ] **Step 2:** Initialize shadcn/ui with `npx shadcn@latest init`
- [ ] **Step 3:** Install core dependencies: `react-hook-form zod @hookform/resolvers next-themes react-markdown remark-gfm framer-motion @supabase/supabase-js @supabase/ssr`
- [ ] **Step 4:** Install dev dependencies: `prettier prettier-plugin-tailwindcss`
- [ ] **Step 5:** Add shadcn components: button, input, card, badge, dialog, dropdown-menu, select, textarea, form, label, separator, sheet, skeleton, switch, table, tabs, toast, tooltip, avatar, command, popover, scroll-area, sonner
- [ ] **Step 6:** Create `.env.local` and `.env.example` with API URL, mock toggle, Supabase keys
- [ ] **Step 7:** Create config files (`.prettierrc`, `.prettierignore`, `.editorconfig`, `.nvmrc`)
- [ ] **Step 8:** Configure red-accented theme in `globals.css` — custom CSS variables for both light and dark modes
- [ ] **Step 9:** Verify `npm run dev` and `npm run build` pass
- [ ] **Step 10:** Commit: `chore: scaffold Next.js project with all dependencies`

### Task 2: Configure Red-Accented Theme

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

The theme uses a professional dark palette with red as the primary accent. Not overwhelming — red for primary actions, active states, and key indicators. The rest is neutral grays and clean whites.

- [ ] **Step 1:** Define CSS variables for light mode — red primary (hsl 0 72% 51%), neutral backgrounds, proper contrast ratios
- [ ] **Step 2:** Define CSS variables for dark mode — slightly desaturated red primary, dark slate backgrounds
- [ ] **Step 3:** Add custom `accent-red` utilities and chart colors
- [ ] **Step 4:** Verify both themes render correctly
- [ ] **Step 5:** Commit: `feat(theme): configure red-accented enterprise theme`

---

## Phase 2: Foundation Layer

### Task 3: TypeScript Type Definitions

**Files:**
- Create: `src/lib/types/incident.ts`
- Create: `src/lib/types/kb.ts`
- Create: `src/lib/types/rule.ts`
- Create: `src/lib/types/ask.ts`
- Create: `src/lib/types/common.ts`
- Create: `src/lib/types/index.ts`

All types match the CLAUDE.md data model exactly. snake_case for API fields.

- [ ] **Step 1:** Create all type definition files per CLAUDE.md spec
- [ ] **Step 2:** Create barrel export `index.ts`
- [ ] **Step 3:** Verify with `npx tsc --noEmit`
- [ ] **Step 4:** Commit: `chore(types): define all shared TypeScript interfaces`

### Task 4: Constants and Utilities

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1:** Define constants — severity levels, status values, KB categories, rule categories, with display labels and colors
- [ ] **Step 2:** Create utility functions — cn (classnames), formatDate, getStatusColor, getSeverityColor, truncate, slug generation
- [ ] **Step 3:** Commit: `chore(lib): add constants and utility functions`

### Task 5: API Client and Mock Data

**Files:**
- Create: `src/lib/api/client.ts`
- Create: `src/lib/api/incidents.ts`
- Create: `src/lib/api/kb.ts`
- Create: `src/lib/api/rules.ts`
- Create: `src/lib/api/ask.ts`
- Create: `src/lib/api/services.ts`
- Create: `src/lib/api/teams.ts`
- Create: `src/lib/mock/incidents.ts`
- Create: `src/lib/mock/kb.ts`
- Create: `src/lib/mock/rules.ts`
- Create: `src/lib/mock/services.ts`
- Create: `src/lib/mock/teams.ts`

- [ ] **Step 1:** Create base API client with fetch wrapper, error handling, mock mode toggle
- [ ] **Step 2:** Create mock data files with realistic sample data (8-10 incidents, 6-8 KB articles, 5-6 rules, services, teams)
- [ ] **Step 3:** Create API functions for each resource — all route through client, mock mode returns mock data
- [ ] **Step 4:** Verify type safety with `npx tsc --noEmit`
- [ ] **Step 5:** Commit: `feat(api): create API service layer with mock data`

### Task 6: Supabase Authentication Setup

**Files:**
- Create: `src/lib/supabase/client.ts` — browser client
- Create: `src/lib/supabase/server.ts` — server client
- Create: `src/lib/supabase/middleware.ts` — auth middleware helper
- Create: `src/middleware.ts` — Next.js middleware for route protection
- Create: `src/lib/types/auth.ts` — auth-related types
- Create: `src/hooks/use-auth.ts` — auth hook
- Create: `src/components/auth/AuthProvider.tsx` — auth context provider

- [ ] **Step 1:** Create Supabase browser client using `@supabase/ssr`
- [ ] **Step 2:** Create Supabase server client for server components
- [ ] **Step 3:** Create middleware for session refresh and route protection
- [ ] **Step 4:** Create AuthProvider context with user state, login, logout, signup
- [ ] **Step 5:** Create `use-auth` hook for accessing auth state
- [ ] **Step 6:** Commit: `feat(auth): integrate Supabase authentication`

### Task 7: Custom React Hooks

**Files:**
- Create: `src/hooks/use-incidents.ts`
- Create: `src/hooks/use-kb.ts`
- Create: `src/hooks/use-rules.ts`
- Create: `src/hooks/use-ask.ts`

- [ ] **Step 1:** Create data fetching hooks with loading/error states for each resource
- [ ] **Step 2:** Include mutation hooks (create, update, delete) with optimistic updates
- [ ] **Step 3:** Create RAG query hook with streaming support placeholder
- [ ] **Step 4:** Commit: `feat(hooks): create data fetching and mutation hooks`

---

## Phase 3: Layout & Navigation

### Task 8: App Shell — Sidebar, Navbar, Theme Toggle

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/ThemeToggle.tsx`
- Create: `src/components/layout/ThemeProvider.tsx`
- Create: `src/components/layout/UserNav.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1:** Create ThemeProvider wrapping next-themes
- [ ] **Step 2:** Create collapsible Sidebar with nav links, icons, active state with red accent, smooth animations
- [ ] **Step 3:** Create Navbar with breadcrumbs area, theme toggle, user menu
- [ ] **Step 4:** Create ThemeToggle (sun/moon icon switch with animation)
- [ ] **Step 5:** Create UserNav dropdown (profile, settings, logout)
- [ ] **Step 6:** Wire into root layout.tsx with AuthProvider + ThemeProvider
- [ ] **Step 7:** Verify responsive behavior (sidebar collapses on mobile)
- [ ] **Step 8:** Commit: `feat(layout): implement app shell with sidebar, navbar, and theme toggle`

---

## Phase 4: Auth Pages

### Task 9: Login and Signup Pages

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/SignupForm.tsx`

- [ ] **Step 1:** Create auth layout (centered card, no sidebar)
- [ ] **Step 2:** Create LoginForm with email/password, validation, error states, red accent submit button
- [ ] **Step 3:** Create SignupForm with email/password/confirm, validation
- [ ] **Step 4:** Create login and signup pages
- [ ] **Step 5:** Add redirect logic (authenticated → dashboard, unauthenticated → login)
- [ ] **Step 6:** Commit: `feat(auth): create login and signup pages`

---

## Phase 5: Dashboard

### Task 10: Dashboard Page

**Files:**
- Create: `src/app/(dashboard)/page.tsx` — or modify `src/app/page.tsx` depending on route group setup
- Create: `src/components/dashboard/StatsCards.tsx`
- Create: `src/components/dashboard/RecentIncidentsList.tsx`
- Create: `src/components/dashboard/RecentArticlesList.tsx`
- Create: `src/components/dashboard/QuickSearch.tsx`

- [ ] **Step 1:** Create StatsCards — open incidents, critical count, avg resolution time, total KB articles, recently published. Animated counters, subtle entrance animations
- [ ] **Step 2:** Create RecentIncidentsList — last 10 incidents in compact table with severity/status badges
- [ ] **Step 3:** Create RecentArticlesList — recently published KB articles
- [ ] **Step 4:** Create QuickSearch — search bar that routes to /ask
- [ ] **Step 5:** Compose dashboard page with responsive grid layout
- [ ] **Step 6:** Commit: `feat(dashboard): create main dashboard with stats, recent items, and quick search`

---

## Phase 6: Incidents CRUD

### Task 11: Incident Shared Components

**Files:**
- Create: `src/components/incidents/StatusBadge.tsx`
- Create: `src/components/incidents/SeverityBadge.tsx`
- Create: `src/components/incidents/IncidentCard.tsx`
- Create: `src/components/incidents/IncidentTable.tsx`
- Create: `src/components/incidents/IncidentFilters.tsx`

- [ ] **Step 1:** Create StatusBadge and SeverityBadge with color-coded variants
- [ ] **Step 2:** Create IncidentCard for card-view display
- [ ] **Step 3:** Create IncidentTable for table-view display
- [ ] **Step 4:** Create IncidentFilters — status, severity, service, team dropdowns
- [ ] **Step 5:** Commit: `feat(incidents): create shared incident display components`

### Task 12: Incident List Page

**Files:**
- Create: `src/app/(dashboard)/incidents/page.tsx`

- [ ] **Step 1:** Build incidents list page with filters, pagination, search
- [ ] **Step 2:** Wire to mock data via hooks
- [ ] **Step 3:** Commit: `feat(incidents): create incident list page with filters`

### Task 13: Incident Detail Page

**Files:**
- Create: `src/app/(dashboard)/incidents/[id]/page.tsx`

- [ ] **Step 1:** Build detail view with rendered markdown, metadata sidebar, status/severity badges
- [ ] **Step 2:** Add edit/delete action buttons
- [ ] **Step 3:** Commit: `feat(incidents): create incident detail page`

### Task 14: Incident Create/Edit Forms

**Files:**
- Create: `src/components/incidents/IncidentForm.tsx`
- Create: `src/app/(dashboard)/incidents/new/page.tsx`
- Create: `src/app/(dashboard)/incidents/[id]/edit/page.tsx`

- [ ] **Step 1:** Create IncidentForm with react-hook-form + zod validation, sectioned layout
- [ ] **Step 2:** Create new incident page
- [ ] **Step 3:** Create edit incident page (pre-fills form)
- [ ] **Step 4:** Commit: `feat(incidents): create incident form with create and edit pages`

---

## Phase 7: Knowledge Base CRUD

### Task 15: KB Shared Components

**Files:**
- Create: `src/components/kb/CategoryBadge.tsx`
- Create: `src/components/kb/ArticleCard.tsx`
- Create: `src/components/kb/ArticleTable.tsx`
- Create: `src/components/kb/ArticleFilters.tsx`

- [ ] **Step 1:** Create CategoryBadge with category-specific colors
- [ ] **Step 2:** Create ArticleCard and ArticleTable
- [ ] **Step 3:** Create ArticleFilters — category, status, tags, services
- [ ] **Step 4:** Commit: `feat(kb): create shared KB article display components`

### Task 16: KB Article List Page

**Files:**
- Create: `src/app/(dashboard)/kb/page.tsx`

- [ ] **Step 1:** Build KB list with published/draft tabs, filters, search
- [ ] **Step 2:** Commit: `feat(kb): create KB article list page with tabs and filters`

### Task 17: KB Article Reader Page

**Files:**
- Create: `src/app/(dashboard)/kb/[id]/page.tsx`

- [ ] **Step 1:** Build clean rendered markdown view with metadata sidebar
- [ ] **Step 2:** Add edit/delete actions, related items section
- [ ] **Step 3:** Commit: `feat(kb): create KB article reader view`

### Task 18: KB Article Create/Edit Forms

**Files:**
- Create: `src/components/kb/ArticleForm.tsx`
- Create: `src/app/(dashboard)/kb/new/page.tsx`
- Create: `src/app/(dashboard)/kb/[id]/edit/page.tsx`

- [ ] **Step 1:** Create ArticleForm — CMS-like editor with markdown, metadata sidebar, tag input
- [ ] **Step 2:** Create new and edit pages
- [ ] **Step 3:** Commit: `feat(kb): create KB article form with create and edit pages`

---

## Phase 8: RAG Query Interface

### Task 19: Ask Page and Components

**Files:**
- Create: `src/app/(dashboard)/ask/page.tsx`
- Create: `src/components/ask/QueryInput.tsx`
- Create: `src/components/ask/AnswerPanel.tsx`
- Create: `src/components/ask/SourceCard.tsx`
- Create: `src/components/ask/ConversationPanel.tsx`
- Create: `src/components/ask/SourceTypeToggle.tsx`

- [ ] **Step 1:** Create QueryInput — search bar with source type toggle (All / Incidents / KB)
- [ ] **Step 2:** Create SourceCard — distinct visual styles for incident vs KB sources (different icons, color accents)
- [ ] **Step 3:** Create AnswerPanel — rendered markdown with typing animation for streaming
- [ ] **Step 4:** Create ConversationPanel — optional follow-up conversation view
- [ ] **Step 5:** Compose Ask page with responsive layout
- [ ] **Step 6:** Wire to mock ask API
- [ ] **Step 7:** Commit: `feat(ask): create RAG query interface with source-typed results`

---

## Phase 9: Settings & Rules

### Task 20: Settings Page

**Files:**
- Create: `src/app/(dashboard)/settings/page.tsx`
- Create: `src/components/settings/ServiceCatalog.tsx`
- Create: `src/components/settings/TeamManagement.tsx`

- [ ] **Step 1:** Create settings overview with service catalog and team management sections
- [ ] **Step 2:** Commit: `feat(settings): create settings page with service catalog and team management`

### Task 21: Rules Management

**Files:**
- Create: `src/app/(dashboard)/settings/rules/page.tsx`
- Create: `src/app/(dashboard)/settings/rules/new/page.tsx`
- Create: `src/app/(dashboard)/settings/rules/[id]/edit/page.tsx`
- Create: `src/components/rules/RuleCard.tsx`
- Create: `src/components/rules/RuleTable.tsx`
- Create: `src/components/rules/RuleForm.tsx`
- Create: `src/components/rules/RuleCategoryBadge.tsx`

- [ ] **Step 1:** Create RuleCategoryBadge and RuleCard with enable/disable toggle
- [ ] **Step 2:** Create RuleTable with inline toggles, priority display, category filtering
- [ ] **Step 3:** Create rules list page grouped by category
- [ ] **Step 4:** Create RuleForm with markdown editor, priority input, category dropdown, enabled toggle
- [ ] **Step 5:** Create new and edit pages
- [ ] **Step 6:** Commit: `feat(rules): create rules management with category filtering and inline toggles`

---

## Phase 10: Polish & Animations

### Task 22: Animation System and Final Polish

**Files:**
- Create: `src/lib/animations.ts` — shared framer-motion variants
- Modify: Various components to add entrance animations, page transitions

- [ ] **Step 1:** Define shared animation variants — fadeIn, slideUp, staggerChildren, scaleIn
- [ ] **Step 2:** Add page transition animations to all pages
- [ ] **Step 3:** Add staggered entrance animations to list/card views
- [ ] **Step 4:** Add micro-interactions — button hover effects, badge transitions, sidebar collapse
- [ ] **Step 5:** Verify all animations are smooth and don't cause layout shifts
- [ ] **Step 6:** Commit: `feat(ui): add polished animations and micro-interactions`

### Task 23: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1:** Update CLAUDE.md to reflect Supabase auth, framer-motion, actual file structure, and new conventions
- [ ] **Step 2:** Commit: `docs: update CLAUDE.md with implemented architecture`

---

## Execution Notes

**Design Principles (NO AI SLOP):**
- Clean type hierarchy with clear visual weight
- Purposeful whitespace — not everything needs to be crammed together
- Red accent used sparingly: primary buttons, active nav states, critical severity badges, hover states
- Animations are subtle and functional (200-300ms), not decorative
- Enterprise feel: data-dense where appropriate, professional typography, proper contrast ratios
- Dark mode is the hero — rich dark slate backgrounds with red accent pops
- No rounded-everything, no excessive shadows, no gradient overuse
