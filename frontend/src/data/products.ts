import type { HeadphoneProduct } from "@/types/product";

export const headphoneProducts: HeadphoneProduct[] = [
  
];

export function getProductById(id: string): HeadphoneProduct | undefined {
  return headphoneProducts.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): HeadphoneProduct[] {
  return headphoneProducts.filter((p) => p.category === category);
}

export function filterProducts(filters: {
  category?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  connectivity?: string;
  minReviewScore?: number;
}): HeadphoneProduct[] {
  return headphoneProducts.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.style && p.style !== filters.style) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.minReviewScore && p.reviewScore < filters.minReviewScore) return false;
    if (filters.connectivity && !p.connectivity.includes(filters.connectivity as never)) return false;
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((t) => p.tags.includes(t));
      if (!hasMatchingTag) return false;
    }
    return true;
  });
}
