'use client';

import dynamic from 'next/dynamic';
import { PageWrapper } from '../../_components/page-wrapper';
import { SectionHeading } from '../../_components/section-heading';
import { Layers, Package, Shield, GitBranch, CheckCircle2 } from 'lucide-react';

const DddFlowDiagram = dynamic(
  () => import('../../_components/architecture-diagrams').then((m) => m.DddFlowDiagram),
  { ssr: false, loading: () => <div className="h-[360px] rounded-xl border border-[hsl(30,20%,88%)] bg-white animate-pulse" /> }
);

const MonorepoFlowDiagram = dynamic(
  () => import('../../_components/architecture-diagrams').then((m) => m.MonorepoFlowDiagram),
  { ssr: false, loading: () => <div className="h-[420px] rounded-xl border border-[hsl(30,20%,88%)] bg-white animate-pulse" /> }
);

const roles = [
  { role: 'admin', area: 'Administrador total', color: 'bg-red-100 text-red-800' },
  { role: 'sales_rep', area: 'Representante comercial', color: 'bg-green-100 text-green-800' },
  { role: 'sales_supervisor', area: 'Supervisor comercial', color: 'bg-green-100 text-green-800' },
  { role: 'sales_manager', area: 'Gerente comercial', color: 'bg-green-100 text-green-800' },
  { role: 'sales_director', area: 'Diretor comercial', color: 'bg-green-100 text-green-800' },
  { role: 'credit_analyst', area: 'Analista de crédito', color: 'bg-blue-100 text-blue-800' },
  { role: 'compliance_officer', area: 'Compliance', color: 'bg-blue-100 text-blue-800' },
  { role: 'approver', area: 'Aprovador', color: 'bg-blue-100 text-blue-800' },
  { role: 'backoffice', area: 'Backoffice', color: 'bg-purple-100 text-purple-800' },
  { role: 'legal', area: 'Jurídico', color: 'bg-purple-100 text-purple-800' },
  { role: 'risk_manager', area: 'Gestão de risco', color: 'bg-orange-100 text-orange-800' },
  { role: 'recovery', area: 'Recuperação de crédito', color: 'bg-orange-100 text-orange-800' },
  { role: 'litigation', area: 'Contencioso', color: 'bg-orange-100 text-orange-800' },
  { role: 'employee', area: 'Colaborador (self-service)', color: 'bg-slate-100 text-slate-800' },
  { role: 'people_manager', area: 'Gestor de pessoas', color: 'bg-rose-100 text-rose-800' },
  { role: 'hr', area: 'Recursos Humanos', color: 'bg-rose-100 text-rose-800' },
  { role: 'dp', area: 'Departamento Pessoal', color: 'bg-rose-100 text-rose-800' },
  { role: 'hr_admin', area: 'Administrador RH/DP', color: 'bg-rose-100 text-rose-800' },
];

const authSteps = [
  { step: '1', title: 'Login', desc: 'Email + senha via Supabase Auth. Retorna JWT com user_metadata.role' },
  { step: '2', title: 'Token', desc: 'JWT armazenado em cookie HttpOnly. Middleware Next.js valida em cada request' },
  { step: '3', title: 'RBAC check', desc: 'ROLE_PERMISSIONS[@nexus/config] define quais rotas e ações cada role pode acessar' },
  { step: '4', title: 'Route guard', desc: 'middleware.ts verifica role e redireciona para homeRoute específico por role' },
  { step: '5', title: 'RLS', desc: 'Supabase Row Level Security garante isolamento de dados no nível do banco' },
];

export default function ArchitecturePage() {
  return (
    <PageWrapper>
      <section className="relative overflow-hidden bg-[hsl(45,50%,91%)] px-10 py-14">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(44,52%,89%)] to-[hsl(46,45%,94%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(hsl(40,60%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(40,60%,50%) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(40,50%,80%)]">
              <Layers size={20} className="text-[hsl(38,70%,32%)]" />
            </div>
            <span className="text-sm font-semibold text-[hsl(35,25%,45%)] uppercase tracking-widest">Arquitetura</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight text-[hsl(35,35%,15%)]">Arquitetura do Sistema</h1>
          <p className="text-[hsl(35,20%,40%)] text-base leading-relaxed max-w-xl">
            DDD leve com 4 camadas, monorepo Turborepo e RBAC granular com 18 roles.
          </p>
        </div>
      </section>

      <div className="px-8 py-10 max-w-5xl space-y-14">
        {/* DDD Architecture */}
        <div>
          <SectionHeading
            title="Arquitetura DDD (Domain-Driven Design)"
            subtitle="4 camadas com responsabilidades bem definidas. Regras de negócio vivem nas domain entities, nunca nos controllers ou use cases."
            badge="DDD"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DddFlowDiagram />
            <div className="space-y-3">
              {[
                { layer: 'Controller', color: 'border-blue-400', desc: 'Recebe requests HTTP, valida input com Zod, delega ao UseCase. Nunca contém lógica de negócio.' },
                { layer: 'Use Case', color: 'border-purple-400', desc: 'Orquestra o fluxo de operações. Chama domain entities e repositories. Sem regras de negócio próprias.' },
                { layer: 'Domain', color: 'border-emerald-400', desc: 'Entidades ricas com invariantes de negócio. Define interfaces dos repositórios (nunca implementa).' },
                { layer: 'Repository (Infra)', color: 'border-amber-400', desc: 'Implementações com Drizzle ORM. Faz queries no Supabase/Postgres. Mappers convertem DB ↔ Domain.' },
              ].map((item) => (
                <div key={item.layer} className={`p-4 bg-white rounded-xl border-l-4 ${item.color} border border-[hsl(30,20%,90%)] shadow-sm`}>
                  <div className="text-sm font-bold text-[hsl(150,50%,12%)]">{item.layer}</div>
                  <p className="text-xs text-[hsl(150,15%,45%)] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monorepo */}
        <div>
          <SectionHeading
            title="Estrutura do Monorepo"
            subtitle="Turborepo + pnpm workspaces. Packages internos com escopo @nexus/ garantem reuso sem acoplamento."
            badge="Monorepo"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonorepoFlowDiagram />
            <div className="space-y-2">
              <div className="p-4 bg-[hsl(150,50%,10%)]/5 rounded-xl border border-[hsl(150,30%,80%)]">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={14} className="text-[hsl(150,50%,22%)]" />
                  <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Regra de dependência</span>
                </div>
                <div className="space-y-2 text-xs text-[hsl(150,15%,40%)]">
                  {[
                    'apps/ podem importar de packages/',
                    'packages/ NÃO importam de apps/',
                    '@nexus/types não depende de nenhum package (leaf node)',
                    '@nexus/validators depende de @nexus/types',
                    '@nexus/utils depende de @nexus/types',
                  ].map((rule) => (
                    <div key={rule} className="flex items-start gap-2">
                      <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
                <div className="text-xs font-bold text-[hsl(150,50%,20%)] mb-2">Pipeline Turborepo</div>
                <div className="font-mono text-[10px] text-[hsl(150,15%,40%)] space-y-1">
                  <div><span className="text-amber-600">build</span> → depende de <span className="text-purple-600">^build</span></div>
                  <div><span className="text-blue-600">typecheck</span> → cache habilitado</div>
                  <div><span className="text-blue-600">lint</span> → cache habilitado</div>
                  <div><span className="text-emerald-600">dev</span> → sem cache</div>
                  <div><span className="text-rose-600">test</span> → cache habilitado</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth flow */}
        <div>
          <SectionHeading
            title="Fluxo de Autenticação e RBAC"
            subtitle="Supabase Auth com JWT e Row Level Security. ROLE_PERMISSIONS define granularmente o que cada role pode fazer."
            badge="Auth + RBAC"
          />
          <div className="flex flex-col sm:flex-row gap-2 mb-8">
            {authSteps.map((s) => (
              <div key={s.step} className="flex-1 relative">
                <div className="flex flex-col p-3 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(150,50%,10%)] text-white text-[10px] font-bold shrink-0">
                      {s.step}
                    </div>
                    <span className="text-xs font-semibold text-[hsl(150,50%,15%)]">{s.title}</span>
                  </div>
                  <p className="text-[10px] text-[hsl(150,15%,48%)] leading-relaxed">{s.desc}</p>
                </div>
                {s.step !== '5' && (
                  <div className="hidden sm:flex absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-2 h-2 items-center justify-center">
                    <div className="w-2 h-0.5 bg-[hsl(48,100%,42%)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Roles table */}
        <div>
          <SectionHeading
            title="Roles do Sistema (18 roles)"
            subtitle="Interface adaptativa por role — mesma aplicação, experiência diferente. homeRoute é específico por role."
            badge="RBAC"
          />
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-[hsl(150,50%,22%)]" />
            <span className="text-xs text-[hsl(150,15%,45%)]">Cada role tem permissões granulares configuradas em <code className="font-mono bg-[hsl(30,20%,94%)] px-1 rounded">ROLE_PERMISSIONS</code> no package <code className="font-mono bg-[hsl(30,20%,94%)] px-1 rounded">@nexus/config</code></span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {roles.map((r) => (
              <div key={r.role} className="flex items-center justify-between gap-2 p-3 bg-white rounded-lg border border-[hsl(30,20%,88%)] shadow-sm">
                <span className="text-xs text-[hsl(150,15%,45%)] leading-tight">{r.area}</span>
                <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded shrink-0 ${r.color}`}>{r.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Backend setup */}
        <div>
          <SectionHeading
            title="Backend: NestJS + Fastify"
            subtitle="API REST com NestJS usando Fastify como adapter HTTP. Zod para validação, Pino para logs estruturados."
            badge="API"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: GitBranch,
                title: 'Módulos NestJS',
                items: ['AuthModule', 'ClientsModule', 'CreditModule', 'DraweesModule', 'PeopleModule', 'LearningModule', 'GoalsModule', 'PipelineModule', 'NotificationsModule'],
              },
              {
                icon: Shield,
                title: 'Globais (cross-cutting)',
                items: ['DatabaseModule (Drizzle)', 'AuditModule (interceptor)', 'NotificationsModule (dispatcher)', 'ConfigModule (env vars)'],
              },
              {
                icon: Layers,
                title: 'Infra por módulo',
                items: ['Controller (Fastify)', 'Guard (JWT + Role)', 'UseCase (orquestração)', 'Repository (Drizzle)', 'Mapper (DB ↔ Domain)'],
              },
            ].map((col) => (
              <div key={col.title} className="p-4 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <col.icon size={13} className="text-[hsl(150,50%,25%)]" />
                  <span className="text-xs font-bold text-[hsl(150,50%,15%)]">{col.title}</span>
                </div>
                <ul className="space-y-1.5">
                  {col.items.map((item) => (
                    <li key={item} className="text-[11px] font-mono text-[hsl(150,15%,40%)] bg-[hsl(30,20%,96%)] px-2 py-0.5 rounded">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
