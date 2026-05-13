import { NextRequest, NextResponse } from "next/server";
import { RecommendRequestSchema } from "@/types/recommendation";
import { getRecommendations, getComparison } from "@/services/recommendation.service";
import { errorResponse, successResponse } from "@/types/api";

/**
 * POST /api/recommend
 * Get ranked recommendations for a session, optionally with filters and weight overrides.
 *
 * Body: { sessionId: string, filters?: object, weightOverrides?: object, limit?: number, compareProductIds?: string[] }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const parsed = RecommendRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", parsed.error.format()),
        { status: 400 }
      );
    }

    const { sessionId, filters, weightOverrides, limit, compareProductIds } = parsed.data;

    // Get ranked recommendations
    const recommendations = getRecommendations(sessionId, {
      filters,
      weightOverrides,
      limit,
    });

    // Get comparison data if specific product IDs provided
    let comparisonData = null;
    if (compareProductIds && compareProductIds.length >= 2) {
      comparisonData = getComparison(sessionId, compareProductIds);
    }

    return NextResponse.json(
      successResponse(
        {
          recommendations,
          comparisonData,
          totalCandidates: recommendations.length,
        },
        { processingTimeMs: Date.now() - startTime }
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/recommend] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message),
      { status: 500 }
    );
  }
}
