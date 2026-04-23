"use client";

import { mockIncidents } from "@/lib/mock/incidents";
import { mockKbArticles } from "@/lib/mock/kb";
import { mockRules } from "@/lib/mock/rules";
import { QuickSearch } from "@/components/dashboard/QuickSearch";
import { ChartCards } from "@/components/dashboard/ChartCards";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentIncidentsList } from "@/components/dashboard/RecentIncidentsList";
import { RecentArticlesList } from "@/components/dashboard/RecentArticlesList";

function computeStats() {
  const totalArticles = mockKbArticles.length;

  const publishedArticles = mockKbArticles.filter(
    (a) => a.status === "published"
  ).length;

  const enabledRules = mockRules.filter((r) => r.is_enabled);
  const activeRules = enabledRules.length;
  const guardrailRules = enabledRules.filter(
    (r) => r.category === "agent_guardrail"
  ).length;

  return {
    avgResolution: "4.2 hrs",
    totalArticles,
    publishedArticles,
    activeRules,
    guardrailRules,
  };
}

export default function DashboardPage() {
  const stats = computeStats();

  const recentIncidents = [...mockIncidents]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 6);

  const recentArticles = [...mockKbArticles]
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
      <ChartCards incidents={mockIncidents} />

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
