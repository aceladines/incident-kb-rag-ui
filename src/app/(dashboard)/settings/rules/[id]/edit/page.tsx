"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RuleForm } from "@/components/rules/RuleForm";
import { mockRules } from "@/lib/mock/rules";
import type { RuleFormData } from "@/lib/types";

export default function EditRulePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rule = mockRules.find((r) => r.id === params.id);

  if (!rule) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Rule not found.</p>
        <Button className="mt-4" variant="outline" size="sm" render={<Link href="/settings/rules" />}>
          Back to Rules
        </Button>
      </div>
    );
  }

  const defaultValues: RuleFormData = {
    title: rule.title,
    description: rule.description,
    category: rule.category,
    priority: rule.priority,
    is_enabled: rule.is_enabled,
  };

  const handleSubmit = (data: RuleFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/settings/rules");
    }, 1000);
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
              Edit Rule
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rule.title}
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
        <RuleForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </motion.div>
    </div>
  );
}
