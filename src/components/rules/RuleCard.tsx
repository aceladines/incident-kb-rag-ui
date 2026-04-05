"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Hash, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RuleCategoryBadge } from "@/components/rules/RuleCategoryBadge";
import { cn } from "@/lib/utils";
import { truncate } from "@/lib/utils";
import type { Rule } from "@/lib/types";

interface RuleCardProps {
  rule: Rule;
  onToggle: (id: string, enabled: boolean) => void;
}

export function RuleCard({ rule, onToggle }: RuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card
        className={cn(
          "transition-opacity",
          !rule.is_enabled && "opacity-60"
        )}
      >
        <CardContent className="flex items-start gap-4">
          {/* Priority indicator */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <div className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground">
              <Hash className="size-3" />
              {rule.priority}
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <RuleCategoryBadge category={rule.category} />
            </div>
            <p className="mt-1.5 text-sm font-medium text-foreground">
              {rule.title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {truncate(rule.description, 180)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-3">
            <Link href={`/settings/rules/${rule.id}/edit`}>
              <Button variant="ghost" size="icon-sm">
                <Pencil className="size-3.5" />
              </Button>
            </Link>
            <div className="flex flex-col items-center gap-1">
              <Switch
                checked={rule.is_enabled}
                onCheckedChange={(checked: boolean) => onToggle(rule.id, checked)}
              />
              <span className="text-[10px] text-muted-foreground">
                {rule.is_enabled ? "On" : "Off"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
