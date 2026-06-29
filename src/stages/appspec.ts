import { AppIntent } from "@/validation/schemas";
import { DataSchema } from "@/validation/schemas";
import { AppSpec, AppSpecSchema } from "@/validation/schemas";
import { INTEGRATIONS } from "@/integrations/registry";
import { callGeminiPro } from "@/ai/providers/gemini";

/**
 * Stage 3: App Spec Generation
 * Takes intent + schema and creates a full app specification using AI
 */

export async function generateAppSpec(
  intent: AppIntent,
  schema: DataSchema
): Promise<AppSpec> {
  const mainEntity = Object.keys(schema.entities)[0];

  const prompt = `
You are an expert UI/UX designer. Create a complete app specification.

App Purpose: ${intent.purpose}
Features: ${intent.extractedFeatures.join(", ")}
Main Entity: ${mainEntity}
Schema Entities: ${Object.keys(schema.entities).join(", ")}

Design the app with:
1. Pages (list, detail, create, dashboard if mentioned)
2. Components (inputs, buttons, displays for each field)
3. Integrations configuration

Return ONLY valid JSON with structure:
{
  "pages": [
    {"id": "entity-list", "name": "Entity List", "type": "list", "fields": [...]}
  ],
  "components": [
    {"id": "input-id", "type": "text-input", "label": "ID", "dataField": "id"}
  ]
}
`;

  try {
    const { text } = await callGeminiPro(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const spec: AppSpec = {
      name: generateAppName(intent),
      description: generateAppDescription(intent),
      version: "0.1",
      pages: parsed.pages || createDefaultPages(mainEntity),
      components: parsed.components || createDefaultComponents(mainEntity, schema),
      integrations: createIntegrations(intent),
      dataSchema: schema,
      metadata: {
        theme: "light",
        features: intent.extractedFeatures,
      },
    };

    const validation = AppSpecSchema.safeParse(spec);
    if (!validation.success) {
      throw new Error("AppSpec validation failed");
    }

    return validation.data;
  } catch (error) {
    console.error("AppSpec generation error:", error);
    return generateAppSpecFallback(intent, schema);
  }
}

function generateAppName(intent: AppIntent): string {
  const words = intent.userInput.split(" ");
  const createIdx = words.findIndex((w) => w.toLowerCase() === "create");
  if (createIdx !== -1 && createIdx < words.length - 2) {
    const name = words.slice(createIdx + 2, createIdx + 4).join(" ");
    if (name && name.length < 50) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  const name = words.slice(0, 2).join(" ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateAppDescription(intent: AppIntent): string {
  return intent.purpose.slice(0, 150);
}

function createDefaultPages(mainEntity: string) {
  const pages = [
    {
      id: `${mainEntity}-list`,
      name: `${capitalize(mainEntity)} List`,
      type: "list" as const,
      fields: ["id", `${mainEntity}_name`],
      layout: { columns: 1 },
    },
    {
      id: `${mainEntity}-detail`,
      name: `${capitalize(mainEntity)} Details`,
      type: "detail" as const,
      layout: { columns: 2 },
    },
    {
      id: `${mainEntity}-create`,
      name: `Create ${capitalize(mainEntity)}`,
      type: "form" as const,
      layout: { columns: 1 },
    },
  ];

  return pages;
}

function createDefaultComponents(mainEntity: string, schema: DataSchema) {
  const components = [];
  const fields = schema.entities[mainEntity] || [];

  for (const field of fields) {
    const componentType = getComponentType(field.type);
    components.push({
      id: `input-${field.name}`,
      type: componentType,
      label: capitalize(field.name),
      dataField: field.name,
      props: {
        required: field.required,
        placeholder: `Enter ${field.name}`,
      },
    });
  }

  components.push({
    id: "btn-submit",
    type: "button",
    label: "Save",
    props: { variant: "primary" },
  });

  components.push({
    id: "btn-cancel",
    type: "button",
    label: "Cancel",
    props: { variant: "secondary" },
  });

  return components;
}

function createIntegrations(intent: AppIntent) {
  const integrations = [];

  if (intent.integrationHints) {
    for (const hint of intent.integrationHints) {
      const integration = INTEGRATIONS[hint];
      if (integration) {
        integrations.push({
          id: integration.id,
          type: integration.name,
          triggers: integration.triggers.slice(0, 2).map((t) => t.id),
          actions: integration.actions.slice(0, 2).map((a) => a.id),
        });
      }
    }
  }

  return integrations;
}

function generateAppSpecFallback(intent: AppIntent, schema: DataSchema): AppSpec {
  const mainEntity = Object.keys(schema.entities)[0];

  return {
    name: generateAppName(intent),
    description: generateAppDescription(intent),
    version: "0.1",
    pages: createDefaultPages(mainEntity),
    components: createDefaultComponents(mainEntity, schema),
    integrations: createIntegrations(intent),
    dataSchema: schema,
    metadata: {
      theme: "light",
      features: intent.extractedFeatures,
    },
  };
}

function getComponentType(fieldType: string): string {
  const typeMap: Record<string, string> = {
    string: "text-input",
    number: "number-input",
    boolean: "checkbox",
    date: "date-picker",
    array: "multi-select",
    object: "nested-form",
  };

  return typeMap[fieldType] || "text-input";
}

function capitalize(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}