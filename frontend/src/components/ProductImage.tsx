'use client';

import { motion } from 'motion/react';
import { Headphones } from 'lucide-react';

interface ProductImageProps {
  color: string;
  category: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

// Generate a unique gradient based on product color and category
const categoryGradients: Record<string, string[]> = {
  travel: ['from-violet-500/20', 'via-blue-500/10', 'to-indigo-500/20'],
  gaming: ['from-red-500/20', 'via-orange-500/10', 'to-rose-500/20'],
  workout: ['from-emerald-500/20', 'via-teal-500/10', 'to-cyan-500/20'],
  audiophile: ['from-amber-500/20', 'via-yellow-500/10', 'to-orange-500/20'],
  office: ['from-slate-500/20', 'via-gray-500/10', 'to-zinc-500/20'],
};

const categoryIcons: Record<string, { ringColor: string; iconColor: string; glowColor: string }> = {
  travel: { ringColor: 'border-violet-200', iconColor: 'text-violet-500', glowColor: 'shadow-violet-200/50' },
  gaming: { ringColor: 'border-red-200', iconColor: 'text-red-500', glowColor: 'shadow-red-200/50' },
  workout: { ringColor: 'border-emerald-200', iconColor: 'text-emerald-500', glowColor: 'shadow-emerald-200/50' },
  audiophile: { ringColor: 'border-amber-200', iconColor: 'text-amber-600', glowColor: 'shadow-amber-200/50' },
  office: { ringColor: 'border-slate-200', iconColor: 'text-slate-500', glowColor: 'shadow-slate-200/50' },
};

export function ProductImage({ color, category, name, size = 'md' }: ProductImageProps) {
  const gradient = categoryGradients[category] || categoryGradients.travel;
  const style = categoryIcons[category] || categoryIcons.travel;
  const sizeClasses = {
    sm: { container: 'h-28', icon: 'w-10 h-10', ring: 'w-16 h-16' },
    md: { container: 'h-40', icon: 'w-14 h-14', ring: 'w-22 h-22' },
    lg: { container: 'h-52', icon: 'w-20 h-20', ring: 'w-28 h-28' },
  };

  const s = sizeClasses[size];

  return (
    <div className={`relative ${s.container} bg-gradient-to-br ${gradient[0]} ${gradient[1]} ${gradient[2]} flex items-center justify-center overflow-hidden`}>
      {/* Decorative background circles */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
          style={{ background: `radial-gradient(circle, ${color}25 0%, transparent 70%)` }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full"
          style={{ background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Icon with ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10"
      >
        <div className={`${s.ring} rounded-2xl border ${style.ringColor} bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm flex items-center justify-center shadow-lg ${style.glowColor}`}>
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Headphones className={`${s.icon} ${style.iconColor}`} strokeWidth={1.2} />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom brand gradient bar */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/40 dark:from-gray-900/40 to-transparent" />
    </div>
  );
}
