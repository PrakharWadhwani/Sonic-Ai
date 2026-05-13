'use client';

import { motion } from 'motion/react';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface RecommendationReasonProps {
  reasoning: string;
}

export function RecommendationReason({ reasoning }: RecommendationReasonProps) {
  if (!reasoning) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-500/20 bg-gradient-to-br from-violet-50/80 to-blue-50/50 dark:from-violet-500/10 dark:to-blue-500/5 p-4"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-200/20 rounded-full blur-3xl" />

      <div className="relative flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center shadow-lg shadow-violet-400/20">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold text-violet-600 flex items-center gap-1">
            AI Reasoning
            <ArrowRight className="w-3 h-3" />
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {reasoning}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
