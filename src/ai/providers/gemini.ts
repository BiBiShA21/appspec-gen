import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function callGemini(
  prompt: string
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Estimate tokens (rough approximation)
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(text.length / 4);

  return { text, inputTokens, outputTokens };
}

export async function callGeminiPro(
  prompt: string
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(text.length / 4);

  return { text, inputTokens, outputTokens };
}