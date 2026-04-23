"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, FileSearch } from "lucide-react";
import { SourceTypeToggle } from "@/components/ask/SourceTypeToggle";
import { QueryInput } from "@/components/ask/QueryInput";
import { AnswerPanel } from "@/components/ask/AnswerPanel";
import { SourceCard } from "@/components/ask/SourceCard";
import { useAsk } from "@/hooks/use-ask";
import type { AskQuery } from "@/lib/types";

type SourceType = "all" | "incident" | "kb_article" | "tech_spec";

export default function AskPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [sourceType, setSourceType] = useState<SourceType>("all");
  const [hasQueried, setHasQueried] = useState(false);

  const { response, isLoading, error, ask } = useAsk();

  const handleQuery = useCallback(
    async (query: string) => {
      setHasQueried(true);
      const askQuery: AskQuery = { query };
      if (sourceType !== "all") {
        askQuery.source_types = [sourceType];
      }
      try {
        await ask(askQuery);
      } catch {
        // error is captured in the hook
      }
    },
    [sourceType, ask]
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

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

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
          <div className="flex flex-wrap gap-2">
            {response.sources.map((source, idx) => (
              <SourceCard key={source.data.id} source={source} index={idx} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
