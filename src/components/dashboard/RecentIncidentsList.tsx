"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/lib/types";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface RecentIncidentsListProps {
  incidents: Incident[];
}

const severityIndicator: Record<IncidentSeverity, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

const statusStyle: Record<IncidentStatus, string> = {
  open: "bg-blue-500/10 text-blue-500 border-transparent",
  investigating: "bg-amber-500/10 text-amber-500 border-transparent",
  resolved: "bg-green-500/10 text-green-500 border-transparent",
  closed: "bg-muted text-muted-foreground border-transparent",
};

const statusLabel: Record<IncidentStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  resolved: "Resolved",
  closed: "Closed",
};

export function RecentIncidentsList({ incidents }: RecentIncidentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No incidents to display.
          </p>
        ) : (
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border"
          >
            {incidents.map((incident) => (
              <motion.li key={incident.id} variants={staggerItem}>
                <Link
                  href={`/incidents/${incident.id}`}
                  className={cn(
                    "flex items-center gap-3 py-3 transition-colors",
                    "hover:bg-muted/50 -mx-4 px-4 rounded-md"
                  )}
                >
                  {/* Severity dot */}
                  <span
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      severityIndicator[incident.severity]
                    )}
                    title={incident.severity}
                  />

                  {/* Title */}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {truncate(incident.title, 60)}
                  </span>

                  {/* Status badge */}
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 text-[11px]", statusStyle[incident.status])}
                  >
                    {statusLabel[incident.status]}
                  </Badge>

                  {/* Relative time */}
                  <span className="shrink-0 text-xs text-muted-foreground w-24 text-right">
                    {formatRelativeTime(incident.created_at)}
                  </span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </CardContent>
    </Card>
  );
}
