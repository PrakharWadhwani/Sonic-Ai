import { z } from "zod";
import type { HeadphoneProduct } from "./product";

// ─── Weight Profile ────────────────────────────────────────────────
export const WeightProfileSchema = z.object({
  useCaseFit: z.number().min(0).max(1),
  comfort: z.number().min(0).max(1),
  soundQuality: z.number().min(0).max(1),
  batteryLife: z.number().min(0).max(1),
  priceFit: z.number().min(0).max(1),
  ancFit: z.number().min(0).max(1),
  micFit: z.number().min(0).max(1),
  portabilityFit: z.number().min(0).max(1),
  latencyFit: z.number().min(0).max(1),
});
export type WeightProfile = z.infer<typeof WeightProfileSchema>;

// ─── Score Breakdown ───────────────────────────────────────────────
export const ScoreBreakdownSchema = z.object({
  useCaseFit: z.number(),
  comfort: z.number(),
  soundQuality: z.number(),
  batteryLife: z.number(),
  priceFit: z.number(),
  ancFit: z.number(),
  micFit: z.number(),
  portabilityFit: z.number(),
  latencyFit: z.number(),
});
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

// ─── Scored Product ────────────────────────────────────────────────
export interface ScoredProduct {
  product: HeadphoneProduct;
  totalScore: number;
  breakdown: ScoreBreakdown;
  explanation: string;
  rank: number;
  whyRecommended: string;
  whyNotHigher?: string;
}

// ─── Comparison Dimension ──────────────────────────────────────────
export interface ComparisonDimension {
  value: number | string;
  normalizedScore: number;
  label: string;
}

// ─── Comparison Result ─────────────────────────────────────────────
export interface ComparisonResult {
  products: HeadphoneProduct[];
  dimensions: string[];
  values: Record<string, Record<string, ComparisonDimension>>;
  winners: Record<string, string>; // dimension → product id
  summary: string;
}

// ─── Recommendation Request ────────────────────────────────────────
export const RecommendRequestSchema = z.object({
  sessionId: z.string().uuid(),
  filters: z
    .object({
      category: z.string().optional(),
      style: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
  weightOverrides: z.record(z.string(), z.number()).optional(),
  limit: z.number().min(1).max(10).optional().default(5),
  compareProductIds: z.array(z.string().uuid()).optional(),
});
export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;
