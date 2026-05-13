import { NextRequest, NextResponse } from "next/server";
import { ChatRequestSchema } from "@/types/chat";
import { processChat, processChatStreaming } from "@/services/chat.service";
import { createSSEStream, sseHeaders } from "@/utils/stream";
import { errorResponse, successResponse } from "@/types/api";

/**
 * POST /api/chat
 * Main conversational endpoint. Supports both streaming (SSE) and non-streaming modes.
 *
 * Body: { sessionId?: string, message: string, preferenceOverrides?: object }
 * Query: ?stream=true for SSE streaming
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", parsed.error.format()),
        { status: 400 }
      );
    }

    const { sessionId, message, preferenceOverrides } = parsed.data;
    const isStreaming = request.nextUrl.searchParams.get("stream") === "true";

    if (isStreaming) {
      // ─── Streaming SSE Response ────────────────────────────────
      const { stream, writer } = createSSEStream();

      // Process in background (don't await)
      processChatStreaming(message, writer, sessionId, preferenceOverrides);

      return new Response(stream, {
        headers: sseHeaders(),
      });
    } else {
      // ─── Standard JSON Response ────────────────────────────────
      const response = await processChat(message, sessionId, preferenceOverrides);

      return NextResponse.json(
        successResponse(response, { processingTimeMs: Date.now() - startTime }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("[POST /api/chat] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message),
      { status: 500 }
    );
  }
}
