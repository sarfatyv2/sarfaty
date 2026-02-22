'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  href: string;
  icon: LucideIcon;
  name: string;
  description: string;
  tableCount: number;
  color: string;
  delay?: number;
}

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-700',
    border: 'border-emerald-100 hover:border-emerald-300',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-700',
    border: 'border-blue-100 hover:border-blue-300',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-700',
    border: 'border-amber-100 hover:border-amber-300',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-700',
    border: 'border-purple-100 hover:border-purple-300',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-700',
    border: 'border-rose-100 hover:border-rose-300',
  },
  sky: {
    bg: 'bg-sky-50',
    icon: 'text-sky-700',
    border: 'border-sky-100 hover:border-sky-300',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-700',
    border: 'border-orange-100 hover:border-orange-300',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal-700',
    border: 'border-teal-100 hover:border-teal-300',
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-700',
    border: 'border-indigo-100 hover:border-indigo-300',
  },
};

export function ModuleCard({ href, icon: Icon, name, description, tableCount, color, delay = 0 }: ModuleCardProps) {
  const colors = colorMap[color] ?? { bg: 'bg-emerald-50', icon: 'text-emerald-700', border: 'border-emerald-100 hover:border-emerald-300' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Link
        href={href}
        className={`flex flex-col p-5 bg-white rounded-xl border ${colors.border} transition-all duration-200 shadow-sm hover:shadow-md group`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colors.bg}`}>
            <Icon size={19} className={colors.icon} />
          </div>
          <span className="text-xs font-medium text-[hsl(150,15%,55%)] bg-[hsl(30,20%,95%)] px-2 py-0.5 rounded-full">
            {tableCount} tabelas
          </span>
        </div>
        <h3 className="font-semibold text-[hsl(150,50%,12%)] group-hover:text-[hsl(150,50%,20%)] transition-colors">
          {name}
        </h3>
        <p className="mt-1 text-sm text-[hsl(150,15%,45%)] leading-relaxed line-clamp-2">{description}</p>
      </Link>
    </motion.div>
  );
}
