export interface Headphone {
  id: string;
  name: string;
  brand: string;
  price: number;
  soundQuality: number; // 1-10
  comfort: number; // 1-10
  batteryLife: number; // hours
  anc: number; // 1-10
  micQuality: number; // 1-10
  portability: number; // 1-10
  latency: number; // ms
  weight: number; // grams
  pros: string[];
  cons: string[];
  tags: string[];
  image: string;
  category: 'travel' | 'gaming' | 'workout' | 'audiophile' | 'office';
  color: string;
  description: string;
}

export const headphones: Headphone[] = [
  // TRAVEL ANC HEADPHONES
  
];

export const accessories = [
  
];

export type Badge = 'Best ANC' | 'Best Battery' | 'Travel Pick' | 'Best for Calls' | 'Audiophile Choice' | 'Best Comfort' | 'Best for Gaming' | 'Best for Workout' | 'Best Value' | 'Office Pick' | 'Studio Grade' | 'Unique Design' | 'Best Durability';

export const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
  
};
