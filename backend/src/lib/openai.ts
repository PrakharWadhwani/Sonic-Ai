import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️  OPENAI_API_KEY not set. AI features will use mock responses.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-mock-key",
});

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-mock-key";
}
