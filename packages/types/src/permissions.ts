import { type Role } from './roles';

export interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}

export interface SidebarSection {
  section: string;
  items: SidebarItem[];
}

export interface RoleConfig {
  label: string;
  homeRoute: string;
  sidebar: SidebarSection[];
  dashboardModules: string[];
  clientTabs: string[];
  clientActions: string[];
  globalActions: string[];
  notifications: string[];
}

export const ROLE_PERMISSIONS: Record<Role, RoleConfig> = {
  sales_rep: {
    label: 'Comercial',
    homeRoute: '/dashboard',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Comercial',
        items: [
          { label: 'Dashboard', icon: 'LayoutDashboard', route: '/dashboard' },
          { label: 'Meus Clientes', icon: 'Users', route: '/clients' },
          { label: 'Sacados', icon: 'Building2', route: '/drawees' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Pipeline', icon: 'GitBranch', route: '/pipeline' },
          { label: 'Atividades', icon: 'Calendar', route: '/activities' },
          { label: 'Minha Meta', icon: 'Target', route: '/goals' },
        ],
      },
      {
        section: 'Crédito',
        items: [
          { label: 'Validação CERC', icon: 'ShieldCheck', route: '/credit/cerc' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [
      'pending-actions',
      'my-pipeline-summary',
      'my-goal-progress',
      'recent-updates',
    ],
    clientTabs: ['chat', 'overview', 'documents', 'activities'],
    clientActions: [
      'edit_draft',
      'upload_document',
      'submit_for_analysis',
      'register_activity',
    ],
    globalActions: ['create_client'],
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

  sales_supervisor: {
    label: 'Supervisor Comercial',
    homeRoute: '/dashboard',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Comercial',
        items: [
          { label: 'Dashboard', icon: 'LayoutDashboard', route: '/dashboard' },
          { label: 'Clientes', icon: 'Users', route: '/clients' },
          { label: 'Sacados', icon: 'Building2', route: '/drawees' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Pipeline', icon: 'GitBranch', route: '/pipeline' },
          { label: 'Atividades', icon: 'Calendar', route: '/activities' },
        ],
      },
      {
        section: 'Crédito',
        items: [
          { label: 'Validação CERC', icon: 'ShieldCheck', route: '/credit/cerc' },
        ],
      },
      {
        section: 'Gestão da Equipe',
        items: [
          { label: 'Minha Equipe', icon: 'UsersRound', route: '/team' },
          { label: 'Ranking', icon: 'Trophy', route: '/team/ranking' },
          { label: 'Metas', icon: 'Target', route: '/goals' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [
      'team-pending-actions',
      'team-pipeline-summary',
      'team-goal-progress',
      'team-ranking-mini',
      'clients-without-activity',
    ],
    clientTabs: ['chat', 'overview', 'documents', 'activities', 'assignment-history'],
    clientActions: [
      'edit_draft',
      'upload_document',
      'submit_for_analysis',
      'register_activity',
      'reassign_within_team',
    ],
    globalActions: ['create_client', 'reassign_client'],
    notifications: [
      'document_rejected',
      'client_approved',
      'client_rejected',
      'client_auto_rejected',
      'team_goal_achieved',
      'client_inactive_7days',
    ],
  },

  sales_manager: {
    label: 'Gerente Regional',
    homeRoute: '/dashboard',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Comercial',
        items: [
          { label: 'Dashboard', icon: 'LayoutDashboard', route: '/dashboard' },
          { label: 'Clientes', icon: 'Users', route: '/clients' },
          { label: 'Sacados', icon: 'Building2', route: '/drawees' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Pipeline', icon: 'GitBranch', route: '/pipeline' },
        ],
      },
      {
        section: 'Crédito',
        items: [
          { label: 'Validação CERC', icon: 'ShieldCheck', route: '/credit/cerc' },
        ],
      },
      {
        section: 'Gestão Regional',
        items: [
          { label: 'Equipes', icon: 'UsersRound', route: '/teams' },
          { label: 'Ranking', icon: 'Trophy', route: '/teams/ranking' },
          { label: 'Metas', icon: 'Target', route: '/goals' },
          { label: 'Mapa de Calor', icon: 'Map', route: '/heatmap' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [
      'region-pipeline-summary',
      'region-goal-progress',
      'team-comparison',
      'region-volume-chart',
      'critical-alerts',
    ],
    clientTabs: ['chat', 'overview', 'documents', 'activities', 'assignment-history'],
    clientActions: [
      'edit_draft',
      'upload_document',
      'submit_for_analysis',
      'register_activity',
      'reassign_within_region',
    ],
    globalActions: ['create_client', 'reassign_client', 'manage_teams'],
    notifications: [
      'client_approved',
      'client_rejected',
      'region_goal_achieved',
      'team_below_target',
    ],
  },

  sales_director: {
    label: 'Diretor Comercial',
    homeRoute: '/dashboard',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Visão Geral',
        items: [
          { label: 'Dashboard', icon: 'LayoutDashboard', route: '/dashboard' },
          { label: 'Pipeline', icon: 'GitBranch', route: '/pipeline' },
          { label: 'Clientes', icon: 'Users', route: '/clients' },
          { label: 'Sacados', icon: 'Building2', route: '/drawees' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Validação CERC', icon: 'ShieldCheck', route: '/credit/cerc' },
        ],
      },
      {
        section: 'Gestão Nacional',
        items: [
          { label: 'Regiões', icon: 'Globe', route: '/regions' },
          { label: 'Ranking', icon: 'Trophy', route: '/regions/ranking' },
          { label: 'Metas', icon: 'Target', route: '/goals' },
          { label: 'Tendências', icon: 'TrendingUp', route: '/trends' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [
      'national-pipeline-summary',
      'national-goal-progress',
      'region-comparison',
      'monthly-trends',
      'conversion-funnel',
      'top-operations',
    ],
    clientTabs: ['chat', 'overview', 'documents', 'activities', 'assignment-history'],
    clientActions: ['reassign_anywhere'],
    globalActions: ['create_client', 'reassign_client', 'manage_regions', 'manage_goals'],
    notifications: [
      'national_goal_achieved',
      'large_operation_approved',
      'region_below_target',
    ],
  },

  credit_analyst: {
    label: 'Analista de Crédito',
    homeRoute: '/credit/queue',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Crédito',
        items: [
          { label: 'Fila de Análise', icon: 'ClipboardList', route: '/credit/queue' },
          { label: 'Sacados', icon: 'Building2', route: '/drawees' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Validação CERC', icon: 'ShieldCheck', route: '/credit/cerc' },
          { label: 'Relatórios', icon: 'FileText', route: '/credit/reports' },
          { label: 'Histórico', icon: 'History', route: '/credit/history' },
        ],
      },
      {
        section: 'Monitoramento',
        items: [
          { label: 'Status Bureaus', icon: 'Activity', route: '/credit/bureaus' },
          { label: 'Métricas', icon: 'BarChart3', route: '/credit/metrics' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [
      'credit-queue-count',
      'credit-sla-status',
      'bureau-health',
      'daily-throughput',
      'auto-reject-rate',
    ],
    clientTabs: [
      'overview',
      'documents',
      'financial-data',
      'bureau-results',
      'compliance-results',
      'ai-report',
      'credit-history',
    ],
    clientActions: [
      'trigger_bureau_requery',
      'add_analyst_note',
      'flag_for_review',
      'override_auto_reject',
    ],
    globalActions: [],
    notifications: [
      'new_client_in_queue',
      'bureau_query_failed',
      'bureau_unavailable',
      'auto_reject_override_requested',
    ],
  },

  compliance_officer: {
    label: 'Compliance',
    homeRoute: '/compliance/queue',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Compliance',
        items: [
          { label: 'Fila de Análise', icon: 'ShieldCheck', route: '/compliance/queue' },
          { label: 'Alertas', icon: 'AlertTriangle', route: '/compliance/alerts' },
          { label: 'Monitoramento', icon: 'Eye', route: '/compliance/monitoring' },
        ],
      },
      {
        section: 'KYC/AML/PLD',
        items: [
          { label: 'PEPs', icon: 'UserCheck', route: '/compliance/peps' },
          { label: 'Sanções', icon: 'Ban', route: '/compliance/sanctions' },
          { label: 'Processos', icon: 'Scale', route: '/compliance/lawsuits' },
          { label: 'Relatórios', icon: 'FileText', route: '/compliance/reports' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [
      'compliance-queue-count',
      'active-alerts',
      'pep-hits',
      'sanction-hits',
      'monitoring-due',
    ],
    clientTabs: [
      'overview',
      'compliance-screening',
      'pep-analysis',
      'sanctions-check',
      'lawsuit-details',
      'beneficial-owners',
      'risk-classification',
    ],
    clientActions: [
      'approve_compliance',
      'reject_compliance',
      'request_additional_info',
      'add_compliance_note',
      'flag_suspicious_activity',
      'escalate_to_pld',
    ],
    globalActions: ['generate_coaf_report'],
    notifications: [
      'new_client_compliance_queue',
      'pep_match_found',
      'sanction_match_found',
      'monitoring_alert',
      'coaf_report_due',
    ],
  },

  approver: {
    label: 'Mesa Aprovadora',
    homeRoute: '/approval/queue',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Aprovação',
        items: [
          { label: 'Fila de Aprovação', icon: 'CheckCircle', route: '/approval/queue' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Validação CERC', icon: 'ShieldCheck', route: '/credit/cerc' },
          { label: 'Histórico', icon: 'History', route: '/approval/history' },
          { label: 'Métricas', icon: 'BarChart3', route: '/approval/metrics' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [
      'approval-queue-count',
      'approval-sla-status',
      'approval-volume-today',
      'avg-ticket-in-queue',
      'approval-rate-trend',
    ],
    clientTabs: [
      'overview',
      'financial-data',
      'bureau-results',
      'compliance-results',
      'ai-report',
      'credit-history',
      'approval-decision',
    ],
    clientActions: [
      'approve_credit',
      'reject_credit',
      'approve_with_conditions',
      'request_additional_analysis',
      'add_approver_note',
    ],
    globalActions: [],
    notifications: [
      'new_client_approval_queue',
      'report_ready_for_review',
      'approval_sla_warning',
    ],
  },

  backoffice: {
    label: 'Backoffice',
    homeRoute: '/backoffice/operations',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Operações',
        items: [
          { label: 'Operações Ativas', icon: 'Layers', route: '/backoffice/operations' },
          { label: 'Homologação', icon: 'BadgeCheck', route: '/backoffice/homologation' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Divergências', icon: 'AlertTriangle', route: '/backoffice/divergences' },
        ],
      },
      {
        section: 'Pós-Aprovação',
        items: [
          { label: 'Docs Sócios', icon: 'FileCheck', route: '/backoffice/partner-docs' },
          { label: 'Contratos', icon: 'FileSignature', route: '/backoffice/contracts' },
          { label: 'Fundos', icon: 'Building2', route: '/backoffice/funds' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
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
      'partner-documents',
      'homologation-status',
      'contract-status',
      'fund-eligibility',
    ],
    clientActions: [
      'trigger_homologation',
      'resolve_divergence',
      'request_partner_docs',
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

  legal: {
    label: 'Jurídico',
    homeRoute: '/legal/contracts',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Contratos',
        items: [
          { label: 'Fila de Contratos', icon: 'FileSignature', route: '/legal/contracts' },
          { label: 'Gerar Contrato', icon: 'FilePlus', route: '/legal/contracts/generate' },
          { label: 'Análise Contratual', icon: 'FileSearch', route: '/legal/analysis' },
        ],
      },
      {
        section: 'Regulatório',
        items: [
          { label: 'Regulamentos', icon: 'BookOpen', route: '/legal/regulations' },
          { label: 'Extrajudiciais', icon: 'Gavel', route: '/legal/extrajudicial' },
        ],
      },
      {
        section: 'Contencioso',
        items: [
          { label: 'Ações Judiciais', icon: 'Scale', route: '/legal/litigation' },
          { label: 'Acompanhamento', icon: 'Eye', route: '/legal/tracking' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
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
      'contracts',
      'contract-analysis',
      'extrajudicial-history',
      'litigation-details',
    ],
    clientActions: [
      'generate_contract',
      'review_contract',
      'reject_contract',
      'send_to_signature',
      'generate_extrajudicial',
      'approve_extrajudicial',
      'register_lawsuit',
      'add_legal_note',
    ],
    globalActions: ['review_fund_regulation'],
    notifications: [
      'contract_generation_ready',
      'contract_review_requested',
      'extrajudicial_auto_generated',
      'litigation_update',
      'signature_completed',
      'regulation_review_requested',
    ],
  },

  risk_manager: {
    label: 'Gestão de Risco',
    homeRoute: '/risk/overview',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Gestão de Risco',
        items: [
          { label: 'Visão Geral', icon: 'ShieldAlert', route: '/risk/overview' },
          { label: 'Risco (1-30d)', icon: 'AlertTriangle', route: '/risk/management' },
          { label: 'Recuperação', icon: 'PhoneCall', route: '/risk/recovery' },
          { label: 'Contencioso', icon: 'Gavel', route: '/risk/litigation' },
        ],
      },
      {
        section: 'Análise',
        items: [
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Validação CERC', icon: 'ShieldCheck', route: '/credit/cerc' },
          { label: 'Régua de Cobrança', icon: 'GitBranch', route: '/risk/collection-rules' },
          { label: 'Métricas', icon: 'BarChart3', route: '/risk/metrics' },
          { label: 'Aging', icon: 'Clock', route: '/risk/aging' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [
      'delinquency-overview',
      'risk-clients-count',
      'recovery-clients-count',
      'litigation-clients-count',
      'collection-effectiveness',
      'aging-chart',
      'escalation-trend',
    ],
    clientTabs: [
      'overview',
      'financial-data',
      'payment-history',
      'collection-timeline',
      'negotiation-history',
      'contact-attempts',
    ],
    clientActions: [
      'register_contact_attempt',
      'register_negotiation',
      'propose_settlement',
      'escalate_to_recovery',
      'escalate_to_litigation',
      'request_extrajudicial',
      'add_risk_note',
    ],
    globalActions: ['configure_collection_rules'],
    notifications: [
      'client_entered_risk',
      'client_entered_recovery',
      'client_entered_litigation',
      'payment_received',
      'negotiation_deadline',
      'settlement_expired',
    ],
  },

  recovery: {
    label: 'Recuperação',
    homeRoute: '/risk/recovery',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Recuperação',
        items: [
          { label: 'Fila de Recuperação', icon: 'PhoneCall', route: '/risk/recovery' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Métricas', icon: 'BarChart3', route: '/risk/metrics' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: ['recovery-clients-count', 'collection-effectiveness'],
    clientTabs: ['overview', 'payment-history', 'collection-timeline', 'contact-attempts'],
    clientActions: ['register_contact_attempt', 'register_negotiation', 'propose_settlement'],
    globalActions: [],
    notifications: ['payment_received', 'negotiation_deadline'],
  },

  litigation: {
    label: 'Contencioso',
    homeRoute: '/risk/litigation',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Contencioso',
        items: [
          { label: 'Ações Judiciais', icon: 'Scale', route: '/risk/litigation' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Métricas', icon: 'BarChart3', route: '/risk/metrics' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: ['litigation-clients-count', 'active-litigation'],
    clientTabs: ['overview', 'litigation-details', 'extrajudicial-history'],
    clientActions: ['register_lawsuit', 'add_legal_note'],
    globalActions: [],
    notifications: ['litigation_update'],
  },

  employee: {
    label: 'Colaborador',
    homeRoute: '/people/me',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [],
    clientTabs: [],
    clientActions: [],
    globalActions: [],
    notifications: ['reimbursement_approved', 'reimbursement_rejected', 'review_cycle_open'],
  },

  people_manager: {
    label: 'Gestor de Pessoas',
    homeRoute: '/people/team',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Meu Time',
        items: [
          { label: 'Colaboradores', icon: 'Users', route: '/people/team' },
          { label: 'Reembolsos do Time', icon: 'Receipt', route: '/people/team/reimbursements' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [],
    clientTabs: [],
    clientActions: [],
    globalActions: [],
    notifications: [
      'reimbursement_pending_approval',
      'review_cycle_open',
      'onboarding_task_due',
    ],
  },

  hr: {
    label: 'RH',
    homeRoute: '/people/collaborators',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Gestão de Pessoas',
        items: [
          { label: 'Colaboradores', icon: 'Users', route: '/people/collaborators' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
          { label: 'Gestão de Cursos', icon: 'BookOpen', route: '/learning/admin' },
        ],
      },
    ],
    dashboardModules: [],
    clientTabs: [],
    clientActions: [],
    globalActions: ['create_collaborator', 'create_user', 'manage_courses'],
    notifications: ['onboarding_task_due', 'review_cycle_deadline', 'turnover_alert'],
  },

  dp: {
    label: 'Departamento Pessoal',
    homeRoute: '/people/collaborators',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Departamento Pessoal',
        items: [
          { label: 'Colaboradores', icon: 'Users', route: '/people/collaborators' },
          { label: 'Notas Fiscais PJ', icon: 'FileText', route: '/people/dp/invoices' },
          { label: 'Reembolsos', icon: 'Receipt', route: '/people/dp/reimbursements' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [],
    clientTabs: [],
    clientActions: [],
    globalActions: ['create_collaborator', 'create_user'],
    notifications: [
      'pj_invoice_uploaded',
      'pj_invoice_overdue',
      'reimbursement_pending_payment',
      'onboarding_task_due',
    ],
  },

  hr_admin: {
    label: 'Admin RH',
    homeRoute: '/people/collaborators',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Administração',
        items: [
          { label: 'Usuários', icon: 'Users', route: '/admin/users' },
        ],
      },
      {
        section: 'Departamento Pessoal',
        items: [
          { label: 'Colaboradores', icon: 'Users', route: '/people/collaborators' },
          { label: 'Notas Fiscais PJ', icon: 'FileText', route: '/people/dp/invoices' },
          { label: 'Reembolsos', icon: 'Receipt', route: '/people/dp/reimbursements' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
          { label: 'Gestão de Cursos', icon: 'BookOpen', route: '/learning/admin' },
        ],
      },
    ],
    dashboardModules: [],
    clientTabs: [],
    clientActions: [],
    globalActions: ['create_collaborator', 'create_user', 'manage_people_settings', 'manage_courses'],
    notifications: [
      'onboarding_task_due',
      'review_cycle_deadline',
      'turnover_alert',
      'pj_invoice_overdue',
    ],
  },

  governance: {
    label: 'Governança',
    homeRoute: '/governance',
    sidebar: [
      {
        section: 'Meu Espaço',
        items: [
          { label: 'Meu Perfil', icon: 'User', route: '/people/me' },
          { label: 'Minhas NFs', icon: 'FileText', route: '/people/me/invoices' },
          { label: 'Meus Reembolsos', icon: 'Receipt', route: '/people/me/reimbursements' },
        ],
      },
      {
        section: 'Governança',
        items: [
          { label: 'Visão Geral', icon: 'Landmark', route: '/governance' },
          { label: 'Comitês', icon: 'Users', route: '/governance/committees' },
          { label: 'Ações', icon: 'CheckSquare', route: '/governance/actions' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
        ],
      },
    ],
    dashboardModules: [],
    clientTabs: [],
    clientActions: [],
    globalActions: [],
    notifications: [],
  },

  admin: {
    label: 'Administrador',
    homeRoute: '/admin/overview',
    sidebar: [
      {
        section: 'Sistema',
        items: [
          { label: 'Visão Geral', icon: 'LayoutDashboard', route: '/admin/overview' },
          { label: 'Usuários', icon: 'Users', route: '/admin/users' },
          { label: 'Clientes', icon: 'Users', route: '/clients' },
          { label: 'Sacados', icon: 'Building2', route: '/drawees' },
          { label: 'Duplicatas', icon: 'FileSpreadsheet', route: '/cnab/receivables' },
          { label: 'Operações', icon: 'Briefcase', route: '/cnab/operations' },
          { label: 'Validação CERC', icon: 'ShieldCheck', route: '/credit/cerc' },
          { label: 'Regiões', icon: 'Globe', route: '/admin/regions' },
          { label: 'Equipes', icon: 'UsersRound', route: '/admin/teams' },
        ],
      },
      {
        section: 'Configurações',
        items: [
          { label: 'Segmentos', icon: 'Tags', route: '/admin/segments' },
          { label: 'Templates Docs', icon: 'FileText', route: '/admin/document-templates' },
          { label: 'Motor de Regras', icon: 'Settings', route: '/admin/rules-engine' },
          { label: 'Fundos', icon: 'Building2', route: '/admin/funds' },
          { label: 'Metas', icon: 'Target', route: '/admin/goals' },
        ],
      },
      {
        section: 'Auditoria',
        items: [
          { label: 'Audit Trail', icon: 'ScrollText', route: '/admin/audit' },
          { label: 'Logs', icon: 'Terminal', route: '/admin/logs' },
          { label: 'Integrações', icon: 'Plug', route: '/admin/integrations' },
        ],
      },
      {
        section: 'Conhecimento',
        items: [
          { label: 'Wiki', icon: 'BookOpen', route: '/knowledge' },
        ],
      },
      {
        section: 'Treinamentos',
        items: [
          { label: 'Meus Cursos', icon: 'GraduationCap', route: '/learning' },
          { label: 'Gestão de Cursos', icon: 'BookOpen', route: '/learning/admin' },
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
    clientTabs: ['*'],
    clientActions: ['*'],
    globalActions: ['*', 'manage_courses'],
    notifications: [
      'system_error',
      'integration_down',
      'security_alert',
      'new_user_created',
    ],
  },
};
