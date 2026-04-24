"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, BookOpen, FileCode, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceReference } from "@/lib/types";

interface SourceCardProps {
  source: SourceReference;
  index: number;
}

const TYPE_CONFIG = {
  incident: {
    icon: AlertTriangle,
    label: "Incident",
    accent: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/8 hover:bg-red-500/14 dark:bg-red-500/10 dark:hover:bg-red-500/18",
    border: "border-red-500/15 hover:border-red-500/30",
    href: (id: string) => `/incidents/${id}`,
  },
  kb_article: {
    icon: BookOpen,
    label: "KB",
    accent: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/8 hover:bg-blue-500/14 dark:bg-blue-500/10 dark:hover:bg-blue-500/18",
    border: "border-blue-500/15 hover:border-blue-500/30",
    href: (id: string) => `/kb/${id}`,
  },
  tech_spec: {
    icon: FileCode,
    label: "Spec",
    accent: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/8 hover:bg-violet-500/14 dark:bg-violet-500/10 dark:hover:bg-violet-500/18",
    border: "border-violet-500/15 hover:border-violet-500/30",
    href: (id: string) => `/tech-specs/${id}`,
  },
} as const;

export function SourceCard({ source, index }: SourceCardProps) {
  const config = TYPE_CONFIG[source.type as keyof typeof TYPE_CONFIG];
  const Icon = config.icon;
  const title = source.data.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <Link href={config.href(source.data.id)}>
        <div
          className={cn(
            "group flex w-full items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200",
            config.bg,
            config.border
          )}
        >
          <Icon className={cn("size-3.5 shrink-0", config.accent)} />
          <span className="text-xs font-medium text-muted-foreground">
            {config.label}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {title}
          </span>
          <ArrowUpRight className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>
    </motion.div>
  );
}
