"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import type { TechSpecCategory, TechSpecStatus } from "@/lib/types";

export interface SpecFiltersState {
  search: string;
  category: TechSpecCategory | "all";
  status: TechSpecStatus | "all";
}

interface SpecFiltersProps {
  filters: SpecFiltersState;
  onFiltersChange: (filters: SpecFiltersState) => void;
}

const CATEGORIES: { value: TechSpecCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "api", label: "API" },
  { value: "architecture", label: "Architecture" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "database", label: "Database" },
  { value: "security", label: "Security" },
  { value: "networking", label: "Networking" },
  { value: "integration", label: "Integration" },
  { value: "general", label: "General" },
];

const STATUSES: { value: TechSpecStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const hasActiveFilters = (filters: SpecFiltersState) =>
  filters.search !== "" ||
  filters.category !== "all" ||
  filters.status !== "all";

export function SpecFilters({ filters, onFiltersChange }: SpecFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () => {
    setSearchInput("");
    onFiltersChange({ search: "", category: "all", status: "all" });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tech specs..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.category}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              category: value as TechSpecCategory | "all",
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value as TechSpecStatus | "all",
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters(filters) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
