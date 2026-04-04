"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FieldDescription } from "@/components/ui/field-description";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { slideUp } from "@/lib/animations";
import { mockServices } from "@/lib/mock/services";
import { mockTeams } from "@/lib/mock/teams";
import type { IncidentFormData, IncidentSeverity } from "@/lib/types";

const incidentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or fewer"),
  description: z.string().min(1, "Description is required"),
  impacted_services: z.array(z.string()),
  fix_details: z.string().nullable(),
  responsible_team: z.string().min(1, "Team is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

interface IncidentFormProps {
  defaultValues?: Partial<IncidentFormData>;
  onSubmit: (data: IncidentFormData) => Promise<void>;
  isEditing?: boolean;
}

const SEVERITY_LEVELS: { value: IncidentSeverity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const SEVERITY_TOOLTIP =
  "Low: minimal impact, workaround available. Medium: moderate impact, degraded service. High: major impact, service significantly impaired. Critical: complete outage or data loss, immediate action required.";

export function IncidentForm({ defaultValues, onSubmit, isEditing = false }: IncidentFormProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(
    defaultValues?.impacted_services ?? [],
  );
  const [customServiceInput, setCustomServiceInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      impacted_services: defaultValues?.impacted_services ?? [],
      fix_details: defaultValues?.fix_details ?? null,
      responsible_team: defaultValues?.responsible_team ?? "",
      severity: defaultValues?.severity ?? "medium",
    },
  });

  const currentSeverity = watch("severity");
  const currentTeam = watch("responsible_team");

  const toggleService = (serviceId: string) => {
    const next = selectedServices.includes(serviceId)
      ? selectedServices.filter((s) => s !== serviceId)
      : [...selectedServices, serviceId];
    setSelectedServices(next);
    setValue("impacted_services", next, { shouldValidate: true });
  };

  const removeService = (serviceId: string) => {
    const next = selectedServices.filter((s) => s !== serviceId);
    setSelectedServices(next);
    setValue("impacted_services", next, { shouldValidate: true });
  };

  const addCustomService = useCallback(() => {
    const trimmed = customServiceInput.trim();
    if (!trimmed) return;
    if (selectedServices.includes(trimmed)) {
      setCustomServiceInput("");
      return;
    }
    const next = [...selectedServices, trimmed];
    setSelectedServices(next);
    setValue("impacted_services", next, { shouldValidate: true });
    setCustomServiceInput("");
  }, [customServiceInput, selectedServices, setValue]);

  const handleCustomServiceKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomService();
      }
    },
    [addCustomService],
  );

  const processSubmit = async (data: IncidentFormData) => {
    await onSubmit({
      ...data,
      fix_details: data.fix_details?.trim() || null,
    });
  };

  return (
    <motion.form
      variants={slideUp}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(processSubmit)}
      className="space-y-6"
    >
      {/* Card 1 — Incident Details */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>Basic information about the incident.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <LabelWithTooltip htmlFor="title">Title</LabelWithTooltip>
              <Input
                id="title"
                placeholder="Brief description of the incident"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title ? (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              ) : (
                <FieldDescription>A short, descriptive name for the incident</FieldDescription>
              )}
            </div>

            <div className="space-y-1.5">
              <LabelWithTooltip tooltip={SEVERITY_TOOLTIP}>Severity</LabelWithTooltip>
              <Select
                value={currentSeverity}
                onValueChange={(val) => {
                  if (val) setValue("severity", val as IncidentSeverity, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Impact level on services and users</FieldDescription>
            </div>

            <div className="space-y-1.5">
              <LabelWithTooltip>Responsible Team</LabelWithTooltip>
              <Select
                value={currentTeam}
                onValueChange={(val) => {
                  if (val) setValue("responsible_team", val, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.responsible_team ? (
                <p className="text-sm text-destructive">{errors.responsible_team.message}</p>
              ) : (
                <FieldDescription>The team that owns investigation and resolution</FieldDescription>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2 — Impacted Services */}
      <Card>
        <CardHeader>
          <CardTitle>Impacted Services</CardTitle>
          <CardDescription>Select from catalog or type a custom service name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedServices.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedServices.map((svcId) => {
                const svc = mockServices.find((s) => s.id === svcId);
                return (
                  <Badge key={svcId} variant="secondary" className="gap-1 pr-1">
                    {svc?.name ?? svcId}
                    <button
                      type="button"
                      onClick={() => removeService(svcId)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {mockServices.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`flex flex-col items-start rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-primary/50 bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <span className={`font-medium ${isSelected ? "text-foreground" : ""}`}>
                    {service.name}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {service.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom service input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom service name..."
              value={customServiceInput}
              onChange={(e) => setCustomServiceInput(e.target.value)}
              onKeyDown={handleCustomServiceKeyDown}
            />
            <Button type="button" variant="outline" onClick={addCustomService} className="shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 3 — Description & Resolution */}
      <Card>
        <CardHeader>
          <CardTitle>Description &amp; Resolution</CardTitle>
          <CardDescription>Provide detailed information about the incident.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <LabelWithTooltip htmlFor="description">Description</LabelWithTooltip>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Describe the incident: what happened, when it started, and what is the current impact..."
                  minHeight="200px"
                />
              )}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            ) : (
              <FieldDescription>
                What happened, when, and what is the current impact
              </FieldDescription>
            )}
          </div>

          <div className="space-y-1.5">
            <LabelWithTooltip htmlFor="fix_details">Fix Details (optional)</LabelWithTooltip>
            <Controller
              name="fix_details"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Steps taken or planned to resolve the incident, root cause analysis, and any follow-up actions..."
                  minHeight="150px"
                />
              )}
            />
            <FieldDescription>
              Steps taken or planned to resolve the incident
            </FieldDescription>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Incident" : "Create Incident"}
        </Button>
      </div>
    </motion.form>
  );
}
