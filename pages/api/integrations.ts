import { NextApiRequest, NextApiResponse } from "next";
import { getAllIntegrations } from "@/integrations/registry";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const integrations = getAllIntegrations();
    res.status(200).json({
      success: true,
      count: integrations.length,
      integrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch integrations",
    });
  }
}