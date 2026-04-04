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
