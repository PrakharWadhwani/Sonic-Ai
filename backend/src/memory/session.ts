import { v4 as uuidv4 } from "uuid";
import type { PreferenceMemory, ExtractedIntent, ConversationTurn } from "@/types/chat";

/**
 * In-memory session store. 
 * In production, replace with PostgreSQL via Drizzle ORM.
 */

export interface Session {
  id: string;
  preferences: PreferenceMemory;
  conversationHistory: ConversationTurn[];
  openaiResponseId?: string; // For Responses API stateful chaining
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store (replace with DB in production)
const sessions = new Map<string, Session>();

/**
 * Create a new session.
 */
export function createSession(): Session {
  const session: Session = {
    id: uuidv4(),
    preferences: {
      rejectedProductIds: [],
      priorities: [],
    },
    conversationHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  sessions.set(session.id, session);
  return session;
}

/**
 * Get an existing session by ID, or create a new one.
 */
export function getOrCreateSession(sessionId?: string): Session {
  if (sessionId) {
    const existing = sessions.get(sessionId);
    if (existing) return existing;
  }
  return createSession();
}

/**
 * Get session by ID. Returns undefined if not found.
 */
export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

/**
 * Update session's OpenAI response ID for stateful chaining.
 */
export function updateOpenAIResponseId(sessionId: string, responseId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.openaiResponseId = responseId;
    session.updatedAt = new Date();
  }
}

/**
 * Add a conversation turn to session history.
 */
export function addConversationTurn(sessionId: string, turn: ConversationTurn): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.conversationHistory.push(turn);
    session.updatedAt = new Date();
  }
}

/**
 * Get conversation history formatted for OpenAI API.
 */
export function getConversationForAI(
  sessionId: string
): Array<{ role: "user" | "assistant"; content: string }> {
  const session = sessions.get(sessionId);
  if (!session) return [];
  return session.conversationHistory.map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));
}

/**
 * Delete a session.
 */
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

/**
 * Get all active session count (for monitoring).
 */
export function getActiveSessionCount(): number {
  return sessions.size;
}
