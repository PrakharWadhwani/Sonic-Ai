import { NextRequest, NextResponse } from "next/server";
import { CheckoutRequestSchema } from "@/types/cart";
import { getCheckoutUrl } from "@/services/cart.service";
import { getAccessoriesForProduct } from "@/data/accessories";
import { getOrCreateSession } from "@/memory/session";
import { getRecommendations } from "@/services/recommendation.service";
import { errorResponse, successResponse } from "@/types/api";

/**
 * POST /api/checkout
 * Generate a checkout URL for the current cart.
 * Also returns accessory upsell suggestions.
 *
 * Body: { sessionId: string, cartId?: string }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const parsed = CheckoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", parsed.error.format()),
        { status: 400 }
      );
    }

    const { sessionId } = parsed.data;

    // Get checkout URL
    const checkoutUrl = getCheckoutUrl(sessionId);

    if (!checkoutUrl) {
      return NextResponse.json(
        errorResponse("EMPTY_CART", "Cart is empty. Add items before checkout."),
        { status: 400 }
      );
    }

    // Get upsell accessory suggestions based on session preferences
    const session = getOrCreateSession(sessionId);
    let upsellAccessories: unknown[] = [];
    if (session.preferences.primaryUseCase) {
      upsellAccessories = getAccessoriesForProduct(session.preferences.primaryUseCase).slice(0, 3);
    }

    return NextResponse.json(
      successResponse(
        {
          checkoutUrl,
          upsellAccessories,
          message: "Ready to checkout! Click the URL to complete your purchase.",
        },
        { processingTimeMs: Date.now() - startTime }
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/checkout] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message),
      { status: 500 }
    );
  }
}
