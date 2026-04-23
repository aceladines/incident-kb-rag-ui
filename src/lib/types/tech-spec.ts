export type TechSpecStatus = "draft" | "published" | "archived";
export type TechSpecCategory =
  | "api"
  | "architecture"
  | "infrastructure"
  | "database"
  | "security"
  | "networking"
  | "integration"
  | "general";

export interface TechSpec {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: TechSpecCategory;
  tags: string[];
  related_services: string[];
  status: TechSpecStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface TechSpecFormData {
  title: string;
  content: string;
  summary: string;
  category: TechSpecCategory;
  tags: string[];
  related_services: string[];
  status: TechSpecStatus;
}

export interface TechSpecFilters {
  category?: TechSpecCategory[];
  status?: TechSpecStatus[];
  tags?: string[];
  services?: string[];
  search?: string;
  page?: number;
  page_size?: number;
}
