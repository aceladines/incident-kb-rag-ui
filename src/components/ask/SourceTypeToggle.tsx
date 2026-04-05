"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, BookOpen, Layers } from "lucide-react";

type SourceType = "all" | "incident" | "kb_article";

interface SourceTypeToggleProps {
  value: SourceType;
  onChange: (value: SourceType) => void;
}

const OPTIONS: { value: SourceType; label: string; icon: typeof Layers }[] = [
  { value: "all", label: "All", icon: Layers },
  { value: "incident", label: "Incidents", icon: AlertTriangle },
  { value: "kb_article", label: "KB Articles", icon: BookOpen },
];

export function SourceTypeToggle({ value, onChange }: SourceTypeToggleProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-1">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
