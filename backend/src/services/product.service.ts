import { headphoneProducts, filterProducts, getProductById } from "@/data/products";
import type { HeadphoneProduct, ProductFilter } from "@/types/product";

/**
 * Get all products, optionally filtered.
 */
export function getAllProducts(filters?: ProductFilter): HeadphoneProduct[] {
  if (!filters) return headphoneProducts;
  return filterProducts({
    category: filters.category,
    style: filters.style,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    tags: filters.tags,
    connectivity: filters.connectivity,
    minReviewScore: filters.minReviewScore,
  });
}

/**
 * Get a single product by ID.
 */
export function getProduct(id: string): HeadphoneProduct | undefined {
  return getProductById(id);
}

/**
 * Search products by text query (searches name, brand, description, tags).
 */
export function searchProducts(query: string): HeadphoneProduct[] {
  const lower = query.toLowerCase();
  return headphoneProducts.filter((p) => {
    return (
      p.name.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.includes(lower)) ||
      p.bestFor.some((b) => b.includes(lower)) ||
      p.category.includes(lower)
    );
  });
}

/**
 * Get products by IDs (for recommendation results).
 */
export function getProductsByIds(ids: string[]): HeadphoneProduct[] {
  return ids.map((id) => getProductById(id)).filter(Boolean) as HeadphoneProduct[];
}
