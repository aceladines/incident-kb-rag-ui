"use client";

import { Loader2 } from "lucide-react";
import { mockRules } from "@/lib/mock/rules";
import { useIncidents } from "@/hooks/use-incidents";
import { useKbArticles } from "@/hooks/use-kb";
import { QuickSearch } from "@/components/dashboard/QuickSearch";
import { ChartCards } from "@/components/dashboard/ChartCards";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentIncidentsList } from "@/components/dashboard/RecentIncidentsList";
import { RecentArticlesList } from "@/components/dashboard/RecentArticlesList";

const INCIDENTS_FILTERS = { page_size: 100 } as const;
const KB_FILTERS = { page_size: 100 } as const;

export default function DashboardPage() {
  const { data: incidentData, isLoading: incidentsLoading } =
    useIncidents(INCIDENTS_FILTERS);
  const { data: kbData, isLoading: kbLoading } = useKbArticles(KB_FILTERS);

  const isLoading = incidentsLoading || kbLoading;
  const incidents = incidentData?.items ?? [];
  const kbArticles = kbData?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const enabledRules = mockRules.filter((r) => r.is_enabled);
  const stats = {
    avgResolution: "4.2 hrs",
    totalArticles: kbData?.total ?? 0,
    publishedArticles: kbArticles.filter((a) => a.status === "published")
      .length,
    activeRules: enabledRules.length,
    guardrailRules: enabledRules.filter((r) => r.category === "agent_guardrail")
      .length,
  };

  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 6);

  const recentArticles = [...kbArticles]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Dashboard.
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Incident overview, knowledge base activity, and quick search
        </p>
      </div>

      {/* Quick search */}
      <QuickSearch />

      {/* Chart cards */}
      <ChartCards incidents={incidents} />

      {/* Stats + Activity: unified 3-column grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Stats row — one card per column */}
        <StatsCards stats={stats} />

        {/* Activity row — incidents span 2, KB articles span 1 */}
        <div className="sm:col-span-2">
          <RecentIncidentsList incidents={recentIncidents} />
        </div>
        <div className="sm:col-span-1">
          <RecentArticlesList articles={recentArticles} />
        </div>
      </div>
    </div>
  );
}
