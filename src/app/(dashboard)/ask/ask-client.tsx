"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, FileSearch } from "lucide-react";
import { SourceTypeToggle } from "@/components/ask/SourceTypeToggle";
import { QueryInput } from "@/components/ask/QueryInput";
import { AnswerPanel } from "@/components/ask/AnswerPanel";
import { SourceCard } from "@/components/ask/SourceCard";
import type { AskResponse, SourceReference } from "@/lib/types";

type SourceType = "all" | "incident" | "kb_article";

const MOCK_RESPONSE: AskResponse = {
  answer: `## Authentication Service Issues

Based on recent incidents and our knowledge base, here's what we know:

### Recent Incidents
- **Authentication service returning 503** during peak hours was resolved by scaling up the connection pool.
- The root cause was identified as connection pool exhaustion under high load.

### Recommended Steps
1. Check the current connection pool metrics in Grafana
2. Review the [Database Failover Procedure](/kb/kb-001) if the issue persists
3. Escalate to Platform Engineering if metrics show abnormal patterns

> **Note:** All fixes from incidents older than 6 months should be verified against current infrastructure.`,
  sources: [
    {
      type: "incident" as const,
      data: {
        id: "inc-001",
        title: "Authentication service returning 503 during peak hours",
        description:
          "The auth service started returning 503 errors at approximately 08:15 UTC. Error rates climbed from baseline 0.01% to 12.3% within 15 minutes.",
        severity: "critical" as const,
        status: "resolved" as const,
        impacted_services: ["svc-001"],
        responsible_team: "team-001",
        created_by: "ops@company.com",
        created_at: "2026-03-15T08:30:00Z",
        updated_at: "2026-03-15T14:00:00Z",
        resolved_at: "2026-03-15T14:00:00Z",
        fix_details:
          "Increased connection pool size from 50 to 200 and enabled connection recycling.",
      },
    },
    {
      type: "kb_article" as const,
      data: {
        id: "kb-002",
        title: "Debugging Authentication Failures",
        content: "# Debugging Auth Failures\n\nStep-by-step guide...",
        summary:
          "Step-by-step guide for troubleshooting authentication failures across SSO providers, token validation, and session management.",
        category: "troubleshooting" as const,
        tags: ["auth", "debugging", "sso"],
        related_services: ["svc-001"],
        status: "published" as const,
        created_by: "admin@company.com",
        created_at: "2026-02-01T10:00:00Z",
        updated_at: "2026-03-10T14:00:00Z",
        published_at: "2026-02-02T09:00:00Z",
      },
    },
    {
      type: "kb_article" as const,
      data: {
        id: "kb-003",
        title: "Connection Pool Tuning Guide",
        content: "# Connection Pool Tuning\n\nConfiguration reference...",
        summary:
          "Configuration reference for PostgreSQL connection pooling with PgBouncer, including recommended pool sizes per service tier.",
        category: "configuration" as const,
        tags: ["database", "pgbouncer", "performance"],
        related_services: ["svc-005"],
        status: "published" as const,
        created_by: "admin@company.com",
        created_at: "2026-01-20T10:00:00Z",
        updated_at: "2026-02-15T11:00:00Z",
        published_at: "2026-01-21T09:00:00Z",
      },
    },
  ],
};

export default function AskPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [sourceType, setSourceType] = useState<SourceType>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [hasQueried, setHasQueried] = useState(false);

  const handleQuery = useCallback(
    (query: string) => {
      setIsLoading(true);
      setHasQueried(true);
      setResponse(null);

      setTimeout(() => {
        let filteredSources: SourceReference[] = MOCK_RESPONSE.sources;
        if (sourceType === "incident") {
          filteredSources = MOCK_RESPONSE.sources.filter((s) => s.type === "incident");
        } else if (sourceType === "kb_article") {
          filteredSources = MOCK_RESPONSE.sources.filter((s) => s.type === "kb_article");
        }

        setResponse({
          answer: MOCK_RESPONSE.answer,
          sources: filteredSources,
        });
        setIsLoading(false);
      }, 1800);
    },
    [sourceType]
  );

  useEffect(() => {
    if (initialQuery) {
      handleQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasQueried) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex w-full max-w-2xl flex-col items-center gap-6"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <MessageSquare className="size-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Ask anything
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Search across incidents and the knowledge base using natural language. Get
              AI-generated answers backed by real sources.
            </p>
          </div>
          <SourceTypeToggle value={sourceType} onChange={setSourceType} />
          <div className="w-full">
            <QueryInput onSubmit={handleQuery} initialQuery={initialQuery} />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Try:</span>
            <button
              type="button"
              onClick={() => handleQuery("Why is the auth service returning 503?")}
              className="rounded-md bg-muted px-2.5 py-1 transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              auth service 503 errors
            </button>
            <button
              type="button"
              onClick={() => handleQuery("How do I failover the database?")}
              className="rounded-md bg-muted px-2.5 py-1 transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              database failover procedure
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ask</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered search across incidents and knowledge base.
        </p>
      </div>

      <div className="space-y-3">
        <SourceTypeToggle value={sourceType} onChange={setSourceType} />
        <QueryInput onSubmit={handleQuery} isLoading={isLoading} initialQuery={initialQuery} />
      </div>

      <AnswerPanel answer={response?.answer ?? ""} isLoading={isLoading} />

      {!isLoading && response && response.sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <FileSearch className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">
              Sources ({response.sources.length})
            </h2>
          </div>
          <div className="space-y-2">
            {response.sources.map((source, idx) => (
              <SourceCard key={source.data.id} source={source} index={idx} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
