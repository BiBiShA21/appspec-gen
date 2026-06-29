import { NextApiRequest, NextApiResponse } from "next";

// Access jobs from parent generate.ts (simplified for now)
const jobs: Record<string, any> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobId } = req.query;

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ error: "jobId required" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial message
  res.write("data: Connection established\n\n");

  // Poll job status and send updates
  const pollInterval = setInterval(() => {
    const job = jobs[jobId];

    if (!job) {
      res.write("data: Job not found\n\n");
      clearInterval(pollInterval);
      res.end();
      return;
    }

    // Send stage updates
    if (job.stages?.intent?.status === "completed" && !job._intentSent) {
      res.write(
        `data: ${JSON.stringify({
          type: "stage_completed",
          stage: "intent",
          data: job.stages.intent.output,
        })}\n\n`
      );
      job._intentSent = true;
    }

    if (job.stages?.schema?.status === "completed" && !job._schemaSent) {
      res.write(
        `data: ${JSON.stringify({
          type: "stage_completed",
          stage: "schema",
          data: job.stages.schema.output,
        })}\n\n`
      );
      job._schemaSent = true;
    }

    if (job.stages?.appspec?.status === "completed" && !job._appspecSent) {
      res.write(
        `data: ${JSON.stringify({
          type: "stage_completed",
          stage: "appspec",
          data: job.stages.appspec.output,
        })}\n\n`
      );
      job._appspecSent = true;
    }

    // Send final completion
    if (job.status === "completed" && !job._completeSent) {
      res.write(
        `data: ${JSON.stringify({
          type: "complete",
          finalSpec: job.finalSpec,
        })}\n\n`
      );
      job._completeSent = true;
      clearInterval(pollInterval);
      res.end();
    }

    if (job.status === "failed" && !job._failedSent) {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: job.error,
        })}\n\n`
      );
      job._failedSent = true;
      clearInterval(pollInterval);
      res.end();
    }
  }, 500);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(pollInterval);
    res.end();
  });
}