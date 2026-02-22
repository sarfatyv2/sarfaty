'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface FlowStep {
  label: string;
  desc?: string;
  color?: string;
}

interface TableInfo {
  name: string;
  description: string;
  keyColumns?: string[];
}

interface ModulePageLayoutProps {
  icon: LucideIcon;
  name: string;
  domain: string;
  description: string;
  color: string;
  gradient: string;
  roles: string[];
  tables: TableInfo[];
  flowSteps?: FlowStep[];
  features?: string[];
  children?: React.ReactNode;
}

const colorDot: Record<string, string> = {
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  purple: 'bg-violet-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  teal: 'bg-teal-500',
  indigo: 'bg-indigo-500',
  orange: 'bg-orange-500',
};

export function ModulePageLayout({
  icon: Icon,
  name,
  domain,
  description,
  gradient,
  roles,
  tables,
  flowSteps,
  features,
  children,
  color,
}: ModulePageLayoutProps) {
  const dot = colorDot[color] ?? 'bg-slate-500';

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className={`relative overflow-hidden text-white px-10 py-14 ${gradient}`}>
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15">
              <Icon size={20} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white/50 uppercase tracking-widest">{domain}</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight">{name}</h1>
          <p className="text-white/65 text-base leading-relaxed max-w-xl">{description}</p>
        </div>
      </section>

      <div className="px-8 py-10 max-w-5xl space-y-12">
        {/* Roles */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Roles com Acesso</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span key={role} className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-[hsl(150,50%,10%)]/8 text-[hsl(150,50%,20%)] border border-[hsl(150,30%,80%)]">
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Flow steps */}
        {flowSteps && flowSteps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Fluxo Principal</span>
            </div>
            <div className="relative flex flex-col sm:flex-row gap-0">
              {flowSteps.map((step, i) => (
                <div key={step.label} className="flex-1 relative">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                    className="flex flex-col p-4 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm mx-1 h-full"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(150,50%,10%)] text-white text-[10px] font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${dot}`} />
                      <span className="text-xs font-semibold text-[hsl(150,50%,15%)]">{step.label}</span>
                    </div>
                    {step.desc && (
                      <p className="text-[10px] text-[hsl(150,15%,48%)] leading-relaxed">{step.desc}</p>
                    )}
                  </motion.div>
                  {i < flowSteps.length - 1 && (
                    <div className="hidden sm:block absolute -right-0.5 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-1.5 h-0.5 bg-[hsl(48,100%,42%)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {features && features.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Funcionalidades</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-[hsl(30,20%,88%)] shadow-sm">
                  <div className={`w-1.5 h-1.5 rounded-full ${dot} mt-1 shrink-0`} />
                  <span className="text-xs text-[hsl(150,15%,35%)] leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom content */}
        {children}

        {/* Tables */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Tabelas do Banco</span>
            <span className="text-[10px] text-[hsl(150,15%,55%)] bg-[hsl(30,20%,95%)] px-2 py-0.5 rounded-full">{tables.length} tabelas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tables.map((table) => (
              <div key={table.name} className="p-4 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
                <div className="font-mono text-xs font-bold text-[hsl(150,50%,15%)] mb-1">{table.name}</div>
                <p className="text-[11px] text-[hsl(150,15%,50%)] mb-2 leading-relaxed">{table.description}</p>
                {table.keyColumns && table.keyColumns.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {table.keyColumns.map((col) => (
                      <span key={col} className="text-[9px] font-mono bg-[hsl(150,20%,94%)] text-[hsl(150,30%,30%)] px-1.5 py-0.5 rounded">
                        {col}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/wiki/database"
              className="flex items-center gap-1.5 text-xs text-[hsl(150,50%,25%)] hover:text-[hsl(150,50%,15%)] transition-colors"
            >
              <ExternalLink size={11} />
              Ver ERD completo no Banco de Dados
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
