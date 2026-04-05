"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleForm } from "@/components/kb/ArticleForm";
import { slideUp } from "@/lib/animations";
import { toast } from "sonner";
import type { KbArticle, KbArticleFormData } from "@/lib/types";

const MOCK_ARTICLES: KbArticle[] = [
  {
    id: "kb-001",
    title: "Database Failover Procedure",
    content:
      "## Overview\n\nThis runbook describes the step-by-step procedure for performing a database failover when the primary node is unresponsive or operating in a degraded state.\n\n### Prerequisites\n\n- Access to the database admin console\n- Approval from the on-call DBA\n- Verified read-only access to the replica\n\n### Steps\n\n1. **Verify replica health** — Run `pg_stat_replication` on the replica to confirm it is in sync.\n2. **Initiate failover command** — Execute `pg_ctl promote` on the standby server.\n3. **Validate data consistency** — Run the data integrity check script:\n   ```bash\n   ./scripts/validate-data.sh --target=replica\n   ```\n4. **Update DNS records** — Point the primary DNS entry to the new master.\n5. **Notify stakeholders** — Send notification via the #incidents Slack channel.\n\n### Rollback\n\nIf the failover fails, revert DNS changes and contact the database team immediately.\n\n> **Warning:** Never run failover during peak traffic hours unless it is a P0 incident.",
    summary:
      "Step-by-step guide for database failover when the primary node is unresponsive or degraded.",
    category: "runbook",
    tags: ["database", "failover", "production"],
    related_services: ["svc-005"],
    status: "published",
    created_by: "admin@company.com",
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-03-20T14:30:00Z",
    published_at: "2026-02-16T09:00:00Z",
  },
  {
    id: "kb-002",
    title: "Troubleshooting Authentication Failures",
    content:
      "## Symptoms\n\nUsers report being unable to log in. The auth service returns **401** or **503** errors.\n\n## Diagnosis\n\n### Step 1: Check Auth Service Logs\n\n```bash\nkubectl logs -f deployment/auth-service -n production\n```\n\nLook for rate limiting messages or OIDC provider timeouts.\n\n### Step 2: Verify OIDC Provider Status\n\nCheck the Azure AD status page and verify the tenant configuration.\n\n### Step 3: Check Certificate Expiration\n\n```bash\nopenssl x509 -in /etc/ssl/auth-cert.pem -noout -enddate\n```\n\n## Resolution\n\n1. **If rate limited** — Increase threshold temporarily via the auth config\n2. **If OIDC down** — Switch to backup provider using the feature flag\n3. **If cert expired** — Rotate certificates using the cert-manager pipeline",
    summary:
      "Common authentication failure patterns and their resolutions for the auth service.",
    category: "troubleshooting",
    tags: ["authentication", "auth", "login", "401"],
    related_services: ["svc-001"],
    status: "published",
    created_by: "secops@company.com",
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-03-18T11:15:00Z",
    published_at: "2026-01-11T10:00:00Z",
  },
  {
    id: "kb-003",
    title: "How do I reset a user's MFA?",
    content:
      "## Question\n\nHow do I reset multi-factor authentication for a user who has lost their device?\n\n## Answer\n\n1. Navigate to the **Admin Console** > **Users**\n2. Search for the user by email\n3. Click **Security** > **Reset MFA**\n4. The user will receive a re-enrollment email within 5 minutes\n\n> **Note:** MFA resets require approval from the user's manager. The request will be pending until approved.",
    summary:
      "Instructions for resetting a user's multi-factor authentication when they lose access to their device.",
    category: "faq",
    tags: ["mfa", "authentication", "user-management"],
    related_services: ["svc-001"],
    status: "published",
    created_by: "helpdesk@company.com",
    created_at: "2026-03-01T14:00:00Z",
    updated_at: "2026-03-25T09:45:00Z",
    published_at: "2026-03-02T08:00:00Z",
  },
  {
    id: "kb-004",
    title: "Payment Gateway Configuration Guide",
    content:
      "## Overview\n\nThis document covers the configuration of the payment gateway including API keys, webhooks, and retry policies.\n\n## Configuration Parameters\n\n| Parameter | Default | Description |\n|-----------|---------|-------------|\n| `retry_count` | 3 | Number of retries for failed transactions |\n| `timeout_ms` | 5000 | Request timeout in milliseconds |\n| `webhook_url` | - | URL for payment event callbacks |\n| `idempotency_ttl` | 3600 | Idempotency key TTL in seconds |",
    summary:
      "Configuration reference for the payment gateway service including API keys, webhooks, and retry policies.",
    category: "configuration",
    tags: ["payments", "configuration", "api-keys", "webhooks"],
    related_services: ["svc-002"],
    status: "published",
    created_by: "platform@company.com",
    created_at: "2026-02-20T16:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
    published_at: "2026-02-21T09:00:00Z",
  },
  {
    id: "kb-005",
    title: "Incident Response SOP",
    content:
      "## Purpose\n\nStandard operating procedure for responding to production incidents.\n\n## Severity Levels\n\n- **Critical:** Full outage affecting all users — all hands on deck\n- **High:** Major feature degraded, significant user impact\n- **Medium:** Minor feature impacted, workaround available\n- **Low:** Cosmetic or non-urgent issue\n\n## Response Protocol\n\n1. **Acknowledge** the incident within 5 minutes\n2. **Assemble** the response team based on severity\n3. **Begin root cause analysis** using logs and metrics\n4. **Communicate** status updates every 30 minutes on the #incidents channel\n5. **Implement** fix and validate in staging first\n6. **Write postmortem** within 48 hours of resolution",
    summary:
      "Standard operating procedure for incident response including severity classification and response protocols.",
    category: "sop",
    tags: ["incident-response", "sop", "production", "on-call"],
    related_services: [],
    status: "published",
    created_by: "sre@company.com",
    created_at: "2026-01-05T12:00:00Z",
    updated_at: "2026-03-15T08:30:00Z",
    published_at: "2026-01-06T10:00:00Z",
  },
  {
    id: "kb-006",
    title: "Microservices Architecture Overview",
    content:
      "## Architecture\n\nOur platform follows a microservices architecture with the following key services:\n\n- **Auth Service** — Handles authentication and authorization via OAuth2/OIDC\n- **Payment Gateway** — Processes all payment transactions with PCI compliance\n- **Email Service** — Manages transactional and marketing emails\n- **API Gateway** — Central entry point for all external requests\n- **Database Cluster** — Distributed PostgreSQL cluster with read replicas\n\n## Communication Patterns\n\nServices communicate via:\n- **Synchronous:** REST APIs with circuit breakers\n- **Asynchronous:** Apache Kafka event bus for event-driven workflows\n\n## Deployment\n\nAll services are containerized and deployed to Kubernetes via ArgoCD.",
    summary:
      "High-level overview of the platform microservices architecture and inter-service communication patterns.",
    category: "architecture",
    tags: ["architecture", "microservices", "platform"],
    related_services: ["svc-001", "svc-002", "svc-003", "svc-004", "svc-005"],
    status: "published",
    created_by: "architect@company.com",
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2026-02-28T15:00:00Z",
    published_at: "2025-12-02T08:00:00Z",
  },
  {
    id: "kb-007",
    title: "Email Service Rate Limiting Draft",
    content:
      "## Draft\n\nThis article is a work in progress covering email service rate limiting configuration.\n\n## Current Limits\n- Transactional: 100/min per tenant\n- Marketing: 1000/hour total\n\n## Proposed Changes\nTBD — needs input from the email team.",
    summary:
      "Draft documentation for email service rate limiting configuration and proposed changes.",
    category: "configuration",
    tags: ["email", "rate-limiting", "configuration"],
    related_services: ["svc-003"],
    status: "draft",
    created_by: "platform@company.com",
    created_at: "2026-03-28T10:00:00Z",
    updated_at: "2026-04-02T16:00:00Z",
    published_at: null,
  },
  {
    id: "kb-008",
    title: "API Gateway Troubleshooting",
    content:
      "## Common Issues\n\n### 502 Bad Gateway\n- Check upstream service health\n- Verify load balancer targets\n- Check for connection pool exhaustion\n\n### High Latency\n- Review request queue depth\n- Check for slow upstream services\n- Verify CDN cache hit ratio",
    summary:
      "Troubleshooting guide for common API Gateway issues including 502 errors and high latency.",
    category: "troubleshooting",
    tags: ["api-gateway", "502", "latency", "troubleshooting"],
    related_services: ["svc-004"],
    status: "draft",
    created_by: "sre@company.com",
    created_at: "2026-04-01T09:00:00Z",
    updated_at: "2026-04-03T11:00:00Z",
    published_at: null,
  },
];

export default function EditKbArticlePage() {
  const params = useParams();
  const router = useRouter();

  const articleId = params.id as string;
  const article = MOCK_ARTICLES.find((a) => a.id === articleId);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Article not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The article you are trying to edit does not exist or has been removed.
        </p>
        <Button className="mt-4" variant="outline" render={<Link href="/kb" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Knowledge Base
        </Button>
      </div>
    );
  }

  const defaultValues: KbArticleFormData = {
    title: article.title,
    content: article.content,
    summary: article.summary,
    category: article.category,
    tags: article.tags,
    related_services: article.related_services,
    status: article.status,
  };

  const handleSubmit = async (data: KbArticleFormData) => {
    // Mock update — in production this would call the API
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Updating article:", articleId, data);
    toast.success("Article updated successfully");
    router.push(`/kb/${articleId}`);
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/kb/${articleId}`} />}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Article
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit Article
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update &ldquo;{article.title}&rdquo;
        </p>
      </div>

      {/* Form */}
      <ArticleForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isEditing
      />
    </motion.div>
  );
}
