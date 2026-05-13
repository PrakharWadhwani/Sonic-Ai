import { z } from "zod";

// ─── Extracted Intent ──────────────────────────────────────────────
export const ExtractedIntentSchema = z.object({
  useCases: z.array(z.string()),
  priorities: z.array(z.string()),
  budget: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  style: z
    .enum(["over-ear", "on-ear", "in-ear", "earbuds", "no-preference"])
    .nullable()
    .optional(),
  microphoneNeeded: z.boolean().nullable().optional(),
  ancImportance: z
    .enum(["critical", "nice-to-have", "not-needed"])
    .nullable()
    .optional(),
  portabilityNeeds: z.enum(["high", "medium", "low"]).nullable().optional(),
  gamingFocus: z.boolean().nullable().optional(),
  musicGenres: z.array(z.string()).optional(),
  wirelessPreference: z
    .enum(["wireless", "wired", "no-preference"])
    .nullable()
    .optional(),
  comfortPriority: z.enum(["critical", "important", "normal"]).nullable().optional(),
  confidenceScores: z.record(z.string(), z.number().min(0).max(1)).optional(),
});
export type ExtractedIntent = z.infer<typeof ExtractedIntentSchema>;

// ─── Preference Memory ─────────────────────────────────────────────
export const PreferenceMemorySchema = z.object({
  budget: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  preferredStyle: z
    .enum(["over-ear", "on-ear", "in-ear", "earbuds", "no-preference"])
    .nullable()
    .optional(),
  primaryUseCase: z.string().nullable().optional(),
  secondaryUseCases: z.array(z.string()).optional(),
  soundPreference: z.string().nullable().optional(),
  comfortPriority: z.enum(["critical", "important", "normal"]).nullable().optional(),
  ancImportance: z
    .enum(["critical", "nice-to-have", "not-needed"])
    .nullable()
    .optional(),
  microphoneNeeded: z.boolean().nullable().optional(),
  wirelessPreference: z
    .enum(["wireless", "wired", "no-preference"])
    .nullable()
    .optional(),
  gamingFocus: z.boolean().nullable().optional(),
  portabilityNeeds: z.enum(["high", "medium", "low"]).nullable().optional(),
  musicGenres: z.array(z.string()).optional(),
  rejectedProductIds: z.array(z.string()).optional(),
  priorities: z.array(z.string()).optional(),
  weightOverrides: z.record(z.string(), z.number()).optional(),
});
export type PreferenceMemory = z.infer<typeof PreferenceMemorySchema>;

// ─── Clarification Question ────────────────────────────────────────
export const ClarificationQuestionSchema = z.object({
  question: z.string(),
  field: z.string(), // which preference field this targets
  priority: z.enum(["high", "medium", "low"]),
  options: z.array(z.string()).optional(), // suggested answers
});
export type ClarificationQuestion = z.infer<typeof ClarificationQuestionSchema>;

// ─── Conversation Turn ─────────────────────────────────────────────
export const ConversationTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string().datetime().optional(),
  extractedIntent: ExtractedIntentSchema.optional(),
});
export type ConversationTurn = z.infer<typeof ConversationTurnSchema>;

// ─── Chat Request ──────────────────────────────────────────────────
export const ChatRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
  preferenceOverrides: PreferenceMemorySchema.optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ─── Chat Response ─────────────────────────────────────────────────
export const ChatResponseSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string(),
  clarificationQuestions: z.array(ClarificationQuestionSchema).optional(),
  recommendations: z.array(z.any()).optional(), // ScoredProduct[]
  comparisonData: z.any().optional(), // ComparisonResult
  preferenceMemory: PreferenceMemorySchema,
  cart: z.any().optional(),
  suggestedAccessories: z.array(z.any()).optional(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// ─── SSE Event Types ───────────────────────────────────────────────
export const SSEEventTypeSchema = z.enum([
  "message",
  "clarification",
  "recommendations",
  "comparison",
  "memory",
  "accessories",
  "cart",
  "error",
  "done",
]);
export type SSEEventType = z.infer<typeof SSEEventTypeSchema>;

export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
}
