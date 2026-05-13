'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AudioSpecBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  suffix?: string;
}

export function AudioSpecBar({ label, value, max = 10, color = 'violet', suffix = '' }: AudioSpecBarProps) {
  const percentage = (value / max) * 100;

  const colorMap: Record<string, string> = {
    violet: 'from-violet-400 to-violet-600',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-emerald-400 to-emerald-600',
    amber: 'from-amber-400 to-amber-600',
    rose: 'from-rose-400 to-rose-600',
    teal: 'from-teal-400 to-teal-600',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className="text-[11px] text-gray-700 dark:text-gray-300 font-semibold tabular-nums">
          {value}{suffix}{max !== 10 ? '' : '/10'}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className={cn('h-full rounded-full bg-gradient-to-r', colorMap[color] || colorMap.violet)}
        />
      </div>
    </div>
  );
}
