# 🤝 Sonic AI — Contribution Note

> How time was split across product thinking and engineering.

---

## Solo Project

This project was built entirely as a solo effort. Below is an honest breakdown of how time was allocated across the different phases of the project.

---

## Time Allocation Breakdown

| Phase | Time Spent | % of Total |
|---|---|---|
| Product thinking & problem framing | ~2 hours | ~10% |
| Architecture design & tech decisions | ~3 hours | ~15% |
| Backend development (AI, sessions, scoring) | ~6 hours | ~30% |
| Frontend development (UI, state, components) | ~7 hours | ~35% |
| Shopify integration | ~1.5 hours | ~7.5% |
| Documentation & decision log | ~0.5 hours | ~2.5% |
| **Total** | **~20 hours** | **100%** |

---

## Product Thinking (~10%)

Time spent on product thinking before writing any code:

- **Problem framing**: Why is headphone shopping hard? What does "AI-native" actually mean for e-commerce?
- **Persona definition**: Who is this for? (The overwhelmed buyer vs. the audiophile)
- **Feature scoping**: What's in v1, what's explicitly cut?
- **UX flow design**: Split-screen vs. tab-based vs. chat-only approaches
- **Key questions answered before coding**:
  - What information does the AI need to make a good recommendation?
  - How do we confirm the AI "heard" the user? (→ preference chips)
  - What does explainability look like? (→ `whyRecommended` strings)
  - How do we handle the case where OpenAI is down? (→ keyword fallback)

---

## Engineering (~90%)

### Backend Design (Architecture + AI)

- Chose two-service architecture (frontend :3000 + backend :3001) with proxy layer
- Designed the 13-step `processChat()` pipeline
- Implemented intent extraction with `mergeIntents()` for accumulating context over turns
- Built the weighted scoring system (`recommendation.service.ts`)
- Implemented SSE streaming with structured events
- Built the Shopify integration with tag-based AI scoring and graceful fallback

### Frontend Development

- Implemented global `useStore` React Context with all state in one place
- Built animated chat interface with streaming text rendering
- Built real-time re-ranking with preference chip UI
- Implemented `CartSidebar`, `CheckoutModal`, `ComparisonTable`, `ProductDetailModal`
- Integrated `Wishlist` with `localStorage` persistence
- Full dark mode support across all components

### Key Engineering Challenges Solved

1. **SSE Streaming through Next.js proxy** — The frontend Next.js proxy needed to forward `ReadableStream` without buffering. Solved by returning `new Response(response.body, ...)` directly.

2. **Intent merging across turns** — Each turn's extracted intent needs to update (not replace) the existing session preferences. Built `mergeIntents()` with per-field confidence scoring.

3. **Shopify tag-based scoring** — Merchants should be able to control AI scoring from the Shopify dashboard, with no external database. Solved by parsing product tags in format `sound:8`, `anc:9`.

4. **Graceful degradation at every layer** — Three separate fallback mechanisms (OpenAI → keyword, Shopify → local catalog, backend → client-side scoring) ensure the app always works.

---

## What I'd Do Differently with More Time

- **User testing**: The product thinking phase was short. More user interviews would sharpen the persona and reveal whether the chat-first interface is intuitive.
- **Mobile UX**: The split-screen layout doesn't work well on mobile. A tab-based or overlay approach would be needed.
- **Persistent sessions**: Replace in-memory sessions with PostgreSQL so conversation history survives server restarts.
- **Better streaming UI**: The streaming implementation works but the UX could be smoother (cursor animation, cancel button).
- **Shopify webhook integration**: Product cache invalidation via webhooks rather than TTL-based expiry.
