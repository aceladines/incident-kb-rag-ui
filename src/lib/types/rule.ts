export type RuleCategory = "rag_behavior" | "agent_guardrail";

export interface Rule {
  id: string;
  title: string;
  description: string;
  category: RuleCategory;
  priority: number;
  is_enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RuleFormData {
  title: string;
  description: string;
  category: RuleCategory;
  priority: number;
  is_enabled: boolean;
}

export interface RuleFilters {
  category?: RuleCategory[];
  is_enabled?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}
