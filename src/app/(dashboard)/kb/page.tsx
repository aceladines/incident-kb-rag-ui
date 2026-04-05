"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArticleCard } from "@/components/kb/ArticleCard";
import {
  ArticleFilters,
  type ArticleFiltersState,
} from "@/components/kb/ArticleFilters";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import type { KbArticle } from "@/lib/types";

const MOCK_ARTICLES: KbArticle[] = [
  {
    id: "kb-001",
    title: "Database Failover Procedure",
    content:
      "## Overview\n\nThis runbook describes the step-by-step procedure for performing a database failover...\n\n### Prerequisites\n- Access to the database admin console\n- Approval from the on-call DBA\n\n### Steps\n1. Verify replica health\n2. Initiate failover command\n3. Validate data consistency\n4. Update DNS records",
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
      "## Symptoms\n\nUsers report being unable to log in. The auth service returns 401 or 503 errors.\n\n## Diagnosis\n- Check auth service logs for rate limiting\n- Verify OIDC provider status\n- Check certificate expiration dates\n\n## Resolution\n1. If rate limited, increase threshold temporarily\n2. If OIDC down, switch to backup provider\n3. If cert expired, rotate certificates",
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
      "## Question\n\nHow do I reset multi-factor authentication for a user who has lost their device?\n\n## Answer\n\n1. Navigate to the Admin Console > Users\n2. Search for the user\n3. Click **Security** > **Reset MFA**\n4. The user will receive a re-enrollment email\n\n> **Note:** MFA resets require approval from the user's manager.",
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
      "## Overview\n\nThis document covers the configuration of the payment gateway including API keys, webhooks, and retry policies.\n\n## Configuration Parameters\n\n| Parameter | Default | Description |\n|-----------|---------|-------------|\n| `retry_count` | 3 | Number of retries for failed transactions |\n| `timeout_ms` | 5000 | Request timeout in milliseconds |\n| `webhook_url` | - | URL for payment event callbacks |",
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
      "## Purpose\n\nStandard operating procedure for responding to production incidents.\n\n## Severity Levels\n- **Critical:** Full outage, all hands on deck\n- **High:** Major feature degraded\n- **Medium:** Minor feature impacted\n- **Low:** Cosmetic or non-urgent\n\n## Response Protocol\n1. Acknowledge the incident\n2. Assemble the response team\n3. Begin root cause analysis\n4. Communicate status updates every 30 minutes\n5. Implement fix and validate\n6. Write postmortem within 48 hours",
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
      "## Architecture\n\nOur platform follows a microservices architecture with the following key services:\n\n- **Auth Service** — Handles authentication and authorization\n- **Payment Gateway** — Processes all payment transactions\n- **Email Service** — Manages transactional and marketing emails\n- **API Gateway** — Central entry point for all external requests\n- **Database Cluster** — Distributed PostgreSQL cluster\n\n## Communication Patterns\nServices communicate via REST APIs and an event bus (Kafka).",
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

export default function KbListPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<ArticleFiltersState>({
    search: "",
    category: "all",
    status: "all",
  });

  const filteredArticles = useMemo(() => {
    let articles = MOCK_ARTICLES;

    // Tab filter
    if (activeTab === "published") {
      articles = articles.filter((a) => a.status === "published");
    } else if (activeTab === "drafts") {
      articles = articles.filter((a) => a.status === "draft");
    }

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category !== "all") {
      articles = articles.filter((a) => a.category === filters.category);
    }

    // Status filter (from dropdown, overrides tab if set)
    if (filters.status !== "all") {
      articles = articles.filter((a) => a.status === filters.status);
    }

    return articles;
  }, [activeTab, filters]);

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse runbooks, SOPs, troubleshooting guides, and documentation.
          </p>
        </div>
        <Button render={<Link href="/kb/new" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="mt-4">
          <ArticleFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Content for all tabs - rendered outside TabsContent to avoid unmount */}
        <TabsContent value={activeTab}>
          {filteredArticles.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredArticles.map((article) => (
                <motion.div key={article.id} variants={staggerItem}>
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                {activeTab === "drafts" ? (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No articles found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {filters.search || filters.category !== "all" || filters.status !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first knowledge base article."}
              </p>
              {!filters.search && filters.category === "all" && filters.status === "all" && (
                <Button className="mt-4" render={<Link href="/kb/new" />}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Article
                </Button>
              )}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
