'use client';

import { motion } from 'framer-motion';
import { PageWrapper } from '../../_components/page-wrapper';
import { SectionHeading } from '../../_components/section-heading';
import {
  Rocket,
  CheckCircle2,
  Circle,
  CreditCard,
  Users,
  ShieldCheck,
  Database,
  FileSearch,
  Briefcase,
  Eye,
  Bot,
  BarChart2,
  Scale,
  GraduationCap,
  ArrowRightLeft,
} from 'lucide-react';

interface DeliveryItem {
  label: string;
  description: string;
  status: 'done' | 'in_progress' | 'planned';
  icon: React.ElementType;
}

const delivery1: DeliveryItem[] = [
  {
    label: 'Cadastro de Clientes',
    description:
      'Ciclo de vida completo do cliente PJ/PF com 21 status, checklist dinâmico de documentos por segmento/produto/garantia, contatos, endereços, contas bancárias e pessoas autorizadas.',
    status: 'done',
    icon: Briefcase,
  },
  {
    label: 'Integração de Bureaus de Crédito',
    description:
      'Serasa, Vadu (CNPJ e CPF), Allcheck, UpMiner — consultas automatizadas para clientes e sacados com persistência do payload para auditoria e cacheamento inteligente.',
    status: 'done',
    icon: CreditCard,
  },
  {
    label: 'APIs de Compliance',
    description:
      'PEP, Sanções, PGFN, CNDT, Trabalho Escravo, CGU — verificações automáticas para clientes e sacados, com tabelas dedicadas por tipo de risco e fonte.',
    status: 'done',
    icon: ShieldCheck,
  },
  {
    label: 'Mídia Negativa',
    description:
      'Consulta automatizada de presença em mídia negativa (negative_media_results / negative_media_drawee_results) integrada ao fluxo de compliance.',
    status: 'done',
    icon: Eye,
  },
  {
    label: 'OCR de Faturamento',
    description:
      'Extração via agente IA (Google Gemini) de dados mensais de faturamento a partir de documentos do cliente (faturamento_extractions + faturamento_extraction_sources).',
    status: 'done',
    icon: FileSearch,
  },
  {
    label: 'OCR de Endividamento',
    description:
      'Pipeline de extração de posições de dívida a partir de documentos (debt_position_items), com campos de confiança e necessidade de revisão manual.',
    status: 'done',
    icon: FileSearch,
  },
  {
    label: 'OCR de Imposto de Renda',
    description:
      'Agente IA dedicado ao IRPF dos sócios: extração, merge canônico por ano/CPF, audit trail completo (irpf_extractions + irpf_extraction_sources).',
    status: 'done',
    icon: FileSearch,
  },
  {
    label: 'Módulo de RH — Cadastro e Reembolsos',
    description:
      'Cadastro de colaboradores (CLT e PJ), dependentes, documentos, reembolsos com fluxo de aprovação e onboarding com templates.',
    status: 'done',
    icon: Users,
  },
  {
    label: 'RH — Integração Flash Benefícios',
    description:
      'Conexão com a plataforma Flash para gestão centralizada de benefícios dos colaboradores.',
    status: 'in_progress',
    icon: Users,
  },
  {
    label: 'RH — Gerenciamento de Notas Fiscais PJ',
    description:
      'Ciclo mensal de notas fiscais PJ: atribuição em lote, controle de status, alerta de atraso, vínculo com billing_companies e email de notificação.',
    status: 'done',
    icon: Users,
  },
  {
    label: 'Autenticação e Sessão',
    description:
      'Login local com JWT HS256 (Argon2id), refresh opaco com rotação e revogação por família, middleware Next.js com jose, guards de RBAC na API.',
    status: 'done',
    icon: ShieldCheck,
  },
  {
    label: 'Estruturação do Banco de Dados',
    description:
      '~127 tabelas no PostgreSQL (Supabase) via Drizzle ORM, com RLS, UUIDs, timestamps padronizados e migrations versionadas.',
    status: 'done',
    icon: Database,
  },
];

const delivery2: DeliveryItem[] = [
  {
    label: 'Finalização da Área Comercial',
    description:
      'Conclusão dos fluxos pendentes do módulo comercial: aprovação final, integração completa com sacados e refinamento da transição de status.',
    status: 'planned',
    icon: Briefcase,
  },
  {
    label: 'Sistema de Visitas',
    description:
      'Módulo de registro e acompanhamento de visitas comerciais, com formulário estruturado, evidências fotográficas e geolocalização.',
    status: 'planned',
    icon: Briefcase,
  },
  {
    label: 'Acompanhamento de Visitas com IA',
    description:
      'Painel para gerentes e diretores acompanharem visitas em tempo real, com resumos gerados por IA e insights sobre performance da equipe comercial.',
    status: 'planned',
    icon: Bot,
  },
  {
    label: 'Dashboard Visual para Comerciais',
    description:
      'Painel com KPIs operacionais: carteira ativa, pipeline, metas vs. realizado, aging de propostas e alertas de ação — otimizado para o dia a dia do representante.',
    status: 'planned',
    icon: BarChart2,
  },
  {
    label: 'RH — Integração de Ponto e Benefícios',
    description:
      'Conexão com sistema de controle de ponto eletrônico e ampliação das integrações de benefícios além do Flash.',
    status: 'planned',
    icon: Users,
  },
  {
    label: 'Integração Netfactor (Crédito Aprovado)',
    description:
      'Envio automatizado dos dados aprovados pelo comitê de crédito para o Netfactor, eliminando retrabalho de digitação no sistema legado.',
    status: 'planned',
    icon: ArrowRightLeft,
  },
  {
    label: 'Módulo Jurídico',
    description:
      'Gestão de processos judiciais, prazos, audiências e documentos legais vinculados a clientes e operações de crédito.',
    status: 'planned',
    icon: Scale,
  },
  {
    label: 'Treinamento e Implantação',
    description:
      'Programa de treinamento por role, documentação de uso e rollout faseado para todas as áreas da empresa.',
    status: 'planned',
    icon: GraduationCap,
  },
];

const statusConfig = {
  done: {
    icon: CheckCircle2,
    label: 'Concluído',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  in_progress: {
    icon: Circle,
    label: 'Em andamento',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  planned: {
    icon: Circle,
    label: 'Planejado',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-500',
    dot: 'bg-slate-300',
  },
};

function DeliveryCard({ item, index }: { item: DeliveryItem; index: number }) {
  const config = statusConfig[item.status];
  const StatusIcon = config.icon;
  const ItemIcon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`relative flex gap-4 p-5 rounded-xl border ${config.border} ${config.bg} shadow-sm`}
    >
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${config.bg} border ${config.border}`}>
          <ItemIcon size={16} className={config.text} />
        </div>
        <StatusIcon size={14} className={config.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-[hsl(150,50%,12%)] leading-tight">{item.label}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-[hsl(150,15%,42%)] leading-relaxed">{item.description}</p>
      </div>
    </motion.div>
  );
}

function DeliveryStats({ items }: { items: DeliveryItem[] }) {
  const done = items.filter((i) => i.status === 'done').length;
  const inProgress = items.filter((i) => i.status === 'in_progress').length;
  const planned = items.filter((i) => i.status === 'planned').length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-2 bg-[hsl(30,20%,92%)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-bold text-[hsl(150,50%,15%)] shrink-0">{pct}%</span>
      <div className="flex gap-3 shrink-0">
        {done > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{done}
          </span>
        )}
        {inProgress > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{inProgress}
          </span>
        )}
        {planned > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />{planned}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <PageWrapper>
      <section className="relative overflow-hidden bg-[hsl(45,50%,91%)] px-10 py-14">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(44,52%,89%)] via-[hsl(45,50%,91%)] to-[hsl(46,45%,94%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, hsl(40,60%,50%) 0px, hsl(40,60%,50%) 1px, transparent 1px, transparent 60px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(40,50%,80%)]">
              <Rocket size={20} className="text-[hsl(38,70%,32%)]" />
            </div>
            <span className="text-sm font-semibold text-[hsl(35,25%,45%)] uppercase tracking-widest">Roadmap</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight text-[hsl(35,35%,15%)]">
            Roadmap da Plataforma
          </h1>
          <p className="text-[hsl(35,20%,40%)] text-base leading-relaxed max-w-xl">
            Planejamento de entregas da Plataforma Sarfaty em duas fases. A primeira entrega foca na fundação operacional; a segunda expande para inteligência comercial, jurídico e integrações externas.
          </p>
        </div>
      </section>

      <div className="px-8 py-10 max-w-5xl space-y-16">
        {/* Entrega 1 */}
        <div>
          <SectionHeading
            title="Entrega 1 — Fundação Operacional"
            subtitle="Cadastro de clientes, integrações de bureaus e compliance, extração inteligente de documentos (OCR/IA), módulo de RH completo, autenticação JWT e estruturação do banco de dados."
            badge="Fase 1"
          />
          <DeliveryStats items={delivery1} />
          <div className="grid grid-cols-1 gap-3">
            {delivery1.map((item, i) => (
              <DeliveryCard key={item.label} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Entrega 2 */}
        <div>
          <SectionHeading
            title="Entrega 2 — Expansão Comercial e Integrações"
            subtitle="Finalização da área comercial com dashboards e IA, enriquecimento do RH, integração Netfactor, módulo jurídico e programa de treinamento para rollout."
            badge="Fase 2"
          />
          <DeliveryStats items={delivery2} />
          <div className="grid grid-cols-1 gap-3">
            {delivery2.map((item, i) => (
              <DeliveryCard key={item.label} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-[hsl(30,20%,88%)]">
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-[hsl(150,15%,40%)]">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
