import type { Incident } from "./incident";
import type { KbArticle } from "./kb";

export type SourceReference =
  | { type: "incident"; data: Incident }
  | { type: "kb_article"; data: KbArticle };

export interface AskQuery {
  query: string;
  source_types?: ("incident" | "kb_article")[];
  filters?: {
    status?: string[];
    severity?: string[];
    services?: string[];
    team?: string;
    kb_category?: string[];
    kb_tags?: string[];
  };
}

export interface AskResponse {
  answer: string;
  sources: SourceReference[];
}
