import { v4 as uuidv4 } from "uuid";
import type { Cart, CartItem, CartAction } from "@/types/cart";
import type { Accessory } from "@/types/cart";
import { getProductById } from "@/data/products";
import { getAccessoriesForProduct } from "@/data/accessories";
import { isShopifyConfigured, shopifyFetch } from "@/lib/shopify";
import { CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION, CART_LINES_REMOVE_MUTATION } from "@/shopify/mutations";
import type { CartCreateResponse, CartLinesAddResponse } from "@/shopify/types";

// In-memory cart store (mock mode)
const carts = new Map<string, Cart>();

/**
 * Execute a cart action (create, add, update, remove, get).
 */
export async function handleCartAction(
  sessionId: string,
  action: CartAction,
  payload: { productId?: string; variantId?: string; quantity?: number; lineItemId?: string }
): Promise<{ cart: Cart; suggestedAccessories?: Accessory[] }> {
  switch (action) {
    case "create":
      return createCart(sessionId);
    case "add":
      return addToCart(sessionId, payload.productId!, payload.quantity || 1);
    case "update":
      return updateCartItem(sessionId, payload.productId!, payload.quantity || 1);
    case "remove":
      return removeFromCart(sessionId, payload.productId!);
    case "get":
      return { cart: getCart(sessionId) };
    default:
      throw new Error(`Unknown cart action: ${action}`);
  }
}

/**
 * Create a new empty cart.
 */
function createCart(sessionId: string): { cart: Cart } {
  const cart: Cart = {
    id: uuidv4(),
    sessionId,
    items: [],
    totalAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  carts.set(sessionId, cart);
  return { cart };
}

/**
 * Add a product to cart by product ID.
 */
async function addToCart(
  sessionId: string,
  productId: string,
  quantity: number
): Promise<{ cart: Cart; suggestedAccessories?: Accessory[] }> {
  let cart = carts.get(sessionId);
  if (!cart) {
    cart = createCart(sessionId).cart;
  }

  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  // Check if already in cart
  const existingIndex = cart.items.findIndex((item) => item.productId === productId);
  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    const item: CartItem = {
      productId: product.id,
      name: `${product.brand} ${product.name}`,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    };
    cart.items.push(item);
  }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cart.updatedAt = new Date().toISOString();
  carts.set(sessionId, cart);

  // Get accessory suggestions
  const suggestedAccessories = getAccessoriesForProduct(product.category);

  // If Shopify is configured, sync to Shopify cart
  if (isShopifyConfigured() && product.shopifyVariantId) {
    try {
      await syncToShopify(cart, product.shopifyVariantId, quantity);
    } catch (error) {
      console.error("Failed to sync to Shopify:", error);
    }
  }

  return { cart, suggestedAccessories };
}

/**
 * Update quantity of an item in cart.
 */
function updateCartItem(
  sessionId: string,
  productId: string,
  quantity: number
): { cart: Cart } {
  const cart = carts.get(sessionId);
  if (!cart) throw new Error("Cart not found");

  const index = cart.items.findIndex((item) => item.productId === productId);
  if (index < 0) throw new Error("Item not in cart");

  if (quantity <= 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].quantity = quantity;
  }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cart.updatedAt = new Date().toISOString();
  carts.set(sessionId, cart);

  return { cart };
}

/**
 * Remove a product from cart.
 */
function removeFromCart(sessionId: string, productId: string): { cart: Cart } {
  return updateCartItem(sessionId, productId, 0);
}

/**
 * Get cart for session (creates empty one if none exists).
 */
function getCart(sessionId: string): Cart {
  const cart = carts.get(sessionId);
  if (!cart) return createCart(sessionId).cart;
  return cart;
}

/**
 * Get checkout URL for a cart.
 */
export function getCheckoutUrl(sessionId: string): string | null {
  const cart = carts.get(sessionId);
  if (!cart || cart.items.length === 0) return null;

  if (cart.checkoutUrl) return cart.checkoutUrl;

  // In mock mode, generate a placeholder checkout URL
  const mockUrl = `https://mock-store.myshopify.com/checkout?cart=${cart.id}`;
  cart.checkoutUrl = mockUrl;
  return mockUrl;
}

/**
 * Sync cart to Shopify (when configured).
 */
async function syncToShopify(cart: Cart, variantId: string, quantity: number): Promise<void> {
  if (!cart.shopifyCartId) {
    // Create new Shopify cart
    const result = await shopifyFetch<CartCreateResponse>(CART_CREATE_MUTATION, {
      input: {
        lines: [{ merchandiseId: variantId, quantity }],
      },
    });

    if (result.cartCreate.userErrors.length > 0) {
      throw new Error(result.cartCreate.userErrors[0].message);
    }

    cart.shopifyCartId = result.cartCreate.cart.id;
    cart.checkoutUrl = result.cartCreate.cart.checkoutUrl;
  } else {
    // Add to existing Shopify cart
    const result = await shopifyFetch<CartLinesAddResponse>(CART_LINES_ADD_MUTATION, {
      cartId: cart.shopifyCartId,
      lines: [{ merchandiseId: variantId, quantity }],
    });

    if (result.cartLinesAdd.userErrors.length > 0) {
      throw new Error(result.cartLinesAdd.userErrors[0].message);
    }

    cart.checkoutUrl = result.cartLinesAdd.cart.checkoutUrl;
  }
}
