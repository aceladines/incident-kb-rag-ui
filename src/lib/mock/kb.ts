import type { KbArticle } from "@/lib/types";

export const mockKbArticles: KbArticle[] = [
  {
    id: "kb-001",
    title: "Database Failover Procedure",
    summary: "Step-by-step runbook for initiating and managing a PostgreSQL database failover, including pre-checks, execution, and post-failover validation.",
    content: `# Database Failover Procedure

## Overview

This runbook covers the procedure for performing a controlled failover of the primary PostgreSQL cluster to a standby replica. Use this procedure for planned maintenance or when the primary node is degraded but still partially responsive.

> **For unplanned outages** where the primary is completely unreachable, skip to [Emergency Failover](#emergency-failover).

## Prerequisites

- SSH access to the database nodes (\`db-primary\`, \`db-standby-1\`, \`db-standby-2\`)
- \`pg_ctl\` and \`repmgr\` CLI tools available
- Membership in the \`dba-oncall\` PagerDuty rotation
- Notification sent to \`#db-ops\` Slack channel

## Pre-Failover Checklist

- [ ] Verify replication lag is below 100ms:

\`\`\`bash
repmgr node check --node-id=2
# Expected: "replication lag: OK (0 seconds)"
\`\`\`

- [ ] Confirm standby is in streaming replication mode:

\`\`\`sql
SELECT status, sent_lsn, replay_lsn FROM pg_stat_replication;
\`\`\`

- [ ] Take a snapshot of current connection count and active queries
- [ ] Notify dependent teams via the \`#incident-comms\` channel
- [ ] Pause all batch jobs and cron tasks that write to the database

## Controlled Failover Steps

### Step 1: Enable Read-Only Mode on Primary

\`\`\`sql
ALTER SYSTEM SET default_transaction_read_only = on;
SELECT pg_reload_conf();
\`\`\`

This prevents new writes while existing transactions complete.

### Step 2: Wait for Replication Catch-Up

\`\`\`bash
# Wait until standby has replayed all WAL segments
repmgr standby switchover --siblings-follow --dry-run
\`\`\`

### Step 3: Execute Switchover

\`\`\`bash
repmgr standby switchover --siblings-follow
\`\`\`

### Step 4: Verify New Primary

\`\`\`bash
repmgr cluster show
# New primary should be db-standby-1
\`\`\`

\`\`\`sql
-- On the new primary:
SELECT pg_is_in_recovery();  -- Should return 'f' (false)
\`\`\`

### Step 5: Update Connection Strings

Update the PgBouncer configuration to point to the new primary:

\`\`\`ini
[databases]
app_db = host=db-standby-1 port=5432 dbname=app_db
\`\`\`

Reload PgBouncer: \`pgbouncer -R /etc/pgbouncer/pgbouncer.ini\`

## Post-Failover Validation

- [ ] Application health checks passing
- [ ] No connection errors in application logs
- [ ] Replication established from new primary to remaining standbys
- [ ] Resume batch jobs and cron tasks
- [ ] Update the incident channel with completion status

## Emergency Failover

If the primary is completely unreachable:

\`\`\`bash
# Force promote the standby
repmgr standby promote --node-id=2
\`\`\`

**Warning:** This may result in data loss if the standby was behind the primary. Check \`pg_last_wal_replay_lsn()\` after promotion and compare with the last known primary LSN.

## Rollback

If the failover causes issues, reverse the procedure by promoting the original primary (now a standby) back:

\`\`\`bash
repmgr standby switchover --node-id=1 --siblings-follow
\`\`\``,
    category: "runbook",
    tags: ["database", "postgresql", "failover", "disaster-recovery", "high-availability"],
    related_services: ["svc-005"],
    status: "published",
    created_by: "sarah.kim@example.com",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-03-20T14:30:00Z",
    published_at: "2026-01-16T09:00:00Z",
  },
  {
    id: "kb-002",
    title: "Debugging Authentication Failures",
    summary: "Troubleshooting guide for diagnosing and resolving common authentication and SSO failure scenarios across the platform.",
    content: `# Debugging Authentication Failures

## Common Symptoms

| Symptom | Likely Cause | Section |
|---------|-------------|---------|
| 401 Unauthorized on all requests | Token expired or revoked | [Token Issues](#token-issues) |
| 503 from auth service | Service overloaded | [Service Health](#service-health) |
| SSO redirect loop | Misconfigured callback URL | [SSO Issues](#sso-issues) |
| "Invalid grant" error | Stale refresh token | [Token Issues](#token-issues) |
| Intermittent login failures | Connection pool exhaustion | [Service Health](#service-health) |

## Token Issues

### Expired Access Token

Access tokens have a 15-minute TTL. If the client isn't refreshing tokens proactively, users will see 401 errors.

**Diagnosis:**

\`\`\`bash
# Decode the JWT to check expiry (without verification)
echo "<token>" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.exp | todate'
\`\`\`

**Resolution:**
- Ensure the client SDK has token refresh logic enabled
- Check that the refresh token hasn't expired (24-hour TTL)
- Verify the token endpoint \`/oauth/token\` is responding

### Revoked Tokens

Tokens are revoked when a user changes their password, an admin forces a logout, or the client secret is rotated.

\`\`\`bash
# Check if a token is in the revocation list
curl -s https://auth.example.com/api/v1/token/introspect \\
  -d "token=<access_token>" \\
  -d "client_id=<client_id>" | jq '.active'
\`\`\`

If \`.active\` is \`false\`, the user needs to re-authenticate.

## Service Health

### Connection Pool Exhaustion

The auth service uses a connection pool of 50 connections to the user database.

**Diagnosis:**

\`\`\`bash
# Check current connections
kubectl exec -it auth-svc-pod -- curl -s localhost:9090/metrics | grep 'db_pool'
# db_pool_active_connections 47
# db_pool_idle_connections 3
# db_pool_waiting_requests 12
\`\`\`

If \`waiting_requests > 0\`, the pool is saturated.

**Resolution:**
1. Check for long-running queries: \`SELECT * FROM pg_stat_activity WHERE state = 'active' AND duration > interval '30 seconds'\`
2. If caused by traffic spike, scale the auth service pods
3. If caused by a query regression, identify and fix the slow query

### Pod Health

\`\`\`bash
kubectl get pods -l app=auth-svc -o wide
kubectl top pods -l app=auth-svc
kubectl logs -l app=auth-svc --tail=100 | grep -i error
\`\`\`

## SSO Issues

### Redirect Loop

A redirect loop between the application and the identity provider usually means the callback URL doesn't match what's configured.

**Checklist:**
1. Verify the callback URL in the IdP matches exactly (including trailing slashes)
2. Check that cookies are being set correctly (SameSite, Secure, Domain attributes)
3. Verify the application's session store is working (Redis, if applicable)

### SAML Assertion Errors

\`\`\`bash
# Decode the SAML response for debugging
echo "<base64_saml_response>" | base64 -d | xmllint --format -
\`\`\`

Common issues:
- Clock skew between IdP and SP (> 5 minutes)
- Certificate mismatch after IdP key rotation
- Missing required attributes in the assertion

## Escalation

If the above steps don't resolve the issue:
1. Collect auth service logs for the affected time window
2. Note the user's client ID and approximate timestamp
3. Escalate to the **Security** team via \`#security-oncall\``,
    category: "troubleshooting",
    tags: ["authentication", "sso", "oauth", "jwt", "troubleshooting", "debugging"],
    related_services: ["svc-001"],
    status: "published",
    created_by: "maria.chen@example.com",
    created_at: "2026-02-01T09:00:00Z",
    updated_at: "2026-03-28T11:00:00Z",
    published_at: "2026-02-02T10:00:00Z",
  },
  {
    id: "kb-003",
    title: "Common API Error Codes and Resolutions",
    summary: "Reference guide for all standard API error codes returned by the platform, with explanations and recommended resolutions for each.",
    content: `# Common API Error Codes and Resolutions

## Overview

This document lists all standard error codes returned by the API Gateway and backend services, along with their meanings and recommended actions.

## Client Errors (4xx)

### 400 Bad Request

**Meaning:** The request body or query parameters are malformed or fail validation.

**Common causes:**
- Missing required fields
- Invalid field types (e.g., string where number expected)
- Invalid enum values

**Resolution:**
- Check the request body against the API documentation
- Validate the payload using the OpenAPI schema

**Example error response:**
\`\`\`json
{
  "detail": "Validation error",
  "errors": [
    {
      "field": "severity",
      "message": "Value must be one of: low, medium, high, critical"
    }
  ]
}
\`\`\`

### 401 Unauthorized

**Meaning:** The request lacks valid authentication credentials.

**Common causes:**
- Missing \`Authorization\` header
- Expired access token
- Revoked token

**Resolution:**
- Ensure the \`Authorization: Bearer <token>\` header is present
- Refresh the access token if expired
- Re-authenticate if the refresh token is also expired

### 403 Forbidden

**Meaning:** The authenticated user does not have permission for this action.

**Common causes:**
- Non-admin user accessing admin-only endpoints (e.g., \`/api/rules\`)
- User attempting to modify a resource owned by another team

**Resolution:**
- Verify the user's role has the required permissions
- Contact an admin to request elevated access if needed

### 404 Not Found

**Meaning:** The requested resource does not exist.

**Resolution:**
- Verify the resource ID is correct
- Check if the resource was recently deleted

### 409 Conflict

**Meaning:** The request conflicts with the current state of the resource.

**Common causes:**
- Attempting to create a resource that already exists
- Concurrent update conflict (optimistic locking failure)

**Resolution:**
- Fetch the latest version of the resource and retry
- Use the \`If-Match\` header with the resource's ETag for conditional updates

### 429 Too Many Requests

**Meaning:** The client has exceeded the rate limit.

**Rate limits:**
| Tier | Requests/min | Burst |
|------|-------------|-------|
| Free | 60 | 10 |
| Standard | 600 | 50 |
| Enterprise | 6,000 | 200 |

**Resolution:**
- Implement exponential backoff
- Check the \`Retry-After\` header for when to retry
- Contact sales to upgrade your rate limit tier

## Server Errors (5xx)

### 500 Internal Server Error

**Meaning:** An unexpected error occurred on the server.

**Resolution:**
- Retry the request after a short delay
- If persistent, check the [status page](https://status.example.com)
- Report to \`#api-support\` with the \`X-Request-Id\` header value

### 502 Bad Gateway

**Meaning:** The API Gateway received an invalid response from an upstream service.

**Common causes:**
- Upstream service is deploying
- Upstream service crashed

**Resolution:**
- Retry after 5-10 seconds
- Check service status on the dashboard

### 503 Service Unavailable

**Meaning:** The service is temporarily unable to handle requests.

**Common causes:**
- Service is starting up or shutting down
- Service is overloaded
- Dependency is unavailable

**Resolution:**
- Retry with exponential backoff
- Check the \`Retry-After\` header

### 504 Gateway Timeout

**Meaning:** The upstream service did not respond within the timeout period (30 seconds).

**Common causes:**
- Slow database queries
- External service dependency timeout
- Large payload processing

**Resolution:**
- For large operations, use the async endpoint variant if available
- Report persistent timeouts to the API team`,
    category: "faq",
    tags: ["api", "error-codes", "http", "troubleshooting", "reference"],
    related_services: ["svc-004"],
    status: "published",
    created_by: "daniel.wu@example.com",
    created_at: "2026-01-20T14:00:00Z",
    updated_at: "2026-03-10T09:00:00Z",
    published_at: "2026-01-21T08:00:00Z",
  },
  {
    id: "kb-004",
    title: "Incident Response Protocol",
    summary: "Standard operating procedure for incident detection, triage, communication, resolution, and post-mortem for all severity levels.",
    content: `# Incident Response Protocol

## Purpose

This SOP defines the standard process for responding to production incidents. All on-call engineers and incident commanders must follow this protocol.

## Severity Classification

| Severity | Definition | Response Time | Update Cadence |
|----------|-----------|---------------|----------------|
| **Critical** | Complete service outage or data loss | 5 minutes | Every 15 minutes |
| **High** | Major feature degraded, significant user impact | 15 minutes | Every 30 minutes |
| **Medium** | Minor feature degraded, workaround available | 1 hour | Every 2 hours |
| **Low** | Cosmetic issue, no functional impact | 4 hours | Daily |

## Phase 1: Detection & Triage

### Automated Detection
- Monitoring alerts fire via PagerDuty
- On-call engineer receives notification
- Acknowledge the alert within the response time SLA

### Manual Detection
- Reports from support team, customers, or internal users
- Create an incident record immediately via the Incident Portal

### Triage Steps

1. **Assess scope:** How many users/services are affected?
2. **Classify severity:** Use the table above
3. **Identify impacted services:** Tag all affected services in the incident record
4. **Assign responsible team:** Route to the team that owns the root service

## Phase 2: Incident Command

For **Critical** and **High** severity incidents:

1. **Declare an Incident Commander (IC):** The on-call lead or a designated senior engineer
2. **Open a war room:** Create a dedicated Slack channel: \`#inc-YYYY-MM-DD-short-description\`
3. **Assemble the response team:** Page relevant service owners
4. **Start a timeline:** Document every action and observation with timestamps

### Incident Commander Responsibilities

- Coordinate the response (do not debug directly)
- Ensure communication cadence is maintained
- Make go/no-go decisions for proposed fixes
- Escalate if the incident is not progressing toward resolution

## Phase 3: Communication

### Internal Communication

- Post initial assessment to \`#incident-comms\` within 10 minutes
- Update stakeholders at the cadence defined by severity
- Use the template:

\`\`\`
**Incident Update - [INC-XXX] [Title]**
**Status:** Investigating / Identified / Fixing / Resolved
**Severity:** Critical / High / Medium / Low
**Impact:** [Description of user impact]
**Current Action:** [What is being done right now]
**Next Update:** [Time]
\`\`\`

### External Communication

For customer-facing incidents:
- Update the status page within 15 minutes of detection
- Draft customer communications and route through the Comms team
- Do NOT share root cause details externally until the post-mortem is complete

## Phase 4: Resolution

1. Implement the fix (hotfix, rollback, configuration change, etc.)
2. Validate the fix in production with the affected team
3. Monitor for 30 minutes to confirm stability
4. Update the incident status to **Resolved**
5. Notify all stakeholders

## Phase 5: Post-Mortem

Required for all **Critical** and **High** severity incidents. Recommended for **Medium**.

### Timeline

- Draft post-mortem within **48 hours** of resolution
- Review meeting within **5 business days**
- Action items assigned and tracked to completion

### Post-Mortem Template

1. **Summary:** What happened, when, and for how long
2. **Impact:** Quantified user/revenue impact
3. **Timeline:** Minute-by-minute account of events
4. **Root Cause:** Technical root cause analysis
5. **Contributing Factors:** What made the incident worse or delayed resolution
6. **Action Items:** Preventive measures with owners and due dates
7. **Lessons Learned:** What went well, what didn't`,
    category: "sop",
    tags: ["incident-response", "on-call", "process", "communication", "post-mortem"],
    related_services: [],
    status: "published",
    created_by: "alex.rivera@example.com",
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2026-03-05T16:00:00Z",
    published_at: "2025-12-02T09:00:00Z",
  },
  {
    id: "kb-005",
    title: "API Gateway Rate Limit Configuration",
    summary: "Configuration reference for the API Gateway rate limiting system, including per-tier limits, custom rules, bypass lists, and monitoring.",
    content: `# API Gateway Rate Limit Configuration

## Architecture

The rate limiting system consists of three components:

1. **nginx rate limit module** -- First-pass IP-based rate limiting at the edge
2. **Custom rate limit service** -- Token-bucket algorithm with Redis backend for per-API-key limits
3. **Circuit breaker** -- Protects upstream services from cascading failures

\`\`\`
Client -> nginx (IP rate limit) -> Rate Limit Service (API key rate limit) -> Upstream Service
                                          |
                                       Redis (counters)
\`\`\`

## Configuration Files

### nginx Rate Limiting

Location: \`/etc/nginx/conf.d/rate-limit.conf\`

\`\`\`nginx
# Define rate limit zones
limit_req_zone $binary_remote_addr zone=ip_limit:10m rate=100r/s;
limit_req_zone $http_x_api_key zone=api_key_limit:10m rate=50r/s;

# Apply rate limits
server {
    location /api/ {
        limit_req zone=ip_limit burst=20 nodelay;
        limit_req zone=api_key_limit burst=10 nodelay;
        limit_req_status 429;

        proxy_pass http://rate-limit-service;
    }
}
\`\`\`

### Rate Limit Service Configuration

Location: \`config/rate-limits.yaml\`

\`\`\`yaml
redis:
  host: redis-rate-limit.internal
  port: 6379
  db: 0
  pool_size: 20

tiers:
  free:
    requests_per_minute: 60
    burst: 10
    daily_limit: 10000
  standard:
    requests_per_minute: 600
    burst: 50
    daily_limit: 100000
  enterprise:
    requests_per_minute: 6000
    burst: 200
    daily_limit: null  # unlimited

# Per-endpoint overrides
endpoint_overrides:
  "POST /api/ask":
    # RAG queries are expensive -- lower limits
    free: { requests_per_minute: 10, burst: 2 }
    standard: { requests_per_minute: 60, burst: 10 }
    enterprise: { requests_per_minute: 300, burst: 30 }

  "POST /api/import/bulk":
    # Bulk imports are heavy -- strict limits
    free: { requests_per_minute: 1, burst: 1 }
    standard: { requests_per_minute: 5, burst: 2 }
    enterprise: { requests_per_minute: 20, burst: 5 }

# Bypass list (internal services, health checks)
bypass:
  api_keys:
    - "internal-health-check-key"
    - "monitoring-synthetic-key"
  ip_ranges:
    - "10.0.0.0/8"
    - "172.16.0.0/12"
\`\`\`

## Response Headers

When a request is rate-limited, the following headers are included:

| Header | Description |
|--------|------------|
| \`X-RateLimit-Limit\` | Maximum requests per window |
| \`X-RateLimit-Remaining\` | Remaining requests in current window |
| \`X-RateLimit-Reset\` | Unix timestamp when the window resets |
| \`Retry-After\` | Seconds until the client should retry (on 429 responses) |

## Monitoring

Rate limit metrics are exposed at \`/metrics\` on port 9090:

\`\`\`
rate_limit_requests_total{tier="free",status="allowed"} 45231
rate_limit_requests_total{tier="free",status="rejected"} 127
rate_limit_requests_total{tier="standard",status="allowed"} 892341
rate_limit_requests_total{tier="standard",status="rejected"} 45
\`\`\`

### Alerts

- \`RateLimitRejectionRateHigh\`: > 5% of requests for any tier are being rejected
- \`RateLimitRedisDown\`: Redis is unreachable (failover to in-memory counters)

## Updating Limits

1. Edit \`config/rate-limits.yaml\`
2. Create a PR and get approval from the **Platform Engineering** team
3. Deploy via Helm: \`helm upgrade api-gateway ./charts/api-gateway -f config/rate-limits.yaml\`
4. Verify via \`curl -v\` and check the \`X-RateLimit-*\` headers`,
    category: "configuration",
    tags: ["api-gateway", "rate-limiting", "nginx", "redis", "configuration"],
    related_services: ["svc-004"],
    status: "published",
    created_by: "daniel.wu@example.com",
    created_at: "2026-02-10T11:00:00Z",
    updated_at: "2026-03-01T15:00:00Z",
    published_at: "2026-02-11T09:00:00Z",
  },
  {
    id: "kb-006",
    title: "Payment Processing Pipeline Overview",
    summary: "Architecture overview of the payment processing pipeline, covering the flow from transaction initiation through settlement, including retry logic and failure handling.",
    content: `# Payment Processing Pipeline Overview

## Architecture Diagram

\`\`\`
                                    +-------------------+
                                    |   Payment UI      |
                                    +--------+----------+
                                             |
                                    +--------v----------+
                                    |   API Gateway      |
                                    +--------+----------+
                                             |
                                    +--------v----------+
                                    | Payment Service    |
                                    |  (Orchestrator)    |
                                    +----+----+----+----+
                                         |    |    |
                          +--------------+    |    +--------------+
                          |                   |                   |
                 +--------v------+  +---------v-----+  +---------v-----+
                 |  Fraud Check  |  |  Payment PSP  |  |  Ledger       |
                 |  Service      |  |  Adapter      |  |  Service      |
                 +---------------+  +-------+-------+  +---------------+
                                            |
                                   +--------v------+
                                   |  PSP (Stripe, |
                                   |  Adyen, etc.) |
                                   +---------------+
\`\`\`

## Transaction Flow

### 1. Initiation

The client submits a payment request to \`POST /api/payments\`:

\`\`\`json
{
  "amount": 9999,
  "currency": "USD",
  "payment_method": "card",
  "card_token": "tok_xxx",
  "idempotency_key": "order-12345-attempt-1"
}
\`\`\`

The \`idempotency_key\` ensures duplicate submissions don't result in double charges.

### 2. Fraud Check

Before processing, the transaction passes through the Fraud Check Service:

- **Risk score** calculated based on user history, device fingerprint, and transaction pattern
- Transactions with risk score > 0.8 are **blocked**
- Transactions with risk score 0.5-0.8 are **flagged for review**
- Transactions with risk score < 0.5 are **approved automatically**

### 3. PSP Processing

The Payment PSP Adapter translates the internal payment request into the PSP-specific API format:

| PSP | Regions | Payment Methods |
|-----|---------|----------------|
| Stripe | NA, EU | Card, ACH |
| Adyen | EU, APAC | Card, SEPA, iDEAL |
| PayPal | Global | PayPal balance, Card |

PSP selection is based on:
1. Geographic region of the customer
2. Payment method type
3. PSP availability and performance metrics

### 4. Retry Logic

Failed transactions are retried with exponential backoff:

\`\`\`
Attempt 1: immediate
Attempt 2: 1 second delay
Attempt 3: 4 second delay
Attempt 4: 16 second delay (max)
\`\`\`

Retries only occur for transient failures (network timeouts, 5xx responses). Non-retryable failures (insufficient funds, invalid card) are returned immediately.

### 5. Settlement

- Successful transactions are recorded in the Ledger Service
- Settlement files are generated daily at 02:00 UTC
- Reconciliation runs at 06:00 UTC and flags discrepancies

## Failure Modes

### PSP Timeout

If the PSP doesn't respond within 10 seconds:
1. The request is cancelled
2. A reversal is attempted (if the PSP supports it)
3. The transaction is marked as \`pending_review\`
4. An alert is sent to the payments on-call

### Partial Failure

For split payments (e.g., gift card + credit card):
- If the first payment succeeds but the second fails, the first is automatically reversed
- The entire transaction is marked as \`failed\`
- The user is notified to retry

## Monitoring

Key metrics:
- \`payment_success_rate\` -- target: > 99.5%
- \`payment_latency_p99\` -- target: < 5 seconds
- \`fraud_block_rate\` -- baseline: ~2%
- \`settlement_discrepancy_count\` -- target: 0

## Related Incidents

- [INC-002: Payment processing timeout in EU region](/incidents/inc-002)`,
    category: "architecture",
    tags: ["payments", "architecture", "psp", "stripe", "fraud-detection", "settlement"],
    related_services: ["svc-002", "svc-005"],
    status: "published",
    created_by: "james.okafor@example.com",
    created_at: "2026-01-08T15:00:00Z",
    updated_at: "2026-03-26T10:00:00Z",
    published_at: "2026-01-09T11:00:00Z",
  },
  {
    id: "kb-007",
    title: "On-Call Rotation Guidelines",
    summary: "Guidelines for on-call engineers covering responsibilities, escalation procedures, shift handoff protocols, and well-being policies.",
    content: `# On-Call Rotation Guidelines

## Schedule

- **Primary on-call:** 1-week rotations, Monday 09:00 UTC to Monday 09:00 UTC
- **Secondary on-call:** Backup responder, same rotation schedule
- Rotations are managed in PagerDuty under the \`engineering-oncall\` schedule
- Swaps must be arranged at least 48 hours in advance and updated in PagerDuty

## Responsibilities

### Primary On-Call

- Respond to all PagerDuty alerts within the severity SLA (see [Incident Response Protocol](/kb/kb-004))
- Acknowledge alerts to prevent escalation to secondary
- Perform initial triage and classification
- Coordinate the response for High and Critical incidents
- Document actions in the incident timeline
- Hand off unresolved incidents to the next on-call with a written summary

### Secondary On-Call

- Act as backup if primary doesn't acknowledge within 10 minutes
- Available for consultation and pair debugging
- Take over primary duties if primary is unavailable

## Shift Handoff

At the end of each rotation, the outgoing on-call must:

1. **Write a handoff summary** in the \`#oncall-handoff\` Slack channel:
   - Active incidents and their current status
   - Known flaky alerts that can be safely acknowledged
   - Upcoming maintenance windows
   - Any in-progress investigations

2. **Meet with the incoming on-call** (15-minute sync, async is acceptable if timezones don't overlap)

3. **Update PagerDuty** to confirm the rotation has transitioned

## Alert Triage Guide

### Actionable Alerts

These require investigation:
- \`ServiceDown\` -- A service health check is failing
- \`ErrorRateHigh\` -- Error rate exceeds threshold
- \`LatencyP99High\` -- P99 latency exceeds threshold
- \`DiskSpaceLow\` -- Disk usage > 85%
- \`CertExpiryWarning\` -- SSL certificate expires within 14 days

### Known Noisy Alerts

These are known to be flaky and are being addressed. Acknowledge but monitor:
- \`KafkaConsumerLag\` -- Intermittent lag spikes during batch jobs (tracked in JIRA-1234)
- \`HealthCheckTimeout\` on \`search-svc\` -- Times out during index rotation (tracked in JIRA-5678)

## Escalation

If you cannot resolve an issue within **30 minutes**:

1. Escalate to the **service owner** (listed in the service catalog)
2. If the service owner is unreachable, escalate to the **team lead**
3. For Critical incidents, page the **VP of Engineering** if no progress after 1 hour

## Well-Being Policies

- **Maximum consecutive shifts:** 2 weeks (must have at least 1 week off between)
- **Comp time:** 1 day off for every weekend on-call, 2 days off for holiday on-call
- **Night interruptions:** If woken more than 2 times in a night, you may hand off to secondary
- **Mental health:** If on-call stress is affecting you, speak to your manager. No judgment, no questions.

## Tools & Access

Ensure you have access to the following before your shift:

- [ ] PagerDuty (\`engineering-oncall\` schedule)
- [ ] Grafana dashboards (\`production-overview\`, \`service-health\`)
- [ ] Kubernetes cluster access (\`kubectl\` configured for all environments)
- [ ] VPN access to production network
- [ ] Slack channels: \`#oncall-handoff\`, \`#incident-comms\`, \`#sre-alerts\``,
    category: "general",
    tags: ["on-call", "process", "escalation", "pagerduty", "well-being"],
    related_services: ["svc-010"],
    status: "published",
    created_by: "alex.rivera@example.com",
    created_at: "2025-11-20T09:00:00Z",
    updated_at: "2026-02-28T11:00:00Z",
    published_at: "2025-11-21T10:00:00Z",
  },
  {
    id: "kb-008",
    title: "Resolving Email Delivery Issues",
    summary: "Troubleshooting guide for diagnosing and fixing email delivery problems including delays, bounces, spam classification, and template rendering errors.",
    content: `# Resolving Email Delivery Issues

## Diagnostic Flowchart

\`\`\`
Email not delivered?
  |
  +-- Check: Is the email in the send queue?
  |     +-- No  -> Check the application logs for submission errors
  |     +-- Yes -> Check: Has it been picked up by the mail worker?
  |                 +-- No  -> Check queue backlog and worker health
  |                 +-- Yes -> Check: What is the delivery status?
  |                             +-- Bounced   -> See "Bounce Handling"
  |                             +-- Deferred  -> See "Deferred Emails"
  |                             +-- Delivered  -> Check spam folder
  +-- Check: Is this a specific email type or all emails?
        +-- Specific type -> Check priority queue configuration
        +-- All emails    -> Check SMTP relay health
\`\`\`

## Common Issues

### 1. Emails Stuck in Queue

**Symptoms:** Emails submitted but not delivered. Queue depth growing.

**Diagnosis:**

\`\`\`bash
# Check queue depth
curl -s http://email-svc:9090/metrics | grep email_queue_depth
# email_queue_depth{priority="high"} 12
# email_queue_depth{priority="normal"} 45
# email_queue_depth{priority="low"} 8923  <-- Problem if unusually high

# Check worker status
kubectl get pods -l app=email-worker
kubectl logs -l app=email-worker --tail=50
\`\`\`

**Common causes:**
- Worker pods crashed or scaled to zero
- SMTP relay connection failure
- Rate limiting by the email provider

**Resolution:**
1. Restart email worker pods if crashed
2. Verify SMTP relay credentials and connectivity
3. Check if the email provider has rate-limited our sending domain

### 2. Bounce Handling

**Types of bounces:**

| Type | Meaning | Action |
|------|---------|--------|
| Hard bounce (550) | Mailbox doesn't exist | Remove from mailing list |
| Soft bounce (450) | Mailbox full or temporarily unavailable | Retry (up to 3 times over 24h) |
| Policy bounce (550 5.7.1) | Rejected by spam filter | Check content and sender reputation |

**Checking bounce logs:**

\`\`\`bash
# Query bounce logs from the last 24 hours
curl -s "http://email-svc:8080/api/bounces?since=24h" | jq '.[] | {email, type, reason}'
\`\`\`

### 3. Spam Classification

If emails are landing in spam folders:

**Checklist:**
- [ ] SPF record is correct: \`dig TXT example.com | grep spf\`
- [ ] DKIM signing is active: check \`DKIM-Signature\` header in received email
- [ ] DMARC policy is published: \`dig TXT _dmarc.example.com\`
- [ ] Sender reputation score (check via Google Postmaster Tools)
- [ ] Email content doesn't trigger spam filters (avoid ALL CAPS, excessive links, spam trigger words)

### 4. Template Rendering Errors

If emails are sent but contain broken formatting or missing data:

\`\`\`bash
# Preview a template with sample data
curl -X POST http://email-svc:8080/api/templates/preview \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "password_reset",
    "variables": {
      "user_name": "Test User",
      "reset_link": "https://example.com/reset?token=abc"
    }
  }'
\`\`\`

Common issues:
- Missing template variables (renders as empty or \`{{variable_name}}\`)
- HTML entity encoding issues
- Image URLs pointing to non-existent assets

### 5. Priority Queue Misconfiguration

Email types must be explicitly assigned to a priority queue. If an email type is not listed in any queue, it defaults to the \`low\` priority queue.

**Check current configuration:**

\`\`\`bash
kubectl get configmap email-queue-config -o yaml
\`\`\`

See [INC-005: Email delivery delayed for password reset flows](/incidents/inc-005) for a real-world example of this issue.

## Monitoring

Key metrics to watch:
- \`email_send_total{status="success"}\` -- successful sends
- \`email_send_total{status="bounce"}\` -- bounced emails
- \`email_queue_depth\` -- current queue depth by priority
- \`email_delivery_latency_seconds\` -- time from submission to delivery

### Alerts

- \`EmailDeliveryLatencyHigh\`: P95 delivery time > 60 seconds for high-priority emails
- \`EmailBounceRateHigh\`: Bounce rate > 5% over a 1-hour window
- \`EmailQueueBacklog\`: Any queue depth > 1,000 for more than 10 minutes

## Escalation

If email delivery issues persist after following this guide:
1. Check the email provider's status page
2. Escalate to **Backend Services** team via \`#backend-oncall\`
3. For sender reputation issues, involve the **Security** team`,
    category: "troubleshooting",
    tags: ["email", "smtp", "troubleshooting", "bounces", "spam", "delivery"],
    related_services: ["svc-003"],
    status: "draft",
    created_by: "priya.patel@example.com",
    created_at: "2026-03-18T13:00:00Z",
    updated_at: "2026-04-02T10:00:00Z",
    published_at: null,
  },
];
