"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleForm } from "@/components/kb/ArticleForm";
import { slideUp } from "@/lib/animations";
import { toast } from "sonner";
import type { KbArticleFormData } from "@/lib/types";

export default function NewKbArticlePage() {
  const router = useRouter();

  const handleSubmit = async (data: KbArticleFormData) => {
    // Mock create — in production this would call the API
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Creating article:", data);
    toast.success("Article created successfully");
    router.push("/kb");
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
