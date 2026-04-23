"use client";

import { cn } from "@/lib/utils";
import type { TechSpecStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: TechSpecStatus;
  className?: string;
}

const statusConfig: Record<
  TechSpecStatus,
  { label: string; className: string; dotClassName: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    dotClassName: "bg-amber-500",
  },
  published: {
    label: "Published",
    className: "bg-green-500/15 text-green-600 dark:text-green-400",
    dotClassName: "bg-green-500",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
    dotClassName: "bg-muted-foreground",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", config.dotClassName)}
      />
      {config.label}
    </span>
  );
}
