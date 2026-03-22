# Repository Setup Guide

Step-by-step instructions for creating and configuring the `incident-kb-rag-ui` GitHub repository.

This is a one-time setup document. It can be deleted from the repository after all steps are completed.

---

## Prerequisites

Before starting, ensure you have:

- **GitHub account** with permission to create repositories in your organization
- **GitHub CLI (`gh`)** installed and authenticated — [install guide](https://cli.github.com/)
- **Node.js 20+** and **npm 9+** installed
- **Git** configured with your name and email

```bash
# Verify prerequisites
gh --version          # GitHub CLI
node --version        # Node.js 20+
npm --version         # npm 9+
git --version         # Git
```

---

## 1. Create the Repository

### Option A: Via GitHub UI

1. Go to [github.com/new](https://github.com/new)
2. Configure:
   - **Repository name:** `incident-kb-rag-ui`
   - **Description:** `Internal support portal for incident logging, knowledge base management, agent rules configuration, and RAG-powered retrieval`
   - **Visibility:** Public (MIT licensed)
   - **Initialize:** Do NOT add README, .gitignore, or license (we provide our own)
3. Click **Create repository**

### Option B: Via GitHub CLI

```bash
gh repo create incident-kb-rag-ui \
  --public \
  --description "Internal support portal for incident logging, knowledge base management, agent rules configuration, and RAG-powered retrieval" \
  --clone
```

---

## 2. Scaffold the Next.js Project

```bash
# If you used --clone in step 1, you already have the directory
# Otherwise, create the project:
npx create-next-app@latest incident-kb-rag-ui \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd incident-kb-rag-ui
```

### Install Core Dependencies

```bash
# shadcn/ui init (follow prompts — use Default style, CSS variables: yes)
npx shadcn@latest init

# Form handling and validation
npm install react-hook-form zod @hookform/resolvers

# Theme
npm install next-themes

# Markdown rendering (for KB articles, incident descriptions, rule definitions)
npm install react-markdown remark-gfm

# Dev tooling
npm install -D prettier prettier-plugin-tailwindcss
```

### Add npm Scripts

Add these to `package.json` under `"scripts"`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

### Copy Repository Config Files

Copy all the config files from the repo files bundle into the project root:

```
.editorconfig
.env.example
.gitignore
.nvmrc
.prettierrc
.prettierignore
CLAUDE.md
CONTRIBUTING.md
LICENSE
README.md
```

And the `.github/` directory:

```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
├── pull_request_template.md
└── workflows/
    └── ci.yml
```

### Create Local Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000    # Your FastAPI backend URL
NEXT_PUBLIC_USE_MOCK=true                    # true until backend endpoints are ready
```

### Verify Everything Works

```bash
npm run dev           # Should start on localhost:3000
npm run lint          # Should pass with no errors
npm run type-check    # Should pass
npm run format:check  # Should pass
npm run build         # Should succeed
```

---

## 3. Initialize Git and Push

```bash
# Initialize git (skip if already initialized by create-next-app)
git init
git branch -M main

# Add remote (skip if you used gh repo create --clone)
git remote add origin https://github.com/<your-org>/incident-kb-rag-ui.git

# Initial commit
git add .
git commit -m "chore: initial project scaffold

- Next.js 14 with App Router, TypeScript strict mode
- Tailwind CSS + shadcn/ui with dark/light theme support
- react-hook-form + zod for form validation
- Prettier with Tailwind plugin
- GitHub Actions CI (lint, type-check, format, build)
- Project documentation (CLAUDE.md, CONTRIBUTING.md, README.md)"

# Push main
git push -u origin main

# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

---

## 4. Branch Protection Rules

### `main` branch

Go to **Settings → Rules → Rulesets** (or **Settings → Branches → Add rule** for classic protection):

| Setting | Value |
|---------|-------|
| Branch name pattern | `main` |
| Require pull request before merging | Yes |
| Required approvals | 1 |
| Dismiss stale PR approvals when new commits are pushed | Yes |
| Require status checks to pass before merging | Yes |
| Required checks | `ci` (the GitHub Actions job name) |
| Require branches to be up to date before merging | Yes |
| Require conversation resolution before merging | Yes |
| Restrict deletions | Yes |
| Include administrators | Yes |

### `develop` branch

Same as `main`, with these differences:

| Setting | Value |
|---------|-------|
| Required approvals | 1 |
| Include administrators | No (allows faster iteration during development) |

### Via GitHub CLI

```bash
# Protect main
gh api repos/<your-org>/incident-kb-rag-ui/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field enforce_admins=true \
  --field restrictions=null

# Protect develop
gh api repos/<your-org>/incident-kb-rag-ui/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field enforce_admins=false \
  --field restrictions=null
```

---

## 5. Labels

Replace GitHub's default labels with project-specific ones. Run this script once:

```bash
REPO="<your-org>/incident-kb-rag-ui"

# ─── Delete default labels ───────────────────────────────────────────────────
for label in "documentation" "duplicate" "enhancement" "good first issue" \
  "help wanted" "invalid" "question" "wontfix"; do
  gh label delete "$label" --repo "$REPO" --yes 2>/dev/null
done

# ─── Type labels ─────────────────────────────────────────────────────────────
gh label create "bug"              --color "d73a4a" --description "Something isn't working"              --repo "$REPO"
gh label create "enhancement"      --color "a2eeef" --description "New feature or improvement"           --repo "$REPO"
gh label create "chore"            --color "e4e669" --description "Maintenance, deps, CI"                --repo "$REPO"
gh label create "docs"             --color "0075ca" --description "Documentation only"                   --repo "$REPO"
gh label create "refactor"         --color "d4c5f9" --description "Code restructure, no behavior change" --repo "$REPO"

# ─── Priority labels ─────────────────────────────────────────────────────────
gh label create "priority: critical" --color "b60205" --description "Must fix immediately"   --repo "$REPO"
gh label create "priority: high"     --color "d93f0b" --description "Fix in current sprint"  --repo "$REPO"
gh label create "priority: medium"   --color "fbca04" --description "Fix soon"               --repo "$REPO"
gh label create "priority: low"      --color "0e8a16" --description "Nice to have"           --repo "$REPO"

# ─── Area labels ─────────────────────────────────────────────────────────────
gh label create "area: incidents"  --color "1d76db" --description "Incident CRUD and views"         --repo "$REPO"
gh label create "area: kb"         --color "1d76db" --description "Knowledge Base articles"         --repo "$REPO"
gh label create "area: rules"      --color "1d76db" --description "Rules and agent guardrails"      --repo "$REPO"
gh label create "area: ask"        --color "1d76db" --description "RAG query interface"             --repo "$REPO"
gh label create "area: dashboard"  --color "1d76db" --description "Dashboard and stats"             --repo "$REPO"
gh label create "area: settings"   --color "1d76db" --description "Service catalog, teams, config"  --repo "$REPO"
gh label create "area: api-layer"  --color "1d76db" --description "API client and mock data"        --repo "$REPO"
gh label create "area: layout"     --color "1d76db" --description "Shell, nav, theme"               --repo "$REPO"
gh label create "area: auth"       --color "1d76db" --description "Authentication and roles"        --repo "$REPO"

# ─── Status labels ───────────────────────────────────────────────────────────
gh label create "status: blocked"       --color "b60205" --description "Blocked by dependency"        --repo "$REPO"
gh label create "status: needs-review"  --color "fbca04" --description "Ready for code review"        --repo "$REPO"
gh label create "status: in-progress"   --color "0e8a16" --description "Actively being worked"        --repo "$REPO"
gh label create "status: backend-dep"   --color "f9d0c4" --description "Waiting on backend endpoint"  --repo "$REPO"
```

---

## 6. GitHub Repository Settings

Configure in **Settings → General**:

| Setting | Value | Why |
|---------|-------|-----|
| Features: Wikis | Disabled | Use CLAUDE.md and in-repo docs |
| Features: Issues | Enabled | Primary task tracking |
| Features: Projects | Enabled | Sprint planning |
| Features: Discussions | Disabled | Use Issues instead |
| Pull Requests: Allow merge commits | Disabled | Keep history clean |
| Pull Requests: Allow squash merging | **Enabled** (default) | One commit per PR |
| Pull Requests: Allow rebase merging | Disabled | Avoid messy history |
| Pull Requests: Default commit message | PR title | Matches conventional commits |
| Pull Requests: Auto-delete head branches | **Enabled** | Clean up after merge |
| Pull Requests: Allow auto-merge | Enabled | Merge when CI passes |

### Topics (Optional)

Add repository topics for discoverability:

```bash
gh repo edit <your-org>/incident-kb-rag-ui --add-topic nextjs,typescript,tailwindcss,shadcn-ui,rag,incident-management,knowledge-base
```

---

## 7. Environments

Create these in **Settings → Environments** when deployment is ready:

| Environment | Deploys from | Protection Rules |
|-------------|-------------|-----------------|
| `staging` | `develop` | None (auto-deploy) |
| `production` | `main` | Required reviewers (1+), wait timer (optional) |

### Environment Variables (Per Environment)

| Variable | Staging | Production |
|----------|---------|------------|
| `NEXT_PUBLIC_API_URL` | `https://api-staging.your-domain.com` | `https://api.your-domain.com` |
| `NEXT_PUBLIC_USE_MOCK` | `false` | `false` |

---

## 8. Secrets and Variables

### Repository Secrets (Settings → Secrets and variables → Actions)

None required initially. Add these when deployment is configured:

| Secret | Purpose |
|--------|---------|
| `AZURE_CREDENTIALS` | Azure service principal JSON for deployment |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Azure App Service publish profile (if using App Service) |

### Repository Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_VERSION` | `20` | Pinned Node.js version for CI |

---

## 9. Create Initial GitHub Project Board (Optional)

Set up a project board for tracking development milestones:

```bash
# Create the project (note: GitHub Projects v2 uses GraphQL, this creates a classic board)
gh project create --title "Incident KB RAG UI" --owner <your-org>
```

### Suggested Milestones

Create these milestones in **Issues → Milestones**:

| Milestone | Description | Target |
|-----------|------------|--------|
| `Phase 1: Scaffold & Layout` | App shell, sidebar nav, theme toggle, layout components | Week 1 |
| `Phase 2: Incident CRUD` | Incident form, list, detail, mock data | Week 2-3 |
| `Phase 3: KB CRUD` | KB article form, list, reader view, mock data | Week 3-4 |
| `Phase 4: RAG Query UI` | /ask page, source cards, streaming support | Week 4-5 |
| `Phase 5: Rules Management` | Admin rules page, rule form, priority ordering | Week 5-6 |
| `Phase 6: Backend Integration` | Swap mock data for FastAPI endpoints, auth hookup | When backend is ready |

---

## 10. Seed Initial Issues (Optional)

Kickstart the backlog with foundational issues:

```bash
REPO="<your-org>/incident-kb-rag-ui"

# ─── Phase 1: Scaffold & Layout ──────────────────────────────────────────────

gh issue create --title "feat(layout): scaffold root layout with sidebar and top nav" \
  --label "enhancement,area: layout" --milestone "Phase 1: Scaffold & Layout" --repo "$REPO" \
  --body "Create the root layout.tsx with:
- Collapsible sidebar with nav links (Dashboard, Incidents, Knowledge Base, Ask, Settings)
- Top nav bar with theme toggle and user avatar placeholder
- Responsive: sidebar collapses to hamburger on mobile
- ThemeProvider via next-themes"

gh issue create --title "feat(layout): implement dark/light mode toggle" \
  --label "enhancement,area: layout" --milestone "Phase 1: Scaffold & Layout" --repo "$REPO" \
  --body "Add theme toggle to top nav using next-themes. Default to system preference. Persist choice in localStorage."

gh issue create --title "chore(api): create base API client with mock mode toggle" \
  --label "chore,area: api-layer" --milestone "Phase 1: Scaffold & Layout" --repo "$REPO" \
  --body "Create lib/api/client.ts:
- Base fetch wrapper with NEXT_PUBLIC_API_URL
- JSON headers, error handling, typed ApiError
- Mock mode: return mock data when NEXT_PUBLIC_USE_MOCK=true
- Auth token injection placeholder"

gh issue create --title "chore(types): define all shared TypeScript interfaces" \
  --label "chore,area: api-layer" --milestone "Phase 1: Scaffold & Layout" --repo "$REPO" \
  --body "Create type definition files matching CLAUDE.md data model:
- lib/types/incident.ts (Incident, IncidentFormData, IncidentStatus, IncidentSeverity)
- lib/types/kb.ts (KbArticle, KbArticleFormData, KbArticleStatus, KbArticleCategory)
- lib/types/rule.ts (Rule, RuleFormData, RuleCategory)
- lib/types/ask.ts (AskQuery, AskResponse, SourceReference)
- lib/types/common.ts (PaginatedResponse, ApiError, SelectOption)"

# ─── Phase 2: Incident CRUD ──────────────────────────────────────────────────

gh issue create --title "feat(incidents): create incident list page with filters" \
  --label "enhancement,area: incidents" --milestone "Phase 2: Incident CRUD" --repo "$REPO" \
  --body "Implement /incidents page:
- Table view with columns: title, severity, status, responsible team, created date
- Filter bar: status, severity, impacted service, team
- Pagination
- Link to detail view
- Uses mock data via API layer"

gh issue create --title "feat(incidents): create/edit incident form" \
  --label "enhancement,area: incidents" --milestone "Phase 2: Incident CRUD" --repo "$REPO" \
  --body "Implement incident form (used by /incidents/new and /incidents/[id]/edit):
- Sectioned layout: metadata top, markdown editors below
- Fields: title, severity dropdown, responsible team dropdown, impacted services multi-select tags, description (markdown), fix details (markdown, optional)
- Validation with zod via react-hook-form
- Matches IncidentFormData type from CLAUDE.md"

gh issue create --title "feat(incidents): create incident detail page" \
  --label "enhancement,area: incidents" --milestone "Phase 2: Incident CRUD" --repo "$REPO" \
  --body "Implement /incidents/[id] page:
- Full incident record display with rendered markdown for description and fix details
- Status badge, severity badge, impacted services tags
- Edit and delete actions
- Timeline of updates (placeholder for future)"

# ─── Phase 3: KB CRUD ────────────────────────────────────────────────────────

gh issue create --title "feat(kb): create KB article list page with filters" \
  --label "enhancement,area: kb" --milestone "Phase 3: KB CRUD" --repo "$REPO" \
  --body "Implement /kb page:
- Card or table view with: title, category badge, tags, status, updated date
- Filter by category, tags, status, related services
- Published vs draft tabs
- Search bar for text filtering
- Uses mock data via API layer"

gh issue create --title "feat(kb): create/edit KB article form" \
  --label "enhancement,area: kb" --milestone "Phase 3: KB CRUD" --repo "$REPO" \
  --body "Implement KB article form:
- Title and summary on top
- Metadata sidebar: category dropdown, freeform tag input, related services multi-select, status toggle
- Full markdown editor for content body
- Matches KbArticleFormData type from CLAUDE.md"

gh issue create --title "feat(kb): create KB article reader view" \
  --label "enhancement,area: kb" --milestone "Phase 3: KB CRUD" --repo "$REPO" \
  --body "Implement /kb/[id] page:
- Clean rendered markdown view for article content
- Metadata sidebar: category, tags, related services, author, dates
- Edit and delete actions
- Links to related incidents or other KB articles (if available)"

# ─── Phase 4: RAG Query UI ───────────────────────────────────────────────────

gh issue create --title "feat(ask): create RAG query interface" \
  --label "enhancement,area: ask" --milestone "Phase 4: RAG Query UI" --repo "$REPO" \
  --body "Implement /ask page:
- Search bar with source type toggle (All / Incidents / KB only)
- Results as ranked cards with distinct styles for incident vs KB sources
- Answer panel rendering LLM-generated markdown
- Source cards linking back to incident/KB detail pages
- Mock AskResponse data initially"

gh issue create --title "feat(ask): add streaming support for RAG responses" \
  --label "enhancement,area: ask" --milestone "Phase 4: RAG Query UI" --repo "$REPO" \
  --body "Extend the /ask page and use-ask hook:
- Support streaming responses from /api/ask/stream via SSE or chunked response
- Progressive rendering of the answer as tokens arrive
- Loading state with typing indicator
- Graceful fallback to non-streaming endpoint"

# ─── Phase 5: Rules Management ───────────────────────────────────────────────

gh issue create --title "feat(rules): create rules list page with category filters" \
  --label "enhancement,area: rules" --milestone "Phase 5: Rules Management" --repo "$REPO" \
  --body "Implement /settings/rules page (admin-only):
- List view grouped/filterable by category (RAG Behavior / Agent Guardrail)
- Inline enable/disable toggles per rule
- Rule cards: title, category badge, priority number, enabled status
- Disabled rules visually dimmed but still visible
- Sorted by priority (lower number = higher priority)"

gh issue create --title "feat(rules): create/edit rule form" \
  --label "enhancement,area: rules" --milestone "Phase 5: Rules Management" --repo "$REPO" \
  --body "Implement rule form (used by /settings/rules/new and /settings/rules/[id]/edit):
- Fields: title, category dropdown (rag_behavior / agent_guardrail), priority number input, description (markdown editor for full rule definition and rationale), is_enabled toggle
- Validation with zod via react-hook-form
- Matches RuleFormData type from CLAUDE.md
- Admin-only access guard (placeholder until auth integration)"

# ─── Phase 1 (Dashboard) ─────────────────────────────────────────────────────

gh issue create --title "feat(dashboard): create main dashboard page" \
  --label "enhancement,area: dashboard" --milestone "Phase 1: Scaffold & Layout" --repo "$REPO" \
  --body "Implement / (dashboard) page:
- Stats cards: open incidents, critical incidents, avg resolution time, total KB articles, recently published KB articles
- Recent incidents table (last 10)
- Quick-search bar that routes to /ask
- Uses mock data via API layer"
```

---

## File Checklist

Verify all these files are present and committed before the initial push:

```
├── .editorconfig
├── .env.example
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── pull_request_template.md
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── .nvmrc
├── .prettierignore
├── .prettierrc
├── CLAUDE.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── REPO_SETUP.md             ← this file (delete after setup is complete)
├── next.config.js
├── package.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── ...
├── tailwind.config.ts
└── tsconfig.json
```

---

## Post-Setup Verification

Run through this checklist after completing all steps:

- [ ] Repository exists on GitHub with correct name and description
- [ ] `main` and `develop` branches both exist and are pushed
- [ ] Branch protection rules are active on both branches
- [ ] Labels are created (run `gh label list --repo <your-org>/incident-kb-rag-ui` to verify)
- [ ] Repository settings match the table in step 6
- [ ] `npm run dev` starts the dev server locally
- [ ] `npm run build` succeeds
- [ ] CI workflow runs on push (check **Actions** tab after first push)
- [ ] PR template appears when opening a new pull request
- [ ] Issue templates appear when creating a new issue
- [ ] `.env.local` is in `.gitignore` and NOT committed
- [ ] Milestones created (if using phased approach)
- [ ] Initial issues seeded (optional)
- [ ] Delete this `REPO_SETUP.md` file from the repo
