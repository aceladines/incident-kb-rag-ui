import type { Incident } from "@/lib/types";

export const mockIncidents: Incident[] = [
  {
    id: "inc-001",
    title: "Authentication service returning 503 during peak hours",
    description: `## Summary

The Authentication Service (\`auth-svc\`) is intermittently returning **503 Service Unavailable** errors during peak traffic windows (09:00-10:00 UTC and 14:00-15:00 UTC).

## Impact

- Approximately **12% of login attempts** fail during peak windows
- Affects all SSO-integrated applications (internal portal, customer dashboard, mobile app)
- Users see a generic "Something went wrong" error page

## Observations

- Kubernetes HPA is scaling pods, but new pods take ~45s to become ready
- Health check endpoint \`/healthz\` returns 200 even when the service is under pressure
- Logs show connection pool saturation:

\`\`\`
ERROR [auth-svc] ConnectionPool exhausted: max_connections=50, active=50, waiting=127
\`\`\`

- CPU usage spikes to 92% on existing pods before new ones come online
- The issue correlates with a 3x increase in token refresh requests after the mobile app v4.2 release

## Timeline

| Time (UTC) | Event |
|------------|-------|
| 09:02 | Monitoring alert fires: auth-svc error rate > 5% |
| 09:05 | On-call engineer acknowledges alert |
| 09:08 | HPA begins scaling from 3 to 8 pods |
| 09:12 | New pods ready, error rate drops to 1.2% |
| 09:45 | Traffic subsides, pods scale back down |
| 14:01 | Same pattern repeats during afternoon peak |`,
    impacted_services: ["svc-001", "svc-004"],
    fix_details: null,
    responsible_team: "team-002",
    status: "investigating",
    severity: "high",
    created_by: "maria.chen@example.com",
    created_at: "2026-03-28T09:15:00Z",
    updated_at: "2026-03-29T11:30:00Z",
    resolved_at: null,
  },
  {
    id: "inc-002",
    title: "Payment processing timeout in EU region",
    description: `## Summary

Payment transactions routed through the EU region (\`eu-west-1\`) are experiencing timeouts exceeding the 30-second threshold, causing transaction failures for European customers.

## Impact

- **~8% of EU payment transactions** are timing out
- Affected payment methods: credit card and SEPA direct debit
- Revenue impact estimated at **\u20ac15,000/hour** during business hours
- Customer support ticket volume increased 4x

## Root Cause Analysis

Investigation revealed the issue stems from a recent database migration that introduced a new index on the \`transactions\` table. The index build process is running in the background and causing lock contention on write-heavy operations.

\`\`\`sql
-- The problematic index (created 2026-03-25)
CREATE INDEX CONCURRENTLY idx_transactions_merchant_date
ON transactions (merchant_id, created_at DESC);
\`\`\`

Additionally, the connection pool configuration for the EU read replicas was not updated after the replica count was increased from 2 to 4:

\`\`\`yaml
# Current (incorrect)
pool:
  max_connections: 100
  per_replica: 50  # Only distributes across 2 replicas

# Should be
pool:
  max_connections: 200
  per_replica: 50  # Distributes across all 4 replicas
\`\`\``,
    impacted_services: ["svc-002", "svc-005"],
    fix_details: `## Resolution

### Immediate Fix (applied 2026-03-26T16:00Z)

1. Paused the background index build to relieve lock contention:

\`\`\`sql
SELECT pg_cancel_backend(pid)
FROM pg_stat_activity
WHERE query LIKE '%idx_transactions_merchant_date%';
\`\`\`

2. Updated connection pool configuration to distribute across all 4 replicas:

\`\`\`yaml
pool:
  max_connections: 200
  per_replica: 50
\`\`\`

3. Restarted the payment-gateway pods in a rolling fashion.

### Permanent Fix

- Rescheduled the index build for the maintenance window (Sunday 02:00-06:00 UTC)
- Added a pre-migration check to the CI pipeline that flags \`CREATE INDEX CONCURRENTLY\` on tables larger than 10M rows
- Updated the connection pool helm chart to auto-calculate \`max_connections\` based on replica count

### Validation

- EU payment success rate returned to **99.7%** within 15 minutes of the fix
- No further timeouts observed over the following 48 hours`,
    responsible_team: "team-002",
    status: "resolved",
    severity: "critical",
    created_by: "james.okafor@example.com",
    created_at: "2026-03-25T14:22:00Z",
    updated_at: "2026-03-27T10:00:00Z",
    resolved_at: "2026-03-26T16:45:00Z",
  },
  {
    id: "inc-003",
    title: "Database connection pool exhaustion",
    description: `## Summary

The primary PostgreSQL cluster (\`db-primary\`) is experiencing connection pool exhaustion, causing sporadic \`FATAL: too many connections\` errors across multiple downstream services.

## Impact

- Intermittent 500 errors across **Authentication Service**, **Payment Gateway**, and **Search Service**
- Average response time increased from 120ms to 2.8s for affected services
- ~3% of all API requests failing

## Investigation

Connection count analysis shows a steady leak:

\`\`\`
$ psql -c "SELECT count(*) FROM pg_stat_activity;"
 count
-------
   498
(1 row)

$ psql -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"
     state     | count
---------------+-------
 active        |    47
 idle          |   312
 idle in tx    |   139  <-- Problem: too many idle-in-transaction
\`\`\`

- **139 connections** are stuck in \`idle in transaction\` state
- The leak started after deployment \`v2.14.3\` of the backend services (2026-03-20)
- Diff analysis points to a missing \`finally\` block in the new bulk-import endpoint that doesn't release connections on error paths`,
    impacted_services: ["svc-005", "svc-001", "svc-002", "svc-007"],
    fix_details: `## Resolution

### Root Cause

The \`POST /api/import/bulk\` endpoint introduced in \`v2.14.3\` opens a database transaction for batch processing but fails to release the connection when a validation error occurs mid-batch:

\`\`\`python
# Before (broken)
async def bulk_import(items: list[ImportItem]):
    conn = await pool.acquire()
    tx = await conn.transaction()
    for item in items:
        if not validate(item):
            raise ValidationError(item)  # Connection leaked!
        await tx.execute(insert_query, item)
    await tx.commit()

# After (fixed)
async def bulk_import(items: list[ImportItem]):
    async with pool.acquire() as conn:
        async with conn.transaction() as tx:
            for item in items:
                if not validate(item):
                    raise ValidationError(item)  # Connection released by context manager
                await tx.execute(insert_query, item)
\`\`\`

### Steps Taken

1. Deployed hotfix \`v2.14.4\` with proper context manager usage
2. Terminated all \`idle in transaction\` connections older than 5 minutes
3. Added \`idle_in_transaction_session_timeout = 300000\` (5 min) to PostgreSQL config as a safety net
4. Added a connection leak detection test to the CI suite`,
    responsible_team: "team-001",
    status: "closed",
    severity: "high",
    created_by: "sarah.kim@example.com",
    created_at: "2026-03-20T08:45:00Z",
    updated_at: "2026-03-22T14:00:00Z",
    resolved_at: "2026-03-21T17:30:00Z",
  },
  {
    id: "inc-004",
    title: "CDN cache invalidation not propagating",
    description: `## Summary

Cache invalidation requests sent to the CDN are not propagating to all edge nodes. Stale content is being served from approximately **30% of edge locations** after purge requests.

## Impact

- Users in certain regions see outdated product images and pricing after catalog updates
- Marketing team unable to reliably publish time-sensitive campaign assets
- Inconsistent experience reported across geographic regions

## Observations

- Purge API returns \`202 Accepted\` but status callback shows only 70% of nodes purged
- Issue appears to be isolated to the Asia-Pacific and South America edge groups
- CDN provider dashboard shows those edge groups are running firmware version \`3.8.1\` while others are on \`3.9.0\`
- No changes on our side correlate with the onset of the issue (first noticed 2026-03-30)

## Steps Taken So Far

1. Opened a support ticket with CDN provider (Ticket #CDN-78421)
2. Implemented a temporary workaround using cache-busting query parameters for critical assets
3. Monitoring propagation times via synthetic checks from 12 global locations`,
    impacted_services: ["svc-006"],
    fix_details: null,
    responsible_team: "team-004",
    status: "open",
    severity: "medium",
    created_by: "alex.rivera@example.com",
    created_at: "2026-03-30T16:10:00Z",
    updated_at: "2026-04-01T09:20:00Z",
    resolved_at: null,
  },
  {
    id: "inc-005",
    title: "Email delivery delayed for password reset flows",
    description: `## Summary

Password reset emails are experiencing significant delays (5-15 minutes) instead of the expected delivery within 30 seconds. Other transactional email types (order confirmations, welcome emails) appear unaffected.

## Impact

- Users unable to complete password resets in a timely manner
- Support ticket volume for "didn't receive reset email" increased by **320%**
- Potential security concern: delayed resets leave accounts in a vulnerable state longer

## Investigation

- Email Service logs show password reset emails are being queued but processed with lower priority
- The issue started after the Email Service configuration update on 2026-03-15 that introduced priority queues:

\`\`\`json
{
  "queues": {
    "high": ["order_confirmation", "payment_receipt", "security_alert"],
    "normal": ["welcome", "newsletter"],
    "low": ["marketing", "digest"]
  }
}
\`\`\`

- **Password reset emails were not added to any queue**, so they default to the \`low\` priority queue
- The \`low\` queue has a rate limit of 10 emails/second, while the \`high\` queue allows 500/second
- Combined with a marketing blast running concurrently, the low queue backlog grew to ~45,000 emails`,
    impacted_services: ["svc-003", "svc-001"],
    fix_details: `## Resolution

### Immediate Fix

Added \`password_reset\` to the \`high\` priority queue configuration:

\`\`\`json
{
  "queues": {
    "high": ["order_confirmation", "payment_receipt", "security_alert", "password_reset"],
    "normal": ["welcome", "newsletter"],
    "low": ["marketing", "digest"]
  }
}
\`\`\`

Flushed the backlogged low-priority queue to clear the ~45,000 pending emails.

### Preventive Measures

- Added a mandatory \`priority\` field to the email template schema so new email types cannot be created without an explicit queue assignment
- Added monitoring alert: if any email type's p95 delivery time exceeds 60 seconds, fire a warning
- Created a runbook for email queue management (KB-003)`,
    responsible_team: "team-002",
    status: "resolved",
    severity: "high",
    created_by: "priya.patel@example.com",
    created_at: "2026-03-15T11:30:00Z",
    updated_at: "2026-03-16T08:00:00Z",
    resolved_at: "2026-03-15T18:45:00Z",
  },
  {
    id: "inc-006",
    title: "API rate limiter incorrectly blocking legitimate traffic",
    description: `## Summary

The API Gateway's rate limiter is incorrectly classifying legitimate API traffic as abusive and returning \`429 Too Many Requests\` responses to authenticated users well below their rate limit quotas.

## Impact

- **~5% of authenticated API users** are being rate-limited despite being under their 1,000 req/min quota
- Affected users report intermittent failures in their integrations
- Several enterprise customers have escalated via their account managers

## Root Cause

The rate limiter uses a sliding window algorithm keyed on IP address. After a load balancer configuration change on 2026-02-28, the \`X-Forwarded-For\` header parsing was altered. Multiple customers behind corporate NATs are now being grouped under a single IP, causing their combined traffic to exceed the per-IP rate limit.

\`\`\`
# Before (correct): rate limit key = first X-Forwarded-For IP
# After (broken): rate limit key = load balancer IP (same for all requests)

Rate limit key for user A: 10.0.0.1  -> was: 203.0.113.45
Rate limit key for user B: 10.0.0.1  -> was: 198.51.100.22
# Both users now share the same rate limit bucket
\`\`\``,
    impacted_services: ["svc-004"],
    fix_details: `## Resolution

1. Fixed the \`X-Forwarded-For\` header parsing in the load balancer configuration:

\`\`\`nginx
# Fixed: use the client's real IP from the rightmost trusted proxy
real_ip_header X-Forwarded-For;
set_real_ip_from 10.0.0.0/8;
real_ip_recursive on;
\`\`\`

2. Switched the rate limiter key from IP-only to a composite key of \`API-Key + IP\`:

\`\`\`yaml
rate_limit:
  key: "\${api_key}:\${client_ip}"
  window: 60s
  max_requests: 1000
\`\`\`

3. Manually cleared rate limit counters for affected customers
4. Sent an incident notification to all enterprise customers with an apology and explanation`,
    responsible_team: "team-001",
    status: "closed",
    severity: "high",
    created_by: "daniel.wu@example.com",
    created_at: "2026-02-28T13:00:00Z",
    updated_at: "2026-03-02T16:00:00Z",
    resolved_at: "2026-03-01T10:30:00Z",
  },
  {
    id: "inc-007",
    title: "Search index out of sync after bulk import",
    description: `## Summary

After a scheduled bulk data import of ~250,000 product records, the Elasticsearch search index is out of sync with the primary database. Search results are returning stale data and missing recently imported records.

## Impact

- Search results are **missing approximately 40% of new products** imported in the latest batch
- Some search results show outdated pricing and availability information
- Customer-facing search and internal admin search both affected

## Investigation

- The bulk import completed successfully in PostgreSQL (all 250,000 records verified)
- Elasticsearch document count: **612,000** (expected: ~850,000)
- The indexing pipeline uses a CDC (Change Data Capture) approach via Debezium
- Debezium connector logs show:

\`\`\`
WARN [debezium] Kafka consumer lag: 238,412 messages behind
ERROR [debezium] Batch rejected: payload size 15.2MB exceeds max.request.size (10485760)
\`\`\`

- The bulk import generated change events larger than Kafka's \`max.request.size\` default, causing messages to be silently dropped`,
    impacted_services: ["svc-007", "svc-005"],
    fix_details: null,
    responsible_team: "team-006",
    status: "investigating",
    severity: "medium",
    created_by: "lisa.nguyen@example.com",
    created_at: "2026-04-01T07:00:00Z",
    updated_at: "2026-04-02T15:30:00Z",
    resolved_at: null,
  },
  {
    id: "inc-008",
    title: "Memory leak in notification service worker",
    description: `## Summary

The Notification Service's background worker process exhibits a steady memory leak, causing OOM (Out of Memory) kills every ~18 hours. The service restarts automatically but drops in-flight notifications during the restart window.

## Impact

- **~200 push notifications lost** per OOM restart event (approximately 3x per day)
- Users occasionally miss time-sensitive alerts (incident updates, approval requests)
- Kubernetes node memory pressure events triggered twice, affecting co-located pods

## Observations

Memory usage pattern (from Prometheus):

\`\`\`
notification-worker memory RSS:
  T+0h:   256 MB (baseline after restart)
  T+6h:   512 MB
  T+12h:  1.1 GB
  T+18h:  2.0 GB -> OOM killed (limit: 2 GB)
\`\`\`

- Heap dump analysis shows accumulating \`WebSocket\` connection objects that are not being garbage collected
- The leak correlates with the number of unique device connections
- Each device connection creates a subscription object that holds a reference to the full notification history buffer
- The history buffer grows unbounded because the cleanup timer was accidentally removed in commit \`a3f8e2d\``,
    impacted_services: ["svc-008"],
    fix_details: `## Resolution

### Root Cause

Commit \`a3f8e2d\` (2026-02-10, "Refactor notification delivery pipeline") removed the periodic cleanup timer that evicted stale WebSocket subscriptions and truncated the per-connection history buffer.

### Fix Applied

1. Restored the cleanup timer with a 5-minute interval:

\`\`\`typescript
setInterval(() => {
  for (const [deviceId, sub] of subscriptions.entries()) {
    if (sub.lastHeartbeat < Date.now() - STALE_THRESHOLD_MS) {
      sub.socket.close();
      subscriptions.delete(deviceId);
    }
    // Truncate history buffer to last 50 entries
    if (sub.historyBuffer.length > 50) {
      sub.historyBuffer = sub.historyBuffer.slice(-50);
    }
  }
}, 5 * 60 * 1000);
\`\`\`

2. Added a memory usage alert at 75% of the container limit (1.5 GB)
3. Set \`max_old_space_size=1536\` to trigger GC pressure before OOM

### Validation

- Memory usage stabilized at ~350 MB after 48 hours of observation
- Zero OOM kills since the fix was deployed`,
    responsible_team: "team-002",
    status: "closed",
    severity: "medium",
    created_by: "carlos.mendez@example.com",
    created_at: "2026-02-15T22:00:00Z",
    updated_at: "2026-02-20T09:00:00Z",
    resolved_at: "2026-02-18T14:00:00Z",
  },
  {
    id: "inc-009",
    title: "SSL certificate expiry warning for api.example.com",
    description: `## Summary

The TLS/SSL certificate for \`api.example.com\` expires in **7 days** (2026-04-12). The automatic renewal via cert-manager failed silently due to a DNS challenge misconfiguration.

## Impact

- **No current user impact** -- the certificate is still valid
- If not renewed before expiry, all API traffic will fail with certificate errors
- Potential for complete service outage affecting all customers and integrations

## Investigation

Cert-manager logs show the renewal attempt failed:

\`\`\`
ERROR cert-manager/challenges "msg"="propagation check failed" "error"="DNS record not found"
  resource_name="api-example-com-tls-1"
  dnsName="api.example.com"
  type="DNS-01"
\`\`\`

- The DNS-01 challenge requires a TXT record at \`_acme-challenge.api.example.com\`
- After the DNS provider migration last month, the API credentials for the DNS provider in cert-manager's secret were not updated
- The credentials reference the old provider's API, which returns 401 Unauthorized

## Urgency

| Days to Expiry | Risk Level |
|----------------|------------|
| 7 | Warning |
| 3 | High |
| 1 | Critical |
| 0 | **Total outage** |`,
    impacted_services: ["svc-004"],
    fix_details: null,
    responsible_team: "team-005",
    status: "open",
    severity: "medium",
    created_by: "rachel.foster@example.com",
    created_at: "2026-04-05T08:00:00Z",
    updated_at: "2026-04-05T08:00:00Z",
    resolved_at: null,
  },
  {
    id: "inc-010",
    title: "File upload failures for attachments > 10MB",
    description: `## Summary

Users are unable to upload file attachments larger than 10MB through the application. Uploads fail with a generic "Upload failed" error message. Files under 10MB work without issue.

## Impact

- Users cannot attach large log files, screenshots, or database dumps to incidents
- Workaround: users are sharing files via external links, which bypasses access controls
- Approximately **15% of upload attempts** fail due to this size limit

## Investigation

- The File Storage service itself accepts files up to 100MB (verified via direct API call)
- The issue is at the **API Gateway** layer, which has a request body size limit:

\`\`\`yaml
# API Gateway config (nginx)
client_max_body_size 10m;  # This is the bottleneck
\`\`\`

- The frontend chunked upload feature was implemented but the API Gateway was never configured to accept the reassembled payload
- Additionally, the frontend shows a generic error instead of a meaningful file-size-exceeded message because the gateway returns \`413 Payload Too Large\` which isn't handled:

\`\`\`
HTTP/1.1 413 Request Entity Too Large
Content-Type: text/html
<html><body><h1>413 Request Entity Too Large</h1></body></html>
\`\`\``,
    impacted_services: ["svc-009", "svc-004"],
    fix_details: `## Resolution

### Changes Applied

1. **API Gateway**: Increased \`client_max_body_size\` to 100MB to match the File Storage service limit:

\`\`\`yaml
client_max_body_size 100m;
\`\`\`

2. **Frontend**: Added proper error handling for 413 responses with a user-friendly message:

\`\`\`typescript
if (error.status === 413) {
  toast.error(\`File too large. Maximum upload size is \${MAX_UPLOAD_SIZE_MB}MB.\`);
}
\`\`\`

3. **Frontend**: Added client-side file size validation before upload to provide instant feedback

4. **Monitoring**: Added an alert for upload failure rates exceeding 2%

### Testing

- Verified uploads of 10MB, 25MB, 50MB, and 95MB files all succeed
- Verified 101MB file is rejected with a clear error message
- Load tested concurrent large uploads (20 simultaneous 50MB files) with no degradation`,
    responsible_team: "team-001",
    status: "resolved",
    severity: "low",
    created_by: "tom.bradley@example.com",
    created_at: "2026-03-10T14:00:00Z",
    updated_at: "2026-03-12T11:00:00Z",
    resolved_at: "2026-03-11T16:30:00Z",
  },
];
