import { AppIntent, AppIntentSchema } from "@/validation/schemas";
import { callGemini } from "@/ai/providers/gemini";

/**
 * Stage 1: Intent Extraction
 * Takes user input and extracts structured app intent using AI
 */

export async function extractIntent(userInput: string): Promise<AppIntent> {
  const prompt = `
You are an expert app designer. Analyze this user request and extract the app intent.

User Request: "${userInput}"

Return a JSON object with:
- purpose: (string) What is the main purpose of this app?
- extractedFeatures: (array) List of app features needed [e.g., "create_items", "delete_items", "list_view"]
- integrationHints: (array) Which integrations are mentioned? [slack, gmail, stripe, notion, airtable, etc]
- constraints: (array) Any constraints mentioned? [e.g., "mobile_first", "offline_support"]

Return ONLY valid JSON, no markdown or explanation.

Common features: create_items, delete_items, edit_items, list_view, search_filter, sorting, notifications, user_management, payment_processing, dashboard, comments, favorites, scheduling

Common integrations: slack, gmail, stripe, notion, airtable, jira, github

Example output:
{
  "purpose": "A task management app for teams",
  "extractedFeatures": ["create_items", "delete_items", "list_view", "notifications"],
  "integrationHints": ["slack"],
  "constraints": []
}
`;

  try {
    const { text } = await callGemini(prompt);

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const intent: AppIntent = {
      purpose: parsed.purpose || userInput.slice(0, 100),
      userInput,
      extractedFeatures: parsed.extractedFeatures || [],
      integrationHints: parsed.integrationHints || [],
      constraints: parsed.constraints || [],
    };

    // Validate
    const validation = AppIntentSchema.safeParse(intent);
    if (!validation.success) {
      throw new Error("Intent validation failed");
    }

    return validation.data;
  } catch (error) {
    console.error("Intent extraction error:", error);
    // Fallback to simple extraction
    return fallbackExtractIntent(userInput);
  }
}

function fallbackExtractIntent(userInput: string): AppIntent {
  const lowerInput = userInput.toLowerCase();

  const features = [];
  if (lowerInput.includes("create") || lowerInput.includes("add")) features.push("create_items");
  if (lowerInput.includes("delete") || lowerInput.includes("remove")) features.push("delete_items");
  if (lowerInput.includes("edit") || lowerInput.includes("update")) features.push("edit_items");
  if (lowerInput.includes("list") || lowerInput.includes("view")) features.push("list_view");
  if (lowerInput.includes("search") || lowerInput.includes("filter")) features.push("search_filter");
  if (features.length === 0) features.push("basic_crud");

  const integrations = [];
  if (lowerInput.includes("slack")) integrations.push("slack");
  if (lowerInput.includes("email") || lowerInput.includes("gmail")) integrations.push("gmail");
  if (lowerInput.includes("stripe") || lowerInput.includes("payment")) integrations.push("stripe");
  if (lowerInput.includes("notion")) integrations.push("notion");
  if (lowerInput.includes("airtable")) integrations.push("airtable");

  return {
    purpose: userInput.slice(0, 100),
    userInput,
    extractedFeatures: features,
    integrationHints: integrations,
    constraints: [],
  };
}