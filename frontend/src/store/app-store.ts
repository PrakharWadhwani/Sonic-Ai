import { Headphone, headphones } from '@/data/headphones';

export interface Preference {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  type: 'headphone' | 'accessory';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: string[];
  reasoning?: string;
  isThinking?: boolean;
}

export interface AppState {
  messages: Message[];
  recommendations: Headphone[];
  preferences: Preference[];
  cart: CartItem[];
  isCartOpen: boolean;
  isThinking: boolean;
  comparisonItems: Headphone[];
  showComparison: boolean;
  reasoning: string;
}

// Simple state management for the demo
let state: AppState = {
  messages: [],
  recommendations: [],
  preferences: [],
  cart: [],
  isCartOpen: false,
  isThinking: false,
  comparisonItems: [],
  showComparison: false,
  reasoning: '',
};

let listeners: Set<() => void> = new Set();

export function getState(): AppState {
  return state;
}

export function setState(newState: Partial<AppState>) {
  state = { ...state, ...newState };
  listeners.forEach(l => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// AI reasoning engine - simulates intelligent recommendations
export function getRecommendations(preferences: Preference[]): { products: Headphone[]; reasoning: string } {
  let scored = headphones.map(h => {
    let score = 0;
    let reasons: string[] = [];

    preferences.forEach(pref => {
      const key = pref.label.toLowerCase();
      const val = pref.value.toLowerCase();

      if (key === 'budget') {
        const budget = parseInt(val.replace(/[^0-9]/g, ''));
        if (h.price <= budget) {
          score += 3;
          reasons.push('within budget');
        } else {
          score -= 2;
        }
      }

      if (key === 'use case') {
        if (val.includes('travel') && h.category === 'travel') { score += 5; reasons.push('great for travel'); }
        if (val.includes('gaming') && h.category === 'gaming') { score += 5; reasons.push('designed for gaming'); }
        if (val.includes('workout') && h.category === 'workout') { score += 5; reasons.push('built for workouts'); }
        if (val.includes('office') && h.category === 'office') { score += 5; reasons.push('perfect for office'); }
        if (val.includes('music') && h.category === 'audiophile') { score += 5; reasons.push('audiophile-grade sound'); }
        if (val.includes('calls') || val.includes('meeting') || val.includes('zoom')) {
          score += h.micQuality * 0.5;
          if (h.micQuality >= 8) reasons.push('excellent microphone');
        }
        if (val.includes('flight') || val.includes('plane')) {
          score += h.anc * 0.5;
          score += h.comfort * 0.3;
          if (h.anc >= 8) reasons.push('superior noise cancelling');
        }
      }

      if (key === 'priority') {
        if (val.includes('comfort')) { score += h.comfort * 0.5; if (h.comfort >= 9) reasons.push('exceptional comfort'); }
        if (val.includes('sound')) { score += h.soundQuality * 0.5; if (h.soundQuality >= 9) reasons.push('premium sound quality'); }
        if (val.includes('battery')) { score += h.batteryLife * 0.1; if (h.batteryLife >= 30) reasons.push('outstanding battery life'); }
        if (val.includes('anc') || val.includes('noise')) { score += h.anc * 0.5; if (h.anc >= 9) reasons.push('top-tier ANC'); }
        if (val.includes('portab')) { score += h.portability * 0.5; if (h.portability >= 8) reasons.push('highly portable'); }
        if (val.includes('mic') || val.includes('call')) { score += h.micQuality * 0.5; if (h.micQuality >= 8) reasons.push('crystal-clear calls'); }
      }

      if (key === 'anc') {
        if (val === 'high' || val === 'yes' || val === 'important') {
          score += h.anc * 0.6;
          if (h.anc >= 9) reasons.push('industry-leading ANC');
        }
        if (val === 'none' || val === 'no') {
          if (h.anc === 0) score += 2;
        }
      }

      if (key === 'sound profile') {
        if (val.includes('bass')) { score += 1; }
        if (val.includes('neutral') || val.includes('flat')) {
          if (h.category === 'audiophile') score += 3;
        }
      }
    });

    return { product: h, score, reasons: [...new Set(reasons)] };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);

  const prefSummary = preferences.map(p => `${p.label}: ${p.value}`).join(', ');
  const reasoning = top.length > 0
    ? `Based on your preferences (${prefSummary}), I've selected these headphones. ${top[0].product.name} leads because it's ${top[0].reasons.join(', ')}. ${top.length > 1 ? `${top[1].product.name} is a strong alternative${top[1].reasons.length > 0 ? ', offering ' + top[1].reasons.join(', ') : ''}.` : ''}`
    : 'Let me know your preferences and I\'ll find the perfect headphones for you.';

  return {
    products: top.map(t => t.product),
    reasoning,
  };
}

// Parse user message to extract preferences
export function parsePreferences(message: string): Preference[] {
  const prefs: Preference[] = [];
  const lower = message.toLowerCase();

  // Budget detection
  const budgetMatch = lower.match(/\$?(\d+)/);
  if (budgetMatch && parseInt(budgetMatch[1]) >= 50) {
    prefs.push({ id: 'budget', label: 'Budget', value: `$${budgetMatch[1]}` });
  }

  // Use case detection
  if (lower.includes('travel') || lower.includes('flight') || lower.includes('plane') || lower.includes('commut')) {
    prefs.push({ id: 'usecase', label: 'Use Case', value: 'Travel' });
  }
  if (lower.includes('gaming') || lower.includes('game')) {
    prefs.push({ id: 'usecase', label: 'Use Case', value: 'Gaming' });
  }
  if (lower.includes('workout') || lower.includes('gym') || lower.includes('running') || lower.includes('exercise')) {
    prefs.push({ id: 'usecase', label: 'Use Case', value: 'Workout' });
  }
  if (lower.includes('office') || lower.includes('work') || lower.includes('zoom') || lower.includes('meeting') || lower.includes('call')) {
    prefs.push({ id: 'usecase-calls', label: 'Use Case', value: 'Calls & Meetings' });
  }
  if (lower.includes('music') || lower.includes('audiophile') || lower.includes('studio')) {
    prefs.push({ id: 'usecase-music', label: 'Use Case', value: 'Music Listening' });
  }

  // Priority detection
  if (lower.includes('comfort')) {
    prefs.push({ id: 'priority-comfort', label: 'Priority', value: 'Comfort' });
  }
  if (lower.includes('noise cancel') || lower.includes('anc') || lower.includes('quiet') || lower.includes('silence')) {
    prefs.push({ id: 'priority-anc', label: 'ANC', value: 'High' });
  }
  if (lower.includes('battery') || lower.includes('long lasting')) {
    prefs.push({ id: 'priority-battery', label: 'Priority', value: 'Battery Life' });
  }
  if (lower.includes('sound quality') || lower.includes('audio quality')) {
    prefs.push({ id: 'priority-sound', label: 'Priority', value: 'Sound Quality' });
  }
  if (lower.includes('microphone') || lower.includes('mic quality')) {
    prefs.push({ id: 'priority-mic', label: 'Priority', value: 'Microphone Quality' });
  }
  if (lower.includes('portable') || lower.includes('compact') || lower.includes('light')) {
    prefs.push({ id: 'priority-portable', label: 'Priority', value: 'Portability' });
  }

  return prefs;
}
