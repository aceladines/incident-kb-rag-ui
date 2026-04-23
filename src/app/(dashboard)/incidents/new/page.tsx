"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidentForm } from "@/components/incidents/IncidentForm";
import { slideUp } from "@/lib/animations";
import { useIncidentMutations } from "@/hooks/use-incidents";
import { toast } from "sonner";
import type { IncidentFormData } from "@/lib/types";

export default function NewIncidentPage() {
  const router = useRouter();
  const { create } = useIncidentMutations();

  const handleSubmit = async (data: IncidentFormData) => {
    try {
      await create(data);
      toast.success("Incident created", {
        description: `"${data.title}" has been logged successfully.`,
      });
      router.push("/incidents");
    } catch {
      toast.error("Failed to create incident", {
        description: "Please try again.",
      });
    }
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Back link */}
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" render={<Link href="/incidents" />}>
        <ArrowLeft className="h-4 w-4" />
        Back to incidents
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <AlertTriangle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Create Incident
          </h1>
          <p className="text-sm text-muted-foreground">
            Log a new incident for tracking and resolution.
          </p>
        </div>
      </div>

      {/* Form */}
      <IncidentForm onSubmit={handleSubmit} />
    </motion.div>
  );
}
