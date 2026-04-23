"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Server,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SeverityBadge } from "@/components/incidents/SeverityBadge";
import { StatusBadge } from "@/components/incidents/StatusBadge";
import { slideUp, fadeIn } from "@/lib/animations";
import { formatDate } from "@/lib/utils";
import { mockServices } from "@/lib/mock/services";
import { mockTeams } from "@/lib/mock/teams";
import { useIncident, useIncidentMutations } from "@/hooks/use-incidents";
import { toast } from "sonner";

function getServiceName(id: string): string {
  return mockServices.find((s) => s.id === id)?.name ?? id;
}

function getTeamName(id: string): string {
  return mockTeams.find((t) => t.id === id)?.name ?? id;
}

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: incident, isLoading, error } = useIncident(id);
  const { remove } = useIncidentMutations();

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
          The incident you are looking for does not exist or has been removed.
        </p>
        <Button variant="outline" render={<Link href="/incidents" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to incidents
        </Button>
      </motion.div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await remove(id);
      toast.success("Incident deleted", {
        description: `"${incident.title}" has been removed.`,
      });
      router.push("/incidents");
    } catch {
      toast.error("Failed to delete incident", {
        description: "Please try again.",
      });
      setIsDeleting(false);
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
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" render={<Link href="/incidents" />}>
        <ArrowLeft className="h-4 w-4" />
        Back to incidents
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {incident.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" render={<Link href={`/incidents/${incident.id}/edit`} />}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete incident?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{incident.title}&rdquo;. This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={incident.description} size="sm" />
            </CardContent>
          </Card>

          {/* Fix Details */}
          {incident.fix_details && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Fix Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer content={incident.fix_details} size="sm" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={incident.status} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Severity */}
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Severity</p>
                  <div className="mt-1">
                    <SeverityBadge severity={incident.severity} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Responsible Team */}
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Responsible Team</p>
                  <p className="mt-1 text-sm text-foreground">
                    {getTeamName(incident.responsible_team)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Impacted Services */}
              <div className="flex items-start gap-3">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Impacted Services</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {incident.impacted_services.map((svcId) => (
                      <Badge key={svcId} variant="secondary" className="text-xs font-normal">
                        {getServiceName(svcId)}
                      </Badge>
                    ))}
                    {incident.impacted_services.length === 0 && (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Created by */}
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Created by</p>
                  <p className="mt-1 text-sm text-foreground">{incident.created_by}</p>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Created</p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {formatDate(incident.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Updated</p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {formatDate(incident.updated_at)}
                    </p>
                  </div>
                  {incident.resolved_at && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Resolved</p>
                      <p className="mt-0.5 text-sm text-foreground">
                        {formatDate(incident.resolved_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
