"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RuleCategory } from "@/lib/types";

const CATEGORY_CONFIG: Record<RuleCategory, { label: string; className: string }> = {
  rag_behavior: {
    label: "RAG Behavior",
    className: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  agent_guardrail: {
    label: "Agent Guardrail",
    className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
};

interface RuleCategoryBadgeProps {
  category: RuleCategory;
  className?: string;
}

export function RuleCategoryBadge({ category, className }: RuleCategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
