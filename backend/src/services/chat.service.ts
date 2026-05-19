import { openai, OPENAI_MODEL, isOpenAIConfigured } from "@/lib/openai";
import { SYSTEM_PROMPT } from "@/ai/system-prompt";
import { extractIntent, mergeIntents } from "@/ai/intent-extractor";
import { generateClarificationQuestions, hasEnoughContext } from "@/ai/clarification-engine";
import { updatePreferences, applyWeightOverrides } from "@/memory/preference-tracker";
import {
  getOrCreateSession,
  addConversationTurn,
  getConversationForAI,
  updateOpenAIResponseId,
} from "@/memory/session";
import { getRecommendations, getComparison } from "./recommendation.service";
import { getAccessoriesForProduct } from "@/data/accessories";
import type { ChatResponse, ExtractedIntent, PreferenceMemory } from "@/types/chat";
import type { ScoredProduct } from "@/types/recommendation";
import type { SSEWriter } from "@/utils/stream";

/**
 * Process a chat message — the main orchestration function.
 * Handles the full conversation flow: intent → memory → clarify/recommend → respond.
 */
export async function processChat(
  message: string,
  sessionId?: string,
  preferenceOverrides?: PreferenceMemory
): Promise<ChatResponse> {
  // 1. Get or create session
  const session = getOrCreateSession(sessionId);

  // 2. Record user turn
  addConversationTurn(session.id, {
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  });

  // 3. Apply any direct preference overrides
  if (preferenceOverrides) {
    Object.assign(session.preferences, preferenceOverrides);
    if (preferenceOverrides.weightOverrides) {
      applyWeightOverrides(session, preferenceOverrides.weightOverrides);
    }
  }

  // 4. Extract intent from message
  const newIntent = await extractIntent(message);

  // 5. Merge with existing intent and update preferences
  const existingIntent: ExtractedIntent = {
    useCases: session.preferences.primaryUseCase
      ? [session.preferences.primaryUseCase, ...(session.preferences.secondaryUseCases || [])]
      : [],
    priorities: session.preferences.priorities || [],
    confidenceScores: {},
  };
  const mergedIntent = mergeIntents(existingIntent, newIntent);

  // 6. Update session preferences
  updatePreferences(session, mergedIntent);

  // 7. Check if we need clarification or can recommend
  const enoughContext = hasEnoughContext(mergedIntent, session.preferences);
  const clarificationQuestions = enoughContext
    ? []
    : generateClarificationQuestions(mergedIntent, session.preferences);

  // 8. Get recommendations if we have enough context
  let recommendations: ScoredProduct[] = [];
  if (enoughContext) {
    recommendations = await getRecommendations(session.id, { limit: 5 });
  }

  // 9. Handle weight adjustments from AI response
  if (newIntent.confidenceScores) {
    // Check if user explicitly changed what matters
    const weightKeywords: Record<string, string> = {
      "battery": "batteryLife",
      "comfort": "comfort",
      "sound": "soundQuality",
      "price": "priceFit",
      "noise": "ancFit",
      "mic": "micFit",
      "portable": "portabilityFit",
      "latency": "latencyFit",
    };

    const lower = message.toLowerCase();
    if (lower.includes("more") || lower.includes("important") || lower.includes("matters")) {
      for (const [keyword, weightKey] of Object.entries(weightKeywords)) {
        if (lower.includes(keyword)) {
          applyWeightOverrides(session, { [weightKey]: 0.25 });
        }
      }
    }
  }

  // 10. Generate AI response
  const aiResponse = await generateAIResponse(session.id, message, {
    hasRecommendations: recommendations.length > 0,
    hasClarifications: clarificationQuestions.length > 0,
    recommendations,
    clarificationQuestions,
    preferences: session.preferences,
  });

  // 11. Get accessory suggestions if we have recommendations
  let suggestedAccessories: ReturnType<typeof getAccessoriesForProduct> | undefined;
  if (recommendations.length > 0) {
    const topProduct = recommendations[0].product;
    suggestedAccessories = getAccessoriesForProduct(topProduct.category).slice(0, 3);
  }

  // 12. Build response
  const response: ChatResponse = {
    sessionId: session.id,
    message: aiResponse,
    clarificationQuestions: clarificationQuestions.length > 0 ? clarificationQuestions : undefined,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    preferenceMemory: session.preferences,
    suggestedAccessories: suggestedAccessories?.length ? suggestedAccessories : undefined,
  };

  // 13. Record assistant turn
  addConversationTurn(session.id, {
    role: "assistant",
    content: aiResponse,
    timestamp: new Date().toISOString(),
  });

  return response;
}

/**
 * Process chat with streaming SSE output.
 */
export async function processChatStreaming(
  message: string,
  writer: SSEWriter,
  sessionId?: string,
  preferenceOverrides?: PreferenceMemory
): Promise<void> {
  try {
    const session = getOrCreateSession(sessionId);

    addConversationTurn(session.id, {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    });

    if (preferenceOverrides) {
      Object.assign(session.preferences, preferenceOverrides);
    }

    const newIntent = await extractIntent(message);
    const existingIntent: ExtractedIntent = {
      useCases: session.preferences.primaryUseCase
        ? [session.preferences.primaryUseCase, ...(session.preferences.secondaryUseCases || [])]
        : [],
      priorities: session.preferences.priorities || [],
      confidenceScores: {},
    };
    const mergedIntent = mergeIntents(existingIntent, newIntent);
    updatePreferences(session, mergedIntent);

    const enoughContext = hasEnoughContext(mergedIntent, session.preferences);
    const clarificationQuestions = enoughContext
      ? []
      : generateClarificationQuestions(mergedIntent, session.preferences);

    let recommendations: ScoredProduct[] = [];
    if (enoughContext) {
      recommendations = await getRecommendations(session.id, { limit: 5 });
    }

    // Stream AI message
    if (isOpenAIConfigured()) {
      await streamAIResponse(session.id, message, writer, {
        hasRecommendations: recommendations.length > 0,
        hasClarifications: clarificationQuestions.length > 0,
        recommendations,
        preferences: session.preferences,
      });
    } else {
      const fallback = generateFallbackResponse(session.preferences, clarificationQuestions, recommendations);
      writer.sendText(fallback);
    }

    // Send structured data
    if (clarificationQuestions.length > 0) {
      writer.send({ type: "clarification", data: clarificationQuestions });
    }

    if (recommendations.length > 0) {
      writer.send({ type: "recommendations", data: recommendations });

      const topProduct = recommendations[0].product;
      const accessories = getAccessoriesForProduct(topProduct.category).slice(0, 3);
      if (accessories.length > 0) {
        writer.send({ type: "accessories", data: accessories });
      }
    }

    writer.send({ type: "memory", data: session.preferences });
    writer.close();

    addConversationTurn(session.id, {
      role: "assistant",
      content: "[streamed response]",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    writer.sendError(errMsg);
  }
}

// ─── AI Response Generation ────────────────────────────────────────

async function generateAIResponse(
  sessionId: string,
  userMessage: string,
  context: {
    hasRecommendations: boolean;
    hasClarifications: boolean;
    recommendations: ScoredProduct[];
    clarificationQuestions?: Array<{ question: string; field: string }>;
    preferences: PreferenceMemory;
  }
): Promise<string> {
  if (!isOpenAIConfigured()) {
    return generateFallbackResponse(
      context.preferences,
      context.clarificationQuestions || [],
      context.recommendations
    );
  }

  try {
    const history = getConversationForAI(sessionId);
    const contextMessage = buildContextMessage(context);

    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: SYSTEM_PROMPT,
      input: [
        ...history.slice(-10).map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: `${userMessage}\n\n[SYSTEM CONTEXT: ${contextMessage}]` },
      ],
    });

    // Try to parse as JSON, fall back to raw text
    const text = response.output_text;
    try {
      const parsed = JSON.parse(text);
      return parsed.message || text;
    } catch {
      return text;
    }
  } catch (error) {
    console.error("AI response generation failed:", error);
    return generateFallbackResponse(
      context.preferences,
      context.clarificationQuestions || [],
      context.recommendations
    );
  }
}

async function streamAIResponse(
  sessionId: string,
  userMessage: string,
  writer: SSEWriter,
  context: {
    hasRecommendations: boolean;
    hasClarifications: boolean;
    recommendations: ScoredProduct[];
    preferences: PreferenceMemory;
  }
): Promise<void> {
  const history = getConversationForAI(sessionId);
  const contextMessage = buildContextMessage(context);

  const stream = await openai.responses.create({
    model: OPENAI_MODEL,
    instructions: SYSTEM_PROMPT,
    input: [
      ...history.slice(-10).map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: `${userMessage}\n\n[SYSTEM CONTEXT: ${contextMessage}]` },
    ],
    stream: true,
  });

  for await (const event of stream) {
    if (
      event.type === "response.output_text.delta" &&
      "delta" in event
    ) {
      writer.sendText(event.delta as string);
    }
  }
}

function buildContextMessage(context: {
  hasRecommendations: boolean;
  hasClarifications: boolean;
  recommendations: ScoredProduct[];
  preferences: PreferenceMemory;
}): string {
  const parts: string[] = [];

  if (context.hasRecommendations) {
    const recSummary = context.recommendations
      .slice(0, 3)
      .map((r) => `${r.rank}. ${r.product.name} ($${r.product.price}, score: ${r.totalScore}) - ${r.whyRecommended}`)
      .join("\n");
    parts.push(`TOP RECOMMENDATIONS:\n${recSummary}`);
  }

  const prefs = context.preferences;
  const prefSummary: string[] = [];
  if (prefs.primaryUseCase) prefSummary.push(`Use: ${prefs.primaryUseCase}`);
  if (prefs.budget?.max) prefSummary.push(`Budget: $${prefs.budget.max}`);
  if (prefs.preferredStyle) prefSummary.push(`Style: ${prefs.preferredStyle}`);
  if (prefs.ancImportance) prefSummary.push(`ANC: ${prefs.ancImportance}`);
  if (prefSummary.length > 0) {
    parts.push(`USER PREFS: ${prefSummary.join(", ")}`);
  }

  if (context.hasClarifications) {
    parts.push("STATUS: Need more information before recommending. Ask clarifying questions.");
  } else if (context.hasRecommendations) {
    parts.push("STATUS: Ready to present recommendations with tradeoff explanations.");
  }

  return parts.join("\n\n");
}

function generateFallbackResponse(
  preferences: PreferenceMemory,
  clarifications: Array<{ question: string; field?: string }>,
  recommendations: ScoredProduct[]
): string {
  // If we have recommendations, present them instead of asking questions
  if (recommendations.length > 0) {
    const recs = recommendations
      .slice(0, 3)
      .map((r) => `**${r.rank}. ${r.product.name}** ($${r.product.price}) — ${r.whyRecommended}`)
      .join("\n\n");
    return `Based on what you've told me, here are my top recommendations:\n\n${recs}\n\nWould you like me to compare any of these in detail, or do you have any other preferences to share?`;
  }

  if (clarifications.length > 0) {
    // Only ask a few clarifications, not all of them
    const questionsToAsk = clarifications.slice(0, 2).map((q) => q.question).join("\n• ");
    return `Thanks for sharing! To find the perfect headphones for you, I have a few quick questions:\n\n• ${questionsToAsk}`;
  }

  return "I'd love to help you find the perfect headphones! What will you primarily be using them for?";
}
