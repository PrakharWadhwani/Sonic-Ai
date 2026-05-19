import { apiPost } from "@/lib/api-client";
import type { Cart, CartAction } from "@/types/cart";
import type { Accessory } from "@/types/cart";

/**
 * Execute a cart action via the backend API.
 */
export async function handleCartAction(
  sessionId: string,
  action: CartAction,
  payload: { productId?: string; variantId?: string; quantity?: number; lineItemId?: string }
): Promise<{ cart: Cart; suggestedAccessories?: Accessory[] }> {
  const result = await apiPost<{ cart: Cart; suggestedAccessories?: Accessory[] }>("/api/cart", {
    sessionId,
    action,
    productId: payload.productId,
    variantId: payload.variantId,
    quantity: payload.quantity,
    lineItemId: payload.lineItemId,
  });

  return result;
}
