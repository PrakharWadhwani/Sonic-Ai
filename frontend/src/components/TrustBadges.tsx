'use client';

import { motion } from 'motion/react';
import { TrendingUp, Users, Shield, Truck, Star, Award } from 'lucide-react';

const stats = [
  { icon: Users, label: '50K+ Happy Customers', color: 'text-violet-500' },
  { icon: Shield, label: '2-Year Warranty', color: 'text-blue-500' },
  { icon: Truck, label: 'Free Shipping $200+', color: 'text-emerald-500' },
  { icon: Award, label: '30-Day Returns', color: 'text-amber-500' },
];

export function TrustBadges() {
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 overflow-x-auto scrollbar-none">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-1.5 flex-shrink-0"
        >
          <stat.icon className={`w-3 h-3 ${stat.color}`} />
          <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
