import type { Incident } from "./incident";
import type { KbArticle } from "./kb";
import type { TechSpec } from "./tech-spec";

export type SourceReference =
  | { type: "incident"; data: Incident }
  | { type: "kb_article"; data: KbArticle }
  | { type: "tech_spec"; data: TechSpec };

export interface AskQuery {
  query: string;
  source_types?: ("incident" | "kb_article" | "tech_spec")[];
  filters?: {
    status?: string[];
    severity?: string[];
    services?: string[];
    team?: string;
    kb_category?: string[];
    kb_tags?: string[];
    tech_spec_category?: string[];
    tech_spec_tags?: string[];
  };
}

export interface AskResponse {
  answer: string;
  sources: SourceReference[];
}
