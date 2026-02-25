'use client';

import dynamic from 'next/dynamic';
import { PageWrapper } from '../../_components/page-wrapper';
import { SectionHeading } from '../../_components/section-heading';
import { Database, Info } from 'lucide-react';

const DatabaseErd = dynamic(
  () => import('../../_components/database-erd'),
  { ssr: false, loading: () => <div className="h-[640px] rounded-xl border border-[hsl(30,20%,88%)] bg-white animate-pulse" /> }
);

const domains = [
  { name: 'Core', tables: 5, color: 'bg-emerald-500', desc: 'profiles, regions, teams, notifications, audit_logs' },
  { name: 'Comercial', tables: 14, color: 'bg-blue-500', desc: 'clients, documents, guarantees, goals, segments' },
  { name: 'Crédito / Integrações', tables: 3, color: 'bg-purple-500', desc: 'vadu_company_results, vadu_person_results, creditbox_reports' },
  { name: 'Sacados', tables: 8, color: 'bg-sky-500', desc: 'drawees, contacts, addresses, bank_accounts, groups' },
  { name: 'Grupos Econômicos', tables: 4, color: 'bg-sky-400', desc: 'economic_groups, members, persons, bank_accounts' },
  { name: 'Financeiro', tables: 5, color: 'bg-teal-500', desc: 'financial_accounts, transactions, pendencies, settlements' },
  { name: 'Portfólio', tables: 4, color: 'bg-cyan-500', desc: 'portfolio_positions, market_rates, iof_rates, ir_rates' },
  { name: 'Debêntures', tables: 6, color: 'bg-indigo-500', desc: 'issuers, issuances, series, subscriptions, valuations' },
  { name: 'Fornecedores', tables: 5, color: 'bg-orange-500', desc: 'suppliers, contacts, addresses, bank_accounts, documents' },
  { name: 'Pessoas (RH/DP)', tables: 13, color: 'bg-rose-500', desc: 'collaborators, clt_data, pj_data, dependents, reimbursements' },
  { name: 'Aprendizagem', tables: 5, color: 'bg-violet-500', desc: 'courses, modules, lessons, enrollments, completions' },
  { name: 'Integrações', tables: 3, color: 'bg-slate-500', desc: 'vadu_company, vadu_person, creditbox_reports' },
  { name: 'IRPF / Agente IA', tables: 2, color: 'bg-amber-500', desc: 'irpf_extractions, irpf_extraction_sources' },
];

export default function DatabasePage() {
  return (
    <PageWrapper>
      <section className="relative overflow-hidden bg-[hsl(45,50%,91%)] px-10 py-14">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(44,52%,89%)] to-[hsl(46,45%,94%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(40,60%,50%) 2px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(40,50%,80%)]">
              <Database size={20} className="text-[hsl(38,70%,32%)]" />
            </div>
            <span className="text-sm font-semibold text-[hsl(35,25%,45%)] uppercase tracking-widest">Banco de Dados</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight text-[hsl(35,35%,15%)]">Estrutura do Banco de Dados</h1>
          <p className="text-[hsl(35,20%,40%)] text-base leading-relaxed max-w-xl">
            PostgreSQL 15 via Supabase com 84 tabelas, RLS habilitado em todas, organizadas em 13 domínios.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="px-3 py-1 rounded-full bg-[hsl(42,45%,82%)] text-xs text-[hsl(35,35%,25%)] border border-[hsl(40,35%,75%)]">84 tabelas</span>
            <span className="px-3 py-1 rounded-full bg-[hsl(42,45%,82%)] text-xs text-[hsl(35,35%,25%)] border border-[hsl(40,35%,75%)]">RLS habilitado</span>
            <span className="px-3 py-1 rounded-full bg-[hsl(42,45%,82%)] text-xs text-[hsl(35,35%,25%)] border border-[hsl(40,35%,75%)]">Drizzle ORM</span>
            <span className="px-3 py-1 rounded-full bg-[hsl(42,45%,82%)] text-xs text-[hsl(35,35%,25%)] border border-[hsl(40,35%,75%)]">UUID v4</span>
            <span className="px-3 py-1 rounded-full bg-[hsl(42,45%,82%)] text-xs text-[hsl(35,35%,25%)] border border-[hsl(40,35%,75%)]">created_at / updated_at</span>
          </div>
        </div>
      </section>

      <div className="px-8 py-10 max-w-6xl space-y-12">
        {/* Domains overview */}
        <div>
          <SectionHeading
            title="Domínios do Banco"
            subtitle="84 tabelas organizadas em 13 domínios. Cada domínio segue as fronteiras do módulo de negócio correspondente."
            badge="Schema"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {domains.map((d) => (
              <div key={d.name} className="p-3 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-2 h-2 rounded-full ${d.color} shrink-0`} />
                  <span className="text-xs font-semibold text-[hsl(150,50%,15%)]">{d.name}</span>
                  <span className="ml-auto text-[10px] font-medium text-[hsl(150,15%,55%)] bg-[hsl(30,20%,95%)] px-1.5 py-0.5 rounded-full">{d.tables}</span>
                </div>
                <p className="text-[10px] text-[hsl(150,15%,50%)] leading-snug font-mono">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ERD */}
        <div>
          <SectionHeading
            title="ERD Interativo"
            subtitle="Explore as principais tabelas e seus relacionamentos. Use scroll para zoom, arraste para navegar."
            badge="ERD"
          />
          <div className="flex items-start gap-2 mb-4 p-3 bg-[hsl(48,100%,42%)]/8 border border-[hsl(48,100%,42%)]/20 rounded-lg">
            <Info size={13} className="text-[hsl(48,80%,35%)] mt-0.5 shrink-0" />
            <p className="text-xs text-[hsl(48,60%,30%)]">
              Este diagrama mostra as principais tabelas de cada domínio (subconjunto das 73 tabelas totais) com relacionamentos por chave estrangeira. Use os controles de zoom no canto inferior esquerdo ou o scroll do mouse para explorar.
            </p>
          </div>
          <DatabaseErd />
        </div>

        {/* Conventions */}
        <div>
          <SectionHeading
            title="Convenções do Banco"
            subtitle="Padrões seguidos em todas as tabelas para consistência e rastreabilidade."
            badge="Convenções"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Primary Keys', code: 'id UUID DEFAULT gen_random_uuid()', desc: 'UUIDs v4 gerados pelo Postgres. Nunca serial/autoincrement.' },
              { title: 'Timestamps', code: 'created_at TIMESTAMPTZ DEFAULT now()\nupdated_at TIMESTAMPTZ DEFAULT now()', desc: 'Todas as tabelas têm timestamps com timezone. updated_at via trigger.' },
              { title: 'Soft Delete', code: 'deleted_at TIMESTAMPTZ', desc: 'Tabelas principais usam soft delete. Queries filtram WHERE deleted_at IS NULL.' },
              { title: 'Enums Postgres', code: "status TEXT CHECK (status IN ('draft', 'active'))", desc: 'Enums como TEXT com CHECK constraints ou Postgres native enums.' },
              { title: 'Foreign Keys', code: 'REFERENCES profiles(id) ON DELETE SET NULL', desc: 'FKs com ação explícita (CASCADE, SET NULL ou RESTRICT) conforme regra de negócio.' },
              { title: 'RLS', code: 'ALTER TABLE clients ENABLE ROW LEVEL SECURITY', desc: 'RLS habilitado em todas as tabelas. Backend usa service role (bypass). Frontend usa anon key (RLS enforced).' },
            ].map((c) => (
              <div key={c.title} className="p-4 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
                <div className="text-xs font-bold text-[hsl(150,50%,15%)] mb-2">{c.title}</div>
                <pre className="text-[9px] font-mono bg-[hsl(150,50%,10%)] text-[hsl(120,40%,65%)] p-2.5 rounded-lg mb-2 overflow-x-auto leading-relaxed whitespace-pre-wrap">{c.code}</pre>
                <p className="text-[11px] text-[hsl(150,15%,45%)] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
