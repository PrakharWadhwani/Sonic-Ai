import type { HeadphoneProduct } from "@/types/product";
import type { PreferenceMemory } from "@/types/chat";
import type { WeightProfile, ScoreBreakdown, ScoredProduct } from "@/types/recommendation";
import { getDefaultWeights, computeDynamicWeights } from "./weights";
import { generateWhyRecommended, generateWhyNotHigher } from "@/ai/explanation-generator";

/**
 * Score and rank products based on user preferences using weighted multi-factor scoring.
 * Returns top N products sorted by total score with explanations.
 */
export function rankProducts(
  products: HeadphoneProduct[],
  preferences: PreferenceMemory,
  limit: number = 5,
  weightOverrides?: Record<string, number>
): ScoredProduct[] {
  const weights = weightOverrides
    ? computeDynamicWeights(preferences, weightOverrides)
    : computeDynamicWeights(preferences);

  // Score each product
  const scored = products
    .filter((p) => !(preferences.rejectedProductIds || []).includes(p.id))
    .map((product) => {
      const breakdown = computeBreakdown(product, preferences);
      const totalScore = computeWeightedScore(breakdown, weights);
      return { product, breakdown, totalScore };
    });

  // Sort by total score descending
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // Take top N and add explanations
  const topProducts = scored.slice(0, limit);
  const results: ScoredProduct[] = topProducts.map((item, index) => {
    const rank = index + 1;
    const whyRecommended = generateWhyRecommended(item.product, preferences, item.breakdown, rank);
    const whyNotHigher =
      rank > 1
        ? generateWhyNotHigher(item.product, topProducts[0].product, preferences, item.breakdown)
        : undefined;

    return {
      product: item.product,
      totalScore: Math.round(item.totalScore * 1000) / 1000,
      breakdown: item.breakdown,
      explanation: whyRecommended,
      rank,
      whyRecommended,
      whyNotHigher,
    };
  });

  return results;
}

/**
 * Compute raw (0-1) scores for each dimension of a product against user preferences.
 */
function computeBreakdown(product: HeadphoneProduct, preferences: PreferenceMemory): ScoreBreakdown {
  return {
    useCaseFit: computeUseCaseFit(product, preferences),
    comfort: normalize(product.comfort, 1, 10),
    soundQuality: normalize(product.soundQuality, 1, 10),
    batteryLife: normalizeBattery(product.batteryLife),
    priceFit: computePriceFit(product.price, preferences.budget),
    ancFit: computeANCFit(product.noiseCancellation, preferences.ancImportance),
    micFit: computeMicFit(product.microphoneQuality, preferences.microphoneNeeded),
    portabilityFit: normalize(product.portability, 1, 10),
    latencyFit: computeLatencyFit(product.latency, preferences.gamingFocus),
  };
}

/**
 * Compute weighted total score from breakdown and weight profile.
 */
function computeWeightedScore(breakdown: ScoreBreakdown, weights: WeightProfile): number {
  let total = 0;
  const keys = Object.keys(breakdown) as (keyof ScoreBreakdown)[];
  for (const key of keys) {
    total += breakdown[key] * (weights[key] ?? 0);
  }
  return total;
}

// ─── Scoring Functions ─────────────────────────────────────────────

/**
 * Use-case fit: Jaccard-like similarity between product tags/bestFor and user use cases.
 */
function computeUseCaseFit(product: HeadphoneProduct, preferences: PreferenceMemory): number {
  const userUseCases = new Set<string>();
  if (preferences.primaryUseCase) userUseCases.add(preferences.primaryUseCase.toLowerCase());
  for (const uc of preferences.secondaryUseCases || []) {
    userUseCases.add(uc.toLowerCase());
  }
  for (const p of preferences.priorities || []) {
    userUseCases.add(p.toLowerCase());
  }

  if (userUseCases.size === 0) return 0.5; // neutral if no prefs

  const productTerms = new Set([
    ...product.bestFor.map((b) => b.toLowerCase()),
    ...product.tags.map((t) => t.toLowerCase()),
    product.category.toLowerCase(),
  ]);

  let matches = 0;
  for (const uc of userUseCases) {
    for (const pt of productTerms) {
      if (pt.includes(uc) || uc.includes(pt)) {
        matches++;
        break;
      }
    }
  }

  return Math.min(matches / Math.max(userUseCases.size, 1), 1);
}

/**
 * Price fit using Gaussian-like penalty centered on user budget.
 */
function computePriceFit(
  price: number,
  budget?: { min?: number; max?: number }
): number {
  if (!budget || (!budget.min && !budget.max)) return 0.7; // neutral

  const max = budget.max || Infinity;
  const min = budget.min || 0;

  if (price >= min && price <= max) {
    // Within budget — score based on where in range (center = best)
    const mid = (min + max) / 2;
    const range = (max - min) / 2 || 1;
    const deviation = Math.abs(price - mid) / range;
    return 1 - deviation * 0.3; // 0.7-1.0 range
  }

  if (price > max) {
    // Over budget — penalty increases with distance
    const overBy = (price - max) / max;
    return Math.max(0, 0.7 - overBy * 2);
  }

  // Under budget (under min) — slight penalty for suspiciously cheap
  return 0.6;
}

/**
 * ANC fit based on user's stated importance.
 */
function computeANCFit(
  ancRating: number,
  importance?: "critical" | "nice-to-have" | "not-needed" | null
): number {
  if (!importance || importance === "not-needed") {
    return ancRating > 0 ? 0.5 : 0.7; // Neutral or slight bonus for no ANC
  }
  if (importance === "critical") {
    return normalize(ancRating, 0, 10);
  }
  // nice-to-have
  return 0.4 + normalize(ancRating, 0, 10) * 0.6;
}

/**
 * Microphone fit based on whether user needs one.
 */
function computeMicFit(micRating: number, micNeeded?: boolean | null): number {
  if (!micNeeded) return 0.5; // neutral
  return normalize(micRating, 0, 10);
}

/**
 * Latency fit — only matters for gaming.
 */
function computeLatencyFit(latency: number, gamingFocus?: boolean | null): number {
  if (!gamingFocus) return 0.5; // neutral
  if (latency === 0) return 0.3; // wired-only, usually fine for gaming
  if (latency <= 10) return 1.0;
  if (latency <= 20) return 0.9;
  if (latency <= 40) return 0.7;
  if (latency <= 60) return 0.4;
  return 0.2;
}

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function normalizeBattery(hours: number): number {
  if (hours === 0) return 0.3; // wired headphones
  if (hours >= 40) return 1.0;
  if (hours >= 30) return 0.9;
  if (hours >= 20) return 0.7;
  if (hours >= 10) return 0.5;
  return 0.3;
}
