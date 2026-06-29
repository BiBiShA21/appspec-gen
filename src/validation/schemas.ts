import { z } from "zod";

/**
 * Zod schemas for validation at each stage of the pipeline
 */

// ============= STAGE 1: INTENT EXTRACTION =============

export const AppIntentSchema = z.object({
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  userInput: z.string().min(5, "User input is required"),
  extractedFeatures: z.array(z.string()).min(1, "At least one feature must be extracted"),
  targetAudience: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  integrationHints: z.array(z.string()).optional(),
});

export type AppIntent = z.infer<typeof AppIntentSchema>;

// ============= STAGE 2: SCHEMA GENERATION =============

const DataFieldSchema = z.object({
  name: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Field name must be a valid identifier"),
  type: z.enum(["string", "number", "boolean", "date", "array", "object"]),
  required: z.boolean(),
  description: z.string().optional(),
  validations: z.record(z.unknown()).optional(),
});

export const DataSchemaSchema = z.object({
entities: z.record(z.array(DataFieldSchema)).refine(
  (obj) => Object.keys(obj).length > 0,
  "At least one entity is required"
),
  relationships: z
    .record(
      z.object({
        from: z.string(),
        to: z.string(),
        type: z.string(),
      })
    )
    .optional(),
  validationRules: z.array(z.string()).optional(),
});

export type DataSchema = z.infer<typeof DataSchemaSchema>;

// ============= STAGE 3: APP SPEC GENERATION =============

const AppSpecPageSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-_]+$/, "Page ID must be alphanumeric"),
  name: z.string().min(1, "Page name is required"),
  type: z.enum(["form", "list", "detail", "dashboard", "custom"]),
  fields: z.array(z.string()).optional(),
  layout: z
    .object({
      columns: z.number().int().min(1).max(12).optional(),
      sections: z
        .array(
          z.object({
            title: z.string().optional(),
            fields: z.array(z.string()).min(1),
          })
        )
        .optional(),
    })
    .optional(),
});

const AppSpecComponentSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-_]+$/, "Component ID must be alphanumeric"),
  type: z.string().min(1, "Component type is required"),
  label: z.string().optional(),
  dataField: z.string().optional(),
  props: z.record(z.unknown()).optional(),
});

const IntegrationConfigSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-_]+$/, "Integration ID must be alphanumeric"),
  type: z.string().min(1, "Integration type is required"),
  triggers: z.array(z.string()).optional(),
  actions: z.array(z.string()).optional(),
  validation: z.record(z.unknown()).optional(),
});

export const AppSpecSchema = z.object({
  name: z.string().min(1, "App name is required").max(100, "App name is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  version: z.literal("0.1"),
  pages: z.array(AppSpecPageSchema).min(1, "At least one page is required"),
  components: z.array(AppSpecComponentSchema).min(1, "At least one component is required"),
  integrations: z.array(IntegrationConfigSchema).optional().default([]),
  dataSchema: DataSchemaSchema,
  metadata: z
    .object({
      theme: z.string().optional(),
      features: z.array(z.string()).optional(),
    })
    .optional(),
});

export type AppSpec = z.infer<typeof AppSpecSchema>;

// ============= VALIDATION ERROR & REPAIR LOG =============

export const ValidationErrorSchema = z.object({
  stage: z.enum(["intent", "schema", "appspec"]),
  field: z.string().optional(),
  message: z.string(),
  severity: z.enum(["error", "warning"]),
  repairable: z.boolean(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export const RepairLogSchema = z.object({
  stage: z.string(),
  strategy: z.string(),
  field: z.string().optional(),
  original: z.unknown().optional(),
  repaired: z.unknown().optional(),
  success: z.boolean(),
});

export type RepairLog = z.infer<typeof RepairLogSchema>;

// ============= JOB TRACKING =============

export const GenerationJobSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  userInput: z.string(),
  stages: z.object({
    intent: z
      .object({
        completed: z.boolean(),
        output: AppIntentSchema,
        errors: z.array(ValidationErrorSchema),
      })
      .optional(),
    schema: z
      .object({
        completed: z.boolean(),
        output: DataSchemaSchema,
        errors: z.array(ValidationErrorSchema),
      })
      .optional(),
    appspec: z
      .object({
        completed: z.boolean(),
        output: AppSpecSchema,
        errors: z.array(ValidationErrorSchema),
      })
      .optional(),
  }),
  repairLog: z.array(RepairLogSchema),
  finalSpec: AppSpecSchema.optional(),
  costTracking: z.object({
    stage1: z.object({ tokens: z.number(), cost: z.number() }).optional(),
    stage2: z.object({ tokens: z.number(), cost: z.number() }).optional(),
    stage3: z.object({ tokens: z.number(), cost: z.number() }).optional(),
  }),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export type GenerationJob = z.infer<typeof GenerationJobSchema>;

// ============= HELPER FUNCTIONS =============

export function validateAtStage(
  stage: "intent" | "schema" | "appspec",
  data: unknown
): { valid: boolean; errors: ValidationError[] } {
  const schema =
    stage === "intent"
      ? AppIntentSchema
      : stage === "schema"
        ? DataSchemaSchema
        : AppSpecSchema;

  const result = schema.safeParse(data);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  const errors = result.error.errors.map((err) => ({
    stage,
    field: err.path.join("."),
    message: err.message,
    severity: "error" as const,
    repairable: true,
  }));

  return { valid: false, errors };
}
