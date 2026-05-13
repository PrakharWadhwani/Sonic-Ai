import type { WeightProfile } from "@/types/recommendation";
import type { PreferenceMemory } from "@/types/chat";

/**
 * Default weight distribution for recommendation scoring.
 */
export function getDefaultWeights(): WeightProfile {
  return {
    useCaseFit: 0.25,
    comfort: 0.15,
    soundQuality: 0.15,
    batteryLife: 0.08,
    priceFit: 0.10,
    ancFit: 0.10,
    micFit: 0.07,
    portabilityFit: 0.05,
    latencyFit: 0.05,
  };
}

/**
 * Compute dynamic weights based on user preferences.
 * Adjusts weights so that dimensions the user cares about get more weight.
 * Then applies any explicit overrides from the user.
 */
export function computeDynamicWeights(
  preferences: PreferenceMemory,
  overrides?: Record<string, number>
): WeightProfile {
  const weights = getDefaultWeights();

  // ─── Boost weights based on preferences ──────────────────────

  // ANC importance
  if (preferences.ancImportance === "critical") {
    weights.ancFit = 0.20;
  } else if (preferences.ancImportance === "not-needed") {
    weights.ancFit = 0.02;
  }

  // Comfort priority
  if (preferences.comfortPriority === "critical") {
    weights.comfort = 0.25;
  } else if (preferences.comfortPriority === "normal") {
    weights.comfort = 0.08;
  }

  // Microphone needed
  if (preferences.microphoneNeeded) {
    weights.micFit = 0.15;
  } else if (preferences.microphoneNeeded === false) {
    weights.micFit = 0.02;
  }

  // Gaming focus — boost latency
  if (preferences.gamingFocus) {
    weights.latencyFit = 0.15;
    weights.micFit = Math.max(weights.micFit, 0.10);
  }

  // Portability
  if (preferences.portabilityNeeds === "high") {
    weights.portabilityFit = 0.12;
    weights.batteryLife = 0.12;
  } else if (preferences.portabilityNeeds === "low") {
    weights.portabilityFit = 0.02;
  }

  // Audiophile / sound-focused
  if (preferences.primaryUseCase === "audiophile" || preferences.soundPreference) {
    weights.soundQuality = 0.30;
  }

  // ─── Apply explicit overrides ────────────────────────────────
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      if (key in weights) {
        (weights as Record<string, number>)[key] = value;
      }
    }
  }

  // ─── Apply memory-stored weight overrides ────────────────────
  if (preferences.weightOverrides) {
    for (const [key, value] of Object.entries(preferences.weightOverrides)) {
      if (key in weights) {
        (weights as Record<string, number>)[key] = value;
      }
    }
  }

  // ─── Normalize so weights sum to 1.0 ─────────────────────────
  return normalizeWeights(weights);
}

/**
 * Normalize weight profile so all values sum to 1.0.
 */
function normalizeWeights(weights: WeightProfile): WeightProfile {
  const keys = Object.keys(weights) as (keyof WeightProfile)[];
  const sum = keys.reduce((acc, key) => acc + weights[key], 0);

  if (sum === 0) return getDefaultWeights();

  const normalized = { ...weights };
  for (const key of keys) {
    normalized[key] = weights[key] / sum;
  }
  return normalized;
}
