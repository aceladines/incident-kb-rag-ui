# CLAUDE.md — Incident Knowledge Base RAG UI

## Project Overview

Internal support team portal for logging incidents, managing a knowledge base, configuring agent rules, and querying all of it via natural language using Retrieval-Augmented Generation (RAG). The frontend is a Next.js application that communicates exclusively with an existing FastAPI backend.

**The existing backend** already leverages the Microsoft AI Agent framework to automate IT incident workflows: processing incidents, performing AI-driven root cause analysis (RCA), applying fixes, validating resolutions, integrating with ITSM, and sending notifications. The RAG and KB capabilities described here are being added on top of that existing automation pipeline.

The RAG pipeline retrieves from **three source types**:
- **Incidents** — reactive records of past/ongoing issues, their impact, and fixes
- **Knowledge Base (KB) articles** — proactive documentation: runbooks, SOPs, troubleshooting guides, FAQs, configuration references
- **Technical Specifications (Tech Specs)** — technical design documents: API contracts, architecture decisions, infrastructure specs, database schemas

**Rules** define the non-negotiable boundaries and behavioral configuration for:
- **RAG behavior** — relevance thresholds, source preferences, staleness policies, hallucination safeguards
- **Agent guardrails** — what the agent can and cannot do autonomously within the incident automation workflow

Rules are admin-only. They are consumed by the FastAPI backend and passed to the Microsoft AI Agent framework to govern its orchestration and decision-making.

This repository contains **only the frontend**. The backend is a separate FastAPI service.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (CSS-based config, no tailwind.config.ts)
- **Component Library:** shadcn/ui v4 (uses `@base-ui/react`, NOT Radix — no `asChild` prop, use `render` prop instead)
- **Theme:** Dark/Light mode via `next-themes`, red-accented enterprise theme
- **Authentication:** Supabase Auth (`@supabase/ssr`) — will migrate to Azure Entra ID later
- **Animations:** Framer Motion
- **Forms:** react-hook-form + zod + @hookform/resolvers
- **Markdown:** react-markdown + remark-gfm
- **Package Manager:** npm

---

## Project Structure

```
src/
├── proxy.ts                    # Next.js 16 proxy (auth session refresh + route protection)
├── app/
│   ├── layout.tsx              # Root layout (ThemeProvider, Toaster)
│   ├── globals.css             # Tailwind v4 config + red-accented theme CSS variables
│   ├── (auth)/                 # Auth route group (no sidebar)
│   │   ├── layout.tsx          # Centered auth layout
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   └── (dashboard)/            # Dashboard route group (sidebar + navbar)
│       ├── layout.tsx          # AppShell wrapper
│       ├── page.tsx            # Dashboard (stats, recent items, quick search)
│       ├── ask/
│       │   ├── page.tsx        # Suspense wrapper for RAG query
│       │   └── ask-client.tsx  # RAG query interface (client component)
│       ├── incidents/
│       │   ├── page.tsx        # Incident list with filters
│       │   ├── new/page.tsx    # Create incident form
│       │   └── [id]/
│       │       ├── page.tsx    # Incident detail view
│       │       └── edit/page.tsx # Edit incident form
│       ├── kb/
│       │   ├── page.tsx        # KB article list with filters
│       │   ├── new/page.tsx    # Create KB article
│       │   └── [id]/
│       │       ├── page.tsx    # KB article reader view
│       │       └── edit/page.tsx # Edit KB article
│       ├── tech-specs/
│       │   ├── page.tsx        # Tech spec list with filters
│       │   ├── new/page.tsx    # Create tech spec
│       │   └── [id]/
│       │       ├── page.tsx    # Tech spec detail view
│       │       └── edit/page.tsx # Edit tech spec
│       └── settings/
│           ├── page.tsx        # Service catalog + team management
│           └── rules/
│               ├── page.tsx    # Rules list (RAG behavior + agent guardrails)
│               ├── new/page.tsx # Create rule
│               └── [id]/edit/page.tsx # Edit rule
├── components/
│   ├── ui/                     # shadcn/ui v4 primitives (@base-ui/react)
│   ├── layout/                 # AppShell, Sidebar, Navbar, ThemeToggle, MobileSidebar, UserNav
│   ├── auth/                   # LoginForm, SignupForm
│   ├── incidents/              # IncidentForm, IncidentTable, IncidentFilters, SeverityBadge, StatusBadge
│   ├── kb/                     # ArticleForm, ArticleCard, ArticleFilters, CategoryBadge, StatusBadge
│   ├── tech-specs/             # TechSpecForm, TechSpecCard, TechSpecFilters, CategoryBadge, StatusBadge
│   ├── rules/                  # RuleForm, RuleCard, RuleCategoryBadge
│   ├── ask/                    # QueryInput, AnswerPanel, SourceCard, SourceTypeToggle
│   └── dashboard/              # StatsCards, RecentIncidentsList, RecentArticlesList, QuickSearch
├── lib/
│   ├── api/                    # API service layer (mock mode via NEXT_PUBLIC_USE_MOCK)
│   │   ├── client.ts           # Base fetch wrapper
│   │   ├── incidents.ts        # Incident CRUD
│   │   ├── kb.ts               # KB article CRUD
│   │   ├── tech-specs.ts       # Tech spec CRUD
│   │   ├── rules.ts            # Rule CRUD
│   │   ├── ask.ts              # RAG query
│   │   ├── services.ts         # Service catalog
│   │   └── teams.ts            # Teams
│   ├── types/                  # Shared TypeScript interfaces
│   │   ├── incident.ts, kb.ts, tech-spec.ts, rule.ts, ask.ts, common.ts, auth.ts
│   │   └── index.ts            # Barrel export
│   ├── supabase/               # Supabase auth clients
│   │   ├── client.ts           # Browser client (graceful fallback when not configured)
│   │   ├── server.ts           # Server component client
│   │   └── middleware.ts       # Session refresh helper for proxy.ts
│   ├── mock/                   # Mock data (used until backend is ready)
│   │   ├── incidents.ts
│   │   ├── kb.ts
│   │   ├── tech-specs.ts
│   │   ├── rules.ts
│   │   ├── services.ts
│   │   └── teams.ts
│   ├── animations.ts           # Shared framer-motion variants
│   ├── utils.ts                # cn, formatDate, formatRelativeTime, truncate, etc.
│   └── constants.ts            # Severity levels, status values, categories, nav items
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts             # Supabase auth state and actions
│   ├── use-incidents.ts        # Incident data fetching/mutation hooks
│   ├── use-kb.ts               # KB article data fetching/mutation hooks
│   ├── use-tech-specs.ts       # Tech spec data fetching/mutation hooks
│   ├── use-rules.ts            # Rule data fetching/mutation hooks
│   └── use-ask.ts              # RAG query hook
```

---

## Core Data Model

```typescript
// lib/types/incident.ts

type IncidentStatus = "open" | "investigating" | "resolved" | "closed";
type IncidentSeverity = "low" | "medium" | "high" | "critical";

interface Incident {
  id: string;
  title: string;
  description: string;            // markdown
  impacted_services: string[];    // IDs from service catalog
  fix_details: string | null;     // markdown, null if unresolved
  responsible_team: string;       // team ID
  status: IncidentStatus;
  severity: IncidentSeverity;
  created_by: string;
  created_at: string;             // ISO 8601
  updated_at: string;
  resolved_at: string | null;
}

interface IncidentFormData {
  title: string;
  description: string;
  impacted_services: string[];
  fix_details: string | null;
  responsible_team: string;
  severity: IncidentSeverity;
}
```

```typescript
// lib/types/kb.ts

type KbArticleStatus = "draft" | "published" | "archived";
type KbArticleCategory =
  | "runbook"
  | "troubleshooting"
  | "faq"
  | "sop"
  | "configuration"
  | "architecture"
  | "general";

interface KbArticle {
  id: string;
  title: string;
  content: string;                // markdown — the main article body
  summary: string;                // short plain-text summary for search result previews
  category: KbArticleCategory;
  tags: string[];                 // freeform tags for filtering and retrieval
  related_services: string[];     // IDs from service catalog
  status: KbArticleStatus;
  created_by: string;
  created_at: string;             // ISO 8601
  updated_at: string;
  published_at: string | null;
}

interface KbArticleFormData {
  title: string;
  content: string;
  summary: string;
  category: KbArticleCategory;
  tags: string[];
  related_services: string[];
  status: KbArticleStatus;
}
```

```typescript
// lib/types/tech-spec.ts

type TechSpecStatus = "draft" | "published" | "archived";
type TechSpecCategory =
  | "api"
  | "architecture"
  | "infrastructure"
  | "database"
  | "security"
  | "networking"
  | "integration"
  | "general";

interface TechSpec {
  id: string;
  title: string;
  content: string;                // markdown — technical design document body
  summary: string;                // short plain-text summary for search result previews
  category: TechSpecCategory;
  tags: string[];                 // freeform tags for filtering and retrieval
  related_services: string[];     // IDs from service catalog
  status: TechSpecStatus;
  created_by: string;
  created_at: string;             // ISO 8601
  updated_at: string;
  published_at: string | null;
}

interface TechSpecFormData {
  title: string;
  content: string;
  summary: string;
  category: TechSpecCategory;
  tags: string[];
  related_services: string[];
  status: TechSpecStatus;
}
```

```typescript
// lib/types/rule.ts

// Two categories matching what the Microsoft AI Agent framework consumes
type RuleCategory = "rag_behavior" | "agent_guardrail";

interface Rule {
  id: string;
  title: string;                  // short name, e.g. "Staleness Disclaimer Required"
  description: string;            // markdown — the full rule definition and rationale
  category: RuleCategory;
  priority: number;               // ordering weight — lower number = higher priority (evaluated first)
  is_enabled: boolean;            // toggle rule on/off without deleting
  created_by: string;
  created_at: string;             // ISO 8601
  updated_at: string;
}

interface RuleFormData {
  title: string;
  description: string;
  category: RuleCategory;
  priority: number;
  is_enabled: boolean;
}
```

**Rule category definitions:**

`rag_behavior` — Controls how the RAG pipeline retrieves and generates answers. Examples:
- "Never suggest a fix from a resolved incident older than 6 months without appending a staleness disclaimer."
- "Always prioritize published KB articles over draft articles in retrieval results."
- "If no retrieved sources exceed a 0.7 relevance score, respond with 'Insufficient context to provide a reliable answer' instead of generating a speculative response."
- "When a query matches both an incident fix and a KB runbook, surface the KB runbook first."
- "Do not include archived KB articles in retrieval results."

`agent_guardrail` — Defines what the agent can and cannot do autonomously within the existing incident automation workflow (RCA, fix application, validation, ITSM integration, notifications). Examples:
- "Agent must not auto-close incidents without explicit human confirmation."
- "Agent-generated fix suggestions must cite at least one source (incident or KB article)."
- "Agent must not modify KB articles — only suggest edits and queue for human review."
- "Agent must not apply a fix to production services without approval from the responsible team lead."
- "Agent must log all autonomous actions to the incident timeline with full reasoning trace."
- "Agent must not send external ITSM updates for incidents classified as severity: low without human review."

```typescript
// lib/types/ask.ts

// Discriminated union so the UI can render each source type differently
type SourceReference =
  | { type: "incident"; data: Incident }
  | { type: "kb_article"; data: KbArticle }
  | { type: "tech_spec"; data: TechSpec };

interface AskQuery {
  query: string;
  source_types?: ("incident" | "kb_article" | "tech_spec")[]; // optional filter: search only specific source types, or all (default)
  filters?: {
    status?: IncidentStatus[];
    severity?: IncidentSeverity[];
    services?: string[];
    team?: string;
    kb_category?: KbArticleCategory[];
    kb_tags?: string[];
    tech_spec_category?: TechSpecCategory[];
    tech_spec_tags?: string[];
  };
}

interface AskResponse {
  answer: string;                 // LLM-generated markdown
  sources: SourceReference[];     // retrieved items used as context, ranked by relevance
}
```

---

## API Contract

The frontend communicates with the FastAPI backend at a configurable base URL (`NEXT_PUBLIC_API_URL`).

| Method | Endpoint               | Purpose                                      |
|--------|------------------------|----------------------------------------------|
| POST   | /api/incidents         | Create incident                              |
| GET    | /api/incidents         | List incidents (query params for filters/pagination) |
| GET    | /api/incidents/{id}    | Get incident detail                          |
| PUT    | /api/incidents/{id}    | Update incident                              |
| DELETE | /api/incidents/{id}    | Delete incident                              |
| POST   | /api/kb                | Create KB article                            |
| GET    | /api/kb                | List KB articles (query params for filters/pagination) |
| GET    | /api/kb/{id}           | Get KB article detail                        |
| PUT    | /api/kb/{id}           | Update KB article                            |
| DELETE | /api/kb/{id}           | Delete KB article                            |
| POST   | /api/tech-specs        | Create tech spec                             |
| GET    | /api/tech-specs        | List tech specs (query params for filters/pagination) |
| GET    | /api/tech-specs/{id}   | Get tech spec detail                         |
| PUT    | /api/tech-specs/{id}   | Update tech spec                             |
| DELETE | /api/tech-specs/{id}   | Delete tech spec                             |
| POST   | /api/rules             | Create rule (admin-only)                     |
| GET    | /api/rules             | List rules (filterable by category, enabled status) |
| GET    | /api/rules/{id}        | Get rule detail                              |
| PUT    | /api/rules/{id}        | Update rule (admin-only)                     |
| DELETE | /api/rules/{id}        | Delete rule (admin-only)                     |
| POST   | /api/ask               | RAG query → returns answer + sources (incidents, KB & tech specs) |
| GET    | /api/services          | List service catalog entries                 |
| GET    | /api/teams             | List teams/groups                            |

**Authorization notes:**
- All `/api/rules` endpoints require admin role. The API layer should pass auth tokens and the backend enforces role-based access.
- All other endpoints are accessible to any authenticated support agent.

**Response conventions (matching FastAPI/Pydantic):**
- Field names use `snake_case` (matching Python backend).
- Paginated lists return `{ items: T[], total: number, page: number, page_size: number }`.
- Errors return `{ detail: string }` with appropriate HTTP status codes.

---

## API Service Layer Pattern

All API calls go through `lib/api/client.ts`, which wraps `fetch` with:
- Base URL from environment variable
- JSON content-type headers
- Auth token injection (when auth is implemented)
- Standardized error handling that throws typed `ApiError`

Each resource file (`incidents.ts`, `ask.ts`, etc.) exports plain async functions:

```typescript
// Example: lib/api/incidents.ts
export async function getIncidents(filters?: IncidentFilters): Promise<PaginatedResponse<Incident>> { ... }
export async function getIncident(id: string): Promise<Incident> { ... }
export async function createIncident(data: IncidentFormData): Promise<Incident> { ... }
```

**Mock mode:** When `NEXT_PUBLIC_USE_MOCK=true`, the client module returns mock data instead of making network calls. This keeps development unblocked while the backend is pending.

---

## Coding Conventions

### General
- Use TypeScript strict mode. No `any` types unless absolutely unavoidable (and add a comment explaining why).
- Prefer named exports over default exports, except for page components (`page.tsx`) which Next.js requires as defaults.
- Use `snake_case` for API response fields (to match FastAPI/Pydantic). Use `camelCase` for internal frontend-only variables and function names.
- Keep components focused — one component per file, file name matches component name in PascalCase.

### Components
- All reusable UI components live in `components/ui/` (shadcn primitives) or feature-specific folders.
- Use shadcn/ui components as the building blocks. Do not install additional component libraries.
- **CRITICAL: shadcn v4 uses `@base-ui/react`, NOT Radix UI.** Key API differences:
  - No `asChild` prop. Use `render` prop instead: `<Button render={<Link href="/path" />}>text</Button>`
  - Select `onValueChange` can receive `null` — always guard: `onValueChange={(val) => { if (val) ... }}`
  - DropdownMenuContent has no `forceMount` prop
  - TooltipProvider uses `delay` prop, not `delayDuration`
  - Next.js 16 uses `proxy.ts` instead of `middleware.ts`
- Props interfaces are defined in the same file as the component, named `{ComponentName}Props`.
- Avoid prop drilling beyond 2 levels — use React context or composition instead.

### Styling
- Use Tailwind utility classes exclusively. No custom CSS files except `globals.css` for shadcn variables.
- Do not use inline `style` attributes.
- Use shadcn's CSS variable-based theming. Colors reference semantic tokens (`bg-background`, `text-foreground`, `border-border`, etc.), never raw Tailwind colors like `bg-gray-800`. This ensures dark/light mode works correctly.
- Responsive design: mobile-first approach. The app should be usable on tablet at minimum.

### State Management
- Server state (API data): use React hooks with `fetch` in the API layer. Consider `swr` or `react-query` if caching/revalidation needs grow.
- Client state (UI state like form inputs, modals): use React `useState` / `useReducer`. No global state library unless complexity demands it.
- Form state: use `react-hook-form` with `zod` for validation.

### File and Folder Naming
- Folders: `kebab-case`
- Component files: `PascalCase.tsx`
- Non-component files (utils, hooks, types, api): `kebab-case.ts`
- Type definition files: `kebab-case.ts` inside `lib/types/`

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000    # FastAPI backend URL
NEXT_PUBLIC_USE_MOCK=true                    # Toggle mock data mode
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...              # Supabase anon key
```

**Note:** Supabase auth gracefully degrades when not configured (placeholder values). The app remains functional in mock mode without valid Supabase credentials — auth is bypassed during build and development.

---

## Key UX Decisions

- **Incident form:** Sectioned layout — metadata (title, severity, team) on top, description and fix details as markdown editors below, impacted services as a multi-select tag input.
- **KB article form:** Title and summary on top, category dropdown and freeform tag input in a metadata sidebar, full markdown editor for content body, related services as multi-select, status toggle (draft/published). The form should feel like a lightweight CMS editor.
- **KB article reader (`/kb/[id]`):** Clean rendered markdown view with a metadata sidebar showing category, tags, related services, author, and dates. Links to related incidents or other KB articles if available.
- **KB article list (`/kb`):** Filterable table/card view by category, tags, status, and related services. Search bar for text filtering. Published vs draft tabs.
- **RAG query page (`/ask`):** Search bar at top with a source type toggle (All / Incidents only / KB only). Results as ranked cards below — incident sources and KB sources render with distinct visual styles (different icons, color accents) so agents can immediately tell what type of source they're looking at. Optional conversational follow-up panel.
- **Dashboard:** Stats cards (open incidents, critical count, avg resolution time, total KB articles, recently published KB articles), recent incidents table, quick-search that routes to `/ask`.
- **Settings:** Service catalog, team management, and KB category management.
- **Rules management (`/settings/rules`):** Admin-only. List view shows all rules grouped or filterable by category (RAG Behavior / Agent Guardrail) with enable/disable toggles inline. Each rule card shows title, category badge, priority, and enabled status. The form is a structured text entry — title, category dropdown, priority number input, description as a markdown editor for the full rule definition and rationale, and an enabled toggle. Rules are ordered by priority (lower = higher priority = evaluated first by the agent). Disabled rules are visually dimmed but remain in the list for reference.
- **Dark/light mode:** Toggle in the top nav. Persists via `next-themes` (localStorage). Defaults to system preference.

---

## Backend Context (For Reference Only — Not Built Here)

The FastAPI backend this frontend connects to has **two layers**:

**Existing incident automation pipeline (already built):**
- Leverages the Microsoft AI Agent framework to automate IT incident workflows
- Processes incoming incidents and performs AI-driven root cause analysis (RCA)
- Applies fixes, validates resolutions, and integrates with ITSM systems
- Sends notifications for faster, intelligent IT service management

**RAG and KB layer (being added):**
- Handles incident, KB article, and rule CRUD and persistence (Azure Cosmos DB)
- Runs RAG orchestration: query → Azure AI Search (hybrid retrieval across both incident and KB indexes) → Azure OpenAI (answer generation)
- Indexes both incidents and KB articles into Azure AI Search (with embeddings via Azure OpenAI) for unified retrieval
- Will serve a streaming endpoint (`/api/ask/stream`) for real-time answer generation

**Rules integration:**
- Rules stored in the database are loaded by the agent framework at orchestration time
- `rag_behavior` rules are injected into the RAG pipeline configuration (relevance thresholds, source filtering, response policies)
- `agent_guardrail` rules are injected into the agent's system prompt and tool-use constraints, governing what autonomous actions are permitted during RCA, fix application, validation, and ITSM updates
- The `priority` field determines evaluation order — when rules conflict, lower-priority-number rules take precedence
- The `is_enabled` flag allows admins to toggle rules without deleting them, useful for A/B testing agent behavior or temporarily relaxing constraints during incident surges

---

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Start dev server with Turbopack (localhost:3000)
npm run build         # Production build
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking (tsc --noEmit)
npm run format        # Format with Prettier
npm run format:check  # Check formatting
```

---

## What Is NOT in Scope

- Backend API implementation (lives in a separate FastAPI repo)
- Azure Entra ID integration (currently using Supabase Auth; will migrate later)
- Deployment/CI pipeline configuration
- Direct calls to Azure services from the frontend — all Azure interactions go through FastAPI
