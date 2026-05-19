import type { HeadphoneProduct } from "@/types/product";

export const headphoneProducts: HeadphoneProduct[] = [
  {
    id: "sony-wh-1000xm5",
    name: "WH-1000XM5",
    brand: "Sony",
    price: 399.99,
    category: "noise-cancelling",
    style: "over-ear",
    description: "Industry-leading noise cancellation with two processors and eight microphones.",
    soundQuality: 9,
    comfort: 9,
    noiseCancellation: 10,
    microphoneQuality: 8,
    portability: 7,
    batteryLife: 30,
    latency: 150,
    connectivity: ["bluetooth", "wired"],
    bestFor: ["travel", "office"],
    pros: ["Incredible ANC", "Very comfortable", "Great sound"],
    cons: ["Doesn't fold compactly", "Expensive"],
    reviewScore: 4.8,
    tags: ["anc", "travel", "premium", "over-ear", "bluetooth"],
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "apple-airpods-max",
    name: "AirPods Max",
    brand: "Apple",
    price: 549.00,
    category: "noise-cancelling",
    style: "over-ear",
    description: "High-fidelity audio with spatial audio and dynamic head tracking.",
    soundQuality: 9,
    comfort: 8,
    noiseCancellation: 9,
    microphoneQuality: 8,
    portability: 5,
    batteryLife: 20,
    latency: 120,
    connectivity: ["bluetooth"],
    bestFor: ["office", "audiophile"],
    pros: ["Premium build", "Spatial audio", "Seamless Apple integration"],
    cons: ["Heavy", "Very expensive", "Strange case"],
    reviewScore: 4.6,
    tags: ["apple", "premium", "spatial-audio", "over-ear", "anc"],
    imageUrl: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "bose-qc45",
    name: "QuietComfort 45",
    brand: "Bose",
    price: 329.00,
    category: "noise-cancelling",
    style: "over-ear",
    description: "Iconic quiet. Comfort. And sound. The perfect balance of quiet, comfort, and sound.",
    soundQuality: 8,
    comfort: 10,
    noiseCancellation: 9,
    microphoneQuality: 7,
    portability: 8,
    batteryLife: 24,
    latency: 160,
    connectivity: ["bluetooth", "wired"],
    bestFor: ["travel", "office"],
    pros: ["Extremely comfortable", "Folds compactly", "Great ANC"],
    cons: ["Sound is slightly bright", "No EQ in app at launch"],
    reviewScore: 4.7,
    tags: ["bose", "comfort", "travel", "anc", "over-ear"],
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426fa99f5?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "sennheiser-momentum-4",
    name: "Momentum 4 Wireless",
    brand: "Sennheiser",
    price: 349.95,
    category: "audiophile",
    style: "over-ear",
    description: "Audiophile-inspired acoustics with outstanding 60-hour battery life.",
    soundQuality: 10,
    comfort: 8,
    noiseCancellation: 8,
    microphoneQuality: 7,
    portability: 6,
    batteryLife: 60,
    latency: 140,
    connectivity: ["bluetooth", "wired", "usb-c"],
    bestFor: ["audiophile", "travel"],
    pros: ["Unbeatable battery life", "Superb sound quality", "Comfortable"],
    cons: ["ANC not as good as Sony/Bose", "Bland design"],
    reviewScore: 4.6,
    tags: ["audiophile", "battery", "over-ear", "bluetooth"],
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "jabra-elite-8-active",
    name: "Elite 8 Active",
    brand: "Jabra",
    price: 199.99,
    category: "workout",
    style: "earbuds",
    description: "The world's toughest earbuds, fully sweatproof and waterproof.",
    soundQuality: 7,
    comfort: 9,
    noiseCancellation: 7,
    microphoneQuality: 8,
    portability: 10,
    batteryLife: 8,
    latency: 180,
    connectivity: ["bluetooth"],
    bestFor: ["workout", "running"],
    pros: ["Indestructible build", "Secure fit", "Good physical controls"],
    cons: ["ANC is just okay", "Sound is bass-heavy"],
    reviewScore: 4.5,
    tags: ["workout", "sweatproof", "durable", "earbuds", "bluetooth"],
    imageUrl: "https://images.unsplash.com/photo-1590658006821-04f4007d1a7b?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "razer-blackshark-v2-pro",
    name: "BlackShark V2 Pro",
    brand: "Razer",
    price: 199.99,
    category: "gaming",
    style: "over-ear",
    description: "The definitive esports gaming headset with ultra-low latency.",
    soundQuality: 8,
    comfort: 9,
    noiseCancellation: 4,
    microphoneQuality: 10,
    portability: 4,
    batteryLife: 70,
    latency: 20,
    connectivity: ["2.4ghz-wireless", "bluetooth"],
    bestFor: ["gaming", "esports"],
    pros: ["Incredible mic", "Very low latency", "Massive battery life"],
    cons: ["Bulky design", "Not great for commuting"],
    reviewScore: 4.6,
    tags: ["gaming", "esports", "low-latency", "microphone", "over-ear"],
    imageUrl: "https://images.unsplash.com/photo-1612222869049-d8ec83637a3c?auto=format&fit=crop&q=80&w=600",
  }
];

export function getProductById(id: string): HeadphoneProduct | undefined {
  return headphoneProducts.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): HeadphoneProduct[] {
  return headphoneProducts.filter((p) => p.category === category);
}

export function filterProducts(filters: {
  category?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  connectivity?: string;
  minReviewScore?: number;
}): HeadphoneProduct[] {
  return headphoneProducts.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.style && p.style !== filters.style) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.minReviewScore && p.reviewScore < filters.minReviewScore) return false;
    if (filters.connectivity && !p.connectivity.includes(filters.connectivity as never)) return false;
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((t) => p.tags.includes(t));
      if (!hasMatchingTag) return false;
    }
    return true;
  });
}
