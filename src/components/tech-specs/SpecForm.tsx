"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { FieldDescription } from "@/components/ui/field-description";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import { slideUp } from "@/lib/animations";
import type { TechSpecFormData, TechSpecCategory, TechSpecStatus } from "@/lib/types";

const MOCK_SERVICES = [
  { value: "svc-001", label: "Authentication Service" },
  { value: "svc-002", label: "Payment Gateway" },
  { value: "svc-003", label: "Email Service" },
  { value: "svc-004", label: "API Gateway" },
  { value: "svc-005", label: "Database Cluster" },
];

const CATEGORIES: { value: TechSpecCategory; label: string }[] = [
  { value: "api", label: "API" },
  { value: "architecture", label: "Architecture" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "database", label: "Database" },
  { value: "security", label: "Security" },
  { value: "networking", label: "Networking" },
  { value: "integration", label: "Integration" },
  { value: "general", label: "General" },
];

const STATUSES: { value: TechSpecStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

const specSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  summary: z.string().min(1, "Summary is required").max(500, "Summary must be 500 characters or less"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["api", "architecture", "infrastructure", "database", "security", "networking", "integration", "general"]),
  status: z.enum(["draft", "published", "archived"]),
  tags: z.array(z.string()),
  related_services: z.array(z.string()),
});

type SpecSchemaData = z.infer<typeof specSchema>;

interface SpecFormProps {
  defaultValues?: TechSpecFormData;
  onSubmit: (data: TechSpecFormData) => void | Promise<void>;
  isEditing?: boolean;
}

function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setInputValue("");
    },
    [value, onChange]
  );

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-sm p-0.5 transition-colors hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a tag and press Enter"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
    </div>
  );
}

function ServiceCheckboxes({
  value,
  onChange,
}: {
  value: string[];
  onChange: (services: string[]) => void;
}) {
  const toggleService = (serviceId: string) => {
    if (value.includes(serviceId)) {
      onChange(value.filter((s) => s !== serviceId));
    } else {
      onChange([...value, serviceId]);
    }
  };

  return (
    <div className="space-y-2">
      {MOCK_SERVICES.map((service) => (
        <label
          key={service.value}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <input
            type="checkbox"
            checked={value.includes(service.value)}
            onChange={() => toggleService(service.value)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="text-foreground">{service.label}</span>
        </label>
      ))}
    </div>
  );
}

export function SpecForm({ defaultValues, onSubmit, isEditing }: SpecFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SpecSchemaData>({
    resolver: zodResolver(specSchema),
    defaultValues: defaultValues ?? {
      title: "",
      summary: "",
      content: "",
      category: "general",
      status: "draft",
      tags: [],
      related_services: [],
    },
  });

  const handleFormSubmit = async (data: SpecSchemaData) => {
    await onSubmit(data as TechSpecFormData);
  };

  return (
    <motion.form
      variants={slideUp}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content area */}
        <Card>
          <CardHeader>
            <CardTitle>Specification Content</CardTitle>
            <CardDescription>The main specification body and metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <LabelWithTooltip htmlFor="title">Title</LabelWithTooltip>
              <Input
                id="title"
                placeholder="Specification title"
                className="h-11 text-lg font-medium"
                {...register("title")}
              />
              {errors.title ? (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              ) : (
                <FieldDescription>Clear, searchable title for the specification</FieldDescription>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <LabelWithTooltip htmlFor="summary">Summary</LabelWithTooltip>
              <Textarea
                id="summary"
                placeholder="A brief summary of the specification for search result previews..."
                rows={3}
                {...register("summary")}
              />
              {errors.summary ? (
                <p className="text-xs text-destructive">{errors.summary.message}</p>
              ) : (
                <FieldDescription>Brief plain-text summary shown in search results</FieldDescription>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <LabelWithTooltip>Content</LabelWithTooltip>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your technical specification here..."
                    minHeight="400px"
                  />
                )}
              />
              {errors.content ? (
                <p className="text-xs text-destructive">{errors.content.message}</p>
              ) : (
                <FieldDescription>The full specification body</FieldDescription>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <LabelWithTooltip tooltip="API: API contracts and specifications. Architecture: system design documents. Infrastructure: infrastructure specs. Database: schema and data model docs. Security: security policies and specs. Networking: network architecture docs. Integration: integration specs. General: everything else.">
                  Category
                </LabelWithTooltip>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => { if (val) field.onChange(val); }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <LabelWithTooltip tooltip="Draft: only visible to editors, not included in search results. Published: visible to all users and included in RAG retrieval. Archived: hidden from search but retained for reference.">
                  Status
                </LabelWithTooltip>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => { if (val) field.onChange(val); }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <Separator />

              {/* Tags */}
              <div className="space-y-2">
                <LabelWithTooltip>Tags</LabelWithTooltip>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagsInput value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldDescription>Freeform tags for filtering and retrieval</FieldDescription>
              </div>

              <Separator />

              {/* Related Services */}
              <div className="space-y-2">
                <LabelWithTooltip>Related Services</LabelWithTooltip>
                <Controller
                  name="related_services"
                  control={control}
                  render={({ field }) => (
                    <ServiceCheckboxes
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div
        className={cn(
          "flex items-center justify-end gap-3 border-t border-border pt-4"
        )}
      >
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Spec"
          )}
        </Button>
      </div>
    </motion.form>
  );
}
