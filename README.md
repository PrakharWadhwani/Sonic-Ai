# 🎧 Sonic AI — AI-Native Headphone Shopping Platform

> **An intelligent conversational shopping assistant that recommends the perfect headphones based on your unique lifestyle and preferences.**

Sonic AI combines a conversational AI interface with a dynamic product recommendation engine, allowing users to describe their needs in natural language and receive personalized, ranked headphone recommendations in real time.

---

## 🧩 Problem Statement

Shopping for headphones is overwhelming. Hundreds of products, dozens of specs, and no clear way to know what actually matters for *your* use case. Is ANC important if you commute by bike? Does latency matter if you don't game? Most e-commerce sites force you to filter specs you don't understand.

**Sonic AI solves this** by letting you have a natural conversation — like talking to an expert friend — and surfacing the best options for you, explained in plain language.

---

## ✨ Key Features

- 💬 **Conversational AI Interface** — Chat with Botty, the SonicAI assistant, using plain English
- 🎯 **Smart Preference Memory** — The system remembers your budget, use case, style, and ANC needs across the entire conversation
- 🔁 **Dynamic Re-ranking** — Product rankings update live as you refine your preferences
- 🛒 **Shopping Cart + Checkout** — Add items and check out directly via Shopify (or mock mode)
- ❤️ **Wishlist** — Save products to revisit later (persisted in localStorage)
- ⚖️ **Side-by-side Comparison** — Compare up to 3 headphones on specs
- 🌙 **Dark Mode** — Full dark mode support throughout the app
- 📡 **Streaming AI Responses** — Token-by-token streaming for a real-time feel
- 🔌 **Shopify Integration** — Optional live Shopify product + cart sync; falls back to mock data gracefully

---

## 🏗️ Project Structure

```
Sonic-Ai-main/
├── backend/           # Next.js API server (port 3001)
│   └── src/
│       ├── ai/        # Intent extraction, clarification engine
│       ├── memory/    # In-memory session store
│       ├── ranking/   # Product scoring algorithm
│       ├── services/  # Chat, product, cart, recommendation services
│       ├── shopify/   # GraphQL queries & mutations
│       ├── data/      # Fallback product catalog
│       └── types/     # Shared TypeScript types
│
└── frontend/          # Next.js UI (port 3000)
    └── src/
        ├── ai/        # Client-side intent & explanation layer
        ├── app/       # Pages + API proxy routes
        ├── components/# UI components (Chat, Products, Cart, etc.)
        ├── hooks/     # useStore — global state
        ├── ranking/   # Client-side scoring fallback
        ├── shopify/   # Shopify client + types
        └── store/     # Shared types + fetch utilities
```

---

## 🚀 How to Run Locally

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) OpenAI API Key for AI-powered responses
- (Optional) Shopify store credentials for live product data

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sonic-ai.git
cd sonic-ai
```

---

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env.local` file in the `backend/` directory:

```env
# Required for AI responses (falls back to keyword matching if missing)
OPENAI_API_KEY=sk-...your-key-here...

# Optional: Connect a real Shopify store
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_admin_api_token
SHOPIFY_MOCK_MODE=false   # Set to "true" to use local mock data

# Server port
PORT=3001
```

Start the backend:

```bash
npm run dev
# Backend runs at http://localhost:3001
```

---

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
# Points to the backend server
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Optional: Frontend-side OpenAI calls (for local fallback AI)
OPENAI_API_KEY=sk-...your-key-here...
```

Start the frontend:

```bash
npm run dev
# Frontend runs at http://localhost:3000
```

---

### 4. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

Try typing something like:
> *"I need headphones for long flights, budget around $300"*

---

## 🎥 Demo Video

> 📹 **[Watch the Demo — YouTube (Unlisted)](https://youtube.com/your-link-here)**
>
> A 3–5 minute walkthrough showing the full conversation flow, live re-ranking, cart, and comparison features.

---

## 🔑 Running Without API Keys

Sonic AI is designed to work **fully offline** with no external accounts:

| Feature | Without OpenAI | Without Shopify |
|---|---|---|
| Chat responses | Keyword-based fallback | N/A |
| Product recommendations | Client-side scoring | Uses hardcoded catalog |
| Cart & checkout | N/A | Mock checkout URL |

Simply leave the environment variables empty — the app auto-detects and falls back gracefully.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| Backend | Next.js API Routes (Node.js runtime) |
| AI | OpenAI Responses API (GPT-4o) |
| E-commerce | Shopify Storefront GraphQL API |
| State | React Context + localStorage |
| Validation | Zod |

---

## 📄 Documentation

- [`PRODUCT_DOCUMENT.md`](./PRODUCT_DOCUMENT.md) — What was built, for whom, and why
- [`TECHNICAL_DOCUMENT.md`](./TECHNICAL_DOCUMENT.md) — Architecture, implementation, failure handling
- [`DECISION_LOG.md`](./DECISION_LOG.md) — Key engineering and product decisions
- [`CONTRIBUTION_NOTE.md`](./CONTRIBUTION_NOTE.md) — Time split and contribution breakdown
- [`SCREENSHOTS.md`](./SCREENSHOTS.md) — Product walkthrough with annotated screenshots

---

## 📝 License

MIT — feel free to fork, build on it, and make it your own.
