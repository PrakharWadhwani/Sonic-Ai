import { apiPost } from "@/lib/api-client";
import type { ScoredProduct, ComparisonResult } from "@/types/recommendation";

/**
 * Get ranked recommendations from the backend for a session.
 */
export async function getRecommendations(
  sessionId: string,
  options?: {
    filters?: { category?: string; style?: string; minPrice?: number; maxPrice?: number; tags?: string[] };
    weightOverrides?: Record<string, number>;
    limit?: number;
  }
): Promise<ScoredProduct[]> {
  const result = await apiPost<{
    recommendations: ScoredProduct[];
    comparisonData: ComparisonResult | null;
    totalCandidates: number;
  }>("/api/recommend", {
    sessionId,
    filters: options?.filters,
    weightOverrides: options?.weightOverrides,
    limit: options?.limit || 5,
  });

  return result.recommendations;
}

/**
 * Compare specific products via the backend.
 */
export async function getComparison(
  sessionId: string,
  productIds: string[]
): Promise<ComparisonResult | null> {
  const result = await apiPost<{
    recommendations: ScoredProduct[];
    comparisonData: ComparisonResult | null;
    totalCandidates: number;
  }>("/api/recommend", {
    sessionId,
    compareProductIds: productIds,
  });

  return result.comparisonData;
}
