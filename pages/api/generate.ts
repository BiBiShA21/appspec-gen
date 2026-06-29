import { NextApiRequest, NextApiResponse } from "next";
import { extractIntent } from "@/stages/intent";
import { generateSchema } from "@/stages/schema";
import { generateAppSpec } from "@/stages/appspec";

// Simple in-memory job storage (for now)
const jobs: Record<string, any> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POST: Start a new generation job
  if (req.method === "POST") {
    return await handlePost(req, res);
  }

  // GET: Get job status
  if (req.method === "GET") {
    return handleGet(req, res);
  }

  res.status(405).json({ error: "Method not allowed" });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { userInput } = req.body;

  if (!userInput || typeof userInput !== "string") {
    return res.status(400).json({ error: "userInput is required" });
  }

  try {
    // Create a job ID
    const jobId = "job_" + Date.now();

    // Store job
    jobs[jobId] = {
      id: jobId,
      status: "processing",
      userInput,
      createdAt: new Date(),
      stages: {},
    };

    // Run pipeline in background (async)
    runPipeline(jobId, userInput).catch((error) => {
      jobs[jobId].status = "failed";
      jobs[jobId].error = error.message;
    });

    // Return job ID immediately
    res.status(202).json({
      success: true,
      jobId,
      message: "Generation started",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to start generation",
    });
  }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { jobId } = req.query;

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ error: "jobId is required" });
  }

  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.status(200).json({
    success: true,
    job,
  });
}

async function runPipeline(jobId: string, userInput: string) {
  const job = jobs[jobId];

  try {
    // Stage 1: Intent
    job.stages.intent = { status: "processing" };
    const intent = await extractIntent(userInput);
    job.stages.intent = { status: "completed", output: intent };

    // Stage 2: Schema
    job.stages.schema = { status: "processing" };
    const schema = await generateSchema(intent);
    job.stages.schema = { status: "completed", output: schema };

    // Stage 3: AppSpec
    job.stages.appspec = { status: "processing" };
    const appSpec = await generateAppSpec(intent, schema);
    job.stages.appspec = { status: "completed", output: appSpec };

    // Mark job as complete
    job.status = "completed";
    job.finalSpec = appSpec;
    job.completedAt = new Date();
  } catch (error) {
    job.status = "failed";
    job.error = error instanceof Error ? error.message : "Unknown error";
  }
}