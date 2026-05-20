# 🎧 Sonic AI — Botty Frontend & Backend Walkthrough

A complete technical guide to how the conversational AI assistant ("Botty / SonicAI") works across the full stack.

---

## 📐 Architecture Overview

```
User Types Message
       │
       ▼
┌─────────────────────────────────────────────┐
│            FRONTEND  (Next.js :3000)         │
│                                             │
│  ChatPanel → ChatInput → useStore           │
│                │                            │
│         handleUserMessage()                 │
│                │                            │
│    services/chat.service.ts (frontend)      │
│       POST /api/chat  (Next.js proxy)       │
└──────────────────┬──────────────────────────┘
                   │  HTTP → localhost:3001
                   ▼
┌─────────────────────────────────────────────┐
│            BACKEND  (Next.js :3001)          │
│                                             │
│  POST /api/chat → chat.service.ts           │
│       │                                     │
│  1. getOrCreateSession()                    │
│  2. extractIntent()  ← OpenAI / fallback    │
│  3. mergeIntents() + updatePreferences()    │
│  4. hasEnoughContext() → clarify / rank     │
│  5. getRecommendations() → scored products  │
│  6. generateAIResponse() → OpenAI stream    │
│  7. Return ChatResponse JSON / SSE          │
└─────────────────────────────────────────────┘
```

---

## 🛍️ SHOPIFY INTEGRATION

Shopify sits **between the backend and the product/cart data**. It is the real source of product listings and handles the actual checkout. The backend wraps it with a smart fallback so the app still works without a connected store.

### Where Shopify Lives

```
backend/src/
├── lib/shopify.ts          ← HTTP client (the "connection")
├── shopify/
│   ├── queries.ts          ← GraphQL queries (fetch products)
│   ├── mutations.ts        ← GraphQL mutations (cart operations)
│   └── types.ts            ← TypeScript types for Shopify responses
├── services/
│   ├── product.service.ts  ← Loads products (Shopify → fallback)
│   └── cart.service.ts     ← Manages cart (local + syncs to Shopify)
└── data/products.ts        ← Hardcoded fallback product list
```

---

### `lib/shopify.ts` — The Shopify Client

This is the single function that all Shopify communication goes through:

```typescript
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const SHOPIFY_MOCK_MODE = process.env.SHOPIFY_MOCK_MODE === "true"
```

`shopifyFetch<T>(query, variables)` sends a **GraphQL POST** to:
```
https://{SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json
```
With the `X-Shopify-Access-Token` header. It's fully generic — returns typed `json.data as T`.

`isShopifyConfigured()` returns `true` only when:
- `SHOPIFY_MOCK_MODE` is NOT `"true"`, AND
- Both `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` env vars are set

> **Without those env vars, the whole app runs in mock/fallback mode automatically.**

---

### `shopify/queries.ts` — Reading Products

Two GraphQL queries:

| Query | What it fetches |
|---|---|
| `PRODUCTS_QUERY` | Up to 50 products — id, title, description, tags, variants (price), images |
| `PRODUCT_BY_HANDLE_QUERY` | Single product by URL handle — includes all variants with `availableForSale` |

---

### `shopify/mutations.ts` — Cart Operations

Four GraphQL mutations that manage the Shopify Cart API:

| Mutation | What it does |
|---|---|
| `CART_CREATE_MUTATION` | Creates a new Shopify cart with initial line items; returns `checkoutUrl` |
| `CART_LINES_ADD_MUTATION` | Adds more items to an existing cart |
| `CART_LINES_UPDATE_MUTATION` | Changes quantity of a line item |
| `CART_LINES_REMOVE_MUTATION` | Removes line items by ID |

All mutations return the full cart object including the **`checkoutUrl`** — the real Shopify hosted checkout link.

---

### `services/product.service.ts` — Products with Smart Fallback

This is the **primary product data source**. It has a 5-minute in-memory cache:

```
Request for products
        │
        ▼
  Is cache fresh? ──YES──► return cachedProducts
        │
        NO
        ▼
  isShopifyConfigured()?
  ├── YES ──► shopifyFetch(PRODUCTS_QUERY, { first: 50 })
  │            └── mapShopifyProduct() for each node
  │            └── Cache & return
  │
  └── NO  ──► return localFallback (data/products.ts)
               └── Cache & return
```

#### `mapShopifyProduct()` — Shopify → HeadphoneProduct

This is the critical transformation. Shopify products don't have fields like `soundQuality` or `anc` — those are AI scoring fields. So the mapper **infers them**:

| Field | How it's derived |
|---|---|
| `id` | Last segment of Shopify GID (e.g. `gid://shopify/Product/123` → `"123"`) |
| `price` | First variant's price |
| `imageUrl` | First product image URL |
| `category` | Keyword inference from title + description ("gaming", "workout", "anc", etc.) |
| `style` | Keyword inference ("in-ear", "earbud", "tws" → earbuds; else over-ear) |
| `soundQuality` | Parsed from Shopify **tags** in format `sound:8`, else default `7` |
| `comfort` | Parsed from tag `comfort:9`, else default `7` |
| `noiseCancellation` | Parsed from tag `anc:10`, else `9` if noise-cancelling category, else `5` |
| `batteryLife` | Earbuds=6h, over-ear=30h, others=20h (heuristic defaults) |
| `latency` | Gaming=20ms, others=150ms |
| `shopifyVariantId` | Stored for cart sync — this is the Shopify variant GID |

> **Key insight**: You can control AI scoring by adding tags to your Shopify products in the format `anc:9`, `comfort:8`, `mic:7` etc. The service will parse those automatically.

---

### `services/cart.service.ts` — Local Cart + Shopify Sync

The cart system uses a **two-layer approach**:

#### Layer 1: Local In-Memory Cart (always active)
- A `Map<sessionId, Cart>` stores the cart for each user session
- Add/remove/update operations happen locally first (fast, no latency)
- The cart tracks items with `productId`, `name`, `price`, `quantity`, `imageUrl`

#### Layer 2: Shopify Sync (when configured)
When a product is added and `isShopifyConfigured()` AND the product has a `shopifyVariantId`:

```
First add to this product:
  └── CART_CREATE_MUTATION → creates Shopify cart
       └── saves shopifyCartId + checkoutUrl on local cart

Subsequent adds:
  └── CART_LINES_ADD_MUTATION → appends to existing Shopify cart
       └── updates checkoutUrl
```

This means the **checkout URL** that users click to pay is a **real Shopify hosted checkout page**.

#### Accessory upsell
Every `addToCart()` call also calls `getAccessoriesForProduct(category)` — returning 2-3 relevant accessories (cases, adapters, ear pads) to suggest in the chat / cart sidebar.

#### Mock checkout URL
In mock mode (no Shopify), the checkout URL is a placeholder:
```
https://mock-store.myshopify.com/checkout?cart={cartId}
```

---

### `data/products.ts` — Hardcoded Fallback

When Shopify is not configured, the backend uses **6 hardcoded products** with fully pre-scored AI fields:

| Product | Category | Key Specs |
|---|---|---|
| Sony WH-1000XM5 | noise-cancelling | ANC:10, Comfort:9, Battery:30h |
| Apple AirPods Max | noise-cancelling | Sound:9, ANC:9, Battery:20h |
| Bose QC45 | noise-cancelling | Comfort:10, ANC:9, Battery:24h |
| Sennheiser Momentum 4 | audiophile | Sound:10, Battery:60h |
| Jabra Elite 8 Active | workout | Portability:10, IP68 rated |
| Razer BlackShark V2 Pro | gaming | Latency:20ms, Mic:10 |

---

### Shopify Environment Variables

To connect a real Shopify store, add to the backend's `.env`:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_admin_api_token
SHOPIFY_MOCK_MODE=false
```

Leave these empty (or set `SHOPIFY_MOCK_MODE=true`) to run fully on local fallback data.

---

### Full Product Data Flow

```
Frontend page loads
       │
       ▼  GET /api/products (via frontend proxy)
       │
       ▼  Backend: product.service.getAllProducts()
       │
       ├── isShopifyConfigured? YES
       │     └── shopifyFetch(PRODUCTS_QUERY)
       │          └── mapShopifyProduct() × N
       │               └── infer category, style, scores from tags
       │
       └── isShopifyConfigured? NO
             └── return headphoneProducts (data/products.ts)
       │
       ▼  Frontend: fetchHeadphones() in app-store.ts
            └── maps backend HeadphoneProduct → frontend Headphone type
            └── stored in useStore().allProducts
            └── used by RecommendationPanel to display cards
```

---

## 🖥️ FRONTEND

### Entry Point — `src/app/page.tsx`
The root page mounts the `StoreProvider` context (global state) and renders:
- **Left panel** — `ChatPanel` (the bot conversation)
- **Right panel** — `RecommendationPanel` (product cards)
- **Overlays** — `CartSidebar`, `CheckoutModal`, `ComparisonTable`, `ProductDetailModal`

---

### Global State — `src/hooks/use-store.tsx`

This is the **brain of the frontend**. It's a React Context that holds everything:

| State Field | Purpose |
|---|---|
| `messages` | Chat history (user + assistant turns) |
| `recommendations` | Currently displayed headphone products |
| `preferences` | Detected user preference chips |
| `cart` | Cart items with quantities |
| `sessionId` | UUID linked to a backend session |
| `isThinking` | Controls the typing/thinking indicator |
| `comparisonItems` | Products queued for side-by-side table |
| `wishlist` | Persisted wishlist IDs |
| `isDarkMode` | Dark mode toggle state |

#### Key Action: `handleUserMessage(content)`
This is the most important function — it's called every time the user sends a message:

```
1. Append user message to state → show immediately
2. Set isThinking = true → ThinkingIndicator appears
3. Call processChat(content, sessionId) → hits backend
4. On response:
   - Append assistant message
   - Map backend PreferenceMemory → frontend Preference[]
   - Map backend ScoredProduct[] → frontend Headphone[]
   - Update recommendations panel
   - Auto-open comparison if "compare" / "vs" detected
5. Set isThinking = false
```

#### Key Action: `rerank(newPriority)`
Calls `getRecommendations(sessionId)` directly (no message needed), then re-maps and updates the product list.

---

### Chat UI Components

#### `ChatPanel.tsx`
Renders the full chat column:
- **Header** — Animated SonicAI logo + online indicator
- **Message list** — `AnimatePresence` wraps each `ChatMessage` for slide-in animation
- **Thinking indicator** — `ThinkingIndicator` (animated dots) shown while `isThinking` is true
- **Input** — `ChatInput` at the bottom; fires `handleUserMessage` on submit

#### `ChatMessage.tsx`
Renders a single message bubble:
- User messages: right-aligned, violet bubble
- Assistant messages: left-aligned with SonicAI avatar
- Supports **markdown rendering** and streaming text animation
- Shows `recommendations` chip-links if the message came with product suggestions

#### `ChatInput.tsx`
- Multi-line text area with keyboard shortcut (`Enter` to send, `Shift+Enter` for newline)
- Disabled while `isThinking` is true
- Fires the `onSend` callback (which is `handleUserMessage`)

#### `ThinkingIndicator.tsx`
Three animated dots that appear in the chat while the backend is processing. Fades in/out via Framer Motion.

---

### API Proxy Layer — `src/app/api/`

The frontend is a Next.js app that **proxies** all requests to the backend. This avoids CORS issues and keeps the backend URL server-side.

| Route | Proxies to Backend |
|---|---|
| `POST /api/chat` | `POST :3001/api/chat` |
| `POST /api/recommend` | `POST :3001/api/recommend` |
| `GET /api/products` | `GET :3001/api/products` |
| `POST /api/cart` | `POST :3001/api/cart` |
| `POST /api/checkout` | `POST :3001/api/checkout` |

**Streaming support**: The `/api/chat` proxy detects `?stream=true` and forwards the SSE response body directly, preserving `text/event-stream` headers.

```typescript
// Streaming path — forwards raw ReadableStream
return new Response(response.body, {
  headers: { "Content-Type": "text/event-stream", ... }
});
```

---

### Frontend AI Layer — `src/ai/`

Even though the backend does the heavy lifting, the frontend has its **own** AI utilities as a local fallback or augmentation layer:

| File | Role |
|---|---|
| `intent-extractor.ts` | Extracts structured intent from a message (uses OpenAI or keyword fallback) |
| `clarification-engine.ts` | Generates follow-up questions when context is insufficient |
| `explanation-generator.ts` | Generates natural-language explanations of why a product was recommended |
| `system-prompt.ts` | System prompt for the frontend-side AI calls |

The `extractIntent()` function returns a typed `ExtractedIntent` object:
```typescript
{
  useCases: ["travel", "gaming"],
  priorities: ["comfort", "battery life"],
  budget: { min: null, max: 300 },
  style: "over-ear",
  ancImportance: "critical",
  confidenceScores: { travel: 0.9, comfort: 0.7 }
}
```

If OpenAI is not configured, it falls back to a **keyword-matching engine** that pattern-matches common terms like "gym", "noise cancel", "$200", etc.

---

### Frontend Store Utilities — `src/store/app-store.ts`

Contains shared types and two pure utility functions:

- **`fetchHeadphones()`** — Fetches all products from `GET /api/products`, maps backend format → frontend `Headphone` type
- **`getRecommendations(preferences, headphones)`** — **Client-side scoring engine** (used when backend is unavailable): scores each headphone against detected preferences using weighted rules
- **`parsePreferences(message)`** — Keyword-based preference extractor (simpler than the `ai/intent-extractor.ts` version)

---

## ⚙️ BACKEND

### Entry Point — `src/app/api/chat/route.ts`

```typescript
POST /api/chat
Body: { sessionId?, message, preferenceOverrides? }
Query: ?stream=true for SSE
```

- Validates request body using **Zod schema** (`ChatRequestSchema`)
- Dispatches to either:
  - `processChat()` → JSON response
  - `processChatStreaming()` → SSE stream via `createSSEStream()`

---

### Chat Service — `src/services/chat.service.ts`

This is the **backend orchestrator**. `processChat()` runs 13 steps:

```
Step 1  →  getOrCreateSession(sessionId)
Step 2  →  addConversationTurn(session, userMessage)
Step 3  →  Apply preferenceOverrides if provided
Step 4  →  extractIntent(message)           ← OpenAI or keyword fallback
Step 5  →  mergeIntents(existing, new)      ← smart merge with confidence scores
Step 6  →  updatePreferences(session, intent)
Step 7  →  hasEnoughContext()? → clarify vs recommend
Step 8  →  getRecommendations(session, limit:5)  ← if enough context
Step 9  →  Apply weight adjustments from keywords ("more important", "matters")
Step 10 →  generateAIResponse()             ← OpenAI Responses API
Step 11 →  getAccessoriesForProduct(topProduct)  ← upsell accessories
Step 12 →  Build ChatResponse object
Step 13 →  addConversationTurn(session, assistantResponse)
```

**Streaming variant** (`processChatStreaming`) runs the same pipeline but:
- Streams AI text token-by-token via SSE `sendText(delta)`
- Sends structured data events after streaming: `{type: "recommendations", data: [...]}`, `{type: "clarification", data: [...]}`, `{type: "memory", data: {...}}`

---

### Backend AI Layer — `src/ai/`

#### `intent-extractor.ts`
Identical in structure to the frontend version. Uses OpenAI Responses API with a JSON-mode prompt, returns `ExtractedIntent`.

**`mergeIntents(existing, incoming)`** — Intelligently merges two intents:
- Arrays (useCases, priorities) are **deduplicated union**
- Scalar fields (style, ANC, wireless) — **incoming wins** if higher confidence
- Budget is merged field-by-field (min/max independently)
- Confidence scores always keep the **maximum**

#### `clarification-engine.ts`
`hasEnoughContext(intent, preferences)` decides if enough is known to recommend:
- Returns `true` if at least one use case AND one of: budget, style, or priority is known
- `generateClarificationQuestions()` returns targeted follow-up questions for missing fields

#### `system-prompt.ts`
The master system prompt for the OpenAI model acting as SonicAI advisor. Instructs it to be concise, helpful, explain tradeoffs, and reference specific product names.

---

### Session Memory — `src/memory/session.ts`

An **in-memory Map** keyed by UUID session IDs (production would use PostgreSQL):

```typescript
interface Session {
  id: string;
  preferences: PreferenceMemory;       // Budget, use case, style, ANC, etc.
  conversationHistory: ConversationTurn[];
  openaiResponseId?: string;           // For stateful Responses API chaining
}
```

Key functions:
- `getOrCreateSession(id?)` — Returns existing or creates new session
- `addConversationTurn()` — Appends a user or assistant turn
- `getConversationForAI()` — Returns history formatted for OpenAI input (last 10 turns)
- `updateOpenAIResponseId()` — Saves response ID for stateful conversation chaining

---

### Recommendation Service — `src/services/recommendation.service.ts`

Scores every product against the session's `PreferenceMemory` using weighted criteria:

| Weight Key | What It Scores |
|---|---|
| `priceFit` | How well price fits budget |
| `soundQuality` | Sound quality rating |
| `comfort` | Comfort rating |
| `batteryLife` | Hours of playback |
| `ancFit` | ANC level vs importance |
| `micFit` | Mic quality vs need |
| `portabilityFit` | Portability vs need |
| `latencyFit` | Latency vs gaming focus |

Each dimension has a default weight. The `applyWeightOverrides()` function (called in `chat.service.ts` step 9) boosts weights when the user says "comfort matters more" etc.

Returns `ScoredProduct[]` — each product with `totalScore`, `rank`, and a human-readable `whyRecommended` string.

---

## 🔄 End-to-End Message Flow

```
User: "I need headphones for long flights under $300"
         │
         ▼ ChatInput.tsx → handleUserMessage()
         │
         ▼ POST /api/chat (frontend proxy)
         │
         ▼ POST :3001/api/chat
         │
         ├─ extractIntent("long flights under $300")
         │    → { useCases: ["travel"], budget: {max:300}, ancImportance: "critical" }
         │
         ├─ mergeIntents(existing={}, new=above) → merged
         │
         ├─ updatePreferences(session, merged)
         │    → session.preferences.primaryUseCase = "travel"
         │    → session.preferences.budget.max = 300
         │
         ├─ hasEnoughContext() → true (use case + budget both known)
         │
         ├─ getRecommendations(session, limit:5)
         │    → Score all products → top 5 sorted by score
         │    → e.g. Sony WH-1000XM5 (score:8.7, "within budget, superior ANC")
         │
         ├─ generateAIResponse() → OpenAI
         │    → "For long flights, the Sony WH-1000XM5 is your best bet..."
         │
         └─ Return { sessionId, message, recommendations, preferenceMemory }
                   │
                   ▼ Frontend useStore
                   ├─ Append assistant message to chat
                   ├─ Update recommendations panel with top 5 products
                   └─ Update preference chips (Travel, $300)
```

---

## 📦 Key File Reference

| File | Layer | Role |
|---|---|---|
| [use-store.tsx](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/frontend/src/hooks/use-store.tsx) | Frontend | Global state + handleUserMessage |
| [ChatPanel.tsx](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/frontend/src/components/ChatPanel.tsx) | Frontend | Chat UI layout |
| [ChatInput.tsx](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/frontend/src/components/ChatInput.tsx) | Frontend | User input component |
| [ChatMessage.tsx](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/frontend/src/components/ChatMessage.tsx) | Frontend | Message bubble renderer |
| [app-store.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/frontend/src/store/app-store.ts) | Frontend | Types + client-side scorer |
| [intent-extractor.ts (FE)](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/frontend/src/ai/intent-extractor.ts) | Frontend AI | Local intent extraction |
| [chat/route.ts (FE proxy)](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/frontend/src/app/api/chat/route.ts) | Frontend API | Proxies to backend |
| [chat/route.ts (BE)](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/app/api/chat/route.ts) | Backend API | Entry point, validates + dispatches |
| [chat.service.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/services/chat.service.ts) | Backend | 13-step orchestration pipeline |
| [intent-extractor.ts (BE)](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/ai/intent-extractor.ts) | Backend AI | OpenAI intent extraction + merge |
| [session.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/memory/session.ts) | Backend | In-memory session store |
| [lib/shopify.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/lib/shopify.ts) | Shopify | GraphQL HTTP client |
| [product.service.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/services/product.service.ts) | Shopify | Load + transform products (with fallback) |
| [cart.service.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/services/cart.service.ts) | Shopify | Local cart + Shopify cart sync |
| [shopify/queries.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/shopify/queries.ts) | Shopify | Product GraphQL queries |
| [shopify/mutations.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/shopify/mutations.ts) | Shopify | Cart GraphQL mutations |
| [data/products.ts](file:///c:/Users/KIIT0001/Downloads/Sonic-Ai-main/Sonic-Ai-main/backend/src/data/products.ts) | Shopify | Hardcoded fallback product list |

---

## 💡 Key Design Decisions

> [!NOTE]
> **Dual AI layers**: Both frontend and backend have intent extraction. The frontend layer is a lightweight fallback; the backend is the authoritative path with full session context.

> [!TIP]
> **Streaming SSE**: The backend can stream AI responses token-by-token. The frontend proxy transparently forwards the stream. This gives a real-time typing effect without polling.

> [!IMPORTANT]
> **Session ID bridges the two apps**: The frontend generates a UUID on load and passes it with every chat request. The backend uses this to maintain conversation history and preference memory across turns.

> [!WARNING]
> **In-memory sessions**: Backend sessions are stored in a `Map`. Restarting the backend server clears all session history. For production, replace with a database (the code comments suggest PostgreSQL + Drizzle ORM).
