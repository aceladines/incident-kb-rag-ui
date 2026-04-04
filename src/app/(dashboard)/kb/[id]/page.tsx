"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  User,
  Server,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CategoryBadge } from "@/components/kb/CategoryBadge";
import { StatusBadge } from "@/components/kb/StatusBadge";
import { formatDate } from "@/lib/utils";
import { slideUp } from "@/lib/animations";
import type { KbArticle } from "@/lib/types";
import { toast } from "sonner";

const MOCK_SERVICES_MAP: Record<string, string> = {
  "svc-001": "Authentication Service",
  "svc-002": "Payment Gateway",
  "svc-003": "Email Service",
  "svc-004": "API Gateway",
  "svc-005": "Database Cluster",
};

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
      "## Symptoms\n\nUsers report being unable to log in. The auth service returns **401** or **503** errors.\n\n## Diagnosis\n\n### Step 1: Check Auth Service Logs\n\n```bash\nkubectl logs -f deployment/auth-service -n production\n```\n\nLook for rate limiting messages or OIDC provider timeouts.\n\n### Step 2: Verify OIDC Provider Status\n\nCheck the Azure AD status page and verify the tenant configuration:\n\n| Check | Command |\n|-------|---------|\n| Tenant status | `az ad app show --id $APP_ID` |\n| Token endpoint | `curl https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration` |\n\n### Step 3: Check Certificate Expiration\n\n```bash\nopenssl x509 -in /etc/ssl/auth-cert.pem -noout -enddate\n```\n\n## Resolution\n\n1. **If rate limited** — Increase threshold temporarily via the auth config\n2. **If OIDC down** — Switch to backup provider using the feature flag\n3. **If cert expired** — Rotate certificates using the cert-manager pipeline",
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
      "## Overview\n\nThis document covers the configuration of the payment gateway including API keys, webhooks, and retry policies.\n\n## Configuration Parameters\n\n| Parameter | Default | Description |\n|-----------|---------|-------------|\n| `retry_count` | 3 | Number of retries for failed transactions |\n| `timeout_ms` | 5000 | Request timeout in milliseconds |\n| `webhook_url` | - | URL for payment event callbacks |\n| `idempotency_ttl` | 3600 | Idempotency key TTL in seconds |\n\n## API Keys\n\nAPI keys are managed via the **Settings** > **API Keys** page. Each environment has its own key pair.\n\n## Webhooks\n\nConfigure webhook URLs in the payment dashboard. Supported events:\n- `payment.completed`\n- `payment.failed`\n- `refund.initiated`\n- `refund.completed`",
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
      "## Purpose\n\nStandard operating procedure for responding to production incidents.\n\n## Severity Levels\n\n- **Critical:** Full outage affecting all users — all hands on deck\n- **High:** Major feature degraded, significant user impact\n- **Medium:** Minor feature impacted, workaround available\n- **Low:** Cosmetic or non-urgent issue\n\n## Response Protocol\n\n1. **Acknowledge** the incident within 5 minutes\n2. **Assemble** the response team based on severity\n3. **Begin root cause analysis** using logs and metrics\n4. **Communicate** status updates every 30 minutes on the #incidents channel\n5. **Implement** fix and validate in staging first\n6. **Write postmortem** within 48 hours of resolution\n\n## Escalation Matrix\n\n| Severity | Escalation After | Escalate To |\n|----------|-----------------|-------------|\n| Critical | Immediate | VP Engineering |\n| High | 30 min | Engineering Manager |\n| Medium | 2 hours | Team Lead |\n| Low | Next business day | Ticket queue |",
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

export default function KbArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const articleId = params.id as string;
  const article = MOCK_ARTICLES.find((a) => a.id === articleId);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Article not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The article you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-4" variant="outline" render={<Link href="/kb" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Knowledge Base
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    // Mock delete — in production this would call the API
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Article deleted successfully");
    router.push("/kb");
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back link */}
      <Button variant="ghost" size="sm" render={<Link href="/kb" />}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Knowledge Base
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={article.category} />
            <StatusBadge status={article.status} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {article.title}
          </h1>
          <p className="text-sm text-muted-foreground">{article.summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/kb/${article.id}/edit`} />}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &ldquo;{article.title}&rdquo;?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="destructive"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content — rendered markdown */}
        <Card>
          <CardContent>
            <MarkdownRenderer content={article.content} />
          </CardContent>
        </Card>

        {/* Sidebar metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </p>
                <CategoryBadge category={article.category} />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <StatusBadge status={article.status} />
              </div>

              <Separator />

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tags
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Services */}
              {article.related_services.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Related Services
                      </p>
                    </div>
                    <div className="space-y-1">
                      {article.related_services.map((serviceId) => (
                        <p
                          key={serviceId}
                          className="text-sm text-foreground"
                        >
                          {MOCK_SERVICES_MAP[serviceId] ?? serviceId}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Author */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Author
                  </p>
                </div>
                <p className="text-sm text-foreground">{article.created_by}</p>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Dates
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">
                      {formatDate(article.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="text-foreground">
                      {formatDate(article.updated_at)}
                    </span>
                  </div>
                  {article.published_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Published</span>
                      <span className="text-foreground">
                        {formatDate(article.published_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
