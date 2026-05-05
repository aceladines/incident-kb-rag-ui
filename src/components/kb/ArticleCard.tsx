"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryBadge } from "@/components/kb/CategoryBadge";
import { StatusBadge } from "@/components/kb/StatusBadge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import type { KbArticle } from "@/lib/types";

interface ArticleCardProps {
  article: KbArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const visibleTags = article.tags.slice(0, 3);
  const remainingCount = article.tags.length - visibleTags.length;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/kb/${article.id}`} className="block h-full">
        <Card
          className={cn(
            "h-full cursor-pointer transition-all duration-200",
            "hover:ring-2 hover:ring-primary/25"
          )}
        >
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={article.category} />
                <StatusBadge status={article.status} />
              </div>
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {article.title}
            </h3>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-3">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {article.summary}
            </p>
            <div className="mt-auto space-y-2">
              {article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {remainingCount > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      +{remainingCount} more
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Updated {formatRelativeTime(article.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
