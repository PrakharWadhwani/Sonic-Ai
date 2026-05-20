# 🎧 Sonic AI — Product Document

> **What we built, for whom, and why.**

---

## 1. Product Overview

**Sonic AI** is an AI-native headphone shopping assistant. It replaces traditional filter-based e-commerce browsing with a natural language conversation that understands user lifestyle, priorities, and budget — and surfaces the best-matched products with plain-language explanations.

The experience feels less like a product catalog and more like consulting a knowledgeable friend who listens to what you need.

---

## 2. Problem Statement

Shopping for premium headphones is genuinely hard. There are dozens of meaningful specs (ANC depth, driver type, codec support, latency, battery, microphone quality) that interact with use cases in non-obvious ways. Most users don't know the right vocabulary to filter for what they want.

**No platform today allows a user to say "I work from cafés and take the subway — what's best for me?" and get a ranked, explained answer.**

---

## 3. Target Users

### Primary Persona: The Overwhelmed Buyer
- Age 22–40, tech-aware but not an audiophile
- Has a clear use case (commuting, WFH, gym, gaming) but doesn't know the specs
- Budget conscious — wants to make the right call on a $200–$400 purchase
- Frustrated by spec sheets and analysis paralysis

### Secondary Persona: The Upgrade Shopper
- Already owns headphones, wants to understand what's materially better
- Values comparative reasoning, not just recommendations

---

## 4. User Journey

```
Lands on Sonic AI
       │
       ▼  Types: "Looking for headphones for the gym"
       │
       ▼  Botty asks: "Earbuds or over-ear? What's your budget?"
       │
       ▼  Recommendations panel populates: Top 3 ranked earbuds
          Preference chips appear: "Workout", "Earbuds", "$150 budget"
       │
       ▼  User can: Compare | Add to cart | Refine priorities
       │
       ▼  Checkout via real Shopify hosted cart (or mock in demo)
```

---

## 5. Core Features & Value Propositions

| Feature | Value |
|---|---|
| Conversational Preference Extraction | No spec knowledge required — just describe your life |
| Explainable Recommendations | "Why this product" in plain English, not just a score |
| Dynamic Re-ranking | Shift priorities mid-chat; rankings update live |
| Comparison Table | Side-by-side comparison for up to 3 products |
| Shopify Checkout | Real hosted checkout via Shopify Cart API |
| Wishlist | Save products to localStorage for later |
| Streaming AI | Token-by-token streaming for real-time typing feel |

---

## 6. Scope (v1)

**In Scope:** Chat interface, preference memory, product scoring, cart, comparison, wishlist, dark mode, Shopify integration with fallback, streaming AI.

**Out of Scope:** User accounts, order history, multi-category, mobile app, real-time inventory.

---

## 7. Key Design Principles

1. **Conversation first** — Every interaction feels like talking to a person, not filling a form
2. **Graceful degradation** — Works without OpenAI, without Shopify, without any external service
3. **Explainability** — Every recommendation justified in plain English
4. **Instant feedback** — Re-ranking must feel immediate (streaming + optimistic UI)
5. **Zero config for demo** — Works locally with zero API keys

---

## 8. Key Tradeoffs

| Decision | Choice | Reason |
|---|---|---|
| Single vs multi-category | Headphones only | Enables domain-specific scoring (ANC, latency, comfort) |
| Session storage | In-memory Map | Simpler for demo; PostgreSQL recommended for production |
| Shopify API | Admin API (server-side only) | More product detail (tags, metafields) for AI scoring |
| Dual AI layers | Frontend + Backend intent extraction | Frontend is a lightweight fallback for resilience |

---

## 9. Competitive Positioning

| Platform | Approach | Limitation |
|---|---|---|
| Amazon | Filter + review scroll | No guidance; spec overload |
| Wirecutter | Editorial top picks | Static; not personalized |
| **Sonic AI** | **Conversational + explainable ranking** | **Personalized; no spec knowledge needed** |
