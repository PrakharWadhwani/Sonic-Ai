import { z } from "zod";

// ─── Cart Item ─────────────────────────────────────────────────────
export const CartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  imageUrl: z.string().optional(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

// ─── Cart ──────────────────────────────────────────────────────────
export const CartSchema = z.object({
  id: z.string(),
  sessionId: z.string().uuid(),
  items: z.array(CartItemSchema),
  totalAmount: z.number(),
  checkoutUrl: z.string().url().optional(),
  shopifyCartId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Cart = z.infer<typeof CartSchema>;

// ─── Cart Action ───────────────────────────────────────────────────
export const CartActionSchema = z.enum([
  "create",
  "add",
  "update",
  "remove",
  "get",
]);
export type CartAction = z.infer<typeof CartActionSchema>;

// ─── Cart Request ──────────────────────────────────────────────────
export const CartRequestSchema = z.object({
  sessionId: z.string().uuid(),
  action: CartActionSchema,
  productId: z.string().optional(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  lineItemId: z.string().optional(),
});
export type CartRequest = z.infer<typeof CartRequestSchema>;

// ─── Checkout Request ──────────────────────────────────────────────
export const CheckoutRequestSchema = z.object({
  sessionId: z.string().uuid(),
  cartId: z.string().optional(),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

// ─── Accessory ─────────────────────────────────────────────────────
export const AccessorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  compatibleWith: z.array(z.string()), // product category or product ids
  imageUrl: z.string().optional(),
});
export type Accessory = z.infer<typeof AccessorySchema>;
