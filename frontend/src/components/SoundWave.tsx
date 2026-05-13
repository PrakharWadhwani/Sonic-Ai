'use client';

import { motion } from 'motion/react';

interface SoundWaveProps {
  barCount?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SoundWave({ barCount = 5, color = 'violet', size = 'md' }: SoundWaveProps) {
  const heights = {
    sm: [8, 14, 20, 14, 8],
    md: [12, 24, 36, 24, 12],
    lg: [16, 32, 48, 32, 16],
  };

  const colorMap: Record<string, string> = {
    violet: 'from-violet-400 to-blue-400',
    gray: 'from-gray-300 to-gray-400',
    emerald: 'from-emerald-400 to-teal-400',
  };

  const barHeights = heights[size];
  const gradient = colorMap[color] || colorMap.violet;

  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: barCount }).map((_, i) => {
        const maxH = barHeights[i % barHeights.length];
        const minH = maxH * 0.3;
        return (
          <motion.div
            key={i}
            animate={{
              height: [minH, maxH, minH],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.12,
            }}
            className={`w-[3px] rounded-full bg-gradient-to-t ${gradient}`}
            style={{ height: minH }}
          />
        );
      })}
    </div>
  );
}
