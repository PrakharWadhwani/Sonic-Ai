'use client';

import { motion } from 'motion/react';
import { ArrowDownUp, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortOption {
  id: string;
  label: string;
}

interface FilterSortBarProps {
  activeSort: string;
  onSortChange: (sort: string) => void;
  resultCount: number;
}

const sortOptions: SortOption[] = [
  { id: 'ai', label: '✨ AI Ranked' },
  { id: 'price-low', label: 'Price: Low → High' },
  { id: 'price-high', label: 'Price: High → Low' },
  { id: 'sound', label: 'Sound Quality' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'battery', label: 'Battery Life' },
  { id: 'anc', label: 'Best ANC' },
];

export function FilterSortBar({ activeSort, onSortChange, resultCount }: FilterSortBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <ArrowUpDown className="w-3 h-3" />
          <span>Sort by</span>
        </div>
      </div>

      {/* Sort chips */}
      <div className="flex flex-wrap gap-1.5">
        {sortOptions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSortChange(option.id)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 border',
              activeSort === option.id
                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 shadow-sm shadow-violet-100 dark:shadow-violet-500/5'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
