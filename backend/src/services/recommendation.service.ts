import { getAllProducts } from "@/services/product.service";
import { rankProducts } from "@/ranking/scoring";
import { compareProducts } from "@/ranking/comparator";
import { getOrCreateSession } from "@/memory/session";
import type { PreferenceMemory } from "@/types/chat";
import type { HeadphoneProduct } from "@/types/product";
import type { ScoredProduct, ComparisonResult } from "@/types/recommendation";

// Shared in-memory product cache used by recommendation engine
// Populated on first call to any recommendation function
let _productCache: HeadphoneProduct[] | null = null;

async function getProducts(): Promise<HeadphoneProduct[]> {
  if (!_productCache) {
    _productCache = await getAllProducts();
  }
  return _productCache;
}

/** Invalidate cache so next call re-fetches from Shopify */
export function invalidateProductCache() {
  _productCache = null;
}

/**
 * Get ranked recommendations for a session.
 */
export async function getRecommendations(
  sessionId: string,
  options?: {
    filters?: { category?: string; style?: string; minPrice?: number; maxPrice?: number; tags?: string[] };
    weightOverrides?: Record<string, number>;
    limit?: number;
  }
): Promise<ScoredProduct[]> {
  const session = getOrCreateSession(sessionId);
  const preferences = session.preferences;
  const limit = options?.limit || 5;

  let candidates = await getProducts();

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
export async function getComparison(
  sessionId: string,
  productIds: string[]
): Promise<ComparisonResult | null> {
  const session = getOrCreateSession(sessionId);
  const allProducts = await getProducts();
  const products = productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as HeadphoneProduct[];

  if (products.length < 2) return null;

  return compareProducts(products, session.preferences);
}

/**
 * Get recommendations based on raw preferences (no session needed).
 */
export async function getRecommendationsFromPreferences(
  preferences: PreferenceMemory,
  limit: number = 5
): Promise<ScoredProduct[]> {
  const products = await getProducts();
  return rankProducts(products, preferences, limit);
}
