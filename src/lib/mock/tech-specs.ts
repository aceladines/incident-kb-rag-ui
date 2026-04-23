import type { TechSpec } from "@/lib/types";

export const mockTechSpecs: TechSpec[] = [
  {
    id: "ts-001",
    title: "REST API Design Standards",
    summary:
      "Organization-wide standards for designing RESTful APIs, including naming conventions, versioning, pagination, error handling, and authentication patterns.",
    content: `# REST API Design Standards

## Overview

This document defines the organization-wide standards for designing and implementing RESTful APIs. All new services must conform to these standards.

## Base URL Structure

\`\`\`
https://api.example.com/v{major}/{resource}
\`\`\`

- Always use HTTPS
- Version prefix in the URL path (\`/v1/\`, \`/v2/\`)
- Resource names are plural and \`kebab-case\`

## HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|-----------|
| GET | Retrieve resource(s) | Yes |
| POST | Create a resource | No |
| PUT | Full update of a resource | Yes |
| PATCH | Partial update of a resource | No |
| DELETE | Remove a resource | Yes |

## Naming Conventions

- **Resources:** plural nouns, \`kebab-case\` — \`/v1/kb-articles\`, \`/v1/tech-specs\`
- **Query parameters:** \`snake_case\` — \`?page_size=20&sort_by=created_at\`
- **Request/response fields:** \`snake_case\` — \`{ "created_at": "..." }\`

## Pagination

All list endpoints must support cursor-based or offset pagination:

\`\`\`json
{
  "items": [...],
  "total": 142,
  "page": 1,
  "page_size": 20
}
\`\`\`

Default \`page_size\` is 20. Maximum is 100.

## Error Responses

All errors follow a consistent structure:

\`\`\`json
{
  "detail": "Human-readable error message",
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
\`\`\`

## Authentication

All endpoints require a Bearer token in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Rate Limiting

Rate limit headers are included in every response:

- \`X-RateLimit-Limit\`
- \`X-RateLimit-Remaining\`
- \`X-RateLimit-Reset\``,
    category: "api",
    tags: ["rest", "api-design", "standards", "http", "versioning"],
    related_services: ["svc-004"],
    status: "published",
    created_by: "architect@company.com",
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-03-15T14:00:00Z",
    published_at: "2026-01-11T10:00:00Z",
  },
  {
    id: "ts-002",
    title: "Kubernetes Cluster Architecture",
    summary:
      "Infrastructure specification for the production Kubernetes cluster, including node pools, networking, ingress, autoscaling policies, and disaster recovery.",
    content: `# Kubernetes Cluster Architecture

## Overview

Production workloads run on Azure Kubernetes Service (AKS) with the following specifications.

## Cluster Configuration

| Parameter | Value |
|-----------|-------|
| Kubernetes version | 1.29.x |
| Region | East US 2 |
| Node OS | Ubuntu 22.04 |
| CNI | Azure CNI Overlay |
| Network policy | Calico |

## Node Pools

### System Pool

- **SKU:** Standard_D4s_v5 (4 vCPU, 16 GiB)
- **Count:** 3 (fixed)
- **Purpose:** Control plane add-ons, CoreDNS, kube-system

### Application Pool

- **SKU:** Standard_D8s_v5 (8 vCPU, 32 GiB)
- **Min/Max:** 3 / 20
- **Autoscaler:** Enabled (target CPU 65%, target memory 70%)
- **Purpose:** Application workloads

### GPU Pool (on-demand)

- **SKU:** Standard_NC6s_v3
- **Min/Max:** 0 / 4
- **Purpose:** ML inference workloads, embedding generation

## Ingress

- **Ingress controller:** NGINX Ingress Controller v1.10
- **TLS termination:** At ingress level via cert-manager + Let's Encrypt
- **WAF:** Azure Front Door with OWASP 3.2 ruleset

## Autoscaling

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 65
\`\`\`

## Disaster Recovery

- **RPO:** 1 hour
- **RTO:** 4 hours
- **Strategy:** Active-passive with standby cluster in West US 2
- **Backup:** Velero snapshots every 6 hours to Azure Blob Storage`,
    category: "infrastructure",
    tags: ["kubernetes", "aks", "infrastructure", "autoscaling", "disaster-recovery"],
    related_services: ["svc-001", "svc-002", "svc-003", "svc-004", "svc-005"],
    status: "published",
    created_by: "platform@company.com",
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-03-28T16:00:00Z",
    published_at: "2026-02-02T09:00:00Z",
  },
  {
    id: "ts-003",
    title: "PostgreSQL Schema Design Guidelines",
    summary:
      "Database specification covering schema naming conventions, indexing strategies, partitioning policies, migration procedures, and performance baselines.",
    content: `# PostgreSQL Schema Design Guidelines

## Naming Conventions

- **Tables:** \`snake_case\`, plural — \`incidents\`, \`kb_articles\`
- **Columns:** \`snake_case\` — \`created_at\`, \`updated_at\`
- **Primary keys:** Always \`id\` (UUID v4)
- **Foreign keys:** \`{referenced_table_singular}_id\` — \`team_id\`, \`service_id\`
- **Indexes:** \`ix_{table}_{columns}\` — \`ix_incidents_status_severity\`
- **Constraints:** \`ck_{table}_{description}\` — \`ck_incidents_severity_valid\`

## Standard Columns

Every table must include:

\`\`\`sql
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- domain columns here
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);
\`\`\`

## Indexing Strategy

### Required Indexes

- Primary key (automatic)
- Foreign keys (always index FK columns)
- Columns used in WHERE clauses of frequent queries
- Columns used in ORDER BY for paginated queries

### Partial Indexes

Use partial indexes for soft-deleted records:

\`\`\`sql
CREATE INDEX ix_incidents_active ON incidents (status, severity)
  WHERE is_deleted = false;
\`\`\`

## Partitioning

Tables exceeding 10M rows should be partitioned:

- **Time-series data:** Range partition by \`created_at\` (monthly)
- **Multi-tenant data:** List partition by \`tenant_id\`

## Migrations

- Use numbered migration files: \`001_create_incidents.sql\`
- Every migration must have a corresponding rollback
- Test migrations against a production-size dataset before deploying
- Never modify a migration that has already been applied`,
    category: "database",
    tags: ["postgresql", "schema", "database", "migrations", "indexing"],
    related_services: ["svc-005"],
    status: "published",
    created_by: "dba@company.com",
    created_at: "2026-01-20T11:00:00Z",
    updated_at: "2026-03-10T09:30:00Z",
    published_at: "2026-01-21T08:00:00Z",
  },
  {
    id: "ts-004",
    title: "Authentication & Authorization Architecture",
    summary:
      "Security specification for the platform's authentication and authorization system, covering OAuth2/OIDC flows, RBAC model, token lifecycle, and session management.",
    content: `# Authentication & Authorization Architecture

## Overview

The platform uses OAuth2 with OIDC for authentication and role-based access control (RBAC) for authorization.

## Authentication Flow

\`\`\`
User -> Frontend -> Auth Service -> Azure AD (IdP)
                                       |
                                  ID Token + Access Token
                                       |
                              Frontend stores tokens
                                       |
                              API calls with Bearer token
                                       |
                              Backend validates JWT
\`\`\`

## Token Lifecycle

| Token | TTL | Storage | Refresh |
|-------|-----|---------|---------|
| Access token | 15 min | Memory | Via refresh token |
| Refresh token | 24 hours | HttpOnly cookie | Re-authenticate |
| ID token | 1 hour | Memory | Not refreshed |

## RBAC Model

### Roles

| Role | Description |
|------|------------|
| \`admin\` | Full access to all resources including rules management |
| \`agent\` | Can create/edit incidents and KB articles, use RAG |
| \`viewer\` | Read-only access to incidents and KB articles |

### Permission Matrix

| Resource | admin | agent | viewer |
|----------|-------|-------|--------|
| Incidents (CRUD) | Full | Full | Read |
| KB Articles (CRUD) | Full | Full | Read |
| Tech Specs (CRUD) | Full | Full | Read |
| Rules (CRUD) | Full | None | None |
| RAG Query | Full | Full | Full |
| Settings | Full | Read | None |

## Session Management

- Sessions are stateless (JWT-based)
- No server-side session store required
- Token revocation via deny-list in Redis (TTL matches token expiry)

## Security Controls

- All tokens are signed with RS256
- CORS restricted to known frontend origins
- CSRF protection via SameSite cookie attribute
- Rate limiting on authentication endpoints (10 req/min per IP)`,
    category: "security",
    tags: ["authentication", "authorization", "oauth2", "rbac", "security", "jwt"],
    related_services: ["svc-001"],
    status: "published",
    created_by: "secops@company.com",
    created_at: "2026-02-10T14:00:00Z",
    updated_at: "2026-04-01T11:00:00Z",
    published_at: "2026-02-11T09:00:00Z",
  },
  {
    id: "ts-005",
    title: "Service Mesh Networking Specification",
    summary:
      "Networking specification for inter-service communication including mTLS, service discovery, traffic management, and observability.",
    content: `# Service Mesh Networking Specification

## Overview

All inter-service communication within the Kubernetes cluster is managed through a service mesh layer.

## Service Discovery

Services register automatically via Kubernetes DNS:

\`\`\`
{service-name}.{namespace}.svc.cluster.local
\`\`\`

## mTLS

All service-to-service communication is encrypted with mutual TLS:

- **Certificate authority:** Internal CA managed by cert-manager
- **Certificate rotation:** Every 24 hours (automatic)
- **Minimum TLS version:** 1.3

## Traffic Management

### Retry Policy

\`\`\`yaml
retries:
  attempts: 3
  perTryTimeout: 2s
  retryOn: "5xx,reset,connect-failure"
\`\`\`

### Circuit Breaker

\`\`\`yaml
outlierDetection:
  consecutive5xxErrors: 5
  interval: 10s
  baseEjectionTime: 30s
  maxEjectionPercent: 50
\`\`\`

### Timeout Policy

| Service | Timeout |
|---------|---------|
| Auth Service | 5s |
| Payment Gateway | 30s |
| Email Service | 10s |
| API Gateway | 60s |
| Database | 15s |

## Observability

- **Distributed tracing:** OpenTelemetry with Jaeger backend
- **Metrics:** Prometheus scraping every 15s
- **Logging:** Structured JSON to stdout, collected by Fluent Bit`,
    category: "networking",
    tags: ["service-mesh", "mtls", "networking", "observability", "traffic-management"],
    related_services: ["svc-001", "svc-002", "svc-003", "svc-004"],
    status: "published",
    created_by: "platform@company.com",
    created_at: "2026-02-20T09:00:00Z",
    updated_at: "2026-03-22T13:00:00Z",
    published_at: "2026-02-21T10:00:00Z",
  },
  {
    id: "ts-006",
    title: "Event Bus Integration Patterns",
    summary:
      "Integration specification for Apache Kafka event bus, covering topic naming, schema registry, consumer group patterns, and dead letter queues.",
    content: `# Event Bus Integration Patterns

## Overview

Apache Kafka serves as the asynchronous event bus for inter-service communication. This document specifies the patterns and conventions for producing and consuming events.

## Topic Naming

\`\`\`
{domain}.{entity}.{event-type}
\`\`\`

Examples:
- \`payments.transaction.completed\`
- \`incidents.incident.created\`
- \`auth.user.login-failed\`

## Schema Registry

All events must have a registered Avro schema in the Confluent Schema Registry.

- **Compatibility mode:** BACKWARD
- **Schema evolution rules:**
  - New fields must have default values
  - Fields can never be removed
  - Field types can never change

## Consumer Group Naming

\`\`\`
{service-name}.{purpose}
\`\`\`

Examples:
- \`email-service.send-notifications\`
- \`analytics-service.event-tracking\`

## Dead Letter Queue

Failed messages are routed to a DLQ after 3 retry attempts:

\`\`\`
{original-topic}.dlq
\`\`\`

DLQ messages include:
- Original message payload
- Error details
- Retry count
- Timestamp of last attempt

## Retention

| Topic Type | Retention |
|-----------|-----------|
| Domain events | 7 days |
| Audit logs | 90 days |
| DLQ | 30 days |`,
    category: "integration",
    tags: ["kafka", "event-bus", "integration", "schema-registry", "async"],
    related_services: ["svc-001", "svc-002", "svc-003"],
    status: "published",
    created_by: "architect@company.com",
    created_at: "2026-03-01T10:00:00Z",
    updated_at: "2026-03-25T15:00:00Z",
    published_at: "2026-03-02T09:00:00Z",
  },
  {
    id: "ts-007",
    title: "Microservices Platform Architecture v2",
    summary:
      "Architecture specification for the next-generation platform design, covering service boundaries, data ownership, deployment topology, and migration path.",
    content: `# Microservices Platform Architecture v2

## Draft Notice

> This specification is a work in progress. It outlines the proposed architecture for the platform v2 migration.

## Service Boundaries

### Current State

Monolithic services with shared database access patterns.

### Target State

Each service owns its data and exposes it only through well-defined APIs and events.

| Service | Database | Event Topics |
|---------|----------|-------------|
| Auth Service | auth-db (PostgreSQL) | auth.* |
| Payment Gateway | payments-db (PostgreSQL) | payments.* |
| Incident Service | incidents-db (Cosmos DB) | incidents.* |
| KB Service | kb-db (Cosmos DB) | kb.* |
| Search Service | Azure AI Search | — |

## Migration Path

1. **Phase 1:** Extract auth service (Q2 2026)
2. **Phase 2:** Extract payment service (Q3 2026)
3. **Phase 3:** Migrate incident/KB to Cosmos DB (Q4 2026)
4. **Phase 4:** Decommission shared database (Q1 2027)

## Open Questions

- Event sourcing vs. change data capture for cross-service sync?
- Saga vs. orchestration for multi-service transactions?`,
    category: "architecture",
    tags: ["architecture", "microservices", "migration", "platform-v2"],
    related_services: ["svc-001", "svc-002", "svc-003", "svc-004", "svc-005"],
    status: "draft",
    created_by: "architect@company.com",
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-04-05T14:00:00Z",
    published_at: null,
  },
  {
    id: "ts-008",
    title: "CI/CD Pipeline Specification",
    summary:
      "Infrastructure specification for the continuous integration and deployment pipeline, covering build stages, testing gates, deployment strategies, and rollback procedures.",
    content: `# CI/CD Pipeline Specification

## Draft Notice

> This document is being updated to reflect the migration from Jenkins to GitHub Actions.

## Pipeline Stages

\`\`\`
Push -> Lint -> Unit Tests -> Build -> Integration Tests -> Security Scan -> Deploy Staging -> E2E Tests -> Deploy Production
\`\`\`

## Build Configuration

- **Container registry:** Azure Container Registry
- **Image tagging:** \`{service}:{git-sha-short}\`
- **Build cache:** Docker layer caching enabled

## Deployment Strategy

### Staging

- Automatic deployment on merge to \`develop\`
- Blue-green deployment
- Automated smoke tests post-deploy

### Production

- Manual approval required
- Canary deployment (10% -> 50% -> 100%)
- Automated rollback if error rate exceeds 1%

## Rollback

\`\`\`bash
# Automatic rollback via Argo Rollouts
kubectl argo rollouts undo {service-name}
\`\`\`

Manual rollback:
1. Revert the merge commit
2. Pipeline triggers automatically
3. Verify in staging before promoting`,
    category: "infrastructure",
    tags: ["cicd", "pipeline", "github-actions", "deployment", "canary"],
    related_services: [],
    status: "draft",
    created_by: "devops@company.com",
    created_at: "2026-04-01T09:00:00Z",
    updated_at: "2026-04-08T11:00:00Z",
    published_at: null,
  },
];
