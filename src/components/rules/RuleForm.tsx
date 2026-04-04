"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FieldDescription } from "@/components/ui/field-description";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import type { RuleFormData, RuleCategory } from "@/lib/types";

const ruleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or fewer"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["rag_behavior", "agent_guardrail"]),
  priority: z.coerce.number().int().min(1, "Priority must be at least 1"),
  is_enabled: z.boolean(),
});

interface RuleFormProps {
  defaultValues?: RuleFormData;
  onSubmit: (data: RuleFormData) => void;
  isSubmitting?: boolean;
}

type RuleSchemaValues = z.infer<typeof ruleSchema>;

const CATEGORY_OPTIONS: { value: RuleCategory; label: string }[] = [
  { value: "rag_behavior", label: "RAG Behavior" },
  { value: "agent_guardrail", label: "Agent Guardrail" },
];

export function RuleForm({ defaultValues, onSubmit, isSubmitting = false }: RuleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<RuleSchemaValues>({
    resolver: zodResolver(ruleSchema) as any,
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      category: "rag_behavior",
      priority: 1,
      is_enabled: true,
    },
  });

  const isEnabled = watch("is_enabled");
  const category = watch("category");

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data as RuleFormData);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Card 1 — Rule Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rule Details</CardTitle>
          <CardDescription>Basic information and classification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <LabelWithTooltip htmlFor="title">Title</LabelWithTooltip>
            <Input
              id="title"
              placeholder="e.g. Staleness Disclaimer Required"
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Category & Priority row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="space-y-2">
              <LabelWithTooltip tooltip="RAG Behavior: controls how the RAG pipeline retrieves and generates answers (relevance thresholds, source preferences, staleness policies). Agent Guardrail: defines what the agent can and cannot do autonomously within the incident automation workflow.">
                Category
              </LabelWithTooltip>
              <Select
                value={category}
                onValueChange={(val) => {
                  if (val) setValue("category", val as RuleCategory);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <LabelWithTooltip
                htmlFor="priority"
                tooltip="Rules are evaluated in priority order. When rules conflict, lower-priority-number rules take precedence. For example, a rule with priority 1 overrides a rule with priority 10."
              >
                Priority
              </LabelWithTooltip>
              <Input
                id="priority"
                type="number"
                min={1}
                placeholder="1"
                {...register("priority")}
                aria-invalid={!!errors.priority}
              />
              <FieldDescription>Lower number = higher priority (evaluated first).</FieldDescription>
              {errors.priority && (
                <p className="text-xs text-destructive">{errors.priority.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2 — Rule Definition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rule Definition</CardTitle>
          <CardDescription>The full rule definition, rationale, and activation state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Description */}
          <div className="space-y-2">
            <LabelWithTooltip htmlFor="description">Description</LabelWithTooltip>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Full rule definition and rationale..."
                  minHeight="200px"
                />
              )}
            />
            <FieldDescription>Define the rule, its scope, and rationale.</FieldDescription>
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Enabled toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Enabled</p>
              <p className="text-xs text-muted-foreground">
                Disabled rules are retained but not enforced by the agent.
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked: boolean) => setValue("is_enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {defaultValues ? "Save Changes" : "Create Rule"}
        </Button>
      </div>
    </form>
  );
}
