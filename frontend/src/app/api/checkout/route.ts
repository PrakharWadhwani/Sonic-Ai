import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * POST /api/checkout — Proxy to backend
 * Generate a checkout URL for the current cart.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const url = new URL("/api/checkout", BACKEND_URL);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[POST /api/checkout] Proxy error:", error);
    const message = error instanceof Error ? error.message : "Backend unavailable";
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message } },
      { status: 502 }
    );
  }
}
