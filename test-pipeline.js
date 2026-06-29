const { runFullPipeline } = require("./src/stages/pipeline.ts");

async function main() {
    const prompt = "Create a to-do app where users can add and delete tasks";

    console.log("Testing pipeline with:", prompt);

    try {
        const result = await runFullPipeline(prompt);
        console.log("\n✅ SUCCESS!");
        console.log("\nApp Name:", result.appSpec.name);
        console.log("Pages:", result.appSpec.pages.map(p => p.name));
        console.log("Components:", result.appSpec.components.length);
        console.log("Integrations:", result.appSpec.integrations.length);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();