# Especificação de UX — Interface Adaptativa por Role

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Status:** Draft  

---

## 1. Princípio de Design

A plataforma usa uma **interface única adaptativa**: todo usuário acessa a mesma aplicação, loga na mesma URL, e o sistema compõe a experiência com base no seu papel. Não existem condicionais espalhadas pelo código — existe um **mapa de permissões centralizado** que define, para cada role, quais módulos, menus, abas e ações são visíveis.

Toda a lógica de "quem vê o quê" vive em um único arquivo de configuração. O resto da aplicação apenas consome esse mapa e renderiza por composição.

---

## 2. Mapa de Permissões Centralizado

### 2.1 Estrutura do Mapa

```typescript
// packages/config/src/permissions.ts

export interface RoleConfig {
  label: string;                    // Nome amigável
  homeRoute: string;                // Rota após login
  sidebar: SidebarSection[];        // Menus da sidebar
  dashboardModules: string[];       // Módulos do dashboard
  clientTabs: string[];             // Abas na página do cliente
  clientActions: string[];          // Ações que pode tomar no cliente
  globalActions: string[];          // Ações globais (criar cliente, etc.)
  notifications: string[];          // Tipos de notificação que recebe
}
```

### 2.2 Mapa Completo

```typescript
export const ROLE_PERMISSIONS: Record<string, RoleConfig> = {

  // ================================================================
  // COMERCIAL
  // ================================================================
  sales_rep: {
    label: 'Comercial',
    homeRoute: '/dashboard',
    sidebar: [
      {
        section: 'Comercial',
        items: [
          { label: 'Dashboard',   icon: 'LayoutDashboard', route: '/dashboard' },
          { label: 'Meus Clientes', icon: 'Users',         route: '/clients' },
          { label: 'Pipeline',    icon: 'GitBranch',       route: '/pipeline' },
          { label: 'Atividades',  icon: 'Calendar',        route: '/activities' },
          { label: 'Minha Meta',  icon: 'Target',          route: '/goals' },
        ],
      },
    ],
    dashboardModules: [
      'pending-actions',         // "3 clientes precisam de atenção"
      'my-pipeline-summary',     // Funil resumido com valores
      'my-goal-progress',        // Barra de progresso da meta
      'recent-updates',          // Últimas mudanças de status
    ],
    clientTabs: [
      'overview',                // Dados básicos, status, timeline
      'documents',               // Checklist + uploads
      'activities',              // Visitas, ligações, reuniões
    ],
    clientActions: [
      'edit_draft',              // Editar cliente em rascunho
      'upload_document',         // Subir documento
      'submit_for_analysis',     // Enviar pra análise
      'register_activity',       // Registrar visita/ligação
    ],
    globalActions: [
      'create_client',           // Botão "Novo Cliente"
    ],
    notifications: [
      'document_rejected',
      'client_approved',
      'client_rejected',
      'client_auto_rejected',
      'client_reassigned_to_me',
      'client_reassigned_from_me',
      'goal_achieved',
      'client_inactive_7days',
    ],
  },

  // ================================================================
  // SUPERVISOR COMERCIAL
  // ================================================================
  sales_supervisor: {
    label: 'Supervisor Comercial',
    homeRoute: '/dashboard',
    sidebar: [
      {
        section: 'Comercial',
        items: [
          { label: 'Dashboard',     icon: 'LayoutDashboard', route: '/dashboard' },
          { label: 'Clientes',      icon: 'Users',           route: '/clients' },
          { label: 'Pipeline',      icon: 'GitBranch',       route: '/pipeline' },
          { label: 'Atividades',    icon: 'Calendar',        route: '/activities' },
        ],
      },
      {
        section: 'Gestão da Equipe',
        items: [
          { label: 'Minha Equipe',  icon: 'UsersRound',      route: '/team' },
          { label: 'Ranking',       icon: 'Trophy',          route: '/team/ranking' },
          { label: 'Metas',         icon: 'Target',          route: '/goals' },
        ],
      },
    ],
    dashboardModules: [
      'team-pending-actions',    // "5 clientes na equipe precisam de atenção"
      'team-pipeline-summary',   // Funil consolidado da equipe
      'team-goal-progress',      // Meta da equipe + individuais
      'team-ranking-mini',       // Top 3 comerciais
      'clients-without-activity', // Clientes parados há 7+ dias
    ],
    clientTabs: [
      'overview',
      'documents',
      'activities',
      'assignment-history',      // Histórico de reatribuições
    ],
    clientActions: [
      'edit_draft',
      'upload_document',
      'submit_for_analysis',
      'register_activity',
      'reassign_within_team',    // Reatribuir dentro da equipe
    ],
    globalActions: [
      'create_client',
      'reassign_client',
    ],
    notifications: [
      'document_rejected',
      'client_approved',
      'client_rejected',
      'client_auto_rejected',
      'team_goal_achieved',
      'client_inactive_7days',
    ],
  },

  // ================================================================
  // GERENTE REGIONAL
  // ================================================================
  sales_manager: {
    label: 'Gerente Regional',
    homeRoute: '/dashboard',
    sidebar: [
      {
        section: 'Comercial',
        items: [
          { label: 'Dashboard',     icon: 'LayoutDashboard', route: '/dashboard' },
          { label: 'Clientes',      icon: 'Users',           route: '/clients' },
          { label: 'Pipeline',      icon: 'GitBranch',       route: '/pipeline' },
        ],
      },
      {
        section: 'Gestão Regional',
        items: [
          { label: 'Equipes',       icon: 'UsersRound',      route: '/teams' },
          { label: 'Ranking',       icon: 'Trophy',          route: '/teams/ranking' },
          { label: 'Metas',         icon: 'Target',          route: '/goals' },
          { label: 'Mapa de Calor', icon: 'Map',             route: '/heatmap' },
        ],
      },
    ],
    dashboardModules: [
      'region-pipeline-summary',  // Funil consolidado da região
      'region-goal-progress',     // Meta regional + por equipe
      'team-comparison',          // Comparação entre equipes
      'region-volume-chart',      // Evolução mensal
      'critical-alerts',          // Clientes em risco, equipes abaixo da meta
    ],
    clientTabs: [
      'overview',
      'documents',
      'activities',
      'assignment-history',
    ],
    clientActions: [
      'edit_draft',
      'upload_document',
      'submit_for_analysis',
      'register_activity',
      'reassign_within_region',   // Reatribuir dentro da região
    ],
    globalActions: [
      'create_client',
      'reassign_client',
      'manage_teams',
    ],
    notifications: [
      'client_approved',
      'client_rejected',
      'region_goal_achieved',
      'team_below_target',
    ],
  },

  // ================================================================
  // DIRETOR COMERCIAL
  // ================================================================
  sales_director: {
    label: 'Diretor Comercial',
    homeRoute: '/dashboard',
    sidebar: [
      {
        section: 'Visão Geral',
        items: [
          { label: 'Dashboard',     icon: 'LayoutDashboard', route: '/dashboard' },
          { label: 'Pipeline',      icon: 'GitBranch',       route: '/pipeline' },
          { label: 'Clientes',      icon: 'Users',           route: '/clients' },
        ],
      },
      {
        section: 'Gestão Nacional',
        items: [
          { label: 'Regiões',       icon: 'Globe',           route: '/regions' },
          { label: 'Ranking',       icon: 'Trophy',          route: '/regions/ranking' },
          { label: 'Metas',         icon: 'Target',          route: '/goals' },
          { label: 'Tendências',    icon: 'TrendingUp',      route: '/trends' },
        ],
      },
    ],
    dashboardModules: [
      'national-pipeline-summary',
      'national-goal-progress',
      'region-comparison',
      'monthly-trends',
      'conversion-funnel',
      'top-operations',            // Maiores operações em andamento
    ],
    clientTabs: [
      'overview',
      'documents',
      'activities',
      'assignment-history',
    ],
    clientActions: [
      'reassign_anywhere',         // Reatribuir pra qualquer lugar
    ],
    globalActions: [
      'create_client',
      'reassign_client',
      'manage_regions',
      'manage_goals',
    ],
    notifications: [
      'national_goal_achieved',
      'large_operation_approved',
      'region_below_target',
    ],
  },

  // ================================================================
  // ANALISTA DE CRÉDITO
  // ================================================================
  credit_analyst: {
    label: 'Analista de Crédito',
    homeRoute: '/credit/queue',
    sidebar: [
      {
        section: 'Crédito',
        items: [
          { label: 'Fila de Análise', icon: 'ClipboardList', route: '/credit/queue' },
          { label: 'Relatórios',      icon: 'FileText',      route: '/credit/reports' },
          { label: 'Histórico',       icon: 'History',        route: '/credit/history' },
        ],
      },
      {
        section: 'Monitoramento',
        items: [
          { label: 'Status Bureaus',  icon: 'Activity',       route: '/credit/bureaus' },
          { label: 'Métricas',        icon: 'BarChart3',      route: '/credit/metrics' },
        ],
      },
    ],
    dashboardModules: [
      'credit-queue-count',       // "12 operações aguardando análise"
      'credit-sla-status',        // Tempo médio vs SLA
      'bureau-health',            // Status dos bureaus (online/offline)
      'daily-throughput',         // Operações analisadas hoje
      'auto-reject-rate',         // Taxa de indeferimento automático
    ],
    clientTabs: [
      'overview',
      'documents',
      'financial-data',           // Dados financeiros extraídos
      'bureau-results',           // Resultado de cada bureau
      'compliance-results',       // Resultado KYC/AML/PLD
      'ai-report',                // Relatório gerado pelo agente
      'credit-history',           // Histórico de decisões anteriores
    ],
    clientActions: [
      'trigger_bureau_requery',    // Re-consultar um bureau específico
      'add_analyst_note',          // Adicionar observação
      'flag_for_review',           // Sinalizar para revisão especial
      'override_auto_reject',      // Sobrescrever indeferimento automático (com justificativa)
    ],
    globalActions: [],
    notifications: [
      'new_client_in_queue',
      'bureau_query_failed',
      'bureau_unavailable',
      'auto_reject_override_requested',
    ],
  },

  // ================================================================
  // COMPLIANCE
  // ================================================================
  compliance_officer: {
    label: 'Compliance',
    homeRoute: '/compliance/queue',
    sidebar: [
      {
        section: 'Compliance',
        items: [
          { label: 'Fila de Análise', icon: 'ShieldCheck',   route: '/compliance/queue' },
          { label: 'Alertas',         icon: 'AlertTriangle', route: '/compliance/alerts' },
          { label: 'Monitoramento',   icon: 'Eye',           route: '/compliance/monitoring' },
        ],
      },
      {
        section: 'KYC/AML/PLD',
        items: [
          { label: 'PEPs',            icon: 'UserCheck',     route: '/compliance/peps' },
          { label: 'Sanções',         icon: 'Ban',           route: '/compliance/sanctions' },
          { label: 'Processos',       icon: 'Scale',         route: '/compliance/lawsuits' },
          { label: 'Relatórios',      icon: 'FileText',      route: '/compliance/reports' },
        ],
      },
    ],
    dashboardModules: [
      'compliance-queue-count',
      'active-alerts',             // Alertas não resolvidos
      'pep-hits',                  // PEPs identificados recentemente
      'sanction-hits',             // Matches em listas de sanções
      'monitoring-due',            // Clientes com monitoramento vencendo
    ],
    clientTabs: [
      'overview',
      'compliance-screening',      // Resultado completo da varredura
      'pep-analysis',              // Análise de PEPs
      'sanctions-check',           // Listas de sanções
      'lawsuit-details',           // Processos judiciais detalhados
      'beneficial-owners',         // Beneficiários finais
      'risk-classification',       // Classificação de risco PLD
    ],
    clientActions: [
      'approve_compliance',         // Aprovar do ponto de vista compliance
      'reject_compliance',          // Rejeitar (com justificativa obrigatória)
      'request_additional_info',    // Pedir informação adicional
      'add_compliance_note',
      'flag_suspicious_activity',   // Comunicação ao COAF
      'escalate_to_pld',           // Escalar para comitê PLD
    ],
    globalActions: [
      'generate_coaf_report',       // Gerar relatório para o COAF
    ],
    notifications: [
      'new_client_compliance_queue',
      'pep_match_found',
      'sanction_match_found',
      'monitoring_alert',
      'coaf_report_due',
    ],
  },

  // ================================================================
  // MESA APROVADORA
  // ================================================================
  approver: {
    label: 'Mesa Aprovadora',
    homeRoute: '/approval/queue',
    sidebar: [
      {
        section: 'Aprovação',
        items: [
          { label: 'Fila de Aprovação', icon: 'CheckCircle',  route: '/approval/queue' },
          { label: 'Histórico',         icon: 'History',       route: '/approval/history' },
          { label: 'Métricas',          icon: 'BarChart3',     route: '/approval/metrics' },
        ],
      },
    ],
    dashboardModules: [
      'approval-queue-count',      // "8 operações aguardando decisão"
      'approval-sla-status',
      'approval-volume-today',
      'avg-ticket-in-queue',       // Ticket médio na fila
      'approval-rate-trend',       // Taxa de aprovação mês a mês
    ],
    clientTabs: [
      'overview',
      'financial-data',
      'bureau-results',
      'compliance-results',
      'ai-report',                 // Relatório consolidado do agente
      'credit-history',
      'approval-decision',         // Tela de decisão (valor, taxa, condições)
    ],
    clientActions: [
      'approve_credit',             // Aprovar (define valor, taxa, tarifas, condições)
      'reject_credit',              // Reprovar (justificativa obrigatória)
      'approve_with_conditions',    // Aprovar com ressalvas
      'request_additional_analysis', // Devolver pra crédito com pedido
      'add_approver_note',
    ],
    globalActions: [],
    notifications: [
      'new_client_approval_queue',
      'report_ready_for_review',
      'approval_sla_warning',
    ],
  },

  // ================================================================
  // BACKOFFICE
  // ================================================================
  backoffice: {
    label: 'Backoffice',
    homeRoute: '/backoffice/operations',
    sidebar: [
      {
        section: 'Operações',
        items: [
          { label: 'Operações Ativas', icon: 'Layers',        route: '/backoffice/operations' },
          { label: 'Homologação',      icon: 'BadgeCheck',    route: '/backoffice/homologation' },
          { label: 'Divergências',     icon: 'AlertTriangle', route: '/backoffice/divergences' },
        ],
      },
      {
        section: 'Pós-Aprovação',
        items: [
          { label: 'Docs Sócios',      icon: 'FileCheck',     route: '/backoffice/partner-docs' },
          { label: 'Contratos',         icon: 'FileSignature', route: '/backoffice/contracts' },
          { label: 'Fundos',            icon: 'Building2',     route: '/backoffice/funds' },
        ],
      },
    ],
    dashboardModules: [
      'operations-overview',
      'homologation-queue',
      'partner-docs-pending',
      'divergences-active',
      'contracts-pending-signature',
    ],
    clientTabs: [
      'overview',
      'documents',
      'partner-documents',         // Docs dos sócios (fase 2)
      'homologation-status',       // Status da homologação no fundo
      'contract-status',           // Status do contrato
      'fund-eligibility',          // Elegibilidade nos fundos
    ],
    clientActions: [
      'trigger_homologation',       // Iniciar homologação
      'resolve_divergence',         // Resolver divergência
      'request_partner_docs',       // Solicitar docs dos sócios
      'add_backoffice_note',
    ],
    globalActions: [],
    notifications: [
      'homologation_complete',
      'homologation_rejected',
      'partner_docs_uploaded',
      'divergence_detected',
      'contract_signed',
    ],
  },

  // ================================================================
  // JURÍDICO
  // ================================================================
  legal: {
    label: 'Jurídico',
    homeRoute: '/legal/contracts',
    sidebar: [
      {
        section: 'Contratos',
        items: [
          { label: 'Fila de Contratos', icon: 'FileSignature', route: '/legal/contracts' },
          { label: 'Gerar Contrato',    icon: 'FilePlus',      route: '/legal/contracts/generate' },
          { label: 'Análise Contratual', icon: 'FileSearch',   route: '/legal/analysis' },
        ],
      },
      {
        section: 'Regulatório',
        items: [
          { label: 'Regulamentos',       icon: 'BookOpen',     route: '/legal/regulations' },
          { label: 'Extrajudiciais',     icon: 'Gavel',        route: '/legal/extrajudicial' },
        ],
      },
      {
        section: 'Contencioso',
        items: [
          { label: 'Ações Judiciais',    icon: 'Scale',        route: '/legal/litigation' },
          { label: 'Acompanhamento',     icon: 'Eye',          route: '/legal/tracking' },
        ],
      },
    ],
    dashboardModules: [
      'contracts-queue-count',
      'contracts-pending-review',
      'extrajudicial-queue',
      'active-litigation',
      'regulation-reviews-pending',
    ],
    clientTabs: [
      'overview',
      'documents',
      'contracts',                  // Contratos gerados e assinados
      'contract-analysis',          // Análise de contratos de terceiros
      'extrajudicial-history',      // Histórico de cobranças extrajudiciais
      'litigation-details',         // Ações judiciais
    ],
    clientActions: [
      'generate_contract',          // Gerar contrato via IA
      'review_contract',            // Revisar e aprovar contrato
      'reject_contract',            // Devolver contrato pra ajuste
      'send_to_signature',          // Enviar pra assinatura digital
      'generate_extrajudicial',     // Gerar notificação extrajudicial
      'approve_extrajudicial',      // Aprovar envio da extrajudicial
      'register_lawsuit',           // Registrar ação judicial
      'add_legal_note',
    ],
    globalActions: [
      'review_fund_regulation',     // Revisar regulamento de fundo
    ],
    notifications: [
      'contract_generation_ready',
      'contract_review_requested',
      'extrajudicial_auto_generated',
      'litigation_update',
      'signature_completed',
      'regulation_review_requested',
    ],
  },

  // ================================================================
  // GESTÃO DE RISCO / RECUPERAÇÃO
  // ================================================================
  risk_manager: {
    label: 'Gestão de Risco',
    homeRoute: '/risk/overview',
    sidebar: [
      {
        section: 'Gestão de Risco',
        items: [
          { label: 'Visão Geral',     icon: 'ShieldAlert',    route: '/risk/overview' },
          { label: 'Risco (1-30d)',    icon: 'AlertTriangle',  route: '/risk/management' },
          { label: 'Recuperação',      icon: 'PhoneCall',      route: '/risk/recovery' },
          { label: 'Contencioso',      icon: 'Gavel',          route: '/risk/litigation' },
        ],
      },
      {
        section: 'Análise',
        items: [
          { label: 'Régua de Cobrança', icon: 'GitBranch',    route: '/risk/collection-rules' },
          { label: 'Métricas',           icon: 'BarChart3',    route: '/risk/metrics' },
          { label: 'Aging',             icon: 'Clock',         route: '/risk/aging' },
        ],
      },
    ],
    dashboardModules: [
      'delinquency-overview',       // Resumo por faixa de atraso
      'risk-clients-count',         // Clientes em risco (1-30d)
      'recovery-clients-count',     // Clientes em recuperação (31-90d)
      'litigation-clients-count',   // Clientes em contencioso (90d+)
      'collection-effectiveness',   // Taxa de recuperação
      'aging-chart',                // Gráfico de aging
      'escalation-trend',           // Tendência de migração entre faixas
    ],
    clientTabs: [
      'overview',
      'financial-data',
      'payment-history',            // Histórico de pagamentos
      'collection-timeline',        // Linha do tempo da cobrança
      'negotiation-history',        // Histórico de negociações
      'contact-attempts',           // Tentativas de contato
    ],
    clientActions: [
      'register_contact_attempt',    // Registrar tentativa de contato
      'register_negotiation',        // Registrar negociação
      'propose_settlement',          // Propor acordo
      'escalate_to_recovery',        // Escalar pra recuperação
      'escalate_to_litigation',      // Escalar pra contencioso
      'request_extrajudicial',       // Solicitar notificação extrajudicial
      'add_risk_note',
    ],
    globalActions: [
      'configure_collection_rules',  // Configurar régua de cobrança
    ],
    notifications: [
      'client_entered_risk',
      'client_entered_recovery',
      'client_entered_litigation',
      'payment_received',
      'negotiation_deadline',
      'settlement_expired',
    ],
  },

  // ================================================================
  // ADMIN
  // ================================================================
  admin: {
    label: 'Administrador',
    homeRoute: '/admin/overview',
    sidebar: [
      {
        section: 'Sistema',
        items: [
          { label: 'Visão Geral',    icon: 'LayoutDashboard', route: '/admin/overview' },
          { label: 'Usuários',       icon: 'Users',           route: '/admin/users' },
          { label: 'Regiões',        icon: 'Globe',           route: '/admin/regions' },
          { label: 'Equipes',        icon: 'UsersRound',      route: '/admin/teams' },
        ],
      },
      {
        section: 'Configurações',
        items: [
          { label: 'Segmentos',      icon: 'Tags',            route: '/admin/segments' },
          { label: 'Templates Docs', icon: 'FileText',        route: '/admin/document-templates' },
          { label: 'Motor de Regras', icon: 'Settings',       route: '/admin/rules-engine' },
          { label: 'Fundos',         icon: 'Building2',       route: '/admin/funds' },
          { label: 'Metas',          icon: 'Target',          route: '/admin/goals' },
        ],
      },
      {
        section: 'Auditoria',
        items: [
          { label: 'Audit Trail',     icon: 'ScrollText',     route: '/admin/audit' },
          { label: 'Logs',            icon: 'Terminal',        route: '/admin/logs' },
          { label: 'Integrações',     icon: 'Plug',           route: '/admin/integrations' },
        ],
      },
    ],
    dashboardModules: [
      'system-health',
      'active-users',
      'operations-volume',
      'integration-status',
      'error-rate',
      'storage-usage',
    ],
    clientTabs: ['*'],              // Admin vê TODAS as abas
    clientActions: ['*'],           // Admin pode tomar TODAS as ações
    globalActions: ['*'],
    notifications: [
      'system_error',
      'integration_down',
      'security_alert',
      'new_user_created',
    ],
  },
};
```

---

## 3. Sidebar — Implementação

### 3.1 Componente

A sidebar lê o mapa de permissões e renderiza automaticamente:

```typescript
// apps/web-backoffice/components/sidebar.tsx

'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLE_PERMISSIONS } from '@nexus/config/permissions';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { icons } from 'lucide-react';

export function Sidebar() {
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const config = ROLE_PERMISSIONS[user.role];

  return (
    <aside className="w-64 border-r bg-white h-screen sticky top-0">
      {/* Header com nome e role */}
      <div className="p-4 border-b">
        <p className="font-medium">{user.full_name}</p>
        <p className="text-sm text-muted-foreground">{config.label}</p>
      </div>

      {/* Menu sections */}
      <nav className="p-2">
        {config.sidebar.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
              {section.section}
            </p>
            {section.items.map((item) => {
              const Icon = icons[item.icon];
              const isActive = pathname.startsWith(item.route);
              return (
                <Link
                  key={item.route}
                  href={item.route}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm
                    ${isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-muted'
                    }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
```

### 3.2 Visual por Role

```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ COMERCIAL                   │  │ ANALISTA DE CRÉDITO         │
│                             │  │                             │
│ ─── Comercial ───           │  │ ─── Crédito ───             │
│ ▸ Dashboard                 │  │ ▸ Fila de Análise           │
│ ▸ Meus Clientes             │  │ ▸ Relatórios                │
│ ▸ Pipeline                  │  │ ▸ Histórico                 │
│ ▸ Atividades                │  │                             │
│ ▸ Minha Meta                │  │ ─── Monitoramento ───       │
│                             │  │ ▸ Status Bureaus            │
│                             │  │ ▸ Métricas                  │
└─────────────────────────────┘  └─────────────────────────────┘

┌─────────────────────────────┐  ┌─────────────────────────────┐
│ JURÍDICO                    │  │ GESTÃO DE RISCO             │
│                             │  │                             │
│ ─── Contratos ───           │  │ ─── Gestão de Risco ───     │
│ ▸ Fila de Contratos         │  │ ▸ Visão Geral               │
│ ▸ Gerar Contrato            │  │ ▸ Risco (1-30d)             │
│ ▸ Análise Contratual        │  │ ▸ Recuperação (31-90d)      │
│                             │  │ ▸ Contencioso (90d+)        │
│ ─── Regulatório ───         │  │                             │
│ ▸ Regulamentos              │  │ ─── Análise ───             │
│ ▸ Extrajudiciais            │  │ ▸ Régua de Cobrança         │
│                             │  │ ▸ Métricas                  │
│ ─── Contencioso ───         │  │ ▸ Aging                     │
│ ▸ Ações Judiciais           │  │                             │
│ ▸ Acompanhamento            │  │                             │
└─────────────────────────────┘  └─────────────────────────────┘
```

---

## 4. Dashboard — Composição por Módulos

### 4.1 Componente

O dashboard renderiza módulos com base no role:

```typescript
// apps/web-backoffice/app/(dashboard)/dashboard/page.tsx

import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLE_PERMISSIONS } from '@nexus/config/permissions';
import { DashboardModuleRegistry } from '@/components/dashboard/module-registry';

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const modules = ROLE_PERMISSIONS[user.role].dashboardModules;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((moduleId) => (
          <DashboardModuleRegistry key={moduleId} moduleId={moduleId} />
        ))}
      </div>
    </div>
  );
}
```

### 4.2 Registry de Módulos

Cada módulo é um componente independente, registrado por ID:

```typescript
// apps/web-backoffice/components/dashboard/module-registry.tsx

import { PendingActions } from './modules/pending-actions';
import { PipelineSummary } from './modules/pipeline-summary';
import { GoalProgress } from './modules/goal-progress';
import { CreditQueueCount } from './modules/credit-queue-count';
import { BureauHealth } from './modules/bureau-health';
import { ApprovalQueueCount } from './modules/approval-queue-count';
// ... etc

const MODULES: Record<string, React.ComponentType> = {
  'pending-actions':          PendingActions,
  'my-pipeline-summary':      PipelineSummary,
  'team-pipeline-summary':    PipelineSummary,     // Mesmo componente, dados diferentes
  'region-pipeline-summary':  PipelineSummary,
  'national-pipeline-summary': PipelineSummary,
  'my-goal-progress':         GoalProgress,
  'team-goal-progress':       GoalProgress,
  'region-goal-progress':     GoalProgress,
  'national-goal-progress':   GoalProgress,
  'recent-updates':           RecentUpdates,
  'credit-queue-count':       CreditQueueCount,
  'credit-sla-status':        CreditSlaStatus,
  'bureau-health':            BureauHealth,
  'approval-queue-count':     ApprovalQueueCount,
  'contracts-queue-count':    ContractsQueueCount,
  'delinquency-overview':     DelinquencyOverview,
  // ... todos os módulos
};

export function DashboardModuleRegistry({ moduleId }: { moduleId: string }) {
  const Module = MODULES[moduleId];
  if (!Module) return null;
  return <Module />;
}
```

### 4.3 O que cada role vê ao logar

```
COMERCIAL:
┌──────────────────────────────────────────────────────────┐
│ Dashboard                                                │
│                                                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│ │ ⚠ 3 clientes    │ │ Meta: R$ 120k   │ │ Conversão  │ │
│ │ precisam de     │ │ ████████░░ 67%  │ │ 42%        │ │
│ │ atenção         │ │ de R$ 180k      │ │            │ │
│ └─────────────────┘ └─────────────────┘ └────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Pipeline                                             │ │
│ │ Rascunho(3) → Docs(5) → Análise(2) → Aprovado(4)   │ │
│ │ R$ 450k em andamento                                │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Atualizações Recentes                                │ │
│ │ • EMPRESA X → aprovada (há 2h)                      │ │
│ │ • EMPRESA Y → documento rejeitado (há 4h)           │ │
│ │ • EMPRESA Z → em análise de crédito (há 1d)         │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

ANALISTA DE CRÉDITO:
┌──────────────────────────────────────────────────────────┐
│ Fila de Análise                                          │
│                                                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│ │ 📋 12 operações │ │ ⏱ Tempo médio:  │ │ Bureaus:   │ │
│ │ na fila         │ │ 3.2h (SLA: 4h) │ │ ✅✅✅✅   │ │
│ └─────────────────┘ └─────────────────┘ └────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Próximas análises (por ordem de chegada)             │ │
│ │                                                      │ │
│ │ EMPRESA A  │ Agro    │ R$ 500k │ há 1h │ [Analisar] │ │
│ │ EMPRESA B  │ Transp. │ R$ 200k │ há 2h │ [Analisar] │ │
│ │ EMPRESA C  │ Ind.    │ R$ 1.2M │ há 3h │ [Analisar] │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │ Analisadas hoje │ │ Indeferimento automático: 18%   │ │
│ │ 8 operações     │ │ ████░░░░░░░ (meta < 25%)       │ │
│ └─────────────────┘ └─────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

MESA APROVADORA:
┌──────────────────────────────────────────────────────────┐
│ Fila de Aprovação                                        │
│                                                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│ │ 📋 8 operações  │ │ ⏱ SLA: 2h      │ │ Ticket     │ │
│ │ aguardando      │ │ Mais antiga: 1h │ │ médio:     │ │
│ │                 │ │                 │ │ R$ 380k    │ │
│ └─────────────────┘ └─────────────────┘ └────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ EMPRESA D │ R$ 800k │ Score: 72 │ IA: Favorável     │ │
│ │           │ Agro    │ 0 restrit.│ [Ver Relatório]   │ │
│ │──────────────────────────────────────────────────────│ │
│ │ EMPRESA E │ R$ 150k │ Score: 45 │ IA: Ressalvas     │ │
│ │           │ Serv.   │ 2 protest.│ [Ver Relatório]   │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Página do Cliente — Abas por Role

### 5.1 Conceito

A página do cliente (`/clients/:id`) é a mesma URL para todos. O que muda são as **abas visíveis** e as **ações disponíveis**, determinadas pelo mapa de permissões.

### 5.2 Catálogo de Abas

| ID da Aba | Nome | Descrição | Quem vê |
|-----------|------|-----------|---------|
| `overview` | Visão Geral | Dados básicos, status, timeline de eventos, segmento | Todos |
| `documents` | Documentos | Checklist dinâmico, uploads, status de validação | Comercial, Supervisor, Gerente, Backoffice |
| `activities` | Atividades | Visitas, ligações, reuniões registradas | Comercial, Supervisor, Gerente |
| `assignment-history` | Histórico de Atribuição | Reatribuições do cliente entre comerciais | Supervisor, Gerente, Diretor |
| `financial-data` | Dados Financeiros | Dados extraídos dos documentos (faturamento, balanço) | Crédito, Mesa, Risco |
| `bureau-results` | Bureaus | Resultado de cada bureau consultado | Crédito, Mesa |
| `compliance-results` | Compliance | Resultado resumido da varredura KYC/AML | Crédito, Mesa |
| `compliance-screening` | Varredura Completa | Detalhamento total da varredura | Compliance |
| `pep-analysis` | PEPs | Análise de Pessoas Politicamente Expostas | Compliance |
| `sanctions-check` | Sanções | Checagem em listas OFAC, EU, UN | Compliance |
| `lawsuit-details` | Processos | Detalhamento de processos judiciais | Compliance |
| `beneficial-owners` | Beneficiários Finais | Grupo econômico e beneficiários finais | Compliance |
| `risk-classification` | Classificação PLD | Classificação de risco para PLD/CFT | Compliance |
| `ai-report` | Relatório IA | Relatório consolidado gerado pelo agente | Crédito, Mesa |
| `credit-history` | Histórico de Crédito | Decisões anteriores, pareceres | Crédito, Mesa |
| `approval-decision` | Decisão | Tela de aprovação (valor, taxa, condições) | Mesa |
| `partner-documents` | Docs Sócios | Documentos dos sócios (fase 2) | Backoffice |
| `homologation-status` | Homologação | Status da homologação nos fundos | Backoffice |
| `contract-status` | Status Contrato | Status do contrato e assinatura | Backoffice |
| `fund-eligibility` | Elegibilidade | Elegibilidade nos fundos configurados | Backoffice |
| `contracts` | Contratos | Contratos gerados, revisados, assinados | Jurídico |
| `contract-analysis` | Análise Contratual | Análise de contratos de terceiros | Jurídico |
| `extrajudicial-history` | Extrajudiciais | Histórico de cobranças extrajudiciais | Jurídico |
| `litigation-details` | Ações Judiciais | Detalhamento de ações judiciais | Jurídico |
| `payment-history` | Pagamentos | Histórico de pagamentos e atrasos | Risco |
| `collection-timeline` | Linha do Tempo | Timeline da cobrança | Risco |
| `negotiation-history` | Negociações | Histórico de negociações e acordos | Risco |
| `contact-attempts` | Contatos | Tentativas de contato registradas | Risco |

### 5.3 Implementação

```typescript
// apps/web-backoffice/app/(dashboard)/clients/[id]/page.tsx

import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLE_PERMISSIONS } from '@nexus/config/permissions';
import { TabRegistry } from '@/components/client/tab-registry';

export default function ClientPage({ params }: { params: { id: string } }) {
  const { user } = useCurrentUser();
  const allowedTabs = ROLE_PERMISSIONS[user.role].clientTabs;
  const allowedActions = ROLE_PERMISSIONS[user.role].clientActions;

  return (
    <div className="p-6">
      {/* Header do cliente: nome, CNPJ, segmento, status */}
      <ClientHeader clientId={params.id} />

      {/* Abas — só renderiza as permitidas */}
      <Tabs defaultValue={allowedTabs[0]}>
        <TabsList>
          {allowedTabs.map((tabId) => (
            <TabsTrigger key={tabId} value={tabId}>
              {TAB_LABELS[tabId]}
            </TabsTrigger>
          ))}
        </TabsList>

        {allowedTabs.map((tabId) => (
          <TabsContent key={tabId} value={tabId}>
            <TabRegistry 
              tabId={tabId} 
              clientId={params.id}
              allowedActions={allowedActions}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

### 5.4 Visual — Mesma URL, Experiências Diferentes

```
COMERCIAL vê /clients/abc-123:
┌──────────────────────────────────────────────────────────┐
│ EMPRESA EXEMPLO LTDA │ 12.345.678/0001-90 │ Agronegócio │
│ Status: Em análise de crédito                            │
│                                                          │
│ [Visão Geral] [Documentos] [Atividades]                  │
│ ─────────────────────────────────────                    │
│                                                          │
│ Dados básicos, timeline, status.                         │
│ NÃO vê score, bureaus, compliance, parecer da IA.        │
└──────────────────────────────────────────────────────────┘

ANALISTA DE CRÉDITO vê /clients/abc-123:
┌──────────────────────────────────────────────────────────┐
│ EMPRESA EXEMPLO LTDA │ 12.345.678/0001-90 │ Agronegócio │
│ Status: Em análise de crédito                            │
│                                                          │
│ [Visão Geral] [Documentos] [Dados Financeiros]           │
│ [Bureaus] [Compliance] [Relatório IA] [Histórico]        │
│ ─────────────────────────────────────                    │
│                                                          │
│ Vê TUDO sobre a análise. Score, protestos, restritivos,  │
│ resultado de cada bureau, parecer do agente.             │
└──────────────────────────────────────────────────────────┘

COMPLIANCE vê /clients/abc-123:
┌──────────────────────────────────────────────────────────┐
│ EMPRESA EXEMPLO LTDA │ 12.345.678/0001-90 │ Agronegócio │
│ Status: Em análise de crédito                            │
│                                                          │
│ [Visão Geral] [Varredura Completa] [PEPs] [Sanções]     │
│ [Processos] [Beneficiários Finais] [Classificação PLD]   │
│ ─────────────────────────────────────                    │
│                                                          │
│ Vê TUDO sobre compliance. Detalhamento de PEPs, sanções, │
│ grupo econômico, beneficiários finais, classificação.    │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Ações — Controle por Role

### 6.1 Catálogo de Ações

| ID da Ação | Nome | Onde aparece | Quem pode |
|-----------|------|-------------|-----------|
| `create_client` | Novo Cliente | Botão global na sidebar/header | Comercial, Supervisor, Gerente, Diretor |
| `edit_draft` | Editar Rascunho | Página do cliente (status: draft) | Comercial, Supervisor, Gerente |
| `upload_document` | Upload Documento | Aba Documentos | Comercial, Supervisor, Gerente |
| `submit_for_analysis` | Enviar para Análise | Página do cliente | Comercial, Supervisor, Gerente |
| `register_activity` | Registrar Atividade | Aba Atividades | Comercial, Supervisor, Gerente |
| `reassign_within_team` | Reatribuir (equipe) | Página do cliente | Supervisor |
| `reassign_within_region` | Reatribuir (região) | Página do cliente | Gerente |
| `reassign_anywhere` | Reatribuir (nacional) | Página do cliente | Diretor, Admin |
| `trigger_bureau_requery` | Re-consultar Bureau | Aba Bureaus | Crédito |
| `add_analyst_note` | Nota do Analista | Aba Bureaus/Compliance | Crédito |
| `override_auto_reject` | Sobrescrever Indeferimento | Aba Bureaus | Crédito (com justificativa) |
| `approve_compliance` | Aprovar Compliance | Aba Varredura | Compliance |
| `reject_compliance` | Rejeitar Compliance | Aba Varredura | Compliance |
| `flag_suspicious_activity` | Sinalizar ao COAF | Aba Compliance | Compliance |
| `approve_credit` | Aprovar Crédito | Aba Decisão | Mesa |
| `reject_credit` | Reprovar Crédito | Aba Decisão | Mesa |
| `approve_with_conditions` | Aprovar com Ressalvas | Aba Decisão | Mesa |
| `generate_contract` | Gerar Contrato | Aba Contratos | Jurídico |
| `review_contract` | Revisar Contrato | Aba Contratos | Jurídico |
| `send_to_signature` | Enviar p/ Assinatura | Aba Contratos | Jurídico |
| `generate_extrajudicial` | Gerar Extrajudicial | Aba Extrajudiciais | Jurídico, Risco |
| `trigger_homologation` | Iniciar Homologação | Aba Homologação | Backoffice |
| `resolve_divergence` | Resolver Divergência | Aba Homologação | Backoffice |
| `register_contact_attempt` | Registrar Contato | Aba Contatos | Risco |
| `register_negotiation` | Registrar Negociação | Aba Negociações | Risco |
| `propose_settlement` | Propor Acordo | Aba Negociações | Risco |
| `escalate_to_recovery` | Escalar p/ Recuperação | Página do cliente | Risco |
| `escalate_to_litigation` | Escalar p/ Contencioso | Página do cliente | Risco |

### 6.2 Guard de Ação

```typescript
// packages/utils/src/permissions.ts

import { ROLE_PERMISSIONS } from '@nexus/config/permissions';

export function canPerformAction(role: string, action: string): boolean {
  const config = ROLE_PERMISSIONS[role];
  if (!config) return false;
  if (config.clientActions.includes('*')) return true;  // Admin
  return config.clientActions.includes(action);
}

export function canAccessTab(role: string, tab: string): boolean {
  const config = ROLE_PERMISSIONS[role];
  if (!config) return false;
  if (config.clientTabs.includes('*')) return true;     // Admin
  return config.clientTabs.includes(tab);
}

export function getVisibleActions(role: string, clientStatus: string): string[] {
  const config = ROLE_PERMISSIONS[role];
  if (!config) return [];
  
  // Filtra ações que fazem sentido pro status atual
  return config.clientActions.filter(action => {
    if (action === 'edit_draft' && clientStatus !== 'draft') return false;
    if (action === 'submit_for_analysis' && !['pending_documents', 'document_issues'].includes(clientStatus)) return false;
    if (action === 'approve_credit' && clientStatus !== 'pending_approval') return false;
    if (action === 'generate_extrajudicial' && clientStatus !== 'litigation') return false;
    // ... mais regras por status
    return true;
  });
}
```

### 6.3 Proteção no Backend

O frontend esconde botões, mas o backend **também valida**:

```typescript
// apps/api/src/common/guards/rbac.guard.ts

@Injectable()
export class RbacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredActions = this.reflector.get<string[]>('actions', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    
    return requiredActions.every(action => canPerformAction(user.role, action));
  }
}

// Uso no controller:
@Post(':id/approve')
@RequireActions(['approve_credit'])    // Decorator que alimenta o guard
async approveCredit(@Param('id') id: string, @Body() dto: ApproveCreditDto) {
  // Se chegou aqui, o guard já validou
}
```

---

## 7. Múltiplos Papéis (Futuro)

### 7.1 Cenário

Na v1, cada usuário tem UM role. Mas pode surgir a necessidade de um usuário acumular funções — por exemplo, um gerente que também participa da mesa aprovadora.

### 7.2 Migração (quando necessário)

A migração é simples porque o mapa de permissões já é baseado em arrays. Basta fazer merge:

```typescript
// Se o usuário tiver múltiplos roles:
function getMergedPermissions(roles: string[]): RoleConfig {
  const configs = roles.map(r => ROLE_PERMISSIONS[r]);
  
  return {
    label: configs.map(c => c.label).join(' + '),
    homeRoute: configs[0].homeRoute,          // Usa o primeiro
    sidebar: mergeSidebars(configs),           // Une as seções sem duplicar
    dashboardModules: [...new Set(configs.flatMap(c => c.dashboardModules))],
    clientTabs: [...new Set(configs.flatMap(c => c.clientTabs))],
    clientActions: [...new Set(configs.flatMap(c => c.clientActions))],
    globalActions: [...new Set(configs.flatMap(c => c.globalActions))],
    notifications: [...new Set(configs.flatMap(c => c.notifications))],
  };
}
```

Na modelagem do banco, bastaria criar uma tabela `profile_roles`:

```sql
CREATE TABLE profile_roles (
  profile_id UUID REFERENCES profiles(id),
  role TEXT NOT NULL,
  PRIMARY KEY (profile_id, role)
);
```

Mas isso é evolução futura. Na v1, role único no profiles é suficiente.

---

## 8. Notificações — Centro de Notificações

### 8.1 Componente

Todo usuário tem um ícone de sino no header com badge de contagem:

```
┌──────────────────────────────────────────────────┐
│ 🔔 3  │  João Silva  │  Comercial  │  [Sair]   │
└──────────────────────────────────────────────────┘
         │
         ▼ (ao clicar)
┌─────────────────────────────────────────┐
│ Notificações                            │
│                                         │
│ ● Documento rejeitado                   │
│   EMPRESA X — Balanço 2024 ilegível    │
│   há 2 horas                            │
│                                         │
│ ● Cliente aprovado! 🎉                  │
│   EMPRESA Y — R$ 350.000              │
│   há 5 horas                            │
│                                         │
│ ○ Cliente em análise                    │
│   EMPRESA Z                            │
│   há 1 dia                              │
│                                         │
│ [Ver todas]                             │
└─────────────────────────────────────────┘
```

Cada role só recebe os tipos de notificação definidos no mapa. O realtime do Supabase garante que a notificação aparece instantaneamente.

---

## 9. Fluxo de Login → Dashboard

```
[Usuário acessa app.plataforma.com]
         │
         ▼
[Tela de Login (Supabase Auth)]
  • Email + Senha
  • MFA (se obrigatório pro role)
         │
         ▼
[Auth retorna JWT com user_id]
         │
         ▼
[Frontend busca profile do usuário]
  GET /api/me → { id, name, role, team_id, region_id }
         │
         ▼
[Frontend carrega ROLE_PERMISSIONS[user.role]]
         │
         ├── Monta sidebar com config.sidebar
         ├── Redireciona para config.homeRoute
         └── Renderiza config.dashboardModules
         │
         ▼
[Dashboard carregado, personalizado pro role]
[Realtime subscription ativada pra notificações]
```

---

## 10. Resumo — Zero Condicionais no Código

| Camada | Como funciona |
|--------|-------------|
| **Sidebar** | `config.sidebar.map(section => ...)` — array de seções |
| **Dashboard** | `config.dashboardModules.map(id => <Module />)` — array de módulos |
| **Página do cliente** | `config.clientTabs.map(id => <Tab />)` — array de abas |
| **Ações** | `config.clientActions.includes(action)` — array de permissões |
| **Notificações** | `config.notifications` — array de tipos |
| **Rota pós-login** | `config.homeRoute` — string |

Toda a complexidade de "quem vê o quê" mora no mapa `ROLE_PERMISSIONS`. O resto da aplicação é composição pura. Se um dia surgir um novo role (ex: `auditor_externo`), basta adicionar uma entrada no mapa — zero código novo nos componentes.
