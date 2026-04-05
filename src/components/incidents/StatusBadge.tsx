"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IncidentStatus } from "@/lib/types";

const STATUS_CONFIG: Record<IncidentStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  investigating: {
    label: "Investigating",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground border-border",
  },
};

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
