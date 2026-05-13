import { NextRequest, NextResponse } from "next/server";
import { CartRequestSchema } from "@/types/cart";
import { handleCartAction } from "@/services/cart.service";
import { errorResponse, successResponse } from "@/types/api";

/**
 * POST /api/cart
 * Cart operations: create, add, update, remove, get.
 *
 * Body: { sessionId: string, action: "create"|"add"|"update"|"remove"|"get", productId?: string, quantity?: number }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const parsed = CartRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", parsed.error.format()),
        { status: 400 }
      );
    }

    const { sessionId, action, productId, variantId, quantity, lineItemId } = parsed.data;

    const result = await handleCartAction(sessionId, action, {
      productId,
      variantId,
      quantity,
      lineItemId,
    });

    return NextResponse.json(
      successResponse(result, { processingTimeMs: Date.now() - startTime }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/cart] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json(
      errorResponse(status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR", message),
      { status }
    );
  }
}
