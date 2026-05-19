import { apiPost, apiPostStream } from "@/lib/api-client";
import type { ChatResponse, PreferenceMemory } from "@/types/chat";

/**
 * Process a chat message via the backend API (non-streaming).
 */
export async function processChat(
  message: string,
  sessionId?: string,
  preferenceOverrides?: PreferenceMemory
): Promise<ChatResponse> {
  const result = await apiPost<ChatResponse>("/api/chat", {
    sessionId,
    message,
    preferenceOverrides,
  });

  return result;
}

/**
 * Process a chat message via the backend API with SSE streaming.
 * Returns the raw Response for the caller to consume the event stream.
 */
export async function processChatStreaming(
  message: string,
  sessionId?: string,
  preferenceOverrides?: PreferenceMemory
): Promise<Response> {
  return apiPostStream("/api/chat", {
    sessionId,
    message,
    preferenceOverrides,
  });
}
