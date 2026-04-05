import type { Rule } from "@/lib/types";

export const mockRules: Rule[] = [
  {
    id: "rule-001",
    title: "Staleness Disclaimer Required",
    description: `## Rule Definition

When the RAG pipeline retrieves a source (incident or KB article) that was last updated **more than 6 months ago**, the generated answer **must** append a staleness disclaimer.

## Rationale

Older sources may reference deprecated configurations, outdated procedures, or services that have since been refactored. Without a disclaimer, support agents may follow outdated guidance, leading to incorrect fixes or even service degradation.

## Disclaimer Format

The following disclaimer must be appended to any answer that relies on stale sources:

> **Note:** This answer references sources last updated more than 6 months ago. The information may be outdated. Please verify with the responsible team before applying any recommended actions.

## Evaluation

- **Trigger:** Any retrieved source where \`updated_at\` is older than 180 days relative to the query timestamp
- **Action:** Append the disclaimer after the generated answer, before the source list
- **Scope:** Applies to both incident and KB article sources`,
    category: "rag_behavior",
    priority: 1,
    is_enabled: true,
    created_by: "admin@example.com",
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-02-15T11:00:00Z",
  },
  {
    id: "rule-002",
    title: "Prioritize Published KB Articles",
    description: `## Rule Definition

When the RAG pipeline retrieves sources for a query, **published KB articles must be ranked higher** than draft KB articles and resolved incidents of equivalent relevance.

## Rationale

Published KB articles have gone through a review process and represent the team's curated, canonical knowledge. Draft articles may contain incomplete or unverified information, and incident records -- while valuable -- describe specific occurrences that may not generalize.

By prioritizing published KB articles, we ensure that agents receive the most reliable and actionable guidance first.

## Evaluation

- **Trigger:** Every RAG query
- **Action:** Apply a ranking boost of **+0.15** to the relevance score of sources where \`type = "kb_article"\` and \`status = "published"\`
- **Tiebreaker:** If two sources have the same adjusted relevance score, prefer the one with the more recent \`updated_at\` timestamp
- **Exception:** If the user explicitly filters to \`source_types: ["incident"]\`, this rule does not apply

## Notes

- Draft KB articles are still included in results but appear lower in the ranking
- Archived KB articles are excluded entirely (see separate rule if implemented)`,
    category: "rag_behavior",
    priority: 2,
    is_enabled: true,
    created_by: "admin@example.com",
    created_at: "2026-01-10T09:30:00Z",
    updated_at: "2026-02-15T11:30:00Z",
  },
  {
    id: "rule-003",
    title: "Minimum Relevance Threshold",
    description: `## Rule Definition

If **no retrieved source** exceeds a relevance score of **0.70**, the RAG pipeline must **not** generate a speculative answer. Instead, it must return a predefined "insufficient context" response.

## Rationale

When retrieval quality is low, the LLM is more likely to hallucinate or provide generic advice that doesn't match the organization's specific environment. Returning a transparent "I don't have enough information" response is preferable to a confident but incorrect answer.

## Insufficient Context Response

When triggered, the pipeline must return:

> I don't have enough relevant information in the knowledge base to provide a reliable answer to this question. Consider:
> - Rephrasing your query with more specific terms
> - Searching the incident log or KB articles directly
> - Reaching out to the relevant team on Slack

## Evaluation

- **Trigger:** All source relevance scores for a given query are below 0.70
- **Action:** Return the insufficient context response instead of generating an LLM answer
- **Score basis:** The raw cosine similarity score from Azure AI Search before any ranking boosts from other rules

## Configuration

| Parameter | Value |
|-----------|-------|
| Threshold | 0.70 |
| Score type | Cosine similarity (pre-boost) |
| Fallback behavior | Return canned response |`,
    category: "rag_behavior",
    priority: 3,
    is_enabled: true,
    created_by: "admin@example.com",
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-03-01T09:00:00Z",
  },
  {
    id: "rule-004",
    title: "Require Human Confirmation for Auto-Close",
    description: `## Rule Definition

The AI agent **must not** automatically transition an incident to the \`closed\` status without explicit human confirmation. The agent may **suggest** closing an incident and prepare the closure summary, but the final action must be performed by a human.

## Rationale

Incident closure is a critical state transition that has downstream effects:
- Triggers post-mortem workflows for High/Critical incidents
- Sends closure notifications to stakeholders
- Marks the incident as no longer requiring attention in dashboards
- Affects SLA/SLO calculations

Premature closure could mean an unresolved issue stops being monitored, leading to recurrence without awareness.

## Allowed Agent Actions

The agent **may**:
- Suggest that an incident is ready to close, with reasoning
- Pre-fill the closure summary and resolution notes
- Transition an incident from \`investigating\` to \`resolved\` (one step short of closed)

The agent **must not**:
- Directly set \`status = "closed"\`
- Auto-close incidents after a timeout period without human review

## Enforcement

This guardrail is enforced at the agent framework level by removing the \`close_incident\` tool from the agent's available actions. The agent can only invoke \`suggest_close_incident\`, which creates a pending action for human approval.`,
    category: "agent_guardrail",
    priority: 1,
    is_enabled: true,
    created_by: "admin@example.com",
    created_at: "2026-01-12T09:00:00Z",
    updated_at: "2026-02-20T14:00:00Z",
  },
  {
    id: "rule-005",
    title: "Source Citation Required",
    description: `## Rule Definition

Every fix suggestion or recommendation generated by the AI agent **must** cite at least one source -- either a past incident or a KB article. If the agent cannot identify a relevant source, it must explicitly state that the suggestion is based on general knowledge and has not been validated against the organization's knowledge base.

## Rationale

Unsourced recommendations are more likely to be:
- Generic advice that doesn't account for the organization's specific infrastructure
- Hallucinated steps that sound plausible but don't match real procedures
- Difficult to verify or audit after the fact

By requiring citations, we create an audit trail and help support agents assess the reliability of the recommendation.

## Citation Format

When citing a source, the agent must include:
- Source type (incident or KB article)
- Source ID and title
- Relevance context (why this source is relevant to the current situation)

**Example:**

> **Recommended fix:** Increase the connection pool size to 200 and restart the service.
>
> *Sources:*
> - *Incident INC-003: "Database connection pool exhaustion" -- resolved a similar issue by adjusting pool configuration*
> - *KB-005: "API Gateway Rate Limit Configuration" -- documents the standard pool sizing guidelines*

## Unsourced Disclaimer

If no relevant sources exist:

> **Note:** This suggestion is based on general troubleshooting principles and has not been validated against our knowledge base. Please review carefully before applying.

## Enforcement

The agent's response template requires a \`sources\` field. If empty, the disclaimer is automatically appended by the orchestration layer.`,
    category: "agent_guardrail",
    priority: 2,
    is_enabled: true,
    created_by: "admin@example.com",
    created_at: "2026-01-12T09:30:00Z",
    updated_at: "2026-02-20T14:30:00Z",
  },
  {
    id: "rule-006",
    title: "Production Fix Approval Required",
    description: `## Rule Definition

The AI agent **must not** apply any fix or configuration change to **production services** without prior approval from the responsible team's lead or a designated approver.

## Rationale

While the agent can accurately diagnose many issues and suggest correct fixes, applying changes to production without human oversight carries significant risk:
- A fix for one issue might introduce a regression in another area
- The agent may not have full context about ongoing deployments or maintenance windows
- Compliance and audit requirements mandate human approval for production changes
- Rollback may be complex if an automated fix causes unexpected side effects

## Scope

This rule applies to all agent actions that would modify production state, including:
- Configuration changes (environment variables, feature flags, rate limits)
- Service restarts or scaling operations
- Database migrations or data fixes
- DNS or routing changes
- Certificate rotations

## Exemptions

The following actions are **exempt** from this rule and may be performed automatically:
- Adding diagnostic information to the incident timeline
- Running read-only diagnostic commands (log queries, metric checks)
- Sending notifications and alerts
- Creating draft KB articles or suggested edits

## Approval Workflow

1. Agent identifies a fix and prepares a change proposal
2. Change proposal is sent to the responsible team's approval queue
3. Team lead reviews and approves/rejects via the Incident Portal
4. If approved, the agent applies the fix and logs the action with the approver's identity
5. If rejected, the agent logs the rejection and waits for alternative instructions

## Enforcement

The agent's tool-use permissions are configured to require an \`approval_token\` parameter for any write operation against production services. The token is issued only after human approval through the approval workflow.`,
    category: "agent_guardrail",
    priority: 3,
    is_enabled: false,
    created_by: "admin@example.com",
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-03-15T16:00:00Z",
  },
];
