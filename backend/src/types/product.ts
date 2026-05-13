import { z } from "zod";

// ─── Headphone Style ───────────────────────────────────────────────
export const HeadphoneStyleSchema = z.enum([
  "over-ear",
  "on-ear",
  "in-ear",
  "earbuds",
]);
export type HeadphoneStyle = z.infer<typeof HeadphoneStyleSchema>;

// ─── Headphone Category ────────────────────────────────────────────
export const HeadphoneCategorySchema = z.enum([
  "noise-cancelling",
  "gaming",
  "workout",
  "studio",
  "travel",
  "office",
  "audiophile",
  "lifestyle",
  "kids",
  "monitoring",
  "esports",
]);
export type HeadphoneCategory = z.infer<typeof HeadphoneCategorySchema>;

// ─── Connectivity ──────────────────────────────────────────────────
export const ConnectivitySchema = z.enum(["bluetooth", "wired", "both", "usb-c", "2.4ghz-wireless"]);
export type Connectivity = z.infer<typeof ConnectivitySchema>;

// ─── Headphone Product ─────────────────────────────────────────────
export const HeadphoneProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  brand: z.string().min(1),
  price: z.number().positive(),
  category: HeadphoneCategorySchema,
  style: HeadphoneStyleSchema,
  description: z.string(),

  // Ratings (1-10 scale)
  soundQuality: z.number().min(1).max(10),
  comfort: z.number().min(1).max(10),
  noiseCancellation: z.number().min(0).max(10), // 0 = no ANC
  microphoneQuality: z.number().min(0).max(10), // 0 = no mic
  portability: z.number().min(1).max(10),

  // Specs
  batteryLife: z.number().min(0), // hours, 0 = wired only
  latency: z.number().min(0), // ms
  connectivity: z.array(ConnectivitySchema),
  wirelessCodecs: z.array(z.string()).optional(),
  impedance: z.number().optional(), // ohms
  driverSize: z.string().optional(), // e.g. "40mm"
  weight: z.number().optional(), // grams
  ipRating: z.string().optional(), // e.g. "IP68"
  foldable: z.boolean().optional(),

  // Metadata
  bestFor: z.array(z.string()),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  reviewScore: z.number().min(0).max(5),
  tags: z.array(z.string()),
  imageUrl: z.string().url().optional(),
  shopifyVariantId: z.string().optional(),
});
export type HeadphoneProduct = z.infer<typeof HeadphoneProductSchema>;

// ─── Product Filters ───────────────────────────────────────────────
export const ProductFilterSchema = z.object({
  category: HeadphoneCategorySchema.optional(),
  style: HeadphoneStyleSchema.optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  connectivity: ConnectivitySchema.optional(),
  minReviewScore: z.number().min(0).max(5).optional(),
});
export type ProductFilter = z.infer<typeof ProductFilterSchema>;
