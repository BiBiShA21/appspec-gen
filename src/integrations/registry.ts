import { z } from "zod";

/**
 * Integration Registry
 * Defines all available integrations with their triggers, actions, and validation rules
 */

export const IntegrationDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  description: z.string(),
  triggers: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
    })
  ),
  actions: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
    })
  ),
  requiredFields: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
    })
  ),
  category: z.enum(["messaging", "email", "payment", "database", "project", "other"]),
});

export type IntegrationDefinition = z.infer<typeof IntegrationDefinitionSchema>;

// ============= INTEGRATION DEFINITIONS =============

export const INTEGRATIONS: Record<string, IntegrationDefinition> = {
  slack: {
    id: "slack",
    name: "Slack",
    icon: "slack",
    description: "Send notifications to Slack channels or DMs",
    category: "messaging",
    triggers: [
      { id: "deal_closed", description: "When a deal is closed" },
      { id: "task_overdue", description: "When a task becomes overdue" },
      { id: "leave_approved", description: "When leave is approved" },
      { id: "custom_webhook", description: "Custom webhook trigger" },
    ],
    actions: [
      { id: "send_message", description: "Send a message to a channel" },
      { id: "post_thread", description: "Post a message in a thread" },
      { id: "update_status", description: "Update user status" },
      { id: "create_reminder", description: "Create a reminder" },
    ],
    requiredFields: [
      { name: "webhook_url", type: "string" },
      { name: "channel", type: "string" },
    ],
  },

  gmail: {
    id: "gmail",
    name: "Gmail",
    icon: "gmail",
    description: "Send email alerts and notifications",
    category: "email",
    triggers: [
      { id: "new_message", description: "New email received" },
      { id: "label_added", description: "Email labeled" },
    ],
    actions: [
      { id: "send_email", description: "Send an email" },
      { id: "create_draft", description: "Create an email draft" },
      { id: "add_label", description: "Add label to email" },
      { id: "archive_email", description: "Archive email" },
    ],
    requiredFields: [
      { name: "api_key", type: "string" },
      { name: "sender_email", type: "string" },
    ],
  },

  stripe: {
    id: "stripe",
    name: "Stripe",
    icon: "stripe",
    description: "Handle payment events and transactions",
    category: "payment",
    triggers: [
      { id: "payment_intent_succeeded", description: "Payment succeeded" },
      { id: "charge_failed", description: "Charge failed" },
      { id: "customer_created", description: "New customer created" },
      { id: "invoice_created", description: "Invoice created" },
    ],
    actions: [
      { id: "create_charge", description: "Create a charge" },
      { id: "refund_payment", description: "Refund a payment" },
      { id: "update_customer", description: "Update customer info" },
      { id: "create_invoice", description: "Create an invoice" },
    ],
    requiredFields: [
      { name: "api_key", type: "string" },
      { name: "webhook_secret", type: "string" },
    ],
  },

  notion: {
    id: "notion",
    name: "Notion",
    icon: "notion",
    description: "Sync data with Notion databases",
    category: "database",
    triggers: [
      { id: "page_created", description: "New page created" },
      { id: "page_updated", description: "Page updated" },
      { id: "database_modified", description: "Database modified" },
    ],
    actions: [
      { id: "create_page", description: "Create a new page" },
      { id: "update_page", description: "Update a page" },
      { id: "append_block", description: "Append content to page" },
      { id: "query_database", description: "Query database" },
    ],
    requiredFields: [
      { name: "api_token", type: "string" },
      { name: "database_id", type: "string" },
    ],
  },

  airtable: {
    id: "airtable",
    name: "Airtable",
    icon: "airtable",
    description: "Create and update Airtable records",
    category: "database",
    triggers: [
      { id: "record_created", description: "Record created in base" },
      { id: "record_modified", description: "Record modified" },
      { id: "field_changed", description: "Specific field changed" },
    ],
    actions: [
      { id: "create_record", description: "Create a new record" },
      { id: "update_record", description: "Update a record" },
      { id: "delete_record", description: "Delete a record" },
      { id: "find_records", description: "Search records" },
    ],
    requiredFields: [
      { name: "api_key", type: "string" },
      { name: "base_id", type: "string" },
      { name: "table_id", type: "string" },
    ],
  },

  // Stubbed integrations (registry interface defined, not fully implemented)
  jira: {
    id: "jira",
    name: "Jira",
    icon: "jira",
    description: "[STUBBED] Create and manage issues",
    category: "project",
    triggers: [
      { id: "issue_created", description: "Issue created" },
      { id: "issue_updated", description: "Issue updated" },
    ],
    actions: [
      { id: "create_issue", description: "Create an issue" },
      { id: "update_issue", description: "Update an issue" },
    ],
    requiredFields: [
      { name: "api_token", type: "string" },
      { name: "domain", type: "string" },
    ],
  },

  github: {
    id: "github",
    name: "GitHub",
    icon: "github",
    description: "[STUBBED] Manage repositories and pull requests",
    category: "project",
    triggers: [
      { id: "push", description: "Code pushed" },
      { id: "pull_request", description: "PR opened" },
      { id: "issue", description: "Issue created" },
    ],
    actions: [
      { id: "create_pr", description: "Create a pull request" },
      { id: "create_issue", description: "Create an issue" },
      { id: "add_comment", description: "Add a comment" },
    ],
    requiredFields: [
      { name: "api_token", type: "string" },
      { name: "owner", type: "string" },
      { name: "repo", type: "string" },
    ],
  },

  zapier: {
    id: "zapier",
    name: "Zapier",
    icon: "zapier",
    description: "[STUBBED] Connect any app to any app",
    category: "other",
    triggers: [
      { id: "webhook_trigger", description: "Webhook triggered" },
      { id: "polling_trigger", description: "Polling trigger" },
    ],
    actions: [
      { id: "send_webhook", description: "Send webhook" },
      { id: "call_action", description: "Call action in any app" },
    ],
    requiredFields: [
      { name: "webhook_url", type: "string" },
      { name: "api_key", type: "string" },
    ],
  },
};

// ============= REGISTRY UTILITIES =============

export function getIntegration(id: string): IntegrationDefinition | null {
  return INTEGRATIONS[id] || null;
}

export function getAllIntegrations(): IntegrationDefinition[] {
  return Object.values(INTEGRATIONS);
}

export function getIntegrationsByCategory(
  category: IntegrationDefinition["category"]
): IntegrationDefinition[] {
  return Object.values(INTEGRATIONS).filter((i) => i.category === category);
}

export function validateIntegrationConfig(
  integrationId: string,
  config: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const integration = getIntegration(integrationId);

  if (!integration) {
    return { valid: false, errors: [`Integration "${integrationId}" not found`] };
  }

  const errors: string[] = [];

  // Check required fields
  for (const field of integration.requiredFields) {
    if (!(field.name in config)) {
      errors.push(`Missing required field: ${field.name} (${field.type})`);
    }
  }

  // Validate triggers (if provided)
  if ("triggers" in config && Array.isArray(config.triggers)) {
    const validTriggers = new Set(integration.triggers.map((t) => t.id));
    for (const trigger of config.triggers) {
      if (!validTriggers.has(trigger)) {
        errors.push(`Invalid trigger: "${trigger}". Valid triggers: ${[...validTriggers].join(", ")}`);
      }
    }
  }

  // Validate actions (if provided)
  if ("actions" in config && Array.isArray(config.actions)) {
    const validActions = new Set(integration.actions.map((a) => a.id));
    for (const action of config.actions) {
      if (!validActions.has(action)) {
        errors.push(`Invalid action: "${action}". Valid actions: ${[...validActions].join(", ")}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
