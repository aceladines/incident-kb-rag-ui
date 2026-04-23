"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidentForm } from "@/components/incidents/IncidentForm";
import { slideUp, fadeIn } from "@/lib/animations";
import { useIncident, useIncidentMutations } from "@/hooks/use-incidents";
import { toast } from "sonner";
import type { IncidentFormData } from "@/lib/types";

export default function EditIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: incident, isLoading, error } = useIncident(id);
  const { update } = useIncidentMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center gap-4 py-20"
      >
        <p className="text-lg font-medium text-foreground">Incident not found</p>
        <p className="text-sm text-muted-foreground">
          The incident you are trying to edit does not exist.
        </p>
        <Button variant="outline" render={<Link href="/incidents" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to incidents
        </Button>
      </motion.div>
    );
  }

  const handleSubmit = async (data: IncidentFormData) => {
    try {
      await update(id, data);
      toast.success("Incident updated", {
        description: `"${data.title}" has been updated successfully.`,
      });
      router.push(`/incidents/${id}`);
    } catch {
      toast.error("Failed to update incident", {
        description: "Please try again.",
      });
    }
  };

  const defaultValues: Partial<IncidentFormData> = {
    title: incident.title,
    description: incident.description,
    impacted_services: incident.impacted_services,
    fix_details: incident.fix_details,
    responsible_team: incident.responsible_team,
    severity: incident.severity,
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Back link */}
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" render={<Link href={`/incidents/${id}`} />}>
        <ArrowLeft className="h-4 w-4" />
        Back to incident
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Pencil className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Edit Incident
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the details for &ldquo;{incident.title}&rdquo;
          </p>
        </div>
      </div>

      {/* Form */}
      <IncidentForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isEditing
      />
    </motion.div>
  );
}
