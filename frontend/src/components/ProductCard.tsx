'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Headphone } from '@/data/headphones';
import { ProductBadge } from './ProductBadge';
import { ProductImage } from './ProductImage';
import { AudioSpecBar } from './AudioSpecBar';
import { useStore } from '@/hooks/use-store';
import { useToast } from './Toast';
import { ShoppingCart, Plus, ThumbsUp, ThumbsDown, Battery, Volume2, Shield, Heart, Eye, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Headphone;
  index: number;
  rank?: number;
  onAddToCart: (product: Headphone) => void;
  onSelect?: (product: Headphone) => void;
  compact?: boolean;
}

export function ProductCard({ product, index, rank, onAddToCart, onSelect, compact = false }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useStore();
  const { showToast } = useToast();
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    showToast(`${product.name} added to cart`, 'success');
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast(
      wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist ❤️`,
      wishlisted ? 'info' : 'success'
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
        layout: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onSelect?.(product)}
      className={cn(
        'group relative rounded-2xl border overflow-hidden transition-shadow duration-300 cursor-pointer',
        'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800',
        'hover:shadow-xl hover:shadow-gray-200/40 dark:hover:shadow-black/30 hover:border-gray-200 dark:hover:border-gray-700',
      )}
    >
      {/* Rank badge */}
      {rank && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: index * 0.1 + 0.2 }}
          className={cn(
            'absolute top-3 left-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg',
            rank === 1
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
              : rank === 2
              ? 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/30'
              : rank === 3
              ? 'bg-gradient-to-br from-amber-600 to-amber-700 shadow-amber-700/30'
              : 'bg-gradient-to-br from-violet-500 to-blue-500 shadow-violet-500/30'
          )}
        >
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
        </motion.div>
      )}

      {/* Top-right actions */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlist}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all',
            wishlisted
              ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-500 shadow-sm shadow-rose-200 dark:shadow-rose-500/10'
              : 'bg-white/70 dark:bg-gray-800/70 text-gray-400 hover:text-rose-400 hover:bg-white dark:hover:bg-gray-800 shadow-sm'
          )}
        >
          <Heart className={cn('w-3.5 h-3.5', wishlisted && 'fill-current')} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onSelect?.(product); }}
          className="w-7 h-7 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-400 hover:text-violet-500 hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center transition-all shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Product Image Area */}
      <ProductImage
        color={product.color}
        category={product.category}
        name={product.name}
        size={compact ? 'sm' : 'md'}
      />

      {/* Tags overlay on image */}
      <div className="absolute bottom-[calc(100%-10rem)] left-3 right-10 flex flex-wrap gap-1 items-end pb-2">
        {product.tags.slice(0, 2).map((tag) => (
          <ProductBadge key={tag} label={tag} size="sm" />
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{product.brand}</p>
            {product.latency > 0 && product.latency <= 15 && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-500/20">
                <Zap className="w-2.5 h-2.5" />
                Low Latency
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>ANC {product.anc}/10</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <Battery className="w-3 h-3 text-green-400" />
            <span>{product.batteryLife}h</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <Volume2 className="w-3 h-3 text-violet-400" />
            <span>{product.soundQuality}/10</span>
          </div>
        </div>

        {/* Spec Bars */}
        {!compact && (
          <div className="space-y-2 pt-1">
            <AudioSpecBar label="Sound Quality" value={product.soundQuality} color="violet" />
            <AudioSpecBar label="Comfort" value={product.comfort} color="teal" />
            <AudioSpecBar label="ANC" value={product.anc} color="blue" />
          </div>
        )}

        {/* Pros/Cons */}
        {!compact && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              {product.pros.slice(0, 2).map((pro, i) => (
                <div key={i} className="flex items-start gap-1">
                  <ThumbsUp className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{pro}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {product.cons.slice(0, 2).map((con, i) => (
                <div key={i} className="flex items-start gap-1">
                  <ThumbsDown className="w-3 h-3 text-rose-300 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{con}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${product.price}</span>
            {product.price >= 400 && (
              <span className="text-[10px] text-gray-400 ml-1">Premium</span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-lg',
              showAddedFeedback
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : 'bg-gray-900 dark:bg-violet-600 text-white hover:bg-gray-800 dark:hover:bg-violet-500 shadow-gray-900/20 dark:shadow-violet-600/20'
            )}
          >
            {showAddedFeedback ? (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </motion.div>
                Added!
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
