'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Headphones, Package, Sparkles, Gift } from 'lucide-react';
import Image from 'next/image';
import { CartItem } from '@/store/app-store';
import { accessories } from '@/data/accessories';
import { TrustBadges } from './TrustBadges';
import { useToast } from './Toast';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onAddAccessory: (accessory: typeof accessories[0]) => void;
}

export function CartSidebar({ isOpen, onClose, items, onRemove, onUpdateQuantity, onAddAccessory }: CartSidebarProps) {
  const { showToast } = useToast();
  const { setCheckoutOpen, setCartOpen } = useStore();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemove = (item: CartItem) => {
    onRemove(item.id);
    showToast(`${item.name} removed from cart`, 'error');
  };

  const handleAddAccessory = (acc: typeof accessories[0]) => {
    onAddAccessory(acc);
    showToast(`${acc.name} added to cart`, 'success');
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setTimeout(() => setCheckoutOpen(true), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-50 shadow-2xl shadow-gray-900/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-900 dark:bg-violet-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Your Cart</h2>
                  <p className="text-[11px] text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
              <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3"
                  >
                    <ShoppingBag className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                    <p className="text-sm">Your cart is empty</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600">Add headphones from the recommendations</p>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30, height: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700"
                    >
                      {/* Item icon */}
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                        ) : item.type === 'headphone' ? (
                          <Headphones className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-400">{item.brand}</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">${item.price}</p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </motion.button>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-6 text-center tabular-nums">{item.quantity}</span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </motion.button>
                      </div>

                      {/* Remove */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(item)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>

              {/* Accessory Suggestions */}
              {items.length > 0 && items.some(i => i.type === 'headphone') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-violet-400" />
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Complete Your Setup
                    </p>
                  </div>
                  {accessories.slice(0, 3).map((acc, i) => (
                    <motion.div
                      key={acc.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-500/30 hover:bg-violet-50/30 dark:hover:bg-violet-500/5 transition-all cursor-pointer group"
                      onClick={() => handleAddAccessory(acc)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center flex-shrink-0 group-hover:border-violet-200 dark:group-hover:border-violet-500/30 transition-colors">
                        <Package className="w-4 h-4 text-gray-300 group-hover:text-violet-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{acc.name}</p>
                        <p className="text-[10px] text-gray-400">{acc.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">${acc.price}</p>
                        <Plus className="w-3.5 h-3.5 text-gray-300 group-hover:text-violet-500 transition-colors ml-auto" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 space-y-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                {/* Free shipping progress */}
                {subtotal < 200 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Gift className="w-3 h-3 text-violet-400" />
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          ${(200 - subtotal).toFixed(0)} away from free shipping!
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">${subtotal.toFixed(0)}/$200</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((subtotal / 200) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                      />
                    </div>
                  </motion.div>
                )}
                {subtotal >= 200 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">🎉 You qualify for free shipping!</span>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${subtotal.toFixed(2)}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-violet-600 dark:to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 dark:shadow-violet-500/20 hover:shadow-gray-900/30 dark:hover:shadow-violet-500/30 transition-shadow"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <TrustBadges />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
