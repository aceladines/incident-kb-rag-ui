"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, BookOpen, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface DashboardStats {
  openIncidents: number;
  criticalIncidents: number;
  avgResolution: string;
  totalArticles: number;
  publishedArticles: number;
  activeRules: number;
  guardrailRules: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

interface StatCardConfig {
  label: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconClassName: string;
}

function buildCards(stats: DashboardStats): StatCardConfig[] {
  return [
    {
      label: "Open Incidents",
      value: stats.openIncidents,
      subtitle: `${stats.criticalIncidents} critical`,
      icon: AlertTriangle,
      iconClassName: "border-red-500 text-red-500",
    },
    {
      label: "Avg Resolution",
      value: stats.avgResolution,
      subtitle: "Last 30 days",
      icon: Clock,
      iconClassName: "border-blue-500 text-blue-500",
    },
    {
      label: "KB Articles",
      value: stats.totalArticles,
      subtitle: `${stats.publishedArticles} published`,
      icon: BookOpen,
      iconClassName: "border-emerald-500 text-emerald-500",
    },
    {
      label: "Active Rules",
      value: stats.activeRules,
      subtitle: `${stats.guardrailRules} guardrails`,
      icon: ShieldCheck,
      iconClassName: "border-amber-500 text-amber-500",
    },
  ];
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = buildCards(stats);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} variants={staggerItem}>
            <Card className="relative overflow-hidden transition-colors duration-200 hover:border-primary/25">
              {/* Red accent line */}
              <div className="absolute left-4 right-4 top-0 h-[2px] rounded-b-sm bg-gradient-to-r from-primary to-transparent" />
              <CardContent className="flex items-start justify-between pt-5">
                <div className="space-y-1">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="text-[28px] font-extrabold tracking-tight text-foreground">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2",
                    card.iconClassName,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
