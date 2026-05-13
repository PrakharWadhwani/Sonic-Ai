'use client';

import React, { useState } from 'react';
import { StoreProvider, useStore } from '@/hooks/use-store';
import { Navbar } from '@/components/Navbar';
import { ChatPanel } from '@/components/ChatPanel';
import { RecommendationPanel } from '@/components/RecommendationPanel';
import { CartSidebar } from '@/components/CartSidebar';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ToastProvider, useToast } from '@/components/Toast';
import { accessories } from '@/data/headphones';
import { motion, AnimatePresence } from 'motion/react';

function MobileRecommendationToggle() {
  const { recommendations } = useStore();
  const [showRecs, setShowRecs] = useState(false);

  return (
    <>
      {/* Toggle bar */}
      {recommendations.length > 0 && !showRecs && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg"
          onClick={() => setShowRecs(true)}
        >
          <span>View {recommendations.length} Recommendations</span>
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ↑
          </motion.span>
        </motion.button>
      )}

      {/* Mobile recommendation panel */}
      <AnimatePresence>
        {showRecs && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-950 overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recommendations</h3>
              <button
                onClick={() => setShowRecs(false)}
                className="text-xs font-medium text-violet-500 hover:text-violet-700 transition-colors"
              >
                ← Back to Chat
              </button>
            </div>
            <RecommendationPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AppContent() {
  const store = useStore();
  const { showToast } = useToast();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50/30 dark:bg-gray-950">
      {/* Decorative gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200/20 dark:bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-200/15 dark:bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-purple-200/10 dark:bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: Chat Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-[45%] xl:w-[40%] flex-shrink-0 border-r border-gray-100/80 dark:border-gray-800/80 bg-white/40 dark:bg-gray-950/40 backdrop-blur-sm"
        >
          <ChatPanel />
        </motion.div>

        {/* Right: Recommendation Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block flex-1 bg-gray-50/50 dark:bg-gray-900/50"
        >
          <RecommendationPanel />
        </motion.div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={store.isCartOpen}
        onClose={() => store.setCartOpen(false)}
        items={store.cart}
        onRemove={store.removeFromCart}
        onUpdateQuantity={store.updateQuantity}
        onAddAccessory={(acc) => {
          store.addToCart({
            id: acc.id,
            name: acc.name,
            brand: 'SonicAI',
            price: acc.price,
            image: acc.image,
            type: 'accessory',
          });
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={store.selectedProduct}
        isOpen={!!store.selectedProduct}
        onClose={() => store.setSelectedProduct(null)}
        onAddToCart={(product) => {
          store.addToCart({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            type: 'headphone',
          });
          showToast(`${product.name} added to cart`, 'success');
        }}
      />

      {/* Mobile Bottom Tab for Recommendations (visible on small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20">
        <MobileRecommendationToggle />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </StoreProvider>
  );
}
