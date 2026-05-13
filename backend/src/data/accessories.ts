import type { Accessory } from "@/types/cart";

export const accessories: Accessory[] = [
  // ─── Travel Accessories ──────────────────────────────────────
  { id: "acc-001", name: "Premium Headphone Case", description: "Hard-shell protective case with magnetic closure and cable organizer pocket.", price: 39, category: "case", compatibleWith: ["travel", "noise-cancelling", "office", "audiophile"] },
  { id: "acc-002", name: "Airplane Audio Adapter", description: "Dual-prong to 3.5mm airplane seat adapter with gold-plated connectors.", price: 9, category: "adapter", compatibleWith: ["travel", "noise-cancelling"] },
  { id: "acc-003", name: "Memory Foam Neck Pillow", description: "Ergonomic travel neck pillow designed to work with over-ear headphones.", price: 29, category: "comfort", compatibleWith: ["travel"] },

  // ─── Audiophile Accessories ──────────────────────────────────
  { id: "acc-004", name: "Portable DAC/Amp", description: "Hi-res portable DAC/amplifier supporting up to 32bit/384kHz. Powers high-impedance headphones.", price: 149, category: "dac", compatibleWith: ["audiophile", "studio", "monitoring"] },
  { id: "acc-005", name: "Balanced 4.4mm Cable", description: "OFC balanced cable with 4.4mm Pentaconn termination for superior channel separation.", price: 59, category: "cable", compatibleWith: ["audiophile", "studio"] },
  { id: "acc-006", name: "Desktop Headphone Amp", description: "Class-A desktop amplifier with tube pre-amp stage for warm, rich sound.", price: 249, category: "amplifier", compatibleWith: ["audiophile"] },

  // ─── Gaming Accessories ──────────────────────────────────────
  { id: "acc-007", name: "Detachable Boom Mic Pro", description: "Broadcast-quality detachable boom microphone with noise gate and pop filter.", price: 49, category: "microphone", compatibleWith: ["gaming", "esports"] },
  { id: "acc-008", name: "USB Sound Card", description: "External USB sound card with virtual 7.1 surround and mic input.", price: 35, category: "dac", compatibleWith: ["gaming", "esports"] },
  { id: "acc-009", name: "RGB Headphone Stand", description: "Aluminum headphone stand with USB hub and customizable RGB lighting.", price: 45, category: "stand", compatibleWith: ["gaming", "esports"] },

  // ─── Workout Accessories ─────────────────────────────────────
  { id: "acc-010", name: "Silicone Ear Tips Pack", description: "6 pairs of medical-grade silicone ear tips in S/M/L for perfect seal.", price: 14, category: "ear-tips", compatibleWith: ["workout", "lifestyle"] },
  { id: "acc-011", name: "Sport Carry Case", description: "Compact, splash-resistant carry case with carabiner clip.", price: 19, category: "case", compatibleWith: ["workout"] },
  { id: "acc-012", name: "Earbuds Cleaning Kit", description: "Precision cleaning tools, anti-bacterial spray, and microfiber cloth.", price: 12, category: "maintenance", compatibleWith: ["workout", "lifestyle", "travel"] },

  // ─── Office Accessories ──────────────────────────────────────
  { id: "acc-013", name: "Bluetooth USB Dongle", description: "Low-latency Bluetooth 5.3 USB adapter for PC/Mac. Certified for Zoom/Teams.", price: 29, category: "dongle", compatibleWith: ["office"] },
  { id: "acc-014", name: "Desktop Headphone Stand", description: "Minimalist aluminum headphone stand with cable management.", price: 35, category: "stand", compatibleWith: ["office", "studio", "audiophile"] },
  { id: "acc-015", name: "Replacement Ear Pads (Protein Leather)", description: "Premium protein leather replacement ear pads. Universal fit for over-ear headphones.", price: 24, category: "ear-pads", compatibleWith: ["office", "travel", "noise-cancelling", "studio"] },

  // ─── Studio Accessories ──────────────────────────────────────
  { id: "acc-016", name: "Coiled Studio Cable", description: "3m coiled cable with 6.35mm adapter for studio equipment.", price: 22, category: "cable", compatibleWith: ["studio", "monitoring"] },
  { id: "acc-017", name: "Headphone Extension Cable", description: "3m oxygen-free copper extension cable with gold-plated 3.5mm jacks.", price: 18, category: "cable", compatibleWith: ["studio", "audiophile", "monitoring", "gaming"] },

  // ─── Universal ───────────────────────────────────────────────
  { id: "acc-018", name: "Wireless Charging Pad", description: "Qi-compatible wireless charging pad for earbuds cases.", price: 25, category: "charger", compatibleWith: ["lifestyle", "workout", "travel"] },
];

export function getAccessoriesForCategory(category: string): Accessory[] {
  return accessories.filter((a) => a.compatibleWith.includes(category));
}

export function getAccessoriesForProduct(productCategory: string): Accessory[] {
  return getAccessoriesForCategory(productCategory);
}
