"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KbArticle } from "@/lib/types";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { KB_CATEGORY_MAP } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface RecentArticlesListProps {
  articles: KbArticle[];
}

export function RecentArticlesList({ articles }: RecentArticlesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent KB Articles</CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No articles to display.
          </p>
        ) : (
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border"
          >
            {articles.map((article) => {
              const categoryOption = KB_CATEGORY_MAP[article.category];
              return (
                <motion.li key={article.id} variants={staggerItem}>
                  <Link
                    href={`/kb/${article.id}`}
                    className={cn(
                      "flex flex-col gap-1.5 py-3 transition-colors",
                      "hover:bg-muted/50 -mx-4 px-4 rounded-md"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {truncate(article.title, 48)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[11px] border-transparent",
                          categoryOption.color
                        )}
                      >
                        {categoryOption.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {article.published_at
                        ? `Published ${formatRelativeTime(article.published_at)}`
                        : `Updated ${formatRelativeTime(article.updated_at)}`}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </CardContent>
    </Card>
  );
}
