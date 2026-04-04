# Markdown Rendering, Forms UX & Rich Text Editor

**Date:** 2026-04-05
**Status:** Approved

---

## Problem Statement

Three issues degrade the UI/UX:

1. **Broken/inconsistent markdown rendering** — AnswerPanel, Incident Detail, and KB Detail each define their own inline prose classes. Some miss blockquotes, tables, or links. No shared component.
2. **Poor form section separation** — forms use thin `<Separator />` lines between sections. Hard to visually parse field groups.
3. **No field helpers or rich editing** — most form fields lack helper text. All markdown fields are plain `<textarea>` with no formatting tools. Users must know markdown syntax.

---

## Design

### 1. Unified Markdown Renderer

Create `src/components/ui/markdown-renderer.tsx`:

- Wraps `react-markdown` + `remarkGfm` in a single reusable component
- Consolidates all prose styling (based on KB detail's classes — the most complete)
- Accepts a `size` prop (`"sm" | "default"`) for compact vs full reading contexts
- Replace all 3 existing `ReactMarkdown` usages:
  - `src/components/ask/AnswerPanel.tsx`
  - `src/app/(dashboard)/incidents/[id]/page.tsx` (description + fix_details)
  - `src/app/(dashboard)/kb/[id]/page.tsx`
- Remove `.prose-incident` custom CSS from `globals.css`

### 2. Rich Text Editor (Tiptap WYSIWYG)

**Dependencies to install:**
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-code-block-lowlight`
- `turndown` (HTML to Markdown) + `marked` (Markdown to HTML)
- `@types/turndown` (dev dependency)
- `lowlight` (for code block syntax highlighting)

Create `src/components/ui/rich-text-editor.tsx`:

- **Toolbar:** Bold, Italic, Strikethrough | H2, H3 | Bullet List, Ordered List | Code inline, Code Block | Link, Blockquote
- Toolbar buttons: small icon buttons with `border-border`, active state highlighting
- Editor area styled to match existing input/textarea theming (bg-background, border, rounded, focus ring)
- **Props:** `value` (markdown string), `onChange` (returns markdown string), `placeholder`, `minHeight`
- Bidirectional conversion: Markdown -> HTML on mount/value change, HTML -> Markdown on editor changes
- Integration with `react-hook-form` via `onChange` callback returning markdown

**Fields to upgrade:**
| Form | Field | Current | New |
|------|-------|---------|-----|
| IncidentForm | description | textarea (10 rows) | RichTextEditor |
| IncidentForm | fix_details | textarea (6 rows) | RichTextEditor |
| ArticleForm | content | textarea (20 rows) | RichTextEditor |
| RuleForm | description | textarea (min-h-40) | RichTextEditor |

**Not upgraded** (short plain-text fields): ArticleForm `summary`

### 3. Field Helper Text & Tooltips

Create `src/components/ui/field-description.tsx`:
- Styled `<p>` with `text-xs text-muted-foreground mt-1`
- Consistent helper text placement under fields

For fields needing extended explanations, add a `HelpCircle` icon (14px) next to the Label, wrapped in the existing Tooltip component.

**IncidentForm helpers:**

| Field | Helper text | Tooltip |
|-------|------------|---------|
| Title | "A short, descriptive name for the incident" | No |
| Severity | "Impact level on services and users" | Yes — explains each severity level |
| Responsible Team | "The team that owns investigation and resolution" | No |
| Impacted Services | "Select from catalog or type a custom service name" | No |
| Description | "What happened, when, and what is the current impact" | No |
| Fix Details | "Steps taken or planned to resolve the incident" | No |

**ArticleForm helpers:**

| Field | Helper text | Tooltip |
|-------|------------|---------|
| Title | "Clear, searchable title for the article" | No |
| Summary | "Brief plain-text summary shown in search results" | No |
| Category | (none) | Yes — explains each category type |
| Tags | "Freeform tags for filtering and retrieval" | No |
| Content | "The full article body" | No |
| Status | (none) | Yes — explains draft vs published vs archived |

**RuleForm** — migrate existing helpers to `<FieldDescription />`, add tooltips:

| Field | Tooltip |
|-------|---------|
| Priority | Yes — extended explanation of priority ordering |
| Category | Yes — explains rag_behavior vs agent_guardrail |

### 4. Card-Per-Section Form Layout

Wrap each logical section in `<Card>` + `<CardHeader>` + `<CardContent>`. Remove `<Separator />` dividers.

**IncidentForm** — 3 cards:
1. **Incident Details** — title, severity, responsible team (grid layout)
2. **Impacted Services** — service selection grid + custom text input for unlisted services
3. **Description & Resolution** — description editor, fix details editor

**ArticleForm** — 2-column layout:
1. **Main column**: one card with title, summary, content editor
2. **Sidebar**: existing Metadata card (ensure styling consistency)

**RuleForm** — 2 cards:
1. **Rule Details** — title, category, priority
2. **Rule Definition** — description editor, enabled toggle

**Impacted Services custom input:**
- Add a text input field above or below the service grid allowing agents to type a custom service name and add it (Enter or "Add" button)
- Custom entries appear as badges alongside catalog-selected services
- Both catalog selections and custom entries are stored in the `impacted_services` array

Action buttons (Cancel / Submit) sit outside cards, aligned right at bottom.

---

## Files Changed

**New files:**
- `src/components/ui/markdown-renderer.tsx`
- `src/components/ui/rich-text-editor.tsx`
- `src/components/ui/field-description.tsx`

**Modified files:**
- `src/components/ask/AnswerPanel.tsx` — use MarkdownRenderer
- `src/app/(dashboard)/incidents/[id]/page.tsx` — use MarkdownRenderer
- `src/app/(dashboard)/kb/[id]/page.tsx` — use MarkdownRenderer
- `src/components/incidents/IncidentForm.tsx` — card sections, helpers, tooltips, RichTextEditor
- `src/components/kb/ArticleForm.tsx` — card sections, helpers, tooltips, RichTextEditor
- `src/components/rules/RuleForm.tsx` — card sections, helpers, tooltips, RichTextEditor
- `src/app/globals.css` — remove `.prose-incident` custom CSS
- `package.json` — new dependencies

---

## Out of Scope

- Auth forms (LoginForm, SignupForm) — no markdown or complex fields
- ArticleForm `summary` field — stays as plain textarea (short plain text)
- Dashboard components — no markdown rendering needed
- Backend changes — none required
