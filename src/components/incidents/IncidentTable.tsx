"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";
import { StatusBadge } from "@/components/incidents/StatusBadge";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { formatRelativeTime } from "@/lib/utils";
import { mockServices } from "@/lib/mock/services";
import { mockTeams } from "@/lib/mock/teams";
import type { Incident } from "@/lib/types";

interface IncidentTableProps {
  incidents: Incident[];
}

function getServiceName(id: string): string {
  return mockServices.find((s) => s.id === id)?.name ?? id;
}

function getTeamName(id: string): string {
  return mockTeams.find((t) => t.id === id)?.name ?? id;
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  if (incidents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No incidents found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or create a new incident.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/5">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[35%]">Title</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Team</TableHead>
            <TableHead className="hidden xl:table-cell">Services</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <motion.tbody
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {incidents.map((incident) => (
            <motion.tr
              key={incident.id}
              variants={staggerItem}
              className="border-b transition-colors hover:bg-muted/50"
            >
              <TableCell className="max-w-0">
                <Link
                  href={`/incidents/${incident.id}`}
                  className="block truncate font-medium text-foreground hover:text-primary transition-colors"
                >
                  {incident.title}
                </Link>
              </TableCell>
              <TableCell>
                <SeverityBadge severity={incident.severity} />
              </TableCell>
              <TableCell>
                <StatusBadge status={incident.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">
                  {getTeamName(incident.responsible_team)}
                </span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <div className="flex flex-wrap gap-1">
                  {incident.impacted_services.slice(0, 2).map((svcId) => (
                    <Badge
                      key={svcId}
                      variant="secondary"
                      className="text-[0.7rem] font-normal"
                    >
                      {getServiceName(svcId)}
                    </Badge>
                  ))}
                  {incident.impacted_services.length > 2 && (
                    <Badge variant="secondary" className="text-[0.7rem] font-normal">
                      +{incident.impacted_services.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(incident.created_at)}
              </TableCell>
            </motion.tr>
          ))}
        </motion.tbody>
      </Table>
    </div>
  );
}
