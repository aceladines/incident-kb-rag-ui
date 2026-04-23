"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecForm } from "@/components/tech-specs/SpecForm";
import { slideUp } from "@/lib/animations";
import { toast } from "sonner";
import type { TechSpecFormData } from "@/lib/types";
import { useTechSpecMutations } from "@/hooks/use-tech-specs";

export default function NewTechSpecPage() {
  const router = useRouter();
  const { create } = useTechSpecMutations();

  const handleSubmit = async (data: TechSpecFormData) => {
    try {
      await create(data);
      toast.success("Tech spec created successfully");
      router.push("/tech-specs");
    } catch {
      toast.error("Failed to create tech spec");
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
      <Button variant="ghost" size="sm" render={<Link href="/tech-specs" />}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Tech Specs
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New Specification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new technical specification. Use Markdown for rich content.
        </p>
      </div>

      {/* Form */}
      <SpecForm onSubmit={handleSubmit} />
    </motion.div>
  );
}
