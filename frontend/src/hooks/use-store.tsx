'use client';

import { createContext, useContext, useCallback, useState, useRef, ReactNode } from 'react';
import { Headphone, headphones } from '@/data/headphones';
import { getRecommendations, parsePreferences, Preference, CartItem, Message } from '@/store/app-store';

interface StoreState {
  messages: Message[];
  recommendations: Headphone[];
  preferences: Preference[];
  cart: CartItem[];
  isCartOpen: boolean;
  isThinking: boolean;
  comparisonItems: Headphone[];
  showComparison: boolean;
  reasoning: string;
  selectedProduct: Headphone | null;
  wishlist: string[];
  isCheckoutOpen: boolean;
  isDarkMode: boolean;
}

interface StoreActions {
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  setRecommendations: (recs: Headphone[]) => void;
  setPreferences: (prefs: Preference[]) => void;
  addPreference: (pref: Preference) => void;
  removePreference: (id: string) => void;
  updatePreference: (id: string, value: string) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  setIsThinking: (thinking: boolean) => void;
  setComparisonItems: (items: Headphone[]) => void;
  toggleComparison: () => void;
  setReasoning: (reasoning: string) => void;
  handleUserMessage: (content: string) => void;
  rerank: (newPriority: string) => void;
  setSelectedProduct: (product: Headphone | null) => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  setCheckoutOpen: (open: boolean) => void;
  clearCart: () => void;
  toggleDarkMode: () => void;
}

type Store = StoreState & StoreActions;

const StoreContext = createContext<Store | null>(null);

// AI response templates
const aiResponses: Record<string, string[]> = {
  greeting: [
    "Hey there! 👋 I'm your personal headphone advisor. Tell me — what will you mainly use these headphones for?",
    "Welcome! I'm here to find your perfect pair of headphones. What's the primary use case you have in mind?",
  ],
  travel: [
    "Great choice! For travel, noise cancellation and comfort are essential. Here are my top picks based on your needs:\n\nI've prioritized **ANC quality**, **comfort for long wear**, and **battery life** since you'll be on the go.\n\nLet me know if you'd like to adjust any priorities or compare specific models!",
  ],
  gaming: [
    "Gaming headsets — exciting! For gaming, low latency and a great mic are crucial. Here are my recommendations:\n\nI focused on **ultra-low latency**, **microphone clarity**, and **comfort** for those long gaming sessions.\n\nWant me to compare any of these options?",
  ],
  workout: [
    "Looking for workout-ready audio! Here are my top picks:\n\nI selected these for **secure fit**, **sweat/water resistance**, and **durability** — because nobody wants earbuds falling out mid-sprint.\n\nShould I adjust for any specific activity?",
  ],
  office: [
    "For office and calls, crystal-clear microphone quality is key. Here's what I recommend:\n\nI prioritized **microphone quality**, **ANC for focus**, and **comfort** for all-day wear.\n\nWant to see how they compare side by side?",
  ],
  audiophile: [
    "An audiophile! Let me pull out the heavy hitters:\n\nI selected these for **sound accuracy**, **driver technology**, and **soundstage** — pure listening bliss.\n\nNote: Some of these are wired and may need a dedicated amp for the best experience.",
  ],
  budget: [
    "Smart thinking on the budget! Let me find the best value within your range:\n\nI've filtered for the best performance-to-price ratio while keeping quality high.\n\nWant me to stretch the budget a bit for significantly better options?",
  ],
  compare: [
    "Great idea! I've set up a comparison of your top options. Check out the comparison table on the right — you can see exactly how they stack up across sound quality, comfort, ANC, battery, and more.\n\nAnything stand out to you?",
  ],
  rerank: [
    "Got it! I've reranked the recommendations based on your updated priorities. Notice how the order shifted — the best match for your new criteria is now at the top.\n\nThe reasoning has been updated too. Does this look better?",
  ],
  accessory: [
    "Great choice! 🎧 I've also added some accessories that pair perfectly with your headphones. Check the cart sidebar for:\n\n• **Premium carrying case** — protect your investment\n• **Airplane adapter** — essential for travelers\n• **Replacement ear pads** — for long-term comfort\n\nReady to checkout?",
  ],
  default: [
    "I understand! Let me refine my recommendations based on that. Here's my updated selection:\n\nI've adjusted the rankings to better match what you're looking for. The top pick now better reflects your priorities.\n\nAnything else you'd like me to consider?",
  ],
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('travel') || lower.includes('flight') || lower.includes('plane') || lower.includes('commut')) {
    return aiResponses.travel[0];
  }
  if (lower.includes('gaming') || lower.includes('game')) {
    return aiResponses.gaming[0];
  }
  if (lower.includes('workout') || lower.includes('gym') || lower.includes('running')) {
    return aiResponses.workout[0];
  }
  if (lower.includes('office') || lower.includes('work') || lower.includes('call') || lower.includes('zoom') || lower.includes('meeting')) {
    return aiResponses.office[0];
  }
  if (lower.includes('music') || lower.includes('audiophile') || lower.includes('studio') || lower.includes('hifi')) {
    return aiResponses.audiophile[0];
  }
  if (lower.includes('compare') || lower.includes('comparison') || lower.includes('versus') || lower.includes('vs')) {
    return aiResponses.compare[0];
  }
  if (lower.includes('actually') || lower.includes('matter more') || lower.includes('prioritize') || lower.includes('important')) {
    return aiResponses.rerank[0];
  }
  if (lower.includes('accessory') || lower.includes('case') || lower.includes('adapter')) {
    return aiResponses.accessory[0];
  }
  if (lower.includes('budget') || lower.match(/\$\d+/)) {
    return aiResponses.budget[0];
  }
  return aiResponses.default[0];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setFullState] = useState<StoreState>({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hey there! 👋 I'm **SonicAI**, your personal headphone advisor. I'll help you find the perfect pair based on your needs, preferences, and budget.\n\nTell me — **what will you mainly use these headphones for?** (travel, gaming, working out, office calls, or pure music listening?)",
        timestamp: new Date(),
      }
    ],
    recommendations: [],
    preferences: [],
    cart: [],
    isCartOpen: false,
    isThinking: false,
    comparisonItems: [],
    showComparison: false,
    reasoning: '',
    selectedProduct: null,
    wishlist: [],
    isCheckoutOpen: false,
    isDarkMode: false,
  });

  const update = useCallback((partial: Partial<StoreState>) => {
    setFullState(prev => ({ ...prev, ...partial }));
  }, []);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    const message: Message = {
      ...msg,
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
    };
    setFullState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
    return message;
  }, []);

  const handleUserMessage = useCallback((content: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Parse preferences from the message
    const newPrefs = parsePreferences(content);

    setFullState(prev => {
      // Merge new preferences (avoid duplicates by id)
      const existingIds = new Set(prev.preferences.map(p => p.id));
      const mergedPrefs = [...prev.preferences, ...newPrefs.filter(p => !existingIds.has(p.id))];

      return {
        ...prev,
        messages: [...prev.messages, userMsg],
        isThinking: true,
        preferences: mergedPrefs,
      };
    });

    // Simulate AI thinking delay
    setTimeout(() => {
      setFullState(prev => {
        const { products, reasoning } = getRecommendations(prev.preferences);

        const aiResponse = getAIResponse(content);

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          recommendations: products.map(p => p.id),
          reasoning,
        };

        // Set comparison items if "compare" mentioned
        const lower = content.toLowerCase();
        const showComp = lower.includes('compare') || lower.includes('comparison') || lower.includes('vs');

        return {
          ...prev,
          messages: [...prev.messages, aiMsg],
          recommendations: products,
          reasoning,
          isThinking: false,
          comparisonItems: showComp ? products.slice(0, 3) : prev.comparisonItems,
          showComparison: showComp ? true : prev.showComparison,
        };
      });
    }, 1500 + Math.random() * 1000);
  }, []);

  const rerank = useCallback((newPriority: string) => {
    const newPref = parsePreferences(newPriority);
    setFullState(prev => {
      // Replace matching preferences or add new ones
      const existingIds = new Set(newPref.map(p => p.id));
      const filtered = prev.preferences.filter(p => !existingIds.has(p.id));
      const mergedPrefs = [...filtered, ...newPref];
      const { products, reasoning } = getRecommendations(mergedPrefs);

      return {
        ...prev,
        preferences: mergedPrefs,
        recommendations: products,
        reasoning,
      };
    });
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setFullState(prev => {
      const existing = prev.cart.find(c => c.id === item.id);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c),
          isCartOpen: true,
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { ...item, quantity: 1 }],
        isCartOpen: true,
      };
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setFullState(prev => ({
      ...prev,
      cart: prev.cart.filter(c => c.id !== id),
    }));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setFullState(prev => ({
      ...prev,
      cart: prev.cart.map(c => {
        if (c.id === id) {
          const newQty = c.quantity + delta;
          return newQty > 0 ? { ...c, quantity: newQty } : c;
        }
        return c;
      }).filter(c => c.quantity > 0),
    }));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setFullState(prev => ({
      ...prev,
      wishlist: prev.wishlist.includes(id)
        ? prev.wishlist.filter(wid => wid !== id)
        : [...prev.wishlist, id],
    }));
  }, []);

  const clearCart = useCallback(() => {
    setFullState(prev => ({ ...prev, cart: [], isCartOpen: false, isCheckoutOpen: false }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setFullState(prev => {
      const newDark = !prev.isDarkMode;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newDark);
      }
      return { ...prev, isDarkMode: newDark };
    });
  }, []);

  const store: Store = {
    ...state,
    addMessage,
    setRecommendations: (recs) => update({ recommendations: recs }),
    setPreferences: (prefs) => update({ preferences: prefs }),
    addPreference: (pref) => setFullState(prev => ({
      ...prev,
      preferences: [...prev.preferences.filter(p => p.id !== pref.id), pref],
    })),
    removePreference: (id) => setFullState(prev => ({
      ...prev,
      preferences: prev.preferences.filter(p => p.id !== id),
    })),
    updatePreference: (id, value) => setFullState(prev => ({
      ...prev,
      preferences: prev.preferences.map(p => p.id === id ? { ...p, value } : p),
    })),
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleCart: () => setFullState(prev => ({ ...prev, isCartOpen: !prev.isCartOpen })),
    setCartOpen: (open) => update({ isCartOpen: open }),
    setIsThinking: (thinking) => update({ isThinking: thinking }),
    setComparisonItems: (items) => update({ comparisonItems: items }),
    toggleComparison: () => setFullState(prev => ({ ...prev, showComparison: !prev.showComparison })),
    setReasoning: (reasoning) => update({ reasoning }),
    handleUserMessage,
    rerank,
    setSelectedProduct: (product) => update({ selectedProduct: product }),
    toggleWishlist,
    isInWishlist: (id: string) => state.wishlist.includes(id),
    setCheckoutOpen: (open) => update({ isCheckoutOpen: open }),
    clearCart,
    toggleDarkMode,
  };

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  return store;
}
