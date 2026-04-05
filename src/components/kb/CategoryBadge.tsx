"use client";

import { cn } from "@/lib/utils";
import type { KbArticleCategory } from "@/lib/types";

interface CategoryBadgeProps {
  category: KbArticleCategory;
  className?: string;
}

const categoryConfig: Record<
  KbArticleCategory,
  { label: string; className: string }
> = {
  runbook: {
    label: "Runbook",
    className: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  troubleshooting: {
    label: "Troubleshooting",
    className: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  faq: {
    label: "FAQ",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  sop: {
    label: "SOP",
    className: "bg-green-500/15 text-green-600 dark:text-green-400",
  },
  configuration: {
    label: "Configuration",
    className: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
  architecture: {
    label: "Architecture",
    className: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
  general: {
    label: "General",
    className: "bg-muted text-muted-foreground",
  },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
