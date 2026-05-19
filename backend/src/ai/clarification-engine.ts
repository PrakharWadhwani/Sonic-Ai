import type { ExtractedIntent, ClarificationQuestion, PreferenceMemory } from "@/types/chat";

/**
 * Fields ordered by their impact on recommendation quality.
 * Higher-impact fields get asked about first.
 */
const FIELD_IMPACT_ORDER: {
  field: string;
  label: string;
  impact: number;
}[] = [
  { field: "useCases", label: "primary use case", impact: 10 },
  { field: "budget", label: "budget range", impact: 9 },
  { field: "style", label: "headphone style preference", impact: 8 },
  { field: "ancImportance", label: "noise cancellation needs", impact: 7 },
  { field: "comfortPriority", label: "comfort importance", impact: 6 },
  { field: "microphoneNeeded", label: "microphone needs", impact: 5 },
  { field: "wirelessPreference", label: "wired vs wireless", impact: 4 },
  { field: "portabilityNeeds", label: "portability requirements", impact: 3 },
  { field: "gamingFocus", label: "gaming usage", impact: 2 },
  { field: "musicGenres", label: "music preferences", impact: 1 },
];

/**
 * Confidence threshold below which we should ask a clarification question.
 */
const CONFIDENCE_THRESHOLD = 0.5;

/**
 * Maximum number of questions to ask per turn.
 */
const MAX_QUESTIONS_PER_TURN = 3;

/**
 * Minimum overall confidence needed before we can recommend.
 * Lowered from 0.5 to 0.3 to reduce loop of asking questions (only need ~1-2 fields)
 */
const RECOMMENDATION_CONFIDENCE_THRESHOLD = 0.3;

/**
 * Generates intelligent clarification questions based on what's unknown or uncertain.
 * Questions adapt dynamically based on what IS known.
 */
export function generateClarificationQuestions(
  intent: ExtractedIntent,
  memory: PreferenceMemory
): ClarificationQuestion[] {
  const confidences = intent.confidenceScores || {};
  const questions: ClarificationQuestion[] = [];

  for (const { field, impact } of FIELD_IMPACT_ORDER) {
    if (questions.length >= MAX_QUESTIONS_PER_TURN) break;

    const confidence = confidences[field] ?? 0;
    // Use lower threshold (0.5) for skipping questions - if confidence is decent, don't ask
    if (confidence >= 0.5) continue;

    // Skip fields that memory already has good values for
    if (isFieldKnownInMemory(field, memory)) continue;

    const question = buildQuestionForField(field, intent, memory);
    if (question) {
      questions.push({
        ...question,
        priority: impact >= 7 ? "high" : impact >= 4 ? "medium" : "low",
      });
    }
  }

  return questions;
}

/**
 * Check if we have enough confidence to make recommendations.
 * More lenient: if user has stated a use case clearly, we can recommend.
 */
export function hasEnoughContext(intent: ExtractedIntent, memory: PreferenceMemory): boolean {
  const confidences = intent.confidenceScores || {};

  // Check if we have at least one high-confidence use case from the intent
  const hasHighConfidenceUseCase = intent.useCases && intent.useCases.length > 0 && 
                                    intent.useCases.some((uc) => (confidences[uc] ?? 0) >= 0.7);
  
  if (hasHighConfidenceUseCase || memory.primaryUseCase) {
    // With a clear use case, we have enough to recommend even without other fields
    return true;
  }

  // Fallback: check if we have enough coverage of important fields
  const topFields = FIELD_IMPACT_ORDER.slice(0, 5);
  let knownCount = 0;
  for (const { field } of topFields) {
    if ((confidences[field] ?? 0) >= CONFIDENCE_THRESHOLD || isFieldKnownInMemory(field, memory)) {
      knownCount++;
    }
  }

  return knownCount / topFields.length >= RECOMMENDATION_CONFIDENCE_THRESHOLD;
}

function isFieldKnownInMemory(field: string, memory: PreferenceMemory): boolean {
  switch (field) {
    case "useCases":
      return !!memory.primaryUseCase;
    case "budget":
      return !!(memory.budget?.min || memory.budget?.max);
    case "style":
      return !!memory.preferredStyle && memory.preferredStyle !== "no-preference";
    case "ancImportance":
      return !!memory.ancImportance && memory.ancImportance !== "not-needed";
    case "comfortPriority":
      return !!memory.comfortPriority;
    case "microphoneNeeded":
      return memory.microphoneNeeded !== null && memory.microphoneNeeded !== undefined;
    case "wirelessPreference":
      return !!memory.wirelessPreference && memory.wirelessPreference !== "no-preference";
    case "portabilityNeeds":
      return !!memory.portabilityNeeds;
    case "gamingFocus":
      return memory.gamingFocus !== null && memory.gamingFocus !== undefined;
    case "musicGenres":
      return !!(memory.soundPreference);
    default:
      return false;
  }
}

function buildQuestionForField(
  field: string,
  intent: ExtractedIntent,
  memory: PreferenceMemory
): Omit<ClarificationQuestion, "priority"> | null {
  const useCases = intent.useCases || [];
  const hasTravel = useCases.includes("travel");
  const hasGaming = useCases.includes("gaming");
  const hasWorkout = useCases.includes("workout");
  const hasOffice = useCases.includes("office");
  const hasStudio = useCases.includes("studio");

  switch (field) {
    case "useCases":
      return {
        question: "What will you primarily use these headphones for? For example, travel, gaming, working out, office calls, or just enjoying music at home?",
        field: "useCases",
        options: ["Travel & flights", "Gaming", "Gym & workouts", "Office & calls", "Music at home", "Studio production"],
      };

    case "budget":
      return {
        question: "What's your budget range? This helps me find the best value for your needs.",
        field: "budget",
        options: ["Under $100", "$100–$200", "$200–$350", "$350–$500", "Over $500"],
      };

    case "style":
      if (hasWorkout) {
        return {
          question: "For workouts, do you prefer earbuds that stay secure during movement, or would you consider over-ear headphones?",
          field: "style",
          options: ["Earbuds", "In-ear with hooks", "Over-ear"],
        };
      }
      return {
        question: "Do you have a preference for headphone style? Over-ear gives the best sound and comfort, while earbuds are more portable.",
        field: "style",
        options: ["Over-ear", "On-ear", "In-ear / Earbuds", "No preference"],
      };

    case "ancImportance":
      if (hasTravel) {
        return {
          question: "Since you'll be using these for travel, how important is noise cancellation? Is blocking out airplane/train noise a top priority?",
          field: "ancImportance",
          options: ["Essential — I need silence", "Nice to have", "Not important"],
        };
      }
      if (hasOffice) {
        return {
          question: "Do you work in a noisy environment? Would noise cancellation help you focus?",
          field: "ancImportance",
          options: ["Yes, open-plan office", "Sometimes noisy", "Quiet environment"],
        };
      }
      return {
        question: "How important is noise cancellation for your use?",
        field: "ancImportance",
        options: ["Critical", "Nice to have", "Not needed"],
      };

    case "comfortPriority":
      if (hasOffice || hasTravel) {
        return {
          question: "How many hours per day will you typically wear these? This helps me prioritize comfort for long sessions.",
          field: "comfortPriority",
          options: ["2–4 hours", "4–8 hours", "8+ hours — all day"],
        };
      }
      return {
        question: "Is all-day comfort a major factor, or will you use these for shorter sessions?",
        field: "comfortPriority",
        options: ["Long sessions — comfort is critical", "Medium sessions", "Short sessions — comfort is secondary"],
      };

    case "microphoneNeeded":
      if (hasGaming) {
        return {
          question: "Do you need a high-quality microphone for team chat and Discord, or do you use a separate desk mic?",
          field: "microphoneNeeded",
          options: ["Need built-in mic", "I have a separate mic"],
        };
      }
      return {
        question: "Will you be using these for calls or voice chat? Good microphone quality makes a big difference for work calls.",
        field: "microphoneNeeded",
        options: ["Yes, calls are important", "Occasionally", "No, just for listening"],
      };

    case "wirelessPreference":
      if (hasStudio) {
        return {
          question: "For studio work, do you prefer the reliability of a wired connection, or would wireless with low latency work for you?",
          field: "wirelessPreference",
          options: ["Wired only", "Wireless with low latency", "Both options"],
        };
      }
      return {
        question: "Do you prefer wireless freedom, or is a wired connection fine?",
        field: "wirelessPreference",
        options: ["Wireless", "Wired", "No preference"],
      };

    case "portabilityNeeds":
      return {
        question: "How important is portability? Will you be carrying these in a bag or backpack regularly?",
        field: "portabilityNeeds",
        options: ["Very important — always on the go", "Somewhat — occasional travel", "Not important — home/desk use"],
      };

    case "gamingFocus":
      if (intent.useCases?.some((u) => ["gaming", "esports"].includes(u))) {
        return {
          question: "What type of gaming? Competitive FPS games need ultra-low latency, while casual gaming is more flexible.",
          field: "gamingFocus",
          options: ["Competitive / eSports", "Casual gaming", "Story / single-player"],
        };
      }
      return null; // Don't ask about gaming unprompted

    case "musicGenres":
      return {
        question: "What kind of music do you listen to most? Different headphones excel at different genres.",
        field: "musicGenres",
        options: ["Pop / Rock", "Hip-hop / EDM / Bass-heavy", "Jazz / Classical / Acoustic", "Mixed / Everything"],
      };

    default:
      return null;
  }
}
