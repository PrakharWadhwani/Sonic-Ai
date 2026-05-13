import type { HeadphoneProduct } from "@/types/product";
import type { PreferenceMemory } from "@/types/chat";
import type { ComparisonResult, ComparisonDimension } from "@/types/recommendation";
import { generateComparisonSummary } from "@/ai/explanation-generator";

/**
 * All available comparison dimensions with labels and extraction logic.
 */
const DIMENSIONS: {
  key: string;
  label: string;
  extract: (p: HeadphoneProduct) => number | string;
  unit: string;
  higherIsBetter: boolean;
}[] = [
  { key: "soundQuality", label: "Sound Quality", extract: (p) => p.soundQuality, unit: "/10", higherIsBetter: true },
  { key: "comfort", label: "Comfort", extract: (p) => p.comfort, unit: "/10", higherIsBetter: true },
  { key: "noiseCancellation", label: "Noise Cancellation", extract: (p) => p.noiseCancellation, unit: "/10", higherIsBetter: true },
  { key: "batteryLife", label: "Battery Life", extract: (p) => p.batteryLife, unit: "h", higherIsBetter: true },
  { key: "microphoneQuality", label: "Microphone", extract: (p) => p.microphoneQuality, unit: "/10", higherIsBetter: true },
  { key: "portability", label: "Portability", extract: (p) => p.portability, unit: "/10", higherIsBetter: true },
  { key: "price", label: "Price", extract: (p) => p.price, unit: "$", higherIsBetter: false },
  { key: "latency", label: "Latency", extract: (p) => p.latency, unit: "ms", higherIsBetter: false },
  { key: "weight", label: "Weight", extract: (p) => p.weight || 0, unit: "g", higherIsBetter: false },
  { key: "reviewScore", label: "Review Score", extract: (p) => p.reviewScore, unit: "/5", higherIsBetter: true },
];

/**
 * Generate a structured comparison between multiple products.
 * Focuses on dimensions the user cares about based on their preferences.
 */
export function compareProducts(
  products: HeadphoneProduct[],
  preferences: PreferenceMemory
): ComparisonResult {
  // Pick relevant dimensions based on preferences
  const relevantDims = selectRelevantDimensions(preferences);

  // Build comparison values
  const values: Record<string, Record<string, ComparisonDimension>> = {};
  const winners: Record<string, string> = {};

  for (const dim of relevantDims) {
    let bestId = products[0].id;
    let bestScore = -Infinity;

    for (const product of products) {
      const rawValue = dim.extract(product);
      const numValue = typeof rawValue === "number" ? rawValue : 0;

      // Normalize to 0-1
      const allValues = products.map((p) => {
        const v = dim.extract(p);
        return typeof v === "number" ? v : 0;
      });
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const range = max - min || 1;
      let normalized = (numValue - min) / range;
      if (!dim.higherIsBetter) normalized = 1 - normalized;

      // Store
      if (!values[product.id]) values[product.id] = {};
      values[product.id][dim.key] = {
        value: rawValue,
        normalizedScore: Math.round(normalized * 100) / 100,
        label: `${rawValue}${dim.unit}`,
      };

      // Track winner
      const compareValue = dim.higherIsBetter ? numValue : -numValue;
      if (compareValue > bestScore) {
        bestScore = compareValue;
        bestId = product.id;
      }
    }

    winners[dim.key] = bestId;
  }

  const summary = generateComparisonSummary(products, preferences);

  return {
    products,
    dimensions: relevantDims.map((d) => d.key),
    values,
    winners,
    summary,
  };
}

/**
 * Select comparison dimensions based on user preferences.
 * Always includes sound, comfort, price. Adds others based on what the user cares about.
 */
function selectRelevantDimensions(preferences: PreferenceMemory) {
  const selected = new Set(["soundQuality", "comfort", "price"]);

  if (preferences.ancImportance && preferences.ancImportance !== "not-needed") {
    selected.add("noiseCancellation");
  }
  if (preferences.microphoneNeeded) {
    selected.add("microphoneQuality");
  }
  if (preferences.portabilityNeeds === "high") {
    selected.add("portability");
    selected.add("batteryLife");
  }
  if (preferences.gamingFocus) {
    selected.add("latency");
  }
  // Always show battery for wireless
  if (preferences.wirelessPreference === "wireless") {
    selected.add("batteryLife");
  }

  // Add review score
  selected.add("reviewScore");

  return DIMENSIONS.filter((d) => selected.has(d.key));
}
