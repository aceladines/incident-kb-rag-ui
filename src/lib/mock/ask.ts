import type { AskResponse } from "@/lib/types";
import { mockIncidents } from "./incidents";
import { mockKbArticles } from "./kb";

export const mockAskResponses: Record<string, AskResponse> = {
  "authentication issues": {
    answer: `## Authentication Service Issues

Based on recent incidents and our knowledge base, here's what we know about authentication issues:

### Current Status

There is an **active incident** (INC-001) involving the Authentication Service returning 503 errors during peak hours. The investigation points to connection pool saturation and insufficient pod scaling speed.

### Common Causes

Authentication failures typically fall into these categories:

1. **Token-related issues** -- expired access tokens, revoked refresh tokens, or clock skew causing JWT validation failures
2. **Service overload** -- connection pool exhaustion under peak traffic, leading to 503 responses
3. **SSO configuration** -- redirect loops from mismatched callback URLs or expired IdP certificates

### Recommended Actions

- Check the current auth service health: \`kubectl get pods -l app=auth-svc\`
- Verify token validity using the introspection endpoint
- Review the [Debugging Authentication Failures](/kb/kb-002) guide for step-by-step troubleshooting

> **Note:** If you're seeing intermittent 503 errors during peak hours (09:00-10:00 UTC or 14:00-15:00 UTC), this is likely related to the ongoing INC-001 investigation. The team is working on increasing the connection pool size and adjusting HPA thresholds.`,
    sources: [
      { type: "incident", data: mockIncidents[0] },
      { type: "kb_article", data: mockKbArticles[1] },
    ],
  },

  "payment timeout": {
    answer: `## Payment Processing Timeouts

We have documented experience with payment timeouts, particularly in the EU region.

### Recent Incident

**INC-002: Payment processing timeout in EU region** (now resolved) was caused by:

1. A background index build on the \`transactions\` table causing lock contention
2. An outdated connection pool configuration that wasn't distributing load across all read replicas

The fix involved pausing the index build and updating the pool config to use all 4 replicas.

### Architecture Context

The payment pipeline routes transactions through region-specific PSP adapters. EU transactions use Adyen, while NA transactions use Stripe. Timeouts can occur at multiple points:

- **API Gateway** -- 30-second global timeout
- **Payment Service** -- 10-second PSP timeout with 4 retry attempts
- **Database** -- connection acquisition timeout (5 seconds)

### Troubleshooting Steps

1. Check which region is affected: \`curl -s http://payment-svc:9090/metrics | grep payment_latency\`
2. Verify database connection pool health on the regional replica
3. Check for any ongoing database maintenance (index builds, vacuum operations)
4. Review the [Payment Processing Pipeline Overview](/kb/kb-006) for architecture details

### Prevention

The team has since added:
- Pre-migration checks for large index builds
- Auto-calculated connection pool sizing based on replica count
- Alerting on payment success rate dropping below 99.5%`,
    sources: [
      { type: "incident", data: mockIncidents[1] },
      { type: "kb_article", data: mockKbArticles[5] },
    ],
  },

  "database connection issues": {
    answer: `## Database Connection Issues

Database connection problems are a recurring theme across our infrastructure. Here's a synthesis of what we've learned.

### Resolved Incidents

**INC-003: Database connection pool exhaustion** was caused by a missing \`finally\` block in the bulk import endpoint that leaked connections in error paths. The fix involved:

- Switching to async context managers (\`async with\`) for all database operations
- Adding \`idle_in_transaction_session_timeout = 300000\` as a safety net
- Adding connection leak detection tests to CI

### Key Diagnostics

Check the current connection state:

\`\`\`sql
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
\`\`\`

A healthy distribution looks like:
- \`active\`: 5-20% of max connections
- \`idle\`: 30-50%
- \`idle in transaction\`: < 5% (high values indicate leaks)

### Failover Procedure

If the primary database becomes unresponsive, follow the [Database Failover Procedure](/kb/kb-001) runbook. Key steps:

1. Verify replication lag on standby nodes
2. Enable read-only mode on primary (if reachable)
3. Execute switchover via \`repmgr\`
4. Update PgBouncer connection strings

### Common Causes

| Cause | Symptom | Fix |
|-------|---------|-----|
| Connection leak | \`idle in transaction\` growing | Fix code to use context managers |
| Pool too small | \`waiting_requests > 0\` | Increase \`max_connections\` |
| Long queries | Active connections holding resources | Optimize queries, add timeouts |
| Network partition | Sudden connection drops | Check network, failover if needed |`,
    sources: [
      { type: "incident", data: mockIncidents[2] },
      { type: "kb_article", data: mockKbArticles[0] },
    ],
  },
};

const defaultResponse: AskResponse = {
  answer: `I found some information that may be relevant to your query, but I wasn't able to find a highly specific match in our incident history or knowledge base.

### Suggestions

- Try rephrasing your query with more specific terms (e.g., include the service name, error code, or symptom)
- Browse the [Knowledge Base](/kb) for related articles
- Check recent [Incidents](/incidents) to see if there's an ongoing issue
- Reach out to the relevant team on Slack for real-time assistance

If you believe this topic should be covered in our knowledge base, consider creating a new KB article to help future support agents.`,
  sources: [],
};

/**
 * Returns a mock RAG response based on simple keyword matching against the query.
 * In production, this would be replaced by the actual /api/ask endpoint which
 * performs semantic search via Azure AI Search and generates answers via Azure OpenAI.
 */
export function getMockAskResponse(query: string): AskResponse {
  const normalizedQuery = query.toLowerCase().trim();

  // Check for keyword matches against known mock responses
  for (const [key, response] of Object.entries(mockAskResponses)) {
    const keywords = key.split(" ");
    const matchCount = keywords.filter((keyword) =>
      normalizedQuery.includes(keyword)
    ).length;

    // If more than half the keywords match, return this response
    if (matchCount > keywords.length / 2) {
      return response;
    }
  }

  // Additional keyword-based fallbacks for broader matching
  if (
    normalizedQuery.includes("auth") ||
    normalizedQuery.includes("login") ||
    normalizedQuery.includes("sso") ||
    normalizedQuery.includes("token")
  ) {
    return mockAskResponses["authentication issues"];
  }

  if (
    normalizedQuery.includes("payment") ||
    normalizedQuery.includes("transaction") ||
    normalizedQuery.includes("billing") ||
    normalizedQuery.includes("stripe")
  ) {
    return mockAskResponses["payment timeout"];
  }

  if (
    normalizedQuery.includes("database") ||
    normalizedQuery.includes("postgres") ||
    normalizedQuery.includes("connection pool") ||
    normalizedQuery.includes("db ")
  ) {
    return mockAskResponses["database connection issues"];
  }

  if (
    normalizedQuery.includes("email") ||
    normalizedQuery.includes("smtp") ||
    normalizedQuery.includes("notification")
  ) {
    return {
      answer: `## Email and Notification Issues

Based on our knowledge base, email delivery problems are commonly caused by priority queue misconfiguration or SMTP relay issues.

### Key Incident

**INC-005: Email delivery delayed for password reset flows** -- Password reset emails were defaulting to the low-priority queue because they weren't explicitly assigned to a priority tier. This caused 5-15 minute delays during concurrent marketing blasts.

### Troubleshooting

Refer to the [Resolving Email Delivery Issues](/kb/kb-008) guide for a comprehensive diagnostic flowchart covering:

- Queue backlog analysis
- Bounce handling
- Spam classification checks
- Template rendering debugging

### Quick Checks

1. Check queue depth: \`curl -s http://email-svc:9090/metrics | grep email_queue_depth\`
2. Verify SMTP relay connectivity
3. Confirm the email type is assigned to the correct priority queue`,
      sources: [
        { type: "incident", data: mockIncidents[4] },
        { type: "kb_article", data: mockKbArticles[7] },
      ],
    };
  }

  if (
    normalizedQuery.includes("rate limit") ||
    normalizedQuery.includes("429") ||
    normalizedQuery.includes("throttl")
  ) {
    return {
      answer: `## Rate Limiting Issues

### Recent Incident

**INC-006: API rate limiter incorrectly blocking legitimate traffic** was caused by a load balancer configuration change that broke \`X-Forwarded-For\` header parsing. Multiple customers behind corporate NATs were grouped under a single IP, causing their combined traffic to exceed per-IP limits.

### Configuration Reference

See [API Gateway Rate Limit Configuration](/kb/kb-005) for the full configuration reference, including:

- Per-tier rate limits (Free: 60/min, Standard: 600/min, Enterprise: 6,000/min)
- Per-endpoint overrides for expensive operations
- Bypass list configuration for internal services
- Monitoring and alerting thresholds

### Quick Fix

If legitimate users are being rate-limited:
1. Check the rate limit key configuration (should be \`API-Key + IP\`, not IP-only)
2. Verify \`X-Forwarded-For\` parsing is correct
3. Manually clear rate limit counters for affected users in Redis`,
      sources: [
        { type: "incident", data: mockIncidents[5] },
        { type: "kb_article", data: mockKbArticles[4] },
      ],
    };
  }

  if (
    normalizedQuery.includes("incident") &&
    (normalizedQuery.includes("response") || normalizedQuery.includes("process") || normalizedQuery.includes("protocol"))
  ) {
    return {
      answer: `## Incident Response Process

Our incident response protocol is documented in detail in the knowledge base.

### Key Points

1. **Severity Classification** determines response time and update cadence:
   - Critical: 5-minute response, updates every 15 minutes
   - High: 15-minute response, updates every 30 minutes
   - Medium: 1-hour response, updates every 2 hours
   - Low: 4-hour response, daily updates

2. **Incident Command** is required for Critical and High severity incidents. The on-call lead serves as Incident Commander and coordinates the response without directly debugging.

3. **Post-Mortem** is required for all Critical and High incidents, and recommended for Medium. Draft within 48 hours, review within 5 business days.

### On-Call Rotation

On-call rotations run weekly (Monday to Monday). See the [On-Call Rotation Guidelines](/kb/kb-007) for shift handoff procedures, escalation paths, and well-being policies.

Refer to the full [Incident Response Protocol](/kb/kb-004) for the complete SOP.`,
      sources: [
        { type: "kb_article", data: mockKbArticles[3] },
        { type: "kb_article", data: mockKbArticles[6] },
      ],
    };
  }

  return defaultResponse;
}
