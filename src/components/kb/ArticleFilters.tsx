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
import type { KbArticleCategory, KbArticleStatus } from "@/lib/types";

export interface ArticleFiltersState {
  search: string;
  category: KbArticleCategory | "all";
  status: KbArticleStatus | "all";
}

interface ArticleFiltersProps {
  filters: ArticleFiltersState;
  onFiltersChange: (filters: ArticleFiltersState) => void;
}

const CATEGORIES: { value: KbArticleCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "runbook", label: "Runbook" },
  { value: "troubleshooting", label: "Troubleshooting" },
  { value: "faq", label: "FAQ" },
  { value: "sop", label: "SOP" },
  { value: "configuration", label: "Configuration" },
  { value: "architecture", label: "Architecture" },
  { value: "general", label: "General" },
];

const STATUSES: { value: KbArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const hasActiveFilters = (filters: ArticleFiltersState) =>
  filters.search !== "" ||
  filters.category !== "all" ||
  filters.status !== "all";

export function ArticleFilters({ filters, onFiltersChange }: ArticleFiltersProps) {
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
          placeholder="Search articles..."
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
              category: value as KbArticleCategory | "all",
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
              status: value as KbArticleStatus | "all",
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
