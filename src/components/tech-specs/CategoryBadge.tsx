"use client";

import { cn } from "@/lib/utils";
import type { TechSpecCategory } from "@/lib/types";

interface CategoryBadgeProps {
  category: TechSpecCategory;
  className?: string;
}

const categoryConfig: Record<
  TechSpecCategory,
  { label: string; className: string }
> = {
  api: {
    label: "API",
    className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  architecture: {
    label: "Architecture",
    className: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
  infrastructure: {
    label: "Infrastructure",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  database: {
    label: "Database",
    className: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  security: {
    label: "Security",
    className: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  networking: {
    label: "Networking",
    className: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  integration: {
    label: "Integration",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
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
