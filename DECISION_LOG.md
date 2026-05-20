# 📋 Sonic AI — Decision Log

> A simple log of key decisions made during the design and development of Sonic AI.
> Format: **Considered X, Chose Y, Because Z.**

---

## Architecture Decisions

### D-001: Two-Service Architecture (Frontend + Backend)
- **Considered:** Single Next.js app with API routes serving both UI and AI logic
- **Chose:** Two separate Next.js apps (frontend on :3000, backend on :3001)
- **Because:** Separation of concerns — the backend can be swapped for a different runtime (e.g., Express, Fastify) without touching the UI. Also allows independent deployment and scaling. The frontend proxies all requests to avoid CORS.

---

### D-002: Next.js for the Backend
- **Considered:** Express.js, Fastify, or a dedicated Python FastAPI service
- **Chose:** Next.js 16 API Routes (Node.js runtime)
- **Because:** Consistency with frontend toolchain (same tsconfig, same module system). No extra build pipeline. TypeScript works out of the box. Fast for a hackathon/prototype. The tradeoff is that Next.js is not ideal for long-lived streaming connections — but our SSE implementation handles this adequately.

---

### D-003: In-Memory Session Store
- **Considered:** PostgreSQL (via Drizzle ORM), Redis, Upstash
- **Chose:** In-memory `Map<string, Session>` in Node.js
- **Because:** Zero setup friction for local development and demo. The app works completely offline. The tradeoff (sessions lost on restart, no horizontal scaling) is acceptable for a v1 demo. The code is structured with a clear `session.ts` service layer that would be easy to swap for a database adapter.

---

### D-004: OpenAI Responses API (not Chat Completions)
- **Considered:** `openai.chat.completions.create()` (standard Chat API)
- **Chose:** OpenAI Responses API with `openaiResponseId` chaining
- **Because:** The Responses API supports stateful conversation via response IDs — each call can reference the previous response, so the model has full conversation memory without resending the entire history each time. This reduces token usage on long conversations.

---

### D-005: Dual AI Layer (Frontend + Backend)
- **Considered:** AI logic only on the backend; frontend is purely a display layer
- **Chose:** Lightweight intent extraction + client-side scoring on the frontend as fallback
- **Because:** Resilience. If the backend is slow or down, the frontend can still provide basic recommendations using client-side keyword matching and scoring. The tradeoff is code duplication — both layers have `intent-extractor.ts` and scoring logic.

---

## Data & Product Decisions

### D-006: Shopify Admin API (not Storefront API)
- **Considered:** Shopify Storefront API (public-facing, customer token)
- **Chose:** Shopify Admin API with admin access token
- **Because:** Admin API exposes product tags and metafields needed to store AI scoring parameters (`sound:8`, `comfort:9`, `anc:10`). Storefront API doesn't expose tags by default. The tradeoff is security — admin tokens have broader permissions. All Shopify calls are kept strictly server-side (never exposed to the browser).

---

### D-007: Tag-Based AI Scoring for Shopify Products
- **Considered:** Shopify metafields for scoring data, or a separate database
- **Chose:** Shopify product tags in `key:value` format (e.g. `sound:8`, `anc:9`)
- **Because:** Merchants can control AI scoring directly from the Shopify admin dashboard, no external database needed. Tags are a native Shopify concept. The `mapShopifyProduct()` function parses them at load time. Heuristic defaults handle products without tags.

---

### D-008: 5-Minute Product Cache
- **Considered:** No cache (fetch every request), long-lived cache (1 hour+), Redis cache
- **Chose:** 5-minute in-memory cache in `product.service.ts`
- **Because:** Balances freshness vs. Shopify API rate limits. Most users' sessions are under 5 minutes. Cache invalidation is not needed for a demo — in production, a webhook-triggered invalidation would be added.

---

## UX Decisions

### D-009: Streaming AI Responses
- **Considered:** Wait for full AI response before showing in chat
- **Chose:** Token-by-token streaming via SSE (`?stream=true`)
- **Because:** Dramatically improves perceived responsiveness. A 2-second response that appears character-by-character feels faster than a 0.5-second response that appears all at once. The frontend proxy transparently forwards the stream without buffering.

---

### D-010: Split-Screen Layout (Chat Left, Products Right)
- **Considered:** Full-screen chat with product carousel below; tabbed interface; modal products
- **Chose:** Fixed split-screen — chat on left, recommendations on right
- **Because:** Both the conversation and the product results are equally important. Users should be able to see products updating in real time as they chat without switching views. The tradeoff is limited mobile responsiveness (stacks on small screens).

---

### D-011: Preference Chips as Visual Confirmation
- **Considered:** No visual preference display; a sidebar preference list; inline mentions in chat
- **Chose:** Preference chips below the chat header (Travel · Earbuds · $150)
- **Because:** Users need to know the AI "remembered" what they said. Chips provide immediate confirmation that intent was extracted correctly. They're also interactive — clicking a chip could be used to remove a preference in a future version.

---

### D-012: `whyRecommended` as Human-Readable String
- **Considered:** Show numeric score; show radar chart of dimensions; show no explanation
- **Chose:** Plain-English `whyRecommended` string on each product card
- **Because:** The core value proposition is explainability. A score like "87" means nothing. "Within your $300 budget, offers superior ANC for travel" directly answers the user's question. The string is generated by the recommendation service, not the AI — it's fast and deterministic.

---

## Infrastructure Decisions

### D-013: No Build Step Required for Demo
- **Considered:** Building and deploying to Vercel/Railway
- **Chose:** `npm run dev` on both services locally
- **Because:** Minimizes friction for judges and reviewers. No accounts, no environment setup, no cold starts. The README provides a complete local setup in under 5 minutes.

---

### D-014: Zod for Request Validation
- **Considered:** Manual type checking; joi; yup
- **Chose:** Zod schema validation at the API entry point
- **Because:** Zod integrates naturally with TypeScript — validation and type inference in one. The `ChatRequestSchema` rejects malformed requests before they reach the service layer, providing clear error messages. Zero runtime dependencies beyond what's already in the project.
