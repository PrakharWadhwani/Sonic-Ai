import { openai, OPENAI_MODEL, isOpenAIConfigured } from "@/lib/openai";
import type { ExtractedIntent } from "@/types/chat";

const EXTRACTION_PROMPT = `You are an intent extraction system for a headphone shopping assistant.
Analyze the user message and extract structured shopping preferences.

Return valid JSON with these fields:
{
  "useCases": string[],         // e.g. ["travel", "gaming", "work calls", "gym", "music"]
  "priorities": string[],       // e.g. ["comfort", "noise cancellation", "sound quality", "battery life"]
  "budget": { "min": number|null, "max": number|null },
  "style": "over-ear"|"on-ear"|"in-ear"|"earbuds"|"no-preference"|null,
  "microphoneNeeded": boolean|null,
  "ancImportance": "critical"|"nice-to-have"|"not-needed"|null,
  "portabilityNeeds": "high"|"medium"|"low"|null,
  "gamingFocus": boolean|null,
  "musicGenres": string[],
  "wirelessPreference": "wireless"|"wired"|"no-preference"|null,
  "comfortPriority": "critical"|"important"|"normal"|null,
  "confidenceScores": { [field: string]: number }  // 0-1 confidence for each field
}

Rules:
- Only extract what the user explicitly or strongly implies
- Set confidence 0.0-0.3 for uncertain inferences
- Set confidence 0.4-0.7 for reasonable inferences
- Set confidence 0.8-1.0 for explicitly stated preferences
- Leave fields as null if not mentioned at all
- "useCases" and "priorities" should always have confidence scores for each item`;

/**
 * Extracts structured intent from a user message using the AI.
 * Falls back to keyword-based extraction when OpenAI is not configured.
 */
export async function extractIntent(userMessage: string): Promise<ExtractedIntent> {
  if (!isOpenAIConfigured()) {
    return extractIntentFallback(userMessage);
  }

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: [
        { role: "developer", content: EXTRACTION_PROMPT },
        { role: "user", content: userMessage },
      ],
      text: {
        format: { type: "json_object" },
      },
    });

    const text = response.output_text;
    const parsed = JSON.parse(text);
    return normalizeIntent(parsed);
  } catch (error) {
    console.error("Intent extraction failed, using fallback:", error);
    return extractIntentFallback(userMessage);
  }
}

/**
 * Merge a new intent into an existing one, keeping high-confidence values.
 */
export function mergeIntents(existing: ExtractedIntent, incoming: ExtractedIntent): ExtractedIntent {
  const merged: ExtractedIntent = { ...existing };
  const existingConf = existing.confidenceScores || {};
  const incomingConf = incoming.confidenceScores || {};

  // Merge arrays (deduplicate)
  merged.useCases = [...new Set([...(existing.useCases || []), ...(incoming.useCases || [])])];
  merged.priorities = [...new Set([...(existing.priorities || []), ...(incoming.priorities || [])])];
  merged.musicGenres = [...new Set([...(existing.musicGenres || []), ...(incoming.musicGenres || [])])];

  // Merge scalar fields: incoming wins if higher confidence or existing is null
  const scalarFields = [
    "style", "microphoneNeeded", "ancImportance", "portabilityNeeds",
    "gamingFocus", "wirelessPreference", "comfortPriority",
  ] as const;

  for (const field of scalarFields) {
    if (incoming[field] !== null && incoming[field] !== undefined) {
      const inConf = incomingConf[field] ?? 0.5;
      const exConf = existingConf[field] ?? 0;
      if (inConf >= exConf || existing[field] === null || existing[field] === undefined) {
        (merged as Record<string, unknown>)[field] = incoming[field];
      }
    }
  }

  // Merge budget
  if (incoming.budget) {
    merged.budget = {
      min: incoming.budget.min ?? existing.budget?.min,
      max: incoming.budget.max ?? existing.budget?.max,
    };
  }

  // Merge confidence scores
  merged.confidenceScores = { ...existingConf };
  for (const [key, val] of Object.entries(incomingConf)) {
    if (val > (merged.confidenceScores[key] ?? 0)) {
      merged.confidenceScores[key] = val;
    }
  }

  return merged;
}

function normalizeIntent(raw: Record<string, unknown>): ExtractedIntent {
  return {
    useCases: Array.isArray(raw.useCases) ? raw.useCases : [],
    priorities: Array.isArray(raw.priorities) ? raw.priorities : [],
    budget: raw.budget as ExtractedIntent["budget"],
    style: (raw.style as ExtractedIntent["style"]) ?? null,
    microphoneNeeded: raw.microphoneNeeded as boolean | null,
    ancImportance: raw.ancImportance as ExtractedIntent["ancImportance"],
    portabilityNeeds: raw.portabilityNeeds as ExtractedIntent["portabilityNeeds"],
    gamingFocus: raw.gamingFocus as boolean | null,
    musicGenres: Array.isArray(raw.musicGenres) ? raw.musicGenres : [],
    wirelessPreference: raw.wirelessPreference as ExtractedIntent["wirelessPreference"],
    comfortPriority: raw.comfortPriority as ExtractedIntent["comfortPriority"],
    confidenceScores: (raw.confidenceScores as Record<string, number>) ?? {},
  };
}

// ─── Keyword-Based Fallback ────────────────────────────────────────
function extractIntentFallback(message: string): ExtractedIntent {
  const lower = message.toLowerCase();
  const intent: ExtractedIntent = {
    useCases: [],
    priorities: [],
    musicGenres: [],
    confidenceScores: {},
  };

  // Use cases
  const useCaseMap: Record<string, string[]> = {
    travel: ["travel", "flight", "plane", "airplane", "commut"],
    gaming: ["gaming", "game", "fps", "esport"],
    workout: ["gym", "workout", "exercise", "running", "sport", "fitness"],
    office: ["office", "work", "zoom", "teams", "call", "meeting"],
    studio: ["studio", "mixing", "production", "recording", "monitor"],
    audiophile: ["audiophile", "hi-fi", "hifi", "lossless", "critical listening"],
    music: ["music", "listen"],
  };

  for (const [useCase, keywords] of Object.entries(useCaseMap)) {
    if (keywords.some((k) => lower.includes(k))) {
      intent.useCases.push(useCase);
      // Increase confidence for use cases since this is a key classifier
      intent.confidenceScores![useCase] = 0.85;
    }
  }

  // Priorities
  const priorityMap: Record<string, string[]> = {
    comfort: ["comfort", "comfortable", "long wear", "all day"],
    "noise cancellation": ["noise cancel", "anc", "quiet", "silence", "block noise"],
    "sound quality": ["sound quality", "audio quality", "fidelity", "detail"],
    "battery life": ["battery", "long lasting", "charge"],
    "microphone": ["mic", "microphone", "calls", "voice"],
    portability: ["portable", "compact", "light", "small", "travel"],
    "low latency": ["latency", "lag", "delay"],
  };

  for (const [priority, keywords] of Object.entries(priorityMap)) {
    if (keywords.some((k) => lower.includes(k))) {
      intent.priorities.push(priority);
      // Increased from 0.6 to 0.8 for direct mentions
      intent.confidenceScores![priority] = 0.8;
    }
  }

  // Budget
  const budgetMatch = lower.match(/(?:under|below|max|budget|less than)\s*\$?(\d+)/);
  if (budgetMatch) {
    intent.budget = { max: parseInt(budgetMatch[1]) };
    intent.confidenceScores!["budget"] = 0.9;
  }
  const budgetRange = lower.match(/\$?(\d+)\s*[-–to]+\s*\$?(\d+)/);
  if (budgetRange) {
    intent.budget = { min: parseInt(budgetRange[1]), max: parseInt(budgetRange[2]) };
    intent.confidenceScores!["budget"] = 0.9;
  }

  // Style
  if (lower.includes("over-ear") || lower.includes("over ear")) {
    intent.style = "over-ear"; intent.confidenceScores!["style"] = 0.9;
  } else if (lower.includes("earbud")) {
    intent.style = "earbuds"; intent.confidenceScores!["style"] = 0.9;
  } else if (lower.includes("in-ear") || lower.includes("in ear")) {
    intent.style = "in-ear"; intent.confidenceScores!["style"] = 0.9;
  }

  // Wireless
  if (lower.includes("wireless") || lower.includes("bluetooth")) {
    intent.wirelessPreference = "wireless"; intent.confidenceScores!["wirelessPreference"] = 0.8;
  } else if (lower.includes("wired")) {
    intent.wirelessPreference = "wired"; intent.confidenceScores!["wirelessPreference"] = 0.8;
  }

  // Mic
  if (lower.includes("mic") || lower.includes("call") || lower.includes("zoom")) {
    intent.microphoneNeeded = true; intent.confidenceScores!["microphoneNeeded"] = 0.7;
  }

  // ANC
  if (lower.includes("noise cancel") || lower.includes("anc")) {
    intent.ancImportance = "critical"; intent.confidenceScores!["ancImportance"] = 0.8;
  }

  return intent;
}
