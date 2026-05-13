'use client';

import { motion } from 'motion/react';
import { Headphone } from '@/data/headphones';
import { Shield, Volume2, Headphones, Battery, Mic, Briefcase, Timer, DollarSign, Check, X as XIcon, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonTableProps {
  items: Headphone[];
}

const specs = [
  { key: 'soundQuality', label: 'Sound Quality', icon: Volume2, color: 'text-violet-500' },
  { key: 'comfort', label: 'Comfort', icon: Headphones, color: 'text-teal-500' },
  { key: 'anc', label: 'ANC', icon: Shield, color: 'text-blue-500' },
  { key: 'batteryLife', label: 'Battery Life', icon: Battery, color: 'text-green-500' },
  { key: 'micQuality', label: 'Microphone', icon: Mic, color: 'text-amber-500' },
  { key: 'portability', label: 'Portability', icon: Briefcase, color: 'text-rose-500' },
  { key: 'latency', label: 'Latency', icon: Timer, color: 'text-cyan-500' },
  { key: 'price', label: 'Price', icon: DollarSign, color: 'text-emerald-500' },
] as const;

export function ComparisonTable({ items }: ComparisonTableProps) {
  if (items.length === 0) return null;

  const getBestForSpec = (key: string) => {
    if (key === 'price' || key === 'latency') {
      // Lower is better
      return items.reduce((best, item) => {
        const val = item[key as keyof Headphone] as number;
        const bestVal = best[key as keyof Headphone] as number;
        return val < bestVal ? item : best;
      }).id;
    }
    return items.reduce((best, item) => {
      const val = item[key as keyof Headphone] as number;
      const bestVal = best[key as keyof Headphone] as number;
      return val > bestVal ? item : best;
    }).id;
  };

  const formatValue = (key: string, value: number) => {
    if (key === 'batteryLife') return value > 0 ? `${value}h` : 'Wired';
    if (key === 'latency') return value > 0 ? `${value}ms` : 'Wired';
    if (key === 'price') return `$${value}`;
    return `${value}/10`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          Head-to-Head Comparison
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="sticky left-0 bg-white dark:bg-gray-900 z-10 px-4 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider w-32">
                Spec
              </th>
              {items.map((item, i) => (
                <th key={item.id} className="px-4 py-3 text-center min-w-[120px]">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-1"
                  >
                    <p className="text-[10px] font-medium text-gray-400 uppercase">{item.brand}</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                  </motion.div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specs.map((spec, rowIndex) => {
              const bestId = getBestForSpec(spec.key);
              return (
                <motion.tr
                  key={spec.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="border-b border-gray-50/80 dark:border-gray-800/80 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="sticky left-0 bg-white dark:bg-gray-900 z-10 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <spec.icon className={cn('w-3.5 h-3.5', spec.color)} />
                      <span className="text-xs font-medium text-gray-600">{spec.label}</span>
                    </div>
                  </td>
                  {items.map((item) => {
                    const value = item[spec.key as keyof Headphone] as number;
                    const isBest = item.id === bestId;
                    return (
                      <td key={item.id} className="px-4 py-2.5 text-center">
                        <span className={cn(
                          'text-xs font-semibold tabular-nums',
                          isBest ? 'text-violet-600' : 'text-gray-500'
                        )}>
                          {formatValue(spec.key, value)}
                          {isBest && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-block ml-1"
                            >
                              👑
                            </motion.span>
                          )}
                        </span>
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
