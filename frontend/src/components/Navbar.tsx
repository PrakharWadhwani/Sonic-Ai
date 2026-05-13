'use client';

import { motion } from 'motion/react';
import { Headphones, ShoppingBag, Sparkles, Heart, Moon, Sun } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { SoundWave } from './SoundWave';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { cart, toggleCart, wishlist, isDarkMode, toggleDarkMode } = useStore();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-gray-100/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Headphones className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">Sonic</span>
          <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">AI</span>
          <span className="text-[9px] font-medium text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 rounded-md ml-1 border border-violet-100 dark:border-violet-500/20">
            BETA
          </span>
        </div>
      </div>

      {/* Center - tagline + sound wave */}
      <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
        <Sparkles className="w-3 h-3 text-violet-400" />
        <span>AI-powered headphone shopping</span>
        <SoundWave barCount={4} size="sm" color="gray" />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="relative w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all flex items-center justify-center"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDarkMode ? 180 : 0, scale: isDarkMode ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Sun className="w-4 h-4 text-amber-500" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{ rotate: isDarkMode ? 0 : -180, scale: isDarkMode ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Moon className="w-4 h-4 text-blue-400" />
          </motion.div>
        </motion.button>

        {/* Wishlist */}
        {wishlist.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-500"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold">{wishlist.length}</span>
          </motion.div>
        )}

        {/* Cart */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleCart}
          className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all"
        >
          <ShoppingBag className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          {itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-violet-500/30"
            >
              {itemCount}
            </motion.span>
          )}
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">Cart</span>
        </motion.button>
      </div>
    </motion.header>
  );
}
