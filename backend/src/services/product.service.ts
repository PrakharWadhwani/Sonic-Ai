import { shopifyFetch, isShopifyConfigured } from "@/lib/shopify";
import { PRODUCTS_QUERY } from "@/shopify/queries";
import type { HeadphoneProduct } from "@/types/product";
import { headphoneProducts as localFallback, filterProducts, getProductById } from "@/data/products";

// ─── In-memory cache ───────────────────────────────────────────────
let cachedProducts: HeadphoneProduct[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Shopify response types ─────────────────────────────────────────
interface ShopifyProductsResponse {
  products: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        descriptionHtml: string;
        handle: string;
        tags: string[];
        variants: {
          edges: Array<{
            node: { id: string; title: string; price: string };
          }>;
        };
        images: {
          edges: Array<{ node: { url: string; altText: string | null } }>;
        };
      };
    }>;
  };
}

/**
 * Map a Shopify product node to the HeadphoneProduct shape.
 * AI scoring fields default to mid-range values; they can be enhanced
 * via Shopify product metafields in the future.
 */
function mapShopifyProduct(node: ShopifyProductsResponse["products"]["edges"][0]["node"]): HeadphoneProduct {
  const price = parseFloat(node.variants.edges[0]?.node.price) || 0;
  const variantId = node.variants.edges[0]?.node.id ?? undefined;
  const imageUrl = node.images.edges[0]?.node.url ?? undefined;

  // Derive a stable UUID-like ID from the Shopify GID
  // e.g. "gid://shopify/Product/1234567890" → last segment
  const rawId = node.id.split("/").pop() ?? node.handle;

  const desc = node.descriptionHtml || "";

  // Parse AI-scoring hints from tags (format: "anc:9", "comfort:8", etc.)
  const tagsStr = desc.toLowerCase() + " " + (node.tags?.join(" ").toLowerCase() || "");
  const extractedTags = tagsStr.match(/\b(anc|comfort|sound|mic|battery|portability|latency|weight):\d+\b/g) ?? [];

  function extractScore(key: string, fallback: number): number {
    const match = extractedTags.find((t) => t.startsWith(key + ":"));
    return match ? Math.min(10, parseInt(match.split(":")[1])) : fallback;
  }

  // Infer category from title/description keywords
  function inferCategory(): HeadphoneProduct["category"] {
    const combined = (node.title + " " + desc).toLowerCase();
    if (combined.includes("gaming") || combined.includes("esport")) return "gaming";
    if (combined.includes("workout") || combined.includes("sport") || combined.includes("gym") || combined.includes("snowboard")) return "workout";
    if (combined.includes("studio") || combined.includes("monitor")) return "studio";
    if (combined.includes("travel") || combined.includes("commut")) return "travel";
    if (combined.includes("office") || combined.includes("call")) return "office";
    if (combined.includes("audiophile") || combined.includes("hi-fi")) return "audiophile";
    if (combined.includes("noise cancel") || combined.includes("anc")) return "noise-cancelling";
    return "lifestyle";
  }

  function inferStyle(): HeadphoneProduct["style"] {
    const combined = (node.title + " " + desc).toLowerCase();
    if (combined.includes("in-ear") || combined.includes("in ear") || combined.includes("iem")) return "in-ear";
    if (combined.includes("earbud") || combined.includes("true wireless") || combined.includes("tws")) return "earbuds";
    if (combined.includes("on-ear") || combined.includes("on ear")) return "on-ear";
    return "over-ear";
  }

  const category = inferCategory();
  const style = inferStyle();

  return {
    id: rawId,
    name: node.title,
    brand: node.title.split(" ")[0] ?? "Unknown",
    price,
    category,
    style,
    description: desc || node.title,
    soundQuality: extractScore("sound", 7),
    comfort: extractScore("comfort", 7),
    noiseCancellation: extractScore("anc", category === "noise-cancelling" ? 9 : 5),
    microphoneQuality: extractScore("mic", 6),
    portability: extractScore("portability", style === "earbuds" || style === "in-ear" ? 9 : 6),
    batteryLife: style === "earbuds" ? 6 : style === "over-ear" ? 30 : 20,
    latency: category === "gaming" ? 20 : 150,
    connectivity: ["bluetooth"],
    bestFor: [category],
    pros: [],
    cons: [],
    reviewScore: 4.2,
    tags: [category, style, ...(node.tags || [])],
    imageUrl,
    shopifyVariantId: variantId,
  };
}

/**
 * Load products from Shopify (with in-memory cache) or fall back to local data.
 */
async function loadProducts(): Promise<HeadphoneProduct[]> {
  // Return cache if fresh
  if (cachedProducts && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedProducts;
  }

  if (isShopifyConfigured()) {
    try {
      const data = await shopifyFetch<ShopifyProductsResponse>(PRODUCTS_QUERY, { first: 50 });
      const products = data.products.edges.map((e) => mapShopifyProduct(e.node));
      cachedProducts = products;
      cacheTimestamp = Date.now();
      console.log(`[product.service] Loaded ${products.length} products from Shopify`);
      return products;
    } catch (err) {
      console.error("[product.service] Shopify fetch failed, using local fallback:", err);
    }
  }

  // Fall back to local static data
  cachedProducts = localFallback;
  cacheTimestamp = Date.now();
  return localFallback;
}

/**
 * Get all products, optionally filtered.
 */
export async function getAllProducts(filters?: import("@/types/product").ProductFilter): Promise<HeadphoneProduct[]> {
  const products = await loadProducts();
  if (!filters) return products;

  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.style && p.style !== filters.style) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.minReviewScore && p.reviewScore < filters.minReviewScore) return false;
    if (filters.connectivity && !p.connectivity.includes(filters.connectivity)) return false;
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((t) => p.tags.includes(t))) return false;
    }
    return true;
  });
}

/**
 * Get a single product by ID.
 */
export async function getProduct(id: string): Promise<HeadphoneProduct | undefined> {
  const products = await loadProducts();
  return products.find((p) => p.id === id) ?? getProductById(id);
}

/**
 * Search products by text query.
 */
export async function searchProducts(query: string): Promise<HeadphoneProduct[]> {
  const products = await loadProducts();
  const lower = query.toLowerCase();
  return products.filter((p) =>
    p.name.toLowerCase().includes(lower) ||
    p.brand.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some((t) => t.includes(lower)) ||
    p.bestFor.some((b) => b.includes(lower)) ||
    p.category.includes(lower)
  );
}

/**
 * Get products by IDs.
 */
export async function getProductsByIds(ids: string[]): Promise<HeadphoneProduct[]> {
  const products = await loadProducts();
  return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as HeadphoneProduct[];
}
