'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, DollarSign, Target, Zap, Shield, Headphones, Briefcase } from 'lucide-react';
import { Preference } from '@/store/app-store';
import { cn } from '@/lib/utils';

interface PreferenceChipsProps {
  preferences: Preference[];
  onRemove: (id: string) => void;
  onUpdate?: (id: string, value: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Budget: <DollarSign className="w-3 h-3" />,
  'Use Case': <Target className="w-3 h-3" />,
  Priority: <Zap className="w-3 h-3" />,
  ANC: <Shield className="w-3 h-3" />,
  'Sound Profile': <Headphones className="w-3 h-3" />,
};

const colorMap: Record<string, string> = {
  Budget: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  'Use Case': 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400',
  Priority: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
  ANC: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-400',
  'Sound Profile': 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400',
};

export function PreferenceChips({ preferences, onRemove, onUpdate }: PreferenceChipsProps) {
  if (preferences.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        <Briefcase className="w-3 h-3" />
        Your Preferences
      </p>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {preferences.map((pref) => (
            <motion.div
              key={pref.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'group flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium cursor-default transition-all',
                colorMap[pref.label] || 'bg-gray-50 border-gray-200 text-gray-600'
              )}
            >
              {iconMap[pref.label]}
              <span className="opacity-70">{pref.label}:</span>
              <span className="font-semibold">{pref.value}</span>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => onRemove(pref.id)}
                className="ml-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-all"
              >
                <X className="w-3 h-3" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
