"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  User,
  Server,
  Tag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CategoryBadge } from "@/components/kb/CategoryBadge";
import { StatusBadge } from "@/components/kb/StatusBadge";
import { formatDate } from "@/lib/utils";
import { slideUp } from "@/lib/animations";
import { useKbArticle, useKbArticleMutations } from "@/hooks/use-kb";
import { mockServices } from "@/lib/mock/services";
import { toast } from "sonner";

function getServiceName(id: string): string {
  return mockServices.find((s) => s.id === id)?.name ?? id;
}

export default function KbArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const articleId = params.id as string;
  const { data: article, isLoading, error } = useKbArticle(articleId);
  const { remove } = useKbArticleMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Article not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The article you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-4" variant="outline" render={<Link href="/kb" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Knowledge Base
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await remove(articleId);
      toast.success("Article deleted successfully");
      router.push("/kb");
    } catch {
      toast.error("Failed to delete article. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back link */}
      <Button variant="ghost" size="sm" render={<Link href="/kb" />}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Knowledge Base
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={article.category} />
            <StatusBadge status={article.status} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {article.title}
          </h1>
          <p className="text-sm text-muted-foreground">{article.summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/kb/${article.id}/edit`} />}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &ldquo;{article.title}&rdquo;?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="destructive"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content — rendered markdown */}
        <Card>
          <CardContent>
            <MarkdownRenderer content={article.content} />
          </CardContent>
        </Card>

        {/* Sidebar metadata */}
        <div className="order-first space-y-4 lg:order-last">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </p>
                <CategoryBadge category={article.category} />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <StatusBadge status={article.status} />
              </div>

              <Separator />

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tags
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Services */}
              {article.related_services.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Related Services
                      </p>
                    </div>
                    <div className="space-y-1">
                      {article.related_services.map((serviceId) => (
                        <p
                          key={serviceId}
                          className="text-sm text-foreground"
                        >
                          {getServiceName(serviceId)}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Author */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Author
                  </p>
                </div>
                <p className="text-sm text-foreground">{article.created_by}</p>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Dates
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">
                      {formatDate(article.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="text-foreground">
                      {formatDate(article.updated_at)}
                    </span>
                  </div>
                  {article.published_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Published</span>
                      <span className="text-foreground">
                        {formatDate(article.published_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
