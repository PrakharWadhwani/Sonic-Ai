'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-medium text-violet-500">SonicAI</span>
        <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Analyzing your preferences</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
