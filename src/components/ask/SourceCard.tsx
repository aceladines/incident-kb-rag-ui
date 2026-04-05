"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, BookOpen, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { truncate } from "@/lib/utils";
import type { SourceReference } from "@/lib/types";

interface SourceCardProps {
  source: SourceReference;
  index: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  low: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  investigating: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  resolved: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const CATEGORY_COLORS: Record<string, string> = {
  runbook: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  troubleshooting: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  faq: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
  sop: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20",
  configuration: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
  architecture: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  general: "bg-muted text-muted-foreground border-border",
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function SourceCard({ source, index }: SourceCardProps) {
  if (source.type === "incident") {
    const incident = source.data;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.3 }}
      >
        <Link href={`/incidents/${incident.id}`}>
          <Card className="group/source relative overflow-hidden border-l-4 border-l-red-500/60 transition-colors hover:bg-muted/30">
            <CardContent className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-red-500/10">
                <AlertTriangle className="size-4 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Incident</span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", SEVERITY_COLORS[incident.severity])}
                  >
                    {capitalize(incident.severity)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", STATUS_COLORS[incident.status])}
                  >
                    {capitalize(incident.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {incident.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {truncate(incident.description, 160)}
                </p>
              </div>
              <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/source:opacity-100" />
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  }

  const article = source.data;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Link href={`/kb/${article.id}`}>
        <Card className="group/source relative overflow-hidden border-l-4 border-l-blue-500/60 transition-colors hover:bg-muted/30">
          <CardContent className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
              <BookOpen className="size-4 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">KB Article</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs", CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.general)}
                >
                  {capitalize(article.category)}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-foreground">
                {article.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {truncate(article.summary, 160)}
              </p>
            </div>
            <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/source:opacity-100" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
