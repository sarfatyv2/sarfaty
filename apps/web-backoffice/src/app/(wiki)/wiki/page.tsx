'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PageWrapper } from '../_components/page-wrapper';
import { SectionHeading } from '../_components/section-heading';
import { ModuleCard } from '../_components/module-card';
import {
  Briefcase,
  CreditCard,
  Users,
  BarChart2,
  DollarSign,
  TrendingUp,
  BookOpen,
  Bell,
  Building2,
  Layers,
  Database,
  Code2,
  Globe,
  Zap,
  Shield,
  GitBranch,
  Server,
} from 'lucide-react';

const OverviewFlowDiagram = dynamic(
  () => import('../_components/overview-flow-diagram'),
  { ssr: false, loading: () => <div className="h-[420px] rounded-xl border border-[hsl(30,20%,88%)] bg-white animate-pulse" /> }
);

const modules = [
  {
    href: '/wiki/modules/commercial',
    icon: Briefcase,
    name: 'Comercial',
    description: 'Gestão do ciclo de vida de clientes, desde a prospecção até a ativação com 21 status distintos.',
    tableCount: 14,
    color: 'green',
  },
  {
    href: '/wiki/modules/credit',
    icon: CreditCard,
    name: 'Crédito',
    description: 'Integrações com Vadu (CNPJ/CPF) e Creditbox para análise de crédito.',
    tableCount: 3,
    color: 'blue',
  },
  {
    href: '/wiki/modules/drawees',
    icon: Building2,
    name: 'Sacados',
    description: 'Cadastro e gestão de devedores (PJ/PF), grupos econômicos e produtos habilitados.',
    tableCount: 8,
    color: 'sky',
  },
  {
    href: '/wiki/modules/pipeline',
    icon: BarChart2,
    name: 'Pipeline',
    description: 'Funil comercial com 7 estágios, métricas de conversão e visão kanban.',
    tableCount: 2,
    color: 'amber',
  },
  {
    href: '/wiki/modules/financial',
    icon: DollarSign,
    name: 'Financeiro',
    description: 'Contas financeiras de clientes, transações, pendências e liquidações.',
    tableCount: 5,
    color: 'teal',
  },
  {
    href: '/wiki/modules/debentures',
    icon: TrendingUp,
    name: 'Debêntures',
    description: 'Emissores, emissões, séries, subscrições e valorização diária.',
    tableCount: 6,
    color: 'indigo',
  },
  {
    href: '/wiki/modules/people',
    icon: Users,
    name: 'Pessoas',
    description: 'RH + DP: colaboradores CLT/PJ, dependentes, reembolsos, avaliações e onboarding.',
    tableCount: 13,
    color: 'rose',
  },
  {
    href: '/wiki/modules/learning',
    icon: BookOpen,
    name: 'Aprendizagem',
    description: 'Plataforma de cursos com módulos, lições em vídeo, trilhas e progresso.',
    tableCount: 5,
    color: 'purple',
  },
  {
    href: '/wiki/modules/notifications',
    icon: Bell,
    name: 'Notificações',
    description: 'Sistema event-driven de notificações em tempo real para todos os módulos.',
    tableCount: 1,
    color: 'orange',
  },
];

const techStack = [
  { label: 'Next.js 15', icon: Globe, description: 'App Router, Server Components' },
  { label: 'NestJS', icon: Server, description: 'Fastify adapter, DDD' },
  { label: 'Supabase', icon: Database, description: 'PostgreSQL 15 + RLS' },
  { label: 'Drizzle ORM', icon: Code2, description: 'Type-safe queries' },
  { label: 'Temporal.io', icon: GitBranch, description: 'Workflows distribuídos' },
  { label: 'Upstash Redis', icon: Zap, description: 'Cache e rate limiting' },
  { label: 'Turborepo', icon: Layers, description: 'Monorepo com pnpm' },
  { label: 'RBAC', icon: Shield, description: '18 roles, permissões granulares' },
];

const stats = [
  { value: '73', label: 'Tabelas no banco' },
  { value: '18', label: 'Roles de acesso' },
  { value: '9', label: 'Módulos funcionais' },
  { value: '3', label: 'Apps no monorepo' },
];

export default function WikiOverviewPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[hsl(45,50%,91%)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(44,52%,89%)] via-[hsl(45,50%,91%)] to-[hsl(46,45%,94%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(40,60%,50%) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative px-10 py-16 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(40,60%,45%)]/15 border border-[hsl(40,60%,45%)]/30 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(40,70%,40%)] animate-pulse" />
            <span className="text-xs font-semibold text-[hsl(38,65%,30%)] tracking-wide">Documentação Técnica</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight text-[hsl(35,35%,15%)]">
            Plataforma Corporativa<br />
            <span className="text-[hsl(38,70%,32%)]">Sarfaty</span>
          </h1>
          <p className="text-lg text-[hsl(35,20%,40%)] max-w-xl leading-relaxed">
            Interface única adaptativa que integra todas as áreas da empresa — comercial, crédito, compliance, jurídico, backoffice, risco e pessoas.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[hsl(42,45%,84%)] rounded-xl p-4 border border-[hsl(40,40%,80%)]">
                <div className="text-3xl font-bold text-[hsl(38,70%,32%)]">{stat.value}</div>
                <div className="text-xs text-[hsl(35,20%,45%)] mt-1 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-8 py-10 max-w-6xl space-y-14">
        {/* Macro flow diagram */}
        <div>
          <SectionHeading
            title="Fluxo de Dados Entre Módulos"
            subtitle="Visão macro de como os módulos se comunicam e dependem uns dos outros."
            badge="Arquitetura"
          />
          <Suspense fallback={<div className="h-[420px] rounded-xl border border-[hsl(30,20%,88%)] bg-white animate-pulse" />}>
            <OverviewFlowDiagram />
          </Suspense>
        </div>

        {/* Modules grid */}
        <div>
          <SectionHeading
            title="Módulos da Plataforma"
            subtitle="Cada módulo encapsula um domínio de negócio com suas próprias entidades, use cases e repositórios."
            badge="Módulos"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod, i) => (
              <ModuleCard key={mod.href} {...mod} delay={i * 0.06} />
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div>
          <SectionHeading
            title="Stack Tecnológico"
            subtitle="Tecnologias que compõem a plataforma, escolhidas para escalabilidade e produtividade."
            badge="Stack"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {techStack.map((tech) => (
              <div key={tech.label} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[hsl(30,20%,88%)] hover:border-[hsl(150,30%,70%)] transition-colors shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(150,50%,10%)]/8 shrink-0">
                  <tech.icon size={15} className="text-[hsl(150,50%,22%)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[hsl(150,50%,12%)]">{tech.label}</div>
                  <div className="text-xs text-[hsl(150,15%,50%)] mt-0.5 leading-tight">{tech.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
