# 🔧 Sonic AI — Technical Document

> **Architecture, implementation decisions, failure handling, and limitations.**

---

## 1. System Architecture

```
User Browser (port 3000)
        │
        ▼
┌───────────────────────────────────────────────┐
│   FRONTEND — Next.js 16 App Router            │
│                                               │
│  Components: ChatPanel, RecommendationPanel   │
│  State: useStore (React Context)              │
│  AI Layer: intent-extractor (local fallback)  │
│  API Proxy: /api/chat, /api/products, etc.    │
└────────────────────┬──────────────────────────┘
                     │  HTTP → localhost:3001
                     ▼
┌───────────────────────────────────────────────┐
│   BACKEND — Next.js 16 API Routes             │
│                                               │
│  POST /api/chat  → chat.service.ts            │
│  GET  /api/products → product.service.ts      │
│  POST /api/cart  → cart.service.ts            │
│  POST /api/recommend → recommendation.service │
│                                               │
│  AI: OpenAI Responses API (or keyword fallback)│
│  Session: in-memory Map (UUID keyed)          │
└────────────────────┬──────────────────────────┘
                     │  GraphQL (optional)
                     ▼
           Shopify Storefront API
           (or local mock data)
```

---

## 2. Backend Architecture

### 2.1 Chat Service — 13-Step Pipeline

`chat.service.ts` orchestrates every conversation turn:

```
Step 1  →  getOrCreateSession(sessionId)
Step 2  →  addConversationTurn(session, userMessage)
Step 3  →  Apply preferenceOverrides if provided
Step 4  →  extractIntent(message)        ← OpenAI JSON mode or keyword fallback
Step 5  →  mergeIntents(existing, new)   ← smart deduplication + confidence merge
Step 6  →  updatePreferences(session, intent)
Step 7  →  hasEnoughContext()? → clarify vs recommend
Step 8  →  getRecommendations(session, limit:5)
Step 9  →  applyWeightOverrides (keyword boosts)
Step 10 →  generateAIResponse()          ← OpenAI Responses API
Step 11 →  getAccessoriesForProduct()    ← accessory upsell
Step 12 →  Build ChatResponse object
Step 13 →  addConversationTurn(session, assistantResponse)
```

### 2.2 Intent Extraction

`ai/intent-extractor.ts` sends a JSON-mode prompt to OpenAI and returns:

```typescript
interface ExtractedIntent {
  useCases: string[];          // ["travel", "commute"]
  priorities: string[];        // ["comfort", "battery life"]
  budget: { min: number | null; max: number | null };
  style: "over-ear" | "earbuds" | null;
  ancImportance: "critical" | "preferred" | "not-important" | null;
  wirelessPreference: boolean | null;
  micImportance: boolean | null;
  confidenceScores: Record<string, number>;
}
```

**Fallback**: If OpenAI is unavailable, a keyword regex engine pattern-matches terms like "gym", "commute", "$200", "noise cancel" to extract the same structure.

### 2.3 Intent Merging

`mergeIntents(existing, incoming)` is called every turn to accumulate context:
- Arrays (useCases, priorities): deduplicated union
- Scalar fields: incoming wins only if confidence is higher
- Budget: min/max merged independently
- Confidence scores: keep the maximum

### 2.4 Recommendation Scoring

`recommendation.service.ts` scores every product against session preferences:

| Dimension | Default Weight | What It Measures |
|---|---|---|
| priceFit | 0.25 | How well price fits budget |
| soundQuality | 0.15 | Product sound quality rating |
| comfort | 0.15 | Product comfort rating |
| batteryLife | 0.10 | Hours of playback |
| ancFit | 0.15 | ANC level vs stated importance |
| micFit | 0.10 | Mic quality vs need |
| portabilityFit | 0.05 | Portability vs lifestyle |
| latencyFit | 0.05 | Latency vs gaming focus |

Weights are dynamically adjusted via `applyWeightOverrides()` when the user says phrases like "comfort matters more" or "battery is critical".

Returns `ScoredProduct[]` — each with `totalScore`, `rank`, and `whyRecommended` string.

### 2.5 Session Memory

`memory/session.ts` stores sessions in a `Map<string, Session>`:

```typescript
interface Session {
  id: string;
  preferences: PreferenceMemory;
  conversationHistory: ConversationTurn[];
  openaiResponseId?: string;  // For stateful Responses API chaining
}
```

`getConversationForAI()` returns the last 10 turns formatted for OpenAI input.

---

## 3. Frontend Architecture

### 3.1 Global State — `useStore`

All UI state lives in a single React Context (`hooks/use-store.tsx`):

| State | Type | Purpose |
|---|---|---|
| messages | Message[] | Chat history |
| recommendations | Headphone[] | Currently shown products |
| preferences | Preference[] | Detected preference chips |
| cart | CartItem[] | Cart contents |
| sessionId | string | UUID linking to backend session |
| isThinking | boolean | Controls typing indicator |
| comparisonItems | Headphone[] | Products in comparison table |
| wishlist | string[] | Persisted wishlist IDs |
| isDarkMode | boolean | Dark mode state |

### 3.2 API Proxy Layer

The frontend proxies all backend calls to avoid CORS and keep backend URLs server-side:

| Frontend Route | Backend Target |
|---|---|
| POST /api/chat | POST :3001/api/chat |
| GET /api/products | GET :3001/api/products |
| POST /api/cart | POST :3001/api/cart |
| POST /api/recommend | POST :3001/api/recommend |
| POST /api/checkout | POST :3001/api/checkout |

The `/api/chat` proxy supports `?stream=true` — it forwards SSE body directly via `ReadableStream`.

### 3.3 Streaming

When `stream=true` is set:
- Backend: `processChatStreaming()` sends token deltas as SSE `data:` events
- Frontend proxy: forwards raw `response.body` with `text/event-stream` headers
- Frontend component: parses SSE chunks, appending tokens to the message in state

---

## 4. Shopify Integration

### 4.1 Client (`lib/shopify.ts`)

All Shopify communication goes through a single `shopifyFetch<T>(query, variables)` function:
- Sends GraphQL POST to `https://{domain}/admin/api/2024-01/graphql.json`
- Uses `X-Shopify-Access-Token` header
- `isShopifyConfigured()` checks env vars and mock mode flag

### 4.2 Product Service (`services/product.service.ts`)

5-minute in-memory cache sits in front of both Shopify and fallback data:

```
Request → cache fresh? → return cached
       → Shopify configured? → shopifyFetch(PRODUCTS_QUERY) → mapShopifyProduct()
       → else → return local hardcoded products (data/products.ts)
```

`mapShopifyProduct()` infers AI scoring fields from Shopify tags:
- Tag format: `sound:8`, `comfort:9`, `anc:10`
- Falls back to heuristic defaults (earbuds=6h battery, gaming=20ms latency)

### 4.3 Cart Service (`services/cart.service.ts`)

Two-layer approach:
- **Layer 1 (Local)**: In-memory `Map<sessionId, Cart>` — always active, zero latency
- **Layer 2 (Shopify)**: When configured + product has `shopifyVariantId`:
  - First add → `CART_CREATE_MUTATION` → saves `checkoutUrl`
  - Subsequent adds → `CART_LINES_ADD_MUTATION`

The `checkoutUrl` is the real Shopify hosted checkout link users click to pay.

---

## 5. Failure Handling

| Failure | Behavior |
|---|---|
| OpenAI unavailable | Falls back to keyword-matching intent extractor |
| Shopify not configured | Uses hardcoded product catalog (`data/products.ts`) |
| Shopify API error | Logs error, falls back to local data |
| Backend unreachable | Frontend uses client-side scoring engine (`store/app-store.ts`) |
| Session not found | Creates a new session automatically |
| Missing env vars | App detects and switches to mock mode |

---

## 6. Environment Variables

### Backend (`backend/.env.local`)

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | No | Powers AI responses; falls back to keyword matching |
| `SHOPIFY_STORE_DOMAIN` | No | Shopify store URL |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | No | Admin API token |
| `SHOPIFY_MOCK_MODE` | No | Set to `"true"` to force mock data |

### Frontend (`frontend/.env.local`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend server URL |
| `OPENAI_API_KEY` | No | Frontend-side AI fallback |

---

## 7. Known Limitations

1. **In-memory sessions** — Restarting the backend clears all conversation history. Production requires a persistent store (PostgreSQL + Drizzle ORM recommended).

2. **No authentication** — Sessions are UUID-based with no user login. Anyone with a session ID can access that session.

3. **Single-node only** — The in-memory session Map does not replicate across Node.js instances. Horizontal scaling requires an external session store (Redis).

4. **Shopify Admin API** — Using Admin API (not Storefront API) for product fetching requires an admin token, which has broader store permissions than needed. A production version should use Storefront API with a customer token.

5. **Product catalog size** — The Shopify query fetches a max of 50 products (`first: 50`). Larger catalogs require pagination.

6. **No real-time inventory** — `availableForSale` is fetched at product load time and cached for 5 minutes. Products could go out of stock between cache refreshes.

7. **OpenAI rate limits** — No retry logic or exponential backoff is implemented. High-traffic scenarios may hit rate limits.

---

## 8. Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | Next.js | 16.2.6 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Animation | Framer Motion (motion) | 12.x |
| Backend Framework | Next.js API Routes | 16.2.6 |
| AI Provider | OpenAI Node SDK | 6.x |
| Validation | Zod | 4.x |
| Session IDs | uuid | 14.x |
| E-commerce | Shopify GraphQL API | 2024-01 |
