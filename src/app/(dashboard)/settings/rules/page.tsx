"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RuleCard } from "@/components/rules/RuleCard";
import { useRules, useRuleMutations } from "@/hooks/use-rules";
import type { RuleCategory, RuleFilters } from "@/lib/types";

type FilterTab = "all" | RuleCategory;

export default function RulesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filters = useMemo<RuleFilters | undefined>(() => {
    if (activeTab === "rag_behavior") return { category: ["rag_behavior"] };
    if (activeTab === "agent_guardrail") return { category: ["agent_guardrail"] };
    return undefined;
  }, [activeTab]);

  const { data, isLoading, error, refetch } = useRules(filters);
  const { toggle } = useRuleMutations();

  const rules = data?.items ?? [];

  const ragCount = rules.filter((r) => r.category === "rag_behavior").length;
  const guardrailCount = rules.filter((r) => r.category === "agent_guardrail").length;

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggle(id, enabled);
    } catch {
      toast.error("Failed to update rule. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button className="mt-4" variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />
            Rules
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure RAG behavior and agent guardrail rules. Rules are evaluated by priority (lower number first).
          </p>
        </div>
        <Button render={<Link href="/settings/rules/new" />}>
          <Plus className="mr-1.5 size-4" />
          New Rule
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => { if (val) setActiveTab(val as FilterTab); }}
      >
        <TabsList>
          <TabsTrigger value="all">
            All ({data?.total ?? 0})
          </TabsTrigger>
          <TabsTrigger value="rag_behavior">
            RAG Behavior ({ragCount})
          </TabsTrigger>
          <TabsTrigger value="agent_guardrail">
            Agent Guardrail ({guardrailCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 mt-4"
          >
            {rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldCheck className="size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No rules found in this category.
                </p>
              </div>
            ) : (
              rules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} onToggle={handleToggle} />
              ))
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
