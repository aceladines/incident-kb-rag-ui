"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecForm } from "@/components/tech-specs/SpecForm";
import { slideUp } from "@/lib/animations";
import { toast } from "sonner";
import type { TechSpecFormData } from "@/lib/types";
import { useTechSpec, useTechSpecMutations } from "@/hooks/use-tech-specs";

export default function EditTechSpecPage() {
  const params = useParams();
  const router = useRouter();

  const specId = params.id as string;
  const { data: spec, isLoading } = useTechSpec(specId);
  const { update } = useTechSpecMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Spec not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The specification you are trying to edit does not exist or has been removed.
        </p>
        <Button className="mt-4" variant="outline" render={<Link href="/tech-specs" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Tech Specs
        </Button>
      </div>
    );
  }

  const defaultValues: TechSpecFormData = {
    title: spec.title,
    content: spec.content,
    summary: spec.summary,
    category: spec.category,
    tags: spec.tags,
    related_services: spec.related_services,
    status: spec.status,
  };

  const handleSubmit = async (data: TechSpecFormData) => {
    try {
      await update(specId, data);
      toast.success("Tech spec updated successfully");
      router.push(`/tech-specs/${specId}`);
    } catch {
      toast.error("Failed to update tech spec");
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
        render={<Link href={`/tech-specs/${specId}`} />}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Spec
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit Specification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update &ldquo;{spec.title}&rdquo;
        </p>
      </div>

      {/* Form */}
      <SpecForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isEditing
      />
    </motion.div>
  );
}
