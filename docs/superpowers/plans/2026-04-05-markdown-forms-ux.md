# Markdown Rendering, Forms UX & Rich Text Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix inconsistent markdown rendering, add a Tiptap WYSIWYG editor for all markdown fields, add field helper text and tooltips, and restructure forms with card-per-section layout. Also add custom input for Impacted Services.

**Architecture:** Three new UI primitives (`MarkdownRenderer`, `RichTextEditor`, `FieldDescription`) built in `src/components/ui/`, then integrated into existing form and detail-view components. Tiptap handles WYSIWYG editing with bidirectional markdown conversion via `marked`/`turndown`.

**Tech Stack:** Tiptap (React), marked, turndown, lowlight, existing shadcn/ui Card + Tooltip components, Lucide icons

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install tiptap and conversion libraries**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-code-block-lowlight marked turndown lowlight
```

- [ ] **Step 2: Install type definitions**

```bash
npm install -D @types/turndown
```

- [ ] **Step 3: Verify installation compiles**

```bash
npm run type-check
```

Expected: no new type errors from these packages

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add tiptap, marked, turndown, lowlight for rich text editor"
```

---

### Task 2: Create MarkdownRenderer Component

**Files:**
- Create: `src/components/ui/markdown-renderer.tsx`
- Modify: `src/app/globals.css` (remove `.prose-incident` block, lines 174-189)

- [ ] **Step 1: Create the MarkdownRenderer component**

Create `src/components/ui/markdown-renderer.tsx`:

```tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  size?: "sm" | "default";
  className?: string;
}

const BASE_PROSE = [
  "prose max-w-none dark:prose-invert",
  "prose-headings:text-foreground prose-headings:font-semibold",
  "prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-xl",
  "prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg",
  "prose-p:text-muted-foreground prose-p:leading-relaxed",
  "prose-a:text-primary prose-a:underline prose-a:underline-offset-4",
  "prose-strong:text-foreground",
  "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:rounded-lg prose-pre:bg-muted prose-pre:border prose-pre:border-border",
  "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
  "prose-li:text-muted-foreground",
  "prose-table:text-sm prose-th:text-foreground prose-th:font-medium prose-td:text-muted-foreground",
].join(" ");

export function MarkdownRenderer({ content, size = "default", className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        BASE_PROSE,
        size === "sm" ? "prose-sm" : "prose-base",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Remove `.prose-incident` CSS from globals.css**

In `src/app/globals.css`, delete lines 174-189 (the entire `/* ── Markdown Prose ─── */` block including `.prose-incident h1, h2, h3`, `.prose-incident code`, and `.dark .prose-incident code` rules).

- [ ] **Step 3: Verify build passes**

```bash
npm run type-check
```

Expected: PASS (no consumers yet)

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/markdown-renderer.tsx src/app/globals.css
git commit -m "feat: add unified MarkdownRenderer component, remove prose-incident CSS"
```

---

### Task 3: Replace Markdown Rendering in AnswerPanel, Incident Detail, and KB Detail

**Files:**
- Modify: `src/components/ask/AnswerPanel.tsx`
- Modify: `src/app/(dashboard)/incidents/[id]/page.tsx`
- Modify: `src/app/(dashboard)/kb/[id]/page.tsx`

- [ ] **Step 1: Update AnswerPanel**

In `src/components/ask/AnswerPanel.tsx`:

1. Replace the `react-markdown` and `remark-gfm` imports with:
```tsx
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
```

2. Replace the entire `<div className="prose-incident prose prose-sm ...">` block (lines 58-60) with:
```tsx
<MarkdownRenderer content={answer} size="sm" />
```

Remove the unused `ReactMarkdown` and `remarkGfm` imports.

- [ ] **Step 2: Update Incident Detail page**

In `src/app/(dashboard)/incidents/[id]/page.tsx`:

1. Replace the `react-markdown` and `remark-gfm` imports with:
```tsx
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
```

2. Replace the Description section's markdown rendering (lines 164-168):
```tsx
<MarkdownRenderer content={incident.description} size="sm" />
```

3. Replace the Fix Details section's markdown rendering (lines 182-186):
```tsx
<MarkdownRenderer content={incident.fix_details} size="sm" />
```

Remove unused `ReactMarkdown` and `remarkGfm` imports.

- [ ] **Step 3: Update KB Article Detail page**

In `src/app/(dashboard)/kb/[id]/page.tsx`:

1. Replace the `react-markdown` and `remark-gfm` imports with:
```tsx
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
```

2. Replace the `<CardContent className="prose prose-sm max-w-none ...">` block (lines 283-287) with:
```tsx
<CardContent>
  <MarkdownRenderer content={article.content} />
</CardContent>
```

Remove unused `ReactMarkdown` and `remarkGfm` imports.

- [ ] **Step 4: Verify build**

```bash
npm run type-check
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ask/AnswerPanel.tsx src/app/\(dashboard\)/incidents/\[id\]/page.tsx src/app/\(dashboard\)/kb/\[id\]/page.tsx
git commit -m "refactor: replace inline ReactMarkdown with unified MarkdownRenderer"
```

---

### Task 4: Create FieldDescription Component

**Files:**
- Create: `src/components/ui/field-description.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/ui/field-description.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface FieldDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function FieldDescription({ children, className }: FieldDescriptionProps) {
  return (
    <p className={cn("text-xs text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/field-description.tsx
git commit -m "feat: add FieldDescription component for consistent form helper text"
```

---

### Task 5: Create LabelWithTooltip Helper

**Files:**
- Create: `src/components/ui/label-with-tooltip.tsx`

- [ ] **Step 1: Create the component**

This combines a `<Label>` with an optional `?` icon that shows a tooltip on hover. Uses the existing `@base-ui/react` Tooltip component from `src/components/ui/tooltip.tsx`.

Create `src/components/ui/label-with-tooltip.tsx`:

```tsx
"use client";

import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LabelWithTooltipProps {
  htmlFor?: string;
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export function LabelWithTooltip({
  htmlFor,
  children,
  tooltip,
  className,
}: LabelWithTooltipProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{children}</Label>
      {tooltip && (
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="size-3.5" />
              <span className="sr-only">Help</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run type-check
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/label-with-tooltip.tsx
git commit -m "feat: add LabelWithTooltip component for field-level help tooltips"
```

---

### Task 6: Create RichTextEditor Component

**Files:**
- Create: `src/components/ui/rich-text-editor.tsx`

- [ ] **Step 1: Create the RichTextEditor component**

Create `src/components/ui/rich-text-editor.tsx`:

```tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  CodeSquare,
  Link as LinkIcon,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TurndownService from "turndown";
import { marked } from "marked";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

function markdownToHtml(md: string): string {
  if (!md) return "";
  return marked.parse(md, { async: false }) as string;
}

function htmlToMarkdown(html: string): string {
  if (!html || html === "<p></p>") return "";
  return turndown.turndown(html);
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1.5 text-sm transition-colors",
        "hover:bg-muted hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-muted text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-lg bg-muted border border-border p-3 font-mono text-sm",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: markdownToHtml(value),
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return;
      const md = htmlToMarkdown(editor.getHTML());
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
          "prose-headings:text-foreground prose-p:text-muted-foreground",
          "prose-strong:text-foreground prose-a:text-primary",
          "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-foreground",
          "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
          "prose-li:text-muted-foreground",
        ),
      },
    },
  });

  // Sync external value changes into editor
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const currentMd = htmlToMarkdown(editor.getHTML());
    if (currentMd !== value) {
      isUpdatingRef.current = true;
      editor.commands.setContent(markdownToHtml(value));
      isUpdatingRef.current = false;
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <CodeSquare className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive("link")}
          title="Link"
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="px-3 py-2" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run type-check
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/rich-text-editor.tsx
git commit -m "feat: add Tiptap-based RichTextEditor with toolbar and markdown conversion"
```

---

### Task 7: Rebuild IncidentForm with Cards, Helpers, Tooltips, and RichTextEditor

**Files:**
- Modify: `src/components/incidents/IncidentForm.tsx`

- [ ] **Step 1: Update imports**

Replace the imports section (lines 1-25) of `src/components/incidents/IncidentForm.tsx` with:

```tsx
"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FieldDescription } from "@/components/ui/field-description";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { slideUp } from "@/lib/animations";
import { mockServices } from "@/lib/mock/services";
import { mockTeams } from "@/lib/mock/teams";
import type { IncidentFormData, IncidentSeverity } from "@/lib/types";
```

Remove the `Label`, `Textarea`, and `Separator` imports since they are no longer used.

- [ ] **Step 2: Add custom service input state and handler**

After the existing `removeService` function (after line 87), add a `customServiceInput` state and `addCustomService` handler. Also add a `Controller` import (already in updated imports above) since we need it for RichTextEditor fields.

Add inside the component, after the `removeService` function:

```tsx
const [customServiceInput, setCustomServiceInput] = useState("");

const addCustomService = useCallback(() => {
  const trimmed = customServiceInput.trim();
  if (trimmed && !selectedServices.includes(trimmed)) {
    const next = [...selectedServices, trimmed];
    setSelectedServices(next);
    setValue("impacted_services", next, { shouldValidate: true });
  }
  setCustomServiceInput("");
}, [customServiceInput, selectedServices, setValue]);

const handleCustomServiceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addCustomService();
  }
};
```

- [ ] **Step 3: Rebuild the form JSX**

Replace the entire `return (...)` block (lines 96-281) with the card-based layout:

```tsx
return (
  <motion.form
    variants={slideUp}
    initial="hidden"
    animate="visible"
    onSubmit={handleSubmit(processSubmit)}
    className="space-y-6"
  >
    {/* Card 1: Incident Details */}
    <Card>
      <CardHeader>
        <CardTitle>Incident Details</CardTitle>
        <CardDescription>Basic information about the incident.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <LabelWithTooltip htmlFor="title">Title</LabelWithTooltip>
            <Input
              id="title"
              placeholder="Brief description of the incident"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            <FieldDescription>A short, descriptive name for the incident</FieldDescription>
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <LabelWithTooltip
              tooltip="Low: minimal impact, workaround available. Medium: moderate impact, degraded service. High: major impact, service significantly impaired. Critical: complete outage or data loss, immediate action required."
            >
              Severity
            </LabelWithTooltip>
            <Select
              value={currentSeverity}
              onValueChange={(val) => { if (val) setValue("severity", val as IncidentSeverity, { shouldValidate: true }); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Impact level on services and users</FieldDescription>
          </div>

          <div className="space-y-2">
            <LabelWithTooltip>Responsible Team</LabelWithTooltip>
            <Select
              value={currentTeam}
              onValueChange={(val) => { if (val) setValue("responsible_team", val, { shouldValidate: true }); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {mockTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>The team that owns investigation and resolution</FieldDescription>
            {errors.responsible_team && (
              <p className="text-sm text-destructive">{errors.responsible_team.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Card 2: Impacted Services */}
    <Card>
      <CardHeader>
        <CardTitle>Impacted Services</CardTitle>
        <CardDescription>Select from catalog or type a custom service name.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedServices.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedServices.map((svcId) => {
              const svc = mockServices.find((s) => s.id === svcId);
              return (
                <Badge key={svcId} variant="secondary" className="gap-1 pr-1">
                  {svc?.name ?? svcId}
                  <button
                    type="button"
                    onClick={() => removeService(svcId)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {mockServices.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className={`flex flex-col items-start rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-primary/50 bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-border hover:bg-muted/50"
                }`}
              >
                <span className={`font-medium ${isSelected ? "text-foreground" : ""}`}>
                  {service.name}
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                  {service.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom service input */}
        <div className="flex items-center gap-2">
          <Input
            value={customServiceInput}
            onChange={(e) => setCustomServiceInput(e.target.value)}
            onKeyDown={handleCustomServiceKeyDown}
            placeholder="Add a custom service name..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomService}
            disabled={!customServiceInput.trim()}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Card 3: Description & Resolution */}
    <Card>
      <CardHeader>
        <CardTitle>Description &amp; Resolution</CardTitle>
        <CardDescription>Provide detailed information about the incident.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <LabelWithTooltip htmlFor="description">Description</LabelWithTooltip>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Describe the incident: what happened, the impact, and the timeline..."
                minHeight="200px"
              />
            )}
          />
          <FieldDescription>What happened, when, and what is the current impact</FieldDescription>
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <LabelWithTooltip htmlFor="fix_details">Fix Details (optional)</LabelWithTooltip>
          <Controller
            name="fix_details"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Describe the fix applied, root cause, and any follow-up actions..."
                minHeight="150px"
              />
            )}
          />
          <FieldDescription>Steps taken or planned to resolve the incident</FieldDescription>
        </div>
      </CardContent>
    </Card>

    {/* Actions */}
    <div className="flex items-center justify-end gap-3">
      <Button type="button" variant="outline" onClick={() => window.history.back()}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
        {isEditing ? "Update Incident" : "Create Incident"}
      </Button>
    </div>
  </motion.form>
);
```

Note: The component now needs `control` from `useForm`. Update the destructuring (around line 54-60) to include `control`:

```tsx
const {
  register,
  handleSubmit,
  setValue,
  watch,
  control,
  formState: { errors, isSubmitting },
} = useForm<IncidentFormData>({
```

- [ ] **Step 4: Verify build**

```bash
npm run type-check
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/incidents/IncidentForm.tsx
git commit -m "feat: rebuild IncidentForm with cards, helpers, tooltips, rich editor, custom service input"
```

---

### Task 8: Rebuild ArticleForm with Cards, Helpers, Tooltips, and RichTextEditor

**Files:**
- Modify: `src/components/kb/ArticleForm.tsx`

- [ ] **Step 1: Update imports**

Replace the imports in `src/components/kb/ArticleForm.tsx` (lines 1-24). Remove `Textarea` import. Add the new components:

```tsx
"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FieldDescription } from "@/components/ui/field-description";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { cn } from "@/lib/utils";
import { slideUp } from "@/lib/animations";
import type { KbArticleFormData, KbArticleCategory, KbArticleStatus } from "@/lib/types";
```

Note: `Textarea` is still needed for the `summary` field. `Separator` is still needed inside the sidebar card. The `Label` import is removed (replaced by `LabelWithTooltip`).

- [ ] **Step 2: Replace the main content column JSX**

Replace the main content area (lines 211-253 — the `<div className="space-y-6">` inside the grid) with a Card wrapper plus updated fields:

```tsx
{/* Main content area */}
<Card>
  <CardHeader>
    <CardTitle>Article Content</CardTitle>
    <CardDescription>The main article body and metadata.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Title */}
    <div className="space-y-2">
      <LabelWithTooltip htmlFor="title">Title</LabelWithTooltip>
      <Input
        id="title"
        placeholder="Article title"
        className="h-11 text-lg font-medium"
        {...register("title")}
      />
      <FieldDescription>Clear, searchable title for the article</FieldDescription>
      {errors.title && (
        <p className="text-xs text-destructive">{errors.title.message}</p>
      )}
    </div>

    {/* Summary */}
    <div className="space-y-2">
      <LabelWithTooltip htmlFor="summary">Summary</LabelWithTooltip>
      <Textarea
        id="summary"
        placeholder="A brief summary of the article for search result previews..."
        rows={3}
        {...register("summary")}
      />
      <FieldDescription>Brief plain-text summary shown in search results</FieldDescription>
      {errors.summary && (
        <p className="text-xs text-destructive">{errors.summary.message}</p>
      )}
    </div>

    {/* Content */}
    <div className="space-y-2">
      <LabelWithTooltip htmlFor="content">Content</LabelWithTooltip>
      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <RichTextEditor
            value={field.value}
            onChange={field.onChange}
            placeholder="Write your article content here..."
            minHeight="400px"
          />
        )}
      />
      <FieldDescription>The full article body</FieldDescription>
      {errors.content && (
        <p className="text-xs text-destructive">{errors.content.message}</p>
      )}
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 3: Update sidebar with helpers and tooltips**

Replace the sidebar section (lines 256-350) — the `<div className="space-y-4">` containing the Metadata card. The card structure stays but labels get tooltips and helpers:

```tsx
{/* Sidebar metadata */}
<div className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Metadata</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Category */}
      <div className="space-y-2">
        <LabelWithTooltip
          tooltip="Runbook: step-by-step procedures. Troubleshooting: diagnostic guides. FAQ: common questions. SOP: standard operating procedures. Configuration: system settings docs. Architecture: system design docs. General: everything else."
        >
          Category
        </LabelWithTooltip>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val) => { if (val) field.onChange(val); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <LabelWithTooltip
          tooltip="Draft: only visible to editors, not included in search results. Published: visible to all users and included in RAG retrieval. Archived: hidden from search but retained for reference."
        >
          Status
        </LabelWithTooltip>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val) => { if (val) field.onChange(val); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-2">
        <LabelWithTooltip>Tags</LabelWithTooltip>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagsInput value={field.value} onChange={field.onChange} />
          )}
        />
        <FieldDescription>Freeform tags for filtering and retrieval</FieldDescription>
      </div>

      <Separator />

      {/* Related Services */}
      <div className="space-y-2">
        <LabelWithTooltip>Related Services</LabelWithTooltip>
        <Controller
          name="related_services"
          control={control}
          render={({ field }) => (
            <ServiceCheckboxes
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </CardContent>
  </Card>
</div>
```

- [ ] **Step 4: Verify build**

```bash
npm run type-check
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/kb/ArticleForm.tsx
git commit -m "feat: rebuild ArticleForm with card layout, helpers, tooltips, rich editor"
```

---

### Task 9: Rebuild RuleForm with Two Cards, Helpers, Tooltips, and RichTextEditor

**Files:**
- Modify: `src/components/rules/RuleForm.tsx`

- [ ] **Step 1: Update imports**

Replace imports (lines 1-20) of `src/components/rules/RuleForm.tsx`:

```tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FieldDescription } from "@/components/ui/field-description";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import type { RuleFormData, RuleCategory } from "@/lib/types";
```

Remove `Textarea` and `Label` imports.

- [ ] **Step 2: Add `control` to useForm destructuring**

Update the useForm destructuring (around line 44-49) to include `control`:

```tsx
const {
  register,
  handleSubmit,
  watch,
  setValue,
  control,
  formState: { errors },
} = useForm<RuleSchemaValues>({
```

- [ ] **Step 3: Replace the form JSX**

Replace the entire `return (...)` block (lines 68-179) with:

```tsx
return (
  <form onSubmit={handleFormSubmit} className="space-y-6">
    {/* Card 1: Rule Details */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rule Details</CardTitle>
        <CardDescription>Basic information and classification.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <LabelWithTooltip htmlFor="title">Title</LabelWithTooltip>
          <Input
            id="title"
            placeholder="e.g. Staleness Disclaimer Required"
            {...register("title")}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Category & Priority row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Category */}
          <div className="space-y-2">
            <LabelWithTooltip
              tooltip="RAG Behavior: controls how the RAG pipeline retrieves and generates answers (relevance thresholds, source preferences, staleness policies). Agent Guardrail: defines what the agent can and cannot do autonomously within the incident automation workflow."
            >
              Category
            </LabelWithTooltip>
            <Select
              value={category}
              onValueChange={(val) => {
                if (val) setValue("category", val as RuleCategory);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <LabelWithTooltip
              htmlFor="priority"
              tooltip="Rules are evaluated in priority order. When rules conflict, lower-priority-number rules take precedence. For example, a rule with priority 1 overrides a rule with priority 10."
            >
              Priority
            </LabelWithTooltip>
            <Input
              id="priority"
              type="number"
              min={1}
              placeholder="1"
              {...register("priority")}
              aria-invalid={!!errors.priority}
            />
            <FieldDescription>
              Lower number = higher priority (evaluated first).
            </FieldDescription>
            {errors.priority && (
              <p className="text-xs text-destructive">{errors.priority.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Card 2: Rule Definition */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rule Definition</CardTitle>
        <CardDescription>The full rule definition, rationale, and activation state.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Description */}
        <div className="space-y-2">
          <LabelWithTooltip htmlFor="description">Description</LabelWithTooltip>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Full rule definition and rationale..."
                minHeight="200px"
              />
            )}
          />
          <FieldDescription>
            Define the rule, its scope, and rationale.
          </FieldDescription>
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Enabled toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Enabled</p>
            <p className="text-xs text-muted-foreground">
              Disabled rules are retained but not enforced by the agent.
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked: boolean) => setValue("is_enabled", checked)}
          />
        </div>
      </CardContent>
    </Card>

    {/* Submit */}
    <div className="flex items-center justify-end gap-3">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        {defaultValues ? "Save Changes" : "Create Rule"}
      </Button>
    </div>
  </form>
);
```

- [ ] **Step 4: Verify build**

```bash
npm run type-check
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/rules/RuleForm.tsx
git commit -m "feat: rebuild RuleForm with two cards, helpers, tooltips, rich editor"
```

---

### Task 10: Add Tiptap Placeholder CSS

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add Tiptap placeholder styling**

Tiptap's placeholder extension requires a small CSS rule for the empty-state placeholder text. Add to the end of `src/app/globals.css`:

```css
/* ── Tiptap Editor ─── */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-muted-foreground);
  pointer-events: none;
  height: 0;
}
```

- [ ] **Step 2: Verify dev server renders correctly**

```bash
npm run build
```

Expected: PASS (no build errors)

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add Tiptap placeholder CSS for rich text editor"
```

---

### Task 11: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run type-check**

```bash
npm run type-check
```

Expected: PASS

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: PASS (or only pre-existing warnings)

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: PASS — all pages compile successfully

- [ ] **Step 4: Manual spot-check**

Start dev server (`npm run dev`) and visually verify:
1. `/ask` — AnswerPanel renders markdown with consistent prose styling
2. `/incidents/{id}` — description and fix_details render with consistent prose
3. `/kb/{id}` — article content renders with consistent prose
4. `/incidents/new` — 3 cards, helper text under fields, severity tooltip works, rich editor for description/fix_details, custom service input
5. `/kb/new` — card layout, helper text, category/status tooltips, rich editor for content
6. `/settings/rules/new` — 2 cards, category/priority tooltips, rich editor for description

- [ ] **Step 5: Commit any fixes if needed, then final commit**

```bash
git add -A
git commit -m "chore: final verification and cleanup for markdown/forms UX enhancements"
```
