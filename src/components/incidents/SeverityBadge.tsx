"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IncidentSeverity } from "@/lib/types";

const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  },
  high: {
    label: "High",
    className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  low: {
    label: "Low",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
};

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
