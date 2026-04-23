"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileCode, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SpecCard } from "@/components/tech-specs/SpecCard";
import {
  SpecFilters,
  type SpecFiltersState,
} from "@/components/tech-specs/SpecFilters";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { useTechSpecs } from "@/hooks/use-tech-specs";
import type { TechSpecCategory, TechSpecFilters } from "@/lib/types";

export default function TechSpecsListPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<SpecFiltersState>({
    search: "",
    category: "all",
    status: "all",
  });

  const apiFilters = useMemo<TechSpecFilters>(() => {
    const f: TechSpecFilters = {};

    if (activeTab === "published") {
      f.status = ["published"];
    } else if (activeTab === "drafts") {
      f.status = ["draft"];
    }

    if (filters.status !== "all") {
      f.status = [filters.status as "draft" | "published" | "archived"];
    }

    if (filters.category !== "all") {
      f.category = [filters.category as TechSpecCategory];
    }

    if (filters.search) {
      f.search = filters.search;
    }

    return f;
  }, [activeTab, filters]);

  const { data, isLoading, error, refetch } = useTechSpecs(apiFilters);
  const specs = data?.items ?? [];

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Technical Specifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse API specs, architecture docs, infrastructure specs, and technical references.
          </p>
        </div>
        <Button render={<Link href="/tech-specs/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Spec
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="mt-4">
          <SpecFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Content */}
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button className="mt-4" variant="outline" onClick={refetch}>
                Retry
              </Button>
            </div>
          ) : specs.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {specs.map((spec) => (
                <motion.div key={spec.id} variants={staggerItem}>
                  <SpecCard spec={spec} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                {activeTab === "drafts" ? (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <FileCode className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No specs found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {filters.search || filters.category !== "all" || filters.status !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first technical specification."}
              </p>
              {!filters.search && filters.category === "all" && filters.status === "all" && (
                <Button className="mt-4" render={<Link href="/tech-specs/new" />}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Spec
                </Button>
              )}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
