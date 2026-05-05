import type { SelectOption } from "./types/common";
import type { IncidentSeverity, IncidentStatus } from "./types/incident";
import type { KbArticleCategory, KbArticleStatus } from "./types/kb";
import type { TechSpecCategory, TechSpecStatus } from "./types/tech-spec";
import type { RuleCategory } from "./types/rule";

// ---------------------------------------------------------------------------
// Incident Severity
// ---------------------------------------------------------------------------

export interface SeverityOption extends SelectOption {
  value: IncidentSeverity;
  color: string;
}

export const SEVERITY_OPTIONS: SeverityOption[] = [
  { label: "Low", value: "low", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { label: "Medium", value: "medium", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { label: "High", value: "high", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { label: "Critical", value: "critical", color: "text-red-700 bg-red-700/10 border-red-700/20 font-semibold" },
];

export const SEVERITY_MAP: Record<IncidentSeverity, SeverityOption> = Object.fromEntries(
  SEVERITY_OPTIONS.map((o) => [o.value, o]),
) as Record<IncidentSeverity, SeverityOption>;

// ---------------------------------------------------------------------------
// Incident Status
// ---------------------------------------------------------------------------

export interface StatusOption extends SelectOption {
  value: IncidentStatus;
  color: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  { label: "Open", value: "open", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { label: "Investigating", value: "investigating", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  { label: "Resolved", value: "resolved", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  { label: "Closed", value: "closed", color: "text-muted-foreground bg-muted border-border" },
];

export const STATUS_MAP: Record<IncidentStatus, StatusOption> = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o]),
) as Record<IncidentStatus, StatusOption>;

// ---------------------------------------------------------------------------
// KB Article Category
// ---------------------------------------------------------------------------

export interface KbCategoryOption extends SelectOption {
  value: KbArticleCategory;
  icon: string;
  color: string;
}

export const KB_CATEGORY_OPTIONS: KbCategoryOption[] = [
  { label: "Runbook", value: "runbook", icon: "BookOpen", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { label: "Troubleshooting", value: "troubleshooting", icon: "Wrench", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { label: "FAQ", value: "faq", icon: "HelpCircle", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  { label: "SOP", value: "sop", icon: "ClipboardList", color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
  { label: "Configuration", value: "configuration", icon: "Settings", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  { label: "Architecture", value: "architecture", icon: "Network", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  { label: "General", value: "general", icon: "FileText", color: "text-muted-foreground bg-muted border-border" },
];

export const KB_CATEGORY_MAP: Record<KbArticleCategory, KbCategoryOption> = Object.fromEntries(
  KB_CATEGORY_OPTIONS.map((o) => [o.value, o]),
) as Record<KbArticleCategory, KbCategoryOption>;

// ---------------------------------------------------------------------------
// KB Article Status
// ---------------------------------------------------------------------------

export interface KbStatusOption extends SelectOption {
  value: KbArticleStatus;
  color: string;
}

export const KB_STATUS_OPTIONS: KbStatusOption[] = [
  { label: "Draft", value: "draft", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  { label: "Published", value: "published", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  { label: "Archived", value: "archived", color: "text-muted-foreground bg-muted border-border" },
];

export const KB_STATUS_MAP: Record<KbArticleStatus, KbStatusOption> = Object.fromEntries(
  KB_STATUS_OPTIONS.map((o) => [o.value, o]),
) as Record<KbArticleStatus, KbStatusOption>;

// ---------------------------------------------------------------------------
// Tech Spec Category
// ---------------------------------------------------------------------------

export interface TechSpecCategoryOption extends SelectOption {
  value: TechSpecCategory;
  color: string;
}

export const TECH_SPEC_CATEGORY_OPTIONS: TechSpecCategoryOption[] = [
  { label: "API", value: "api", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { label: "Architecture", value: "architecture", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  { label: "Infrastructure", value: "infrastructure", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { label: "Database", value: "database", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  { label: "Security", value: "security", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { label: "Networking", value: "networking", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  { label: "Integration", value: "integration", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { label: "General", value: "general", color: "text-muted-foreground bg-muted border-border" },
];

export const TECH_SPEC_CATEGORY_MAP: Record<TechSpecCategory, TechSpecCategoryOption> = Object.fromEntries(
  TECH_SPEC_CATEGORY_OPTIONS.map((o) => [o.value, o]),
) as Record<TechSpecCategory, TechSpecCategoryOption>;

// ---------------------------------------------------------------------------
// Tech Spec Status
// ---------------------------------------------------------------------------

export interface TechSpecStatusOption extends SelectOption {
  value: TechSpecStatus;
  color: string;
}

export const TECH_SPEC_STATUS_OPTIONS: TechSpecStatusOption[] = [
  { label: "Draft", value: "draft", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  { label: "Published", value: "published", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  { label: "Archived", value: "archived", color: "text-muted-foreground bg-muted border-border" },
];

export const TECH_SPEC_STATUS_MAP: Record<TechSpecStatus, TechSpecStatusOption> = Object.fromEntries(
  TECH_SPEC_STATUS_OPTIONS.map((o) => [o.value, o]),
) as Record<TechSpecStatus, TechSpecStatusOption>;

// ---------------------------------------------------------------------------
// Rule Category
// ---------------------------------------------------------------------------

export interface RuleCategoryOption extends SelectOption {
  value: RuleCategory;
  color: string;
}

export const RULE_CATEGORY_OPTIONS: RuleCategoryOption[] = [
  { label: "RAG Behavior", value: "rag_behavior", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { label: "Agent Guardrail", value: "agent_guardrail", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
];

export const RULE_CATEGORY_MAP: Record<RuleCategory, RuleCategoryOption> = Object.fromEntries(
  RULE_CATEGORY_OPTIONS.map((o) => [o.value, o]),
) as Record<RuleCategory, RuleCategoryOption>;

// ---------------------------------------------------------------------------
// Sidebar Navigation
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: "LayoutDashboard" },
  { label: "Incidents", path: "/incidents", icon: "AlertTriangle" },
  { label: "Knowledge Base", path: "/kb", icon: "BookOpen" },
  { label: "Tech Specs", path: "/tech-specs", icon: "FileCode" },
  { label: "Ask", path: "/ask", icon: "MessageSquare" },
  { label: "Settings", path: "/settings", icon: "Settings" },
];

// ---------------------------------------------------------------------------
// Pagination Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ---------------------------------------------------------------------------
// Validation Limits
// ---------------------------------------------------------------------------

export const ASK_QUERY_MAX_LENGTH = 5_000;
export const PROCESS_INCIDENT_MAX_LENGTH = 50_000;
