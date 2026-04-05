"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { mockIncidents } from "@/lib/mock/incidents";
import { slideUp } from "@/lib/animations";
import type { IncidentFilters as IncidentFiltersType } from "@/lib/types";

export default function IncidentsPage() {
  const [filters, setFilters] = useState<IncidentFiltersType>({});

  const filteredIncidents = useMemo(() => {
    let result = [...mockIncidents];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (inc) =>
          inc.title.toLowerCase().includes(q) ||
          inc.description.toLowerCase().includes(q),
      );
    }

    if (filters.status && filters.status.length > 0) {
      result = result.filter((inc) => filters.status!.includes(inc.status));
    }

    if (filters.severity && filters.severity.length > 0) {
      result = result.filter((inc) => filters.severity!.includes(inc.severity));
    }

    // Sort by created_at descending (most recent first)
    result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return result;
  }, [filters]);

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Incidents</h1>
            <p className="text-sm text-muted-foreground">
              {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button render={<Link href="/incidents/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Incident
        </Button>
      </div>

      {/* Filters */}
      <IncidentFilters filters={filters} onFiltersChange={setFilters} />

      {/* Table */}
      <IncidentTable incidents={filteredIncidents} />
    </motion.div>
  );
}
