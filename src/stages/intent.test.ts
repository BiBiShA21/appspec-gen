import { extractIntent } from "./intent.js";

async function test() {
  console.log("🧪 Testing Intent Extraction...\n");

  const testPrompts = [
    "Create a to-do app where users can add tasks",
    "Build an e-commerce store with Stripe payments",
    "Make a project tracker with Slack notifications",
  ];

  for (const prompt of testPrompts) {
    console.log(`📝 Input: "${prompt}"`);
    
    try {
      const intent = await extractIntent(prompt);
      console.log(`✅ Features: ${intent.extractedFeatures.join(", ")}`);
      console.log(`✅ Integrations: ${intent.integrationHints?.join(", ") || "none"}`);
      console.log(`✅ Constraints: ${intent.constraints?.join(", ") || "none"}`);
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }

    console.log("---\n");
  }
}

test();