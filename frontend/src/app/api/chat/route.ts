import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * POST /api/chat — Proxy to backend
 * Supports both streaming (SSE) and non-streaming modes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isStreaming = request.nextUrl.searchParams.get("stream") === "true";

    const url = new URL("/api/chat", BACKEND_URL);
    if (isStreaming) {
      url.searchParams.set("stream", "true");
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (isStreaming) {
      // Forward the SSE stream directly
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[POST /api/chat] Proxy error:", error);
    const message = error instanceof Error ? error.message : "Backend unavailable";
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message } },
      { status: 502 }
    );
  }
}
