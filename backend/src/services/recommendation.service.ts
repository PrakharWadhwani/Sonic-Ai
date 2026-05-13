import { headphoneProducts } from "@/data/products";
import { rankProducts } from "@/ranking/scoring";
import { compareProducts } from "@/ranking/comparator";
import { getOrCreateSession } from "@/memory/session";
import type { PreferenceMemory } from "@/types/chat";
import type { ScoredProduct, ComparisonResult } from "@/types/recommendation";
import { getProductsByIds } from "./product.service";

/**
 * Get ranked recommendations for a session.
 */
export function getRecommendations(
  sessionId: string,
  options?: {
    filters?: { category?: string; style?: string; minPrice?: number; maxPrice?: number; tags?: string[] };
    weightOverrides?: Record<string, number>;
    limit?: number;
  }
): ScoredProduct[] {
  const session = getOrCreateSession(sessionId);
  const preferences = session.preferences;
  const limit = options?.limit || 5;

  // Start with all products, then apply optional filters
  let candidates = [...headphoneProducts];

  if (options?.filters) {
    const f = options.filters;
    candidates = candidates.filter((p) => {
      if (f.category && p.category !== f.category) return false;
      if (f.style && p.style !== f.style) return false;
      if (f.minPrice && p.price < f.minPrice) return false;
      if (f.maxPrice && p.price > f.maxPrice) return false;
      if (f.tags && f.tags.length > 0) {
        if (!f.tags.some((t) => p.tags.includes(t))) return false;
      }
      return true;
    });
  }

  return rankProducts(candidates, preferences, limit, options?.weightOverrides);
}

/**
 * Compare specific products for a session.
 */
export function getComparison(
  sessionId: string,
  productIds: string[]
): ComparisonResult | null {
  const session = getOrCreateSession(sessionId);
  const products = getProductsByIds(productIds);

  if (products.length < 2) return null;

  return compareProducts(products, session.preferences);
}

/**
 * Get recommendations based on raw preferences (no session needed).
 */
export function getRecommendationsFromPreferences(
  preferences: PreferenceMemory,
  limit: number = 5
): ScoredProduct[] {
  return rankProducts(headphoneProducts, preferences, limit);
}
