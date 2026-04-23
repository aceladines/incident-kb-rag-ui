"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { useIncidents } from "@/hooks/use-incidents";
import { slideUp } from "@/lib/animations";
import type { IncidentFilters as IncidentFiltersType } from "@/lib/types";

export default function IncidentsPage() {
  const [filters, setFilters] = useState<IncidentFiltersType>({});

  const stableFilters = useMemo(() => ({ ...filters }), [filters]);
  const { data, isLoading, error, refetch } = useIncidents(stableFilters);

  const incidents = data?.items ?? [];
  const total = data?.total ?? 0;

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
              {total} incident{total !== 1 ? "s" : ""}
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

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && <IncidentTable incidents={incidents} />}
    </motion.div>
  );
}
