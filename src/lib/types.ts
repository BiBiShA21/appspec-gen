/**
 * Shared types across the entire AppSpec generation pipeline
 */

export interface AppIntent {
  purpose: string;
  userInput: string;
  extractedFeatures: string[];
  targetAudience?: string;
  constraints?: string[];
  integrationHints?: string[];
}

export interface DataField {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  required: boolean;
  description?: string;
  validations?: Record<string, unknown>;
}

export interface DataSchema {
  entities: Record<string, DataField[]>;
  relationships?: Record<string, { from: string; to: string; type: string }>;
  validationRules?: string[];
}

export interface AppSpecPage {
  id: string;
  name: string;
  type: "form" | "list" | "detail" | "dashboard" | "custom";
  fields?: string[]; // References to DataSchema field names
  layout?: {
    columns?: number;
    sections?: { title?: string; fields: string[] }[];
  };
}

export interface AppSpecComponent {
  id: string;
  type: string;
  label?: string;
  dataField?: string;
  props?: Record<string, unknown>;
}

export interface IntegrationConfig {
  id: string;
  type: string;
  triggers?: string[];
  actions?: string[];
  validation?: Record<string, unknown>;
}

export interface AppSpec {
  name: string;
  description: string;
  version: "0.1";
  pages: AppSpecPage[];
  components: AppSpecComponent[];
  integrations: IntegrationConfig[];
  dataSchema: DataSchema;
  metadata?: {
    theme?: string;
    features?: string[];
  };
}

export interface ValidationError {
  stage: "intent" | "schema" | "appspec";
  field?: string;
  message: string;
  severity: "error" | "warning";
  repairable: boolean;
}

export interface RepairLog {
  stage: string;
  strategy: string;
  field?: string;
  original?: unknown;
  repaired?: unknown;
  success: boolean;
}

export interface GenerationJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  userInput: string;
  stages: {
    intent?: { completed: boolean; output: AppIntent; errors: ValidationError[] };
    schema?: { completed: boolean; output: DataSchema; errors: ValidationError[] };
    appspec?: { completed: boolean; output: AppSpec; errors: ValidationError[] };
  };
  repairLog: RepairLog[];
  finalSpec?: AppSpec;
  costTracking: {
    stage1?: { tokens: number; cost: number };
    stage2?: { tokens: number; cost: number };
    stage3?: { tokens: number; cost: number };
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface ModelConfig {
  name: string;
  provider: "gemini" | "openrouter";
  model: string;
  maxTokens: number;
  temperature: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  icon?: string;
  description: string;
  triggers: { id: string; description: string }[];
  actions: { id: string; description: string }[];
  requiredFields: { name: string; type: string }[];
  category: "messaging" | "email" | "payment" | "database" | "project" | "other";
}

export interface SSEEvent {
  type: "stage_started" | "stage_completed" | "stage_failed" | "progress" | "complete" | "error";
  stage?: string;
  data?: unknown;
  error?: string;
  progress?: { current: number; total: number };
}
