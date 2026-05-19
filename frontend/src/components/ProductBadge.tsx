'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

// Badge color mapping (inline since the data file may be empty)
const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
  'Best ANC': { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  'Best Battery': { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/20' },
  'Travel Pick': { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-500/20' },
  'Best for Calls': { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  'Audiophile Choice': { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/20' },
  'Best Comfort': { bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-500/20' },
  'Best for Gaming': { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20' },
  'Best for Workout': { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20' },
  'Best Value': { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
  'Office Pick': { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-500/20' },
  'Studio Grade': { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/20' },
  'Unique Design': { bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-200 dark:border-fuchsia-500/20' },
  'Best Durability': { bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20' },
};

interface ProductBadgeProps {
  label: string;
  size?: 'sm' | 'md';
}

export function ProductBadge({ label, size = 'sm' }: ProductBadgeProps) {
  const colors = badgeColors[label] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -1 }}
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        colors.bg, colors.text, colors.border,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      )}
    >
      {label}
    </motion.span>
  );
}
