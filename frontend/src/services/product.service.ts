import { apiGet } from "@/lib/api-client";
import type { HeadphoneProduct, ProductFilter } from "@/types/product";

/**
 * Get all products from the backend, optionally filtered.
 */
export async function getAllProducts(filters?: ProductFilter): Promise<HeadphoneProduct[]> {
  const params: Record<string, string> = {};
  if (filters?.category) params.category = filters.category;
  if (filters?.style) params.style = filters.style;
  if (filters?.minPrice !== undefined) params.minPrice = String(filters.minPrice);
  if (filters?.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
  if (filters?.tags?.length) params.tags = filters.tags.join(",");
  if (filters?.connectivity) params.connectivity = filters.connectivity;
  if (filters?.minReviewScore !== undefined) params.minReviewScore = String(filters.minReviewScore);

  const result = await apiGet<{ products: HeadphoneProduct[]; total: number }>("/api/products", params);
  return result.products;
}

/**
 * Get a single product by ID from the backend.
 */
export async function getProduct(id: string): Promise<HeadphoneProduct | undefined> {
  try {
    const result = await apiGet<HeadphoneProduct>("/api/products", { id });
    return result;
  } catch {
    return undefined;
  }
}

/**
 * Search products by text query via the backend.
 */
export async function searchProducts(query: string): Promise<HeadphoneProduct[]> {
  const result = await apiGet<{ products: HeadphoneProduct[]; total: number }>("/api/products", { q: query });
  return result.products;
}

/**
 * Get products by IDs (fetches each individually from backend).
 */
export async function getProductsByIds(ids: string[]): Promise<HeadphoneProduct[]> {
  const results = await Promise.all(ids.map((id) => getProduct(id)));
  return results.filter(Boolean) as HeadphoneProduct[];
}
