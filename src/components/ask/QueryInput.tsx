"use client";

import { useState } from "react";
import { Search, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  initialQuery?: string;
}

export function QueryInput({ onSubmit, isLoading = false, initialQuery = "" }: QueryInputProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && !isLoading) {
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask anything about incidents and the knowledge base..."
        className="h-12 rounded-xl pl-12 pr-14 text-base bg-card border-border shadow-sm"
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!query.trim() || isLoading}
        className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-lg"
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </form>
  );
}
