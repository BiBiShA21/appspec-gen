import { AppIntent } from "@/validation/schemas";
import { DataSchema, DataSchemaSchema } from "@/validation/schemas";
import { callGeminiPro } from "@/ai/providers/gemini";

/**
 * Stage 2: Schema Generation
 * Takes the intent and creates a data schema using AI
 */

export async function generateSchema(intent: AppIntent): Promise<DataSchema> {
  const prompt = `
You are an expert database designer. Create a data schema for this app.   

App Purpose: ${intent.purpose}
Features: ${intent.extractedFeatures.join(", ")}
Integrations: ${intent.integrationHints?.join(", ") || "none"}

Design a data schema with:
- entities: An object where keys are entity names and values are arrays of fields
- Each field has: name, type (string|number|boolean|date|array|object), required (true/false), description

Include fields like:
- ID and timestamps for all entities
- Status field if notifications are mentioned
- Amount/currency if payments are mentioned
- User/owner if multi-user
- Description/notes field

Return ONLY valid JSON, no markdown.

Example:
{
  "entities": {
    "task": [
      {"name": "id", "type": "string", "required": true, "description": "Task ID"},
      {"name": "title", "type": "string", "required": true, "description": "Task title"},
      {"name": "status", "type": "string", "required": false, "description": "Status"}
    ]
  }
}
`;

  try {
    const { text } = await callGeminiPro(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validation = DataSchemaSchema.safeParse(parsed);

    if (!validation.success) {
      throw new Error("Schema validation failed");
    }

    return validation.data;
  } catch (error) {
    console.error("Schema generation error:", error);
    return fallbackGenerateSchema(intent);
  }
}

function fallbackGenerateSchema(intent: AppIntent): DataSchema {
  const mainEntity = intent.extractedFeatures[0]?.replace("_items", "").replace("_", "") || "item";

  const fields = [
    { name: "id", type: "string" as const, required: true, description: "Unique ID" },
    { name: `${mainEntity}_name`, type: "string" as const, required: true, description: `Name of ${mainEntity}` },
  ];

  if (intent.integrationHints?.includes("slack") || intent.extractedFeatures.includes("notifications")) {
    fields.push({
      name: "status",
      type: "string" as const,
      required: false,
      description: "Current status",
    });
  }

  if (intent.integrationHints?.includes("stripe")) {
    fields.push({
      name: "amount",
      type: "string" as const,
      required: false,
      description: "Amount",
    });
  }

  return {
    entities: {
      [mainEntity]: fields,
    },
  };
}