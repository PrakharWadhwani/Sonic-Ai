import type { HeadphoneProduct } from "@/types/product";
import type { PreferenceMemory } from "@/types/chat";
import type { ScoreBreakdown } from "@/types/recommendation";

/**
 * Generates a human-readable explanation of why a product was recommended.
 * Links product strengths directly to user's stated preferences.
 */
export function generateWhyRecommended(
  product: HeadphoneProduct,
  preferences: PreferenceMemory,
  breakdown: ScoreBreakdown,
  rank: number
): string {
  const reasons: string[] = [];

  // Use case fit
  if (breakdown.useCaseFit > 0.7) {
    const useCase = preferences.primaryUseCase || preferences.secondaryUseCases?.[0];
    if (useCase) {
      reasons.push(`an excellent match for ${useCase}`);
    }
  }

  // Comfort
  if (preferences.comfortPriority === "critical" && product.comfort >= 9) {
    reasons.push(`outstanding comfort (${product.comfort}/10) for long sessions`);
  } else if (product.comfort >= 8 && breakdown.comfort > 0.6) {
    reasons.push(`great comfort for extended wear`);
  }

  // ANC
  if (preferences.ancImportance === "critical" && product.noiseCancellation >= 8) {
    reasons.push(`top-tier noise cancellation (${product.noiseCancellation}/10)`);
  }

  // Sound quality
  if (product.soundQuality >= 9 && breakdown.soundQuality > 0.5) {
    reasons.push(`exceptional sound quality (${product.soundQuality}/10)`);
  }

  // Battery
  if (preferences.portabilityNeeds === "high" && product.batteryLife >= 30) {
    reasons.push(`marathon ${product.batteryLife}h battery life`);
  }

  // Microphone
  if (preferences.microphoneNeeded && product.microphoneQuality >= 8) {
    reasons.push(`excellent microphone for calls (${product.microphoneQuality}/10)`);
  }

  // Price fit
  if (breakdown.priceFit > 0.8) {
    reasons.push(`well within your budget at $${product.price}`);
  }

  // Portability
  if (preferences.portabilityNeeds === "high" && product.portability >= 8) {
    reasons.push(`highly portable`);
  }

  // Low latency for gaming
  if (preferences.gamingFocus && product.latency <= 20) {
    reasons.push(`ultra-low ${product.latency}ms latency for competitive gaming`);
  }

  if (reasons.length === 0) {
    reasons.push(`a solid all-around choice for your needs`);
  }

  const prefix = rank === 1
    ? `I'm recommending the ${product.name} as your top pick because it's`
    : `The ${product.name} is also worth considering — it's`;

  return `${prefix} ${reasons.join(", ")}.`;
}

/**
 * Generates an explanation of why a product was ranked lower than another.
 * Focuses on the specific tradeoff that caused the lower ranking.
 */
export function generateWhyNotHigher(
  product: HeadphoneProduct,
  higherProduct: HeadphoneProduct,
  preferences: PreferenceMemory,
  breakdown: ScoreBreakdown
): string {
  const weaknesses: string[] = [];

  // Compare on dimensions the user cares about
  if (preferences.ancImportance === "critical" && product.noiseCancellation < higherProduct.noiseCancellation) {
    weaknesses.push(`weaker noise cancellation (${product.noiseCancellation} vs ${higherProduct.noiseCancellation}/10)`);
  }

  if (preferences.comfortPriority === "critical" && product.comfort < higherProduct.comfort) {
    weaknesses.push(`slightly less comfortable (${product.comfort} vs ${higherProduct.comfort}/10)`);
  }

  if (preferences.microphoneNeeded && product.microphoneQuality < higherProduct.microphoneQuality) {
    weaknesses.push(`lower mic quality (${product.microphoneQuality} vs ${higherProduct.microphoneQuality}/10)`);
  }

  if (product.batteryLife < higherProduct.batteryLife && breakdown.batteryLife < 0.5) {
    weaknesses.push(`shorter battery life (${product.batteryLife}h vs ${higherProduct.batteryLife}h)`);
  }

  if (product.soundQuality < higherProduct.soundQuality && breakdown.soundQuality < 0.5) {
    weaknesses.push(`slightly lower sound quality`);
  }

  // Price
  if (preferences.budget?.max && product.price > preferences.budget.max) {
    weaknesses.push(`above your stated budget ($${product.price})`);
  }

  if (weaknesses.length === 0) {
    return `The ${product.name} is very close to the top pick but scored slightly lower overall on your specific priorities.`;
  }

  return `The ${product.name} has ${weaknesses.join(" and ")}, which is why it ranks below the ${higherProduct.name} for your specific needs.`;
}

/**
 * Generates a comparison summary between multiple products.
 */
export function generateComparisonSummary(
  products: HeadphoneProduct[],
  preferences: PreferenceMemory
): string {
  if (products.length < 2) return "";

  const lines: string[] = [`Here's how these compare on what matters most to you:\n`];

  // Determine which dimensions to focus on based on preferences
  const dimensions: { key: keyof HeadphoneProduct; label: string }[] = [];

  if (preferences.ancImportance === "critical" || preferences.ancImportance === "nice-to-have") {
    dimensions.push({ key: "noiseCancellation", label: "Noise Cancellation" });
  }
  if (preferences.comfortPriority === "critical" || preferences.comfortPriority === "important") {
    dimensions.push({ key: "comfort", label: "Comfort" });
  }
  dimensions.push({ key: "soundQuality", label: "Sound Quality" });
  if (preferences.microphoneNeeded) {
    dimensions.push({ key: "microphoneQuality", label: "Microphone" });
  }
  dimensions.push({ key: "batteryLife", label: "Battery Life" });
  dimensions.push({ key: "price", label: "Price" });

  for (const dim of dimensions) {
    const sorted = [...products].sort((a, b) => {
      const aVal = a[dim.key] as number;
      const bVal = b[dim.key] as number;
      return dim.key === "price" ? aVal - bVal : bVal - aVal;
    });

    const winner = sorted[0];
    const winnerVal = winner[dim.key];
    const unit = dim.key === "price" ? "$" : dim.key === "batteryLife" ? "h" : "/10";
    const prefix = dim.key === "price" ? "$" : "";

    lines.push(
      `**${dim.label}**: ${winner.name} leads at ${prefix}${winnerVal}${dim.key !== "price" ? unit : ""}`
    );
  }

  return lines.join("\n");
}
