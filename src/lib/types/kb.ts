export type KbArticleStatus = "draft" | "published" | "archived";
export type KbArticleCategory =
  | "runbook"
  | "troubleshooting"
  | "faq"
  | "sop"
  | "configuration"
  | "architecture"
  | "general";

export interface KbArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: KbArticleCategory;
  tags: string[];
  related_services: string[];
  status: KbArticleStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface KbArticleFormData {
  title: string;
  content: string;
  summary: string;
  category: KbArticleCategory;
  tags: string[];
  related_services: string[];
  status: KbArticleStatus;
}

export interface KbArticleFilters {
  category?: KbArticleCategory[];
  status?: KbArticleStatus[];
  tags?: string[];
  services?: string[];
  search?: string;
  page?: number;
  page_size?: number;
}
