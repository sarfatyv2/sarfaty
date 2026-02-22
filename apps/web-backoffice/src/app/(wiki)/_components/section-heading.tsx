'use client';

import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, badge, className = '' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`mb-8 ${className}`}
    >
      {badge && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[hsl(48,100%,42%)]/10 text-[hsl(48,100%,30%)] border border-[hsl(48,100%,42%)]/20 mb-3">
          {badge}
        </span>
      )}
      <h2 className="text-2xl font-bold text-[hsl(150,50%,12%)] tracking-tight">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-base text-[hsl(150,15%,40%)] leading-relaxed">{subtitle}</p>
      )}
      <div className="mt-3 h-0.5 w-12 bg-[hsl(48,100%,42%)] rounded-full" />
    </motion.div>
  );
}
