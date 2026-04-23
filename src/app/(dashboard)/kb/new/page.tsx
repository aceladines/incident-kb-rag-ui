"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleForm } from "@/components/kb/ArticleForm";
import { slideUp } from "@/lib/animations";
import { toast } from "sonner";
import { useKbArticleMutations } from "@/hooks/use-kb";
import type { KbArticleFormData } from "@/lib/types";

export default function NewKbArticlePage() {
  const router = useRouter();
  const { create } = useKbArticleMutations();

  const handleSubmit = async (data: KbArticleFormData) => {
    try {
      await create(data);
      toast.success("Article created successfully");
      router.push("/kb");
    } catch {
      toast.error("Failed to create article. Please try again.");
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New Article
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new knowledge base article. Use Markdown for rich content.
        </p>
      </div>

      {/* Form */}
      <ArticleForm onSubmit={handleSubmit} />
    </motion.div>
  );
}
