import type { PreferenceMemory, ExtractedIntent } from "@/types/chat";
import type { Session } from "./session";

/**
 * Update session preferences by merging new extracted intent.
 * Uses "latest wins with confidence" strategy.
 */
export function updatePreferences(
  session: Session,
  intent: ExtractedIntent
): PreferenceMemory {
  const current = session.preferences;
  const confidences = intent.confidenceScores || {};

  // ─── Use Cases ─────────────────────────────────────────────────
  if (intent.useCases && intent.useCases.length > 0) {
    // Set primary use case if not set, or if new one has higher confidence
    if (!current.primaryUseCase) {
      current.primaryUseCase = intent.useCases[0];
    }
    // Add any new secondary use cases
    const existing = new Set(current.secondaryUseCases || []);
    for (const uc of intent.useCases) {
      if (uc !== current.primaryUseCase) {
        existing.add(uc);
      }
    }
    current.secondaryUseCases = Array.from(existing);
  }

  // ─── Priorities ────────────────────────────────────────────────
  if (intent.priorities && intent.priorities.length > 0) {
    const existing = new Set(current.priorities || []);
    for (const p of intent.priorities) {
      existing.add(p);
    }
    current.priorities = Array.from(existing);
  }

  // ─── Budget ────────────────────────────────────────────────────
  if (intent.budget) {
    current.budget = {
      min: intent.budget.min ?? current.budget?.min,
      max: intent.budget.max ?? current.budget?.max,
    };
  }

  // ─── Scalar fields (latest wins if confidence is decent) ──────
  if (intent.style && intent.style !== "no-preference" && (confidences["style"] ?? 0) >= 0.5) {
    current.preferredStyle = intent.style;
  } else if (intent.style === "no-preference") {
    current.preferredStyle = null;
  }

  if (intent.ancImportance !== undefined && intent.ancImportance !== null) {
    current.ancImportance = intent.ancImportance;
  }

  if (intent.comfortPriority !== undefined && intent.comfortPriority !== null) {
    current.comfortPriority = intent.comfortPriority;
  }

  if (intent.microphoneNeeded !== undefined && intent.microphoneNeeded !== null) {
    current.microphoneNeeded = intent.microphoneNeeded;
  }

  if (intent.wirelessPreference !== undefined && intent.wirelessPreference !== null) {
    current.wirelessPreference = intent.wirelessPreference;
  }

  if (intent.gamingFocus !== undefined && intent.gamingFocus !== null) {
    current.gamingFocus = intent.gamingFocus;
  }

  if (intent.portabilityNeeds !== undefined && intent.portabilityNeeds !== null) {
    current.portabilityNeeds = intent.portabilityNeeds;
  }

  // ─── Music Genres → Sound Preference ──────────────────────────
  if (intent.musicGenres && intent.musicGenres.length > 0) {
    current.soundPreference = intent.musicGenres.join(", ");
  }

  session.preferences = current;
  session.updatedAt = new Date();

  return current;
}

/**
 * Add a product to the rejected list so it won't be recommended again.
 */
export function rejectProduct(session: Session, productId: string): void {
  if (!session.preferences.rejectedProductIds) {
    session.preferences.rejectedProductIds = [];
  }
  if (!session.preferences.rejectedProductIds.includes(productId)) {
    session.preferences.rejectedProductIds.push(productId);
  }
  session.updatedAt = new Date();
}

/**
 * Apply weight overrides from user ("battery life matters more").
 */
export function applyWeightOverrides(
  session: Session,
  overrides: Record<string, number>
): void {
  session.preferences.weightOverrides = {
    ...(session.preferences.weightOverrides || {}),
    ...overrides,
  };
  session.updatedAt = new Date();
}

/**
 * Get a summary of what we know vs. what we don't.
 */
export function getPreferenceSummary(
  preferences: PreferenceMemory
): { known: string[]; unknown: string[] } {
  const known: string[] = [];
  const unknown: string[] = [];

  if (preferences.primaryUseCase) known.push(`Use case: ${preferences.primaryUseCase}`);
  else unknown.push("primary use case");

  if (preferences.budget?.max || preferences.budget?.min) {
    const min = preferences.budget.min ? `$${preferences.budget.min}` : "";
    const max = preferences.budget.max ? `$${preferences.budget.max}` : "";
    known.push(`Budget: ${min}${min && max ? "–" : ""}${max}`);
  } else unknown.push("budget");

  if (preferences.preferredStyle) known.push(`Style: ${preferences.preferredStyle}`);
  else unknown.push("style preference");

  if (preferences.ancImportance) known.push(`ANC: ${preferences.ancImportance}`);
  else unknown.push("ANC importance");

  if (preferences.comfortPriority) known.push(`Comfort: ${preferences.comfortPriority}`);
  else unknown.push("comfort priority");

  if (preferences.microphoneNeeded !== null && preferences.microphoneNeeded !== undefined) {
    known.push(`Mic needed: ${preferences.microphoneNeeded ? "yes" : "no"}`);
  } else unknown.push("microphone needs");

  if (preferences.wirelessPreference) known.push(`Connectivity: ${preferences.wirelessPreference}`);
  else unknown.push("wired/wireless preference");

  return { known, unknown };
}
