import { runFullPipeline } from "@/stages/pipeline";
import * as fs from "fs";

const evaluationPrompts = [
  {
    id: "prompt_001",
    title: "Simple CRUD App",
    prompt: "Create a basic task management app where users can create, view, update and delete tasks. Each task should have a title, description, due date, and completion status.",
  },
  {
    id: "prompt_002",
    title: "E-commerce Product Catalog",
    prompt: "Build a product catalog for an e-commerce store. Show products with images, names, prices, descriptions, and inventory levels. Include filtering by category and price range.",
  },
  {
    id: "prompt_003",
    title: "Employee Directory with Search",
    prompt: "Create an employee directory app. Show employee photos, names, departments, contact info. Include search and filtering by department. Integrate with Slack.",
  },
  {
    id: "prompt_004",
    title: "Invoice Management with Payments",
    prompt: "Build an invoice management system. Create invoices with line items and totals. Support Stripe payments. Send email confirmations when invoices are paid.",
  },
  {
    id: "prompt_005",
    title: "Project Management Dashboard",
    prompt: "Create a project dashboard showing tasks, milestones, and progress. Display tasks in a kanban board. Sync to Notion and send Slack notifications.",
  },
];

async function runEvaluation() {
  console.log("🧪 Starting Evaluation...\n");

  const results: any[] = [];

  for (const testCase of evaluationPrompts) {
    console.log(`\n📝 Testing: ${testCase.title}`);
    console.log(`   Prompt: "${testCase.prompt.slice(0, 60)}..."`);

    const startTime = Date.now();

    try {
      const result = await runFullPipeline(testCase.prompt);
      const duration = Date.now() - startTime;

      const success = !!result.appSpec?.name;

      results.push({
        id: testCase.id,
        title: testCase.title,
        success,
        duration,
        appName: result.appSpec?.name,
        pages: result.appSpec?.pages?.length || 0,
        components: result.appSpec?.components?.length || 0,
        integrations: result.appSpec?.integrations?.length || 0,
      });

      console.log(`   ✅ Success! (${duration}ms)`);
      console.log(`   App: ${result.appSpec?.name}`);
      console.log(`   Pages: ${result.appSpec?.pages?.length}, Components: ${result.appSpec?.components?.length}, Integrations: ${result.appSpec?.integrations?.length}`);
    } catch (error) {
      results.push({
        id: testCase.id,
        title: testCase.title,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      console.log(`   ❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Calculate metrics
  const successful = results.filter((r) => r.success).length;
  const avgDuration = results.filter((r) => r.success).reduce((sum, r) => sum + (r.duration || 0), 0) / successful;
  const successRate = ((successful / results.length) * 100).toFixed(1);

  console.log("\n" + "=".repeat(60));
  console.log("📊 EVALUATION RESULTS");
  console.log("=".repeat(60));
  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successful}/${results.length} (${successRate}%)`);
  console.log(`Avg Duration: ${avgDuration.toFixed(0)}ms`);
  console.log("=".repeat(60) + "\n");

  // Save results
  fs.writeFileSync(
    "evaluation/results.json",
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        metrics: {
          totalTests: results.length,
          successful,
          successRate: parseFloat(successRate),
          avgDuration: Math.round(avgDuration),
        },
        results,
      },
      null,
      2
    )
  );

  console.log("✅ Results saved to evaluation/results.json\n");
}

runEvaluation().catch(console.error);