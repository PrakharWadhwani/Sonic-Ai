'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { badgeColors } from '@/data/headphones';

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
