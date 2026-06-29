import { z } from "zod";

/**
 * Model routing configuration
 * Defines primary and fallback AI providers for each stage
 * Allows config-driven model selection without code changes
 */

export const ModelConfigSchema = z.object({
  name: z.string(),
  provider: z.enum(["gemini", "openrouter"]),
  model: z.string(),
  maxTokens: z.number().int().min(100).max(100000),
  temperature: z.number().min(0).max(2),
  costPer1kInputTokens: z.number(),
  costPer1kOutputTokens: z.number(),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

export const ModelRoutingSchema = z.object({
  stage1: z.object({
    primary: ModelConfigSchema,
    fallback: ModelConfigSchema.optional(),
  }),
  stage2: z.object({
    primary: ModelConfigSchema,
    fallback: ModelConfigSchema.optional(),
  }),
  stage3: z.object({
    primary: ModelConfigSchema,
    fallback: ModelConfigSchema.optional(),
  }),
});

export type ModelRouting = z.infer<typeof ModelRoutingSchema>;

// ============= DEFAULT ROUTING CONFIGURATION =============

export const DEFAULT_MODEL_ROUTING: ModelRouting = {
  // Stage 1: Intent Extraction (fast, lightweight)
  stage1: {
    primary: {
      name: "Gemini 1.5 Flash",
      provider: "gemini",
      model: "gemini-1.5-flash-latest",
      maxTokens: 2000,
      temperature: 0.3,
      costPer1kInputTokens: 0.0375, // $0.0375 per 1k input tokens
      costPer1kOutputTokens: 0.15, // $0.15 per 1k output tokens
    },
    fallback: {
      name: "OpenRouter Qwen",
      provider: "openrouter",
      model: "qwen/qwen-2-7b",
      maxTokens: 2000,
      temperature: 0.3,
      costPer1kInputTokens: 0.07,
      costPer1kOutputTokens: 0.07,
    },
  },

  // Stage 2: Schema Generation (moderate complexity)
  stage2: {
    primary: {
      name: "Gemini 1.5 Pro",
      provider: "gemini",
      model: "gemini-1.5-pro-latest",
      maxTokens: 4000,
      temperature: 0.2,
      costPer1kInputTokens: 3.5, // $3.50 per 1k input tokens
      costPer1kOutputTokens: 10.5, // $10.50 per 1k output tokens
    },
    fallback: {
      name: "OpenRouter Claude 3.5 Sonnet",
      provider: "openrouter",
      model: "anthropic/claude-3.5-sonnet",
      maxTokens: 4000,
      temperature: 0.2,
      costPer1kInputTokens: 3.0,
      costPer1kOutputTokens: 15.0,
    },
  },

  // Stage 3: App Spec Generation (heavy lifting)
  stage3: {
    primary: {
      name: "Gemini 1.5 Pro",
      provider: "gemini",
      model: "gemini-1.5-pro-latest",
      maxTokens: 8000,
      temperature: 0.4,
      costPer1kInputTokens: 3.5,
      costPer1kOutputTokens: 10.5,
    },
    fallback: {
      name: "OpenRouter Claude 3.5 Sonnet",
      provider: "openrouter",
      model: "anthropic/claude-3.5-sonnet",
      maxTokens: 8000,
      temperature: 0.4,
      costPer1kInputTokens: 3.0,
      costPer1kOutputTokens: 15.0,
    },
  },
};

// ============= ROUTING UTILITIES =============

export class ModelRouter {
  private config: ModelRouting;

  constructor(config: ModelRouting = DEFAULT_MODEL_ROUTING) {
    this.config = config;
  }

  getModel(
    stage: "stage1" | "stage2" | "stage3",
    useFallback: boolean = false
  ): ModelConfig {
    const stageConfig = this.config[stage];

    if (useFallback && stageConfig.fallback) {
      return stageConfig.fallback;
    }

    return stageConfig.primary;
  }

  calculateCost(stage: "stage1" | "stage2" | "stage3", inputTokens: number, outputTokens: number): number {
    const model = this.getModel(stage);

    const inputCost = (inputTokens / 1000) * model.costPer1kInputTokens;
    const outputCost = (outputTokens / 1000) * model.costPer1kOutputTokens;

    return inputCost + outputCost;
  }

  getModelInfo(stage: "stage1" | "stage2" | "stage3"): { primary: string; fallback?: string } {
    const stageConfig = this.config[stage];
    return {
      primary: `${stageConfig.primary.name} (${stageConfig.primary.provider})`,
      fallback: stageConfig.fallback ? `${stageConfig.fallback.name} (${stageConfig.fallback.provider})` : undefined,
    };
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      ModelRoutingSchema.parse(this.config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map((e) => `${e.path.join(".")}: ${e.message}`));
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// ============= EXPORT SINGLETON INSTANCE =============

export const modelRouter = new ModelRouter(DEFAULT_MODEL_ROUTING);

// ============= ENVIRONMENT-BASED CONFIGURATION LOADER =============

export function loadModelRoutingFromEnv(): ModelRouting {
  // This allows loading from environment variables if needed
  // For now, returns default config
  // In production, could read from .env.local or config service

  const configStr = process.env.MODEL_ROUTING_CONFIG;
  if (!configStr) {
    return DEFAULT_MODEL_ROUTING;
  }

  try {
    const config = JSON.parse(configStr);
    return ModelRoutingSchema.parse(config);
  } catch (error) {
    console.error("Failed to load model routing config from env, using defaults", error);
    return DEFAULT_MODEL_ROUTING;
  }
}
