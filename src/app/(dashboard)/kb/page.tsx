"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, BookOpen, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArticleCard } from "@/components/kb/ArticleCard";
import {
  ArticleFilters,
  type ArticleFiltersState,
} from "@/components/kb/ArticleFilters";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { useKbArticles } from "@/hooks/use-kb";
import type { KbArticleCategory, KbArticleFilters, KbArticleStatus } from "@/lib/types";
import { Pagination } from "@/components/ui/Pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export default function KbListPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<ArticleFiltersState>({
    search: "",
    category: "all",
    status: "all",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const apiFilters = useMemo<KbArticleFilters>(() => {
    const f: KbArticleFilters = { page, page_size: pageSize };

    if (activeTab === "published") {
      f.status = ["published"];
    } else if (activeTab === "drafts") {
      f.status = ["draft"];
    }

    if (filters.status !== "all") {
      f.status = [filters.status as KbArticleStatus];
    }

    if (filters.category !== "all") {
      f.category = [filters.category as KbArticleCategory];
    }

    if (filters.search) {
      f.search = filters.search;
    }

    return f;
  }, [activeTab, filters, page, pageSize]);

  const { data, isLoading, error, refetch } = useKbArticles(apiFilters);
  const articles = data?.items ?? [];

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
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse runbooks, SOPs, troubleshooting guides, and documentation.
          </p>
        </div>
        <Button render={<Link href="/kb/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="mt-4">
          <ArticleFilters filters={filters} onFiltersChange={(f) => { setFilters(f); setPage(1); }} />
        </div>

        {/* Content for all tabs - rendered outside TabsContent to avoid unmount */}
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : articles.length > 0 ? (
            <>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
                {articles.map((article) => (
                  <motion.div key={article.id} variants={staggerItem}>
                    <ArticleCard article={article} />
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-6">
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={data?.total ?? 0}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
              </div>
            </>
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
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No articles found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {filters.search || filters.category !== "all" || filters.status !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first knowledge base article."}
              </p>
              {!filters.search && filters.category === "all" && filters.status === "all" && (
                <Button className="mt-4" render={<Link href="/kb/new" />}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Article
                </Button>
              )}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
