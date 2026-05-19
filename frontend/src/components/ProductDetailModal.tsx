'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Plus, Star, Battery, Volume2, Shield, Mic, Headphones, Weight, Timer, Zap, Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Headphone } from '@/store/app-store';
import { ProductBadge } from './ProductBadge';
import { AudioSpecBar } from './AudioSpecBar';
import { cn } from '@/lib/utils';

interface ProductDetailModalProps {
  product: Headphone | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Headphone) => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) {
  if (!product) return null;

  const specs = [
    { label: 'Sound Quality', value: product.soundQuality, max: 10, icon: Volume2, color: 'violet' },
    { label: 'Comfort', value: product.comfort, max: 10, icon: Headphones, color: 'teal' },
    { label: 'Active Noise Cancelling', value: product.anc, max: 10, icon: Shield, color: 'blue' },
    { label: 'Microphone Quality', value: product.micQuality, max: 10, icon: Mic, color: 'amber' },
    { label: 'Portability', value: product.portability, max: 10, icon: Weight, color: 'emerald' },
  ];

  const details = [
    { label: 'Battery Life', value: product.batteryLife > 0 ? `${product.batteryLife} hours` : 'Wired', icon: Battery },
    { label: 'Weight', value: `${product.weight}g`, icon: Weight },
    { label: 'Latency', value: product.latency > 0 ? `${product.latency}ms` : 'Wired', icon: Timer },
    { label: 'Category', value: product.category.charAt(0).toUpperCase() + product.category.slice(1), icon: Zap },
  ];

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
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 xl:inset-x-32 xl:inset-y-12 z-50 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col lg:flex-row h-full">
                
                {/* Left: Product Visual */}
                <div className="lg:w-[45%] relative overflow-hidden">
                  <div 
                    className="h-64 lg:h-full flex items-center justify-center relative"
                    style={{ background: `linear-gradient(135deg, ${product.color}15, ${product.color}08, #f8f9fa)` }}
                  >
                    {product.image ? (
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover" 
                      />
                    ) : (
                      <>
                        {/* Decorative circles */}
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute w-80 h-80 rounded-full border-2"
                          style={{ borderColor: `${product.color}20` }}
                        />
                        <motion.div
                          animate={{ scale: [1.1, 1, 1.1], opacity: [0.05, 0.15, 0.05] }}
                          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute w-60 h-60 rounded-full border-2"
                          style={{ borderColor: `${product.color}30` }}
                        />

                        {/* Sound wave rings */}
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [1, 2.5],
                              opacity: [0.3, 0],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              delay: i * 0.8,
                              ease: 'easeOut',
                            }}
                            className="absolute w-20 h-20 rounded-full border"
                            style={{ borderColor: `${product.color}40` }}
                          />
                        ))}

                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                        >
                          <Headphones className="w-28 h-28 lg:w-36 lg:h-36" style={{ color: product.color }} strokeWidth={1} />
                        </motion.div>
                      </>
                    )}

                    {/* Floating badges */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute bottom-4 left-4 lg:bottom-8 lg:left-8 flex flex-wrap gap-2"
                    >
                      {product.tags.map((tag) => (
                        <ProductBadge key={tag} label={tag} />
                      ))}
                    </motion.div>
                  </div>
                </div>

                {/* Right: Product Info */}
                <div className="lg:w-[55%] p-6 lg:p-8 space-y-6 lg:overflow-y-auto">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em]">{product.brand}</p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{product.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{product.description}</p>
                  </motion.div>

                  {/* Price + CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">${product.price}</span>
                      <span className="text-xs text-gray-400">.00</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onAddToCart(product);
                        onClose();
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-violet-600 dark:to-blue-600 text-white text-sm font-semibold shadow-xl shadow-gray-900/20 dark:shadow-violet-500/20 hover:shadow-gray-900/30 dark:hover:shadow-violet-500/30 transition-shadow"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                  </motion.div>

                  {/* Quick Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                  >
                    {details.map((detail, i) => (
                      <motion.div
                        key={detail.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center space-y-1"
                      >
                        <detail.icon className="w-4 h-4 text-gray-400 mx-auto" />
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{detail.value}</p>
                        <p className="text-[10px] text-gray-400">{detail.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Audio Specs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Audio Specifications</h3>
                    <div className="space-y-3">
                      {specs.map((spec, i) => (
                        <motion.div
                          key={spec.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.05 }}
                          className="flex items-center gap-3"
                        >
                          <spec.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1">
                            <AudioSpecBar label={spec.label} value={spec.value} max={spec.max} color={spec.color} />
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-8 text-right tabular-nums">{spec.value}/10</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Pros & Cons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {/* Pros */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 space-y-2">
                      <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {product.pros.map((pro, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + i * 0.05 }}
                            className="flex items-start gap-2 text-xs text-emerald-800"
                          >
                            <ChevronRight className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                            {pro}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 space-y-2">
                      <h4 className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" />
                        Limitations
                      </h4>
                      <ul className="space-y-1.5">
                        {product.cons.map((con, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + i * 0.05 }}
                            className="flex items-start gap-2 text-xs text-rose-800"
                          >
                            <ChevronRight className="w-3 h-3 mt-0.5 text-rose-400 flex-shrink-0" />
                            {con}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  {/* AI Verdict */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-500/10 dark:to-blue-500/10 border border-violet-100 dark:border-violet-500/20 space-y-2"
                  >
                    <h4 className="text-xs font-semibold text-violet-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      AI Verdict
                    </h4>
                    <p className="text-xs text-violet-800 leading-relaxed">
                      {product.soundQuality >= 9 && product.comfort >= 9
                        ? `The ${product.name} delivers an exceptional audio experience with top-tier comfort. This is a premium choice that justifies its price with outstanding performance across the board.`
                        : product.batteryLife >= 30
                        ? `With an impressive ${product.batteryLife}-hour battery life, the ${product.name} is built for endurance. Perfect for users who prioritize reliability and longevity.`
                        : product.anc >= 9
                        ? `The ${product.name} features industry-leading noise cancellation technology. Ideal for frequent travelers and professionals who need to focus in noisy environments.`
                        : product.portability >= 9
                        ? `The ultra-portable ${product.name} is designed for life on the move. Compact, lightweight, and feature-packed — a great daily driver.`
                        : `The ${product.name} by ${product.brand} offers solid performance in its category. A well-rounded option that balances features and value effectively.`
                      }
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
