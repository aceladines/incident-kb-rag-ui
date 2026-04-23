"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RuleForm } from "@/components/rules/RuleForm";
import { useRuleMutations } from "@/hooks/use-rules";
import type { RuleFormData } from "@/lib/types";

export default function NewRulePage() {
  const router = useRouter();
  const { create, isLoading: isSubmitting } = useRuleMutations();

  const handleSubmit = async (data: RuleFormData) => {
    try {
      await create(data);
      toast.success("Rule created successfully.");
      router.push("/settings/rules");
    } catch {
      toast.error("Failed to create rule. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={<Link href="/settings/rules" />}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create Rule
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Define a new RAG behavior or agent guardrail rule.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <RuleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </motion.div>
    </div>
  );
}
