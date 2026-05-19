/**
 * OpenAI client stub.
 * NOTE: AI features are now handled entirely by the backend.
 * This file is kept as a stub so that any remaining references compile,
 * but no OpenAI SDK is needed in the frontend.
 */

export const openai: any = null;

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export function isOpenAIConfigured(): boolean {
  return false; // AI is handled by the backend
}
