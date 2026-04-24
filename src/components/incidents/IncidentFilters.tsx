"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_OPTIONS, SEVERITY_OPTIONS } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import type { IncidentFilters as IncidentFiltersType, IncidentStatus, IncidentSeverity } from "@/lib/types";

interface IncidentFiltersProps {
  filters: IncidentFiltersType;
  onFiltersChange: (filters: IncidentFiltersType) => void;
}

export function IncidentFilters({ filters, onFiltersChange }: IncidentFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    const value = debouncedSearch || undefined;
    if (value !== filters.search) {
      onFiltersChange({ ...filters, search: value });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters =
    (filters.search && filters.search.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    (filters.severity && filters.severity.length > 0);

  const toggleStatus = useCallback(
    (status: IncidentStatus) => {
      const current = filters.status ?? [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      onFiltersChange({ ...filters, status: next.length > 0 ? next : undefined });
    },
    [filters, onFiltersChange],
  );

  const toggleSeverity = useCallback(
    (severity: IncidentSeverity) => {
      const current = filters.severity ?? [];
      const next = current.includes(severity)
        ? current.filter((s) => s !== severity)
        : [...current, severity];
      onFiltersChange({ ...filters, severity: next.length > 0 ? next : undefined });
    },
    [filters, onFiltersChange],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    onFiltersChange({});
  }, [onFiltersChange]);

  const statusCount = filters.status?.length ?? 0;
  const severityCount = filters.severity?.length ?? 0;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:min-w-[200px] sm:max-w-sm sm:flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search incidents..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm font-medium transition-colors hover:bg-muted dark:bg-input/30 dark:hover:bg-input/50"
        >
          Status
          {statusCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-primary-foreground">
              {statusCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status?.includes(option.value) ?? false}
                onCheckedChange={() => toggleStatus(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm font-medium transition-colors hover:bg-muted dark:bg-input/30 dark:hover:bg-input/50"
        >
          Severity
          {severityCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-primary-foreground">
              {severityCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter by severity</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SEVERITY_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.severity?.includes(option.value) ?? false}
                onCheckedChange={() => toggleSeverity(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
