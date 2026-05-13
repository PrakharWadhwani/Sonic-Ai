'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { useStore } from '@/hooks/use-store';
import { ProductCard } from './ProductCard';
import { ComparisonTable } from './ComparisonTable';
import { PreferenceChips } from './PreferenceChips';
import { RecommendationReason } from './RecommendationReason';
import { FilterSortBar } from './FilterSortBar';
import { SoundWave } from './SoundWave';
import { Headphones, BarChart3, Sparkles, ArrowDownUp, Layers, TrendingUp } from 'lucide-react';
import { Headphone } from '@/data/headphones';

export function RecommendationPanel() {
  const {
    recommendations,
    preferences,
    comparisonItems,
    showComparison,
    reasoning,
    removePreference,
    addToCart,
    toggleComparison,
    setComparisonItems,
    rerank,
    setSelectedProduct,
  } = useStore();

  const [activeSort, setActiveSort] = useState('ai');

  // Sort recommendations based on active sort
  const sortedRecommendations = useMemo(() => {
    if (activeSort === 'ai') return recommendations;
    const sorted = [...recommendations];
    switch (activeSort) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'sound':
        sorted.sort((a, b) => b.soundQuality - a.soundQuality);
        break;
      case 'comfort':
        sorted.sort((a, b) => b.comfort - a.comfort);
        break;
      case 'battery':
        sorted.sort((a, b) => b.batteryLife - a.batteryLife);
        break;
      case 'anc':
        sorted.sort((a, b) => b.anc - a.anc);
        break;
      default:
        break;
    }
    return sorted;
  }, [recommendations, activeSort]);

  const handleAddToCart = (product: Headphone) => {
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      type: 'headphone',
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-6 space-y-6">

        {/* Panel Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recommendation Workspace</h2>
            <SoundWave barCount={5} size="sm" color="violet" />
          </div>
          <p className="text-xs text-gray-400">AI-curated headphones based on your conversation</p>
        </div>

        {/* Preference Chips */}
        <PreferenceChips
          preferences={preferences}
          onRemove={(id) => {
            removePreference(id);
            // Trigger rerank with remaining preferences
            rerank('');
          }}
        />

        {/* AI Reasoning */}
        <AnimatePresence mode="wait">
          {reasoning && (
            <RecommendationReason reasoning={reasoning} />
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence mode="wait">
          {recommendations.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 space-y-6"
            >
              {/* Animated headphone icon with sound waves */}
              <div className="relative">
                {/* Pulsing rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 2], opacity: [0.15, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-2xl border border-violet-300"
                  />
                ))}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-500/20 dark:to-blue-500/20 flex items-center justify-center shadow-lg shadow-violet-100 dark:shadow-violet-500/10">
                    <Headphones className="w-10 h-10 text-violet-400" strokeWidth={1.5} />
                  </div>
                  {/* Decorative sparkles */}
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-5 h-5 text-violet-300" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Sound wave visualizer */}
              <SoundWave barCount={7} size="md" color="violet" />

              <div className="text-center space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Waiting for your preferences</h3>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Tell the AI assistant about your headphone needs and personalized recommendations will appear here
                </p>
              </div>

              {/* Skeleton cards */}
              <div className="w-full space-y-3 pt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-1/4 rounded-full bg-gray-100 animate-pulse" />
                        <div className="h-4 w-3/4 rounded-full bg-gray-100 animate-pulse" />
                        <div className="h-3 w-1/2 rounded-full bg-gray-100 animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <LayoutGroup>
            <div className="space-y-4">
              {/* Filter/Sort Bar */}
              <FilterSortBar
                activeSort={activeSort}
                onSortChange={setActiveSort}
                resultCount={recommendations.length}
              />

              {/* Actions Bar */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (showComparison) {
                      toggleComparison();
                    } else {
                      setComparisonItems(recommendations.slice(0, 3));
                      toggleComparison();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-200 dark:hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-500/5 transition-all"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  {showComparison ? 'Hide Comparison' : 'Compare Top 3'}
                </motion.button>

                {activeSort !== 'ai' && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSort('ai')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-violet-200 text-violet-600 bg-violet-50/50 hover:bg-violet-50 transition-all"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Reset to AI Ranking
                  </motion.button>
                )}
              </div>

              {/* Comparison Table */}
              <AnimatePresence>
                {showComparison && comparisonItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ComparisonTable items={comparisonItems} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Product Cards */}
              <AnimatePresence mode="popLayout">
                {sortedRecommendations.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    rank={activeSort === 'ai' ? i + 1 : undefined}
                    onAddToCart={handleAddToCart}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        )}
      </div>
    </div>
  );
}
