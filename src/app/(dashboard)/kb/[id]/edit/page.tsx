"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleForm } from "@/components/kb/ArticleForm";
import { slideUp } from "@/lib/animations";
import { toast } from "sonner";
import { useKbArticle, useKbArticleMutations } from "@/hooks/use-kb";
import type { KbArticleFormData } from "@/lib/types";

export default function EditKbArticlePage() {
  const params = useParams();
  const router = useRouter();

  const articleId = params.id as string;
  const { data: article, isLoading } = useKbArticle(articleId);
  const { update } = useKbArticleMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Article not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The article you are trying to edit does not exist or has been removed.
        </p>
        <Button className="mt-4" variant="outline" render={<Link href="/kb" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Knowledge Base
        </Button>
      </div>
    );
  }

  const defaultValues: KbArticleFormData = {
    title: article.title,
    content: article.content,
    summary: article.summary,
    category: article.category,
    tags: article.tags,
    related_services: article.related_services,
    status: article.status,
  };

  const handleSubmit = async (data: KbArticleFormData) => {
    try {
      await update(articleId, data);
      toast.success("Article updated successfully");
      router.push(`/kb/${articleId}`);
    } catch {
      toast.error("Failed to update article. Please try again.");
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
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/kb/${articleId}`} />}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Article
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit Article
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update &ldquo;{article.title}&rdquo;
        </p>
      </div>

      {/* Form */}
      <ArticleForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isEditing
      />
    </motion.div>
  );
}
