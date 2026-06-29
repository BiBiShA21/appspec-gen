import { extractIntent } from "./intent";
import { generateSchema } from "./schema";
import { generateAppSpec } from "./appspec";
import { AppSpec } from "@/validation/schemas";

/**
 * Full Pipeline: Takes user input → generates complete app spec
 */

export async function runFullPipeline(userInput: string): Promise<{
  intent: any;
  schema: any;
  appSpec: AppSpec;
}> {
  console.log("\n🚀 Starting Full Pipeline\n");

  // Stage 1: Extract Intent
  console.log("📝 Stage 1: Extracting Intent...");
  const intent = await extractIntent(userInput);
  console.log("✅ Intent extracted:", {
    features: intent.extractedFeatures,
    integrations: intent.integrationHints,
  });

  // Stage 2: Generate Schema
  console.log("\n📊 Stage 2: Generating Schema...");
  const schema = await generateSchema(intent);
  console.log("✅ Schema generated:", {
    entities: Object.keys(schema.entities),
  });

  // Stage 3: Generate App Spec
  console.log("\n🎨 Stage 3: Generating App Spec...");
  const appSpec = await generateAppSpec(intent, schema);
  console.log("✅ App Spec generated:", {
    name: appSpec.name,
    pages: appSpec.pages.length,
    components: appSpec.components.length,
    integrations: appSpec.integrations.length,
  });

  console.log("\n✨ Pipeline Complete!\n");

  return { intent, schema, appSpec };
}