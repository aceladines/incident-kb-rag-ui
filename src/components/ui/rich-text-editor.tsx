"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { marked } from "marked";
import TurndownService from "turndown";
import { useEffect, useRef, useCallback } from "react";
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

// Module-level TurndownService instance
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// ────────────────────────────────────────────────────────────
// Internal sub-components
// ────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
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

// ────────────────────────────────────────────────────────────
// RichTextEditor
// ────────────────────────────────────────────────────────────

export interface RichTextEditorProps {
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
  // Flag to prevent the onUpdate callback from firing when we programmatically
  // set content (external value sync), which would create an update loop.
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-md bg-muted px-4 py-3 font-mono text-sm text-foreground",
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
    editorProps: {
      attributes: {
        class: [
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
          "prose-headings:text-foreground prose-p:text-muted-foreground",
          "prose-strong:text-foreground prose-a:text-primary",
          "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-foreground",
          "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
          "prose-li:text-muted-foreground",
        ].join(" "),
      },
    },
    onUpdate({ editor: ed }) {
      if (isUpdatingRef.current) return;
      const html = ed.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  // Sync external value changes into the editor, but only when not focused
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;

    // Convert incoming markdown to HTML for Tiptap
    const html = marked(value ?? "", { async: false }) as string;

    // Only update if content has actually changed to avoid unnecessary re-renders
    const currentHtml = editor.getHTML();
    if (currentHtml === html) return;

    isUpdatingRef.current = true;
    editor.commands.setContent(html, { emitUpdate: false });
    isUpdatingRef.current = false;
  }, [editor, value]);

  const handleLinkInsert = useCallback(() => {
    if (!editor) return;

    // eslint-disable-next-line no-alert -- intentional: simple UX for link insertion
    const url = window.prompt("Enter URL:");

    if (url === null) {
      // User cancelled — do nothing
      return;
    }

    if (url === "") {
      // Empty string — unset link
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive("bold")}
          disabled={!editor}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive("italic")}
          disabled={!editor}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          isActive={editor?.isActive("strike")}
          disabled={!editor}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor?.isActive("heading", { level: 2 })}
          disabled={!editor}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor?.isActive("heading", { level: 3 })}
          disabled={!editor}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive("bulletList")}
          disabled={!editor}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive("orderedList")}
          disabled={!editor}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Code */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCode().run()}
          isActive={editor?.isActive("code")}
          disabled={!editor}
          title="Inline Code"
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          isActive={editor?.isActive("codeBlock")}
          disabled={!editor}
          title="Code Block"
        >
          <CodeSquare size={16} />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Link & Blockquote */}
        <ToolbarButton
          onClick={handleLinkInsert}
          isActive={editor?.isActive("link")}
          disabled={!editor}
          title="Link"
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive("blockquote")}
          disabled={!editor}
          title="Blockquote"
        >
          <Quote size={16} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="px-3 py-2" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
