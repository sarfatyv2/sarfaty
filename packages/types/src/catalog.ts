export type FeatureType =
  | 'sidebar_item'
  | 'client_tab'
  | 'client_action'
  | 'global_action'
  | 'dashboard_module'
  | 'notification';

export interface ModuleCatalogEntry {
  key: string;
  label: string;
  icon: string;
  sortOrder: number;
}

export interface FeatureCatalogEntry {
  key: string;
  module: string;
  type: FeatureType;
  label: string;
  icon?: string;
  route?: string;
  section?: string;
  sortOrder: number;
}

export const MODULE_CATALOG: ModuleCatalogEntry[] = [
  { key: 'my_space',    label: 'Meu Espaço',        icon: 'User',          sortOrder: 0 },
  { key: 'commercial',  label: 'Comercial',          icon: 'Briefcase',     sortOrder: 1 },
  { key: 'credit',      label: 'Crédito',            icon: 'ClipboardList', sortOrder: 2 },
  { key: 'compliance',  label: 'Compliance',         icon: 'ShieldCheck',   sortOrder: 3 },
  { key: 'approval',    label: 'Aprovação',          icon: 'CheckCircle',   sortOrder: 4 },
  { key: 'backoffice',  label: 'Backoffice',         icon: 'Layers',        sortOrder: 5 },
  { key: 'legal',       label: 'Jurídico',           icon: 'Scale',         sortOrder: 6 },
  { key: 'risk',        label: 'Gestão de Risco',    icon: 'ShieldAlert',   sortOrder: 7 },
  { key: 'people',      label: 'People',             icon: 'Users',         sortOrder: 8 },
  { key: 'governance',  label: 'Governança',         icon: 'Landmark',      sortOrder: 9 },
  { key: 'knowledge',   label: 'Conhecimento',       icon: 'BookOpen',      sortOrder: 10 },
  { key: 'learning',    label: 'Treinamentos',       icon: 'GraduationCap', sortOrder: 11 },
  { key: 'admin',       label: 'Administração',      icon: 'Settings',      sortOrder: 12 },
];

export const FEATURE_CATALOG: FeatureCatalogEntry[] = [
  // ── My Space – sidebar ──────────────────────────────────────────────────────
  { key: 'sidebar:my_space/profile',      module: 'my_space', type: 'sidebar_item', section: 'Meu Espaço',  label: 'Meu Perfil',        icon: 'User',          route: '/people/me',                    sortOrder: 0 },
  { key: 'sidebar:my_space/invoices',     module: 'my_space', type: 'sidebar_item', section: 'Meu Espaço',  label: 'Minhas NFs',         icon: 'FileText',      route: '/people/me/invoices',           sortOrder: 1 },
  { key: 'sidebar:my_space/reimbursements', module: 'my_space', type: 'sidebar_item', section: 'Meu Espaço', label: 'Meus Reembolsos',  icon: 'Receipt',       route: '/people/me/reimbursements',     sortOrder: 2 },

  // ── Commercial – sidebar ────────────────────────────────────────────────────
  { key: 'sidebar:commercial/dashboard',  module: 'commercial', type: 'sidebar_item', section: 'Comercial', label: 'Dashboard',          icon: 'LayoutDashboard', route: '/dashboard',                 sortOrder: 0 },
  { key: 'sidebar:commercial/clients',    module: 'commercial', type: 'sidebar_item', section: 'Comercial', label: 'Clientes',           icon: 'Users',           route: '/clients',                   sortOrder: 1 },
  { key: 'sidebar:commercial/drawees',    module: 'commercial', type: 'sidebar_item', section: 'Comercial', label: 'Sacados',            icon: 'Building2',       route: '/drawees',                   sortOrder: 2 },
  { key: 'sidebar:commercial/receivables',module: 'commercial', type: 'sidebar_item', section: 'Comercial', label: 'Duplicatas',         icon: 'FileSpreadsheet', route: '/cnab/receivables',          sortOrder: 3 },
  { key: 'sidebar:commercial/operations', module: 'commercial', type: 'sidebar_item', section: 'Comercial', label: 'Operações',          icon: 'Briefcase',       route: '/cnab/operations',           sortOrder: 4 },
  { key: 'sidebar:commercial/pipeline',   module: 'commercial', type: 'sidebar_item', section: 'Comercial', label: 'Pipeline',           icon: 'GitBranch',       route: '/pipeline',                  sortOrder: 5 },
  { key: 'sidebar:commercial/activities', module: 'commercial', type: 'sidebar_item', section: 'Comercial', label: 'Atividades',         icon: 'Calendar',        route: '/activities',                sortOrder: 6 },
  { key: 'sidebar:commercial/goals',      module: 'commercial', type: 'sidebar_item', section: 'Comercial', label: 'Minha Meta',         icon: 'Target',          route: '/goals',                     sortOrder: 7 },

  // ── Commercial – team management sidebar ────────────────────────────────────
  { key: 'sidebar:commercial/team',       module: 'commercial', type: 'sidebar_item', section: 'Gestão da Equipe', label: 'Minha Equipe', icon: 'UsersRound', route: '/team',               sortOrder: 0 },
  { key: 'sidebar:commercial/ranking',    module: 'commercial', type: 'sidebar_item', section: 'Gestão da Equipe', label: 'Ranking',      icon: 'Trophy',     route: '/team/ranking',       sortOrder: 1 },
  { key: 'sidebar:commercial/teams_goals',module: 'commercial', type: 'sidebar_item', section: 'Gestão da Equipe', label: 'Metas',        icon: 'Target',     route: '/goals',              sortOrder: 2 },

  // ── Commercial – regional management sidebar ─────────────────────────────────
  { key: 'sidebar:commercial/teams',          module: 'commercial', type: 'sidebar_item', section: 'Gestão Regional', label: 'Equipes',       icon: 'UsersRound', route: '/teams',          sortOrder: 0 },
  { key: 'sidebar:commercial/teams_ranking',  module: 'commercial', type: 'sidebar_item', section: 'Gestão Regional', label: 'Ranking',       icon: 'Trophy',     route: '/teams/ranking',  sortOrder: 1 },
  { key: 'sidebar:commercial/regional_goals', module: 'commercial', type: 'sidebar_item', section: 'Gestão Regional', label: 'Metas',         icon: 'Target',     route: '/goals',          sortOrder: 2 },
  { key: 'sidebar:commercial/heatmap',        module: 'commercial', type: 'sidebar_item', section: 'Gestão Regional', label: 'Mapa de Calor', icon: 'Map',        route: '/heatmap',        sortOrder: 3 },

  // ── Commercial – national management sidebar ─────────────────────────────────
  { key: 'sidebar:commercial/regions',         module: 'commercial', type: 'sidebar_item', section: 'Gestão Nacional', label: 'Regiões',    icon: 'Globe',      route: '/regions',          sortOrder: 0 },
  { key: 'sidebar:commercial/nat_ranking',     module: 'commercial', type: 'sidebar_item', section: 'Gestão Nacional', label: 'Ranking',    icon: 'Trophy',     route: '/regions/ranking',  sortOrder: 1 },
  { key: 'sidebar:commercial/nat_goals',       module: 'commercial', type: 'sidebar_item', section: 'Gestão Nacional', label: 'Metas',      icon: 'Target',     route: '/goals',            sortOrder: 2 },
  { key: 'sidebar:commercial/trends',          module: 'commercial', type: 'sidebar_item', section: 'Gestão Nacional', label: 'Tendências', icon: 'TrendingUp', route: '/trends',           sortOrder: 3 },

  // ── Credit – sidebar ─────────────────────────────────────────────────────────
  { key: 'sidebar:credit/queue',           module: 'credit', type: 'sidebar_item', section: 'Crédito',        label: 'Fila de Análise', icon: 'ClipboardList', route: '/credit/queue',    sortOrder: 0 },
  { key: 'sidebar:credit/reports',         module: 'credit', type: 'sidebar_item', section: 'Crédito',        label: 'Relatórios',      icon: 'FileText',      route: '/credit/reports',  sortOrder: 1 },
  { key: 'sidebar:credit/history',         module: 'credit', type: 'sidebar_item', section: 'Crédito',        label: 'Histórico',       icon: 'History',       route: '/credit/history',  sortOrder: 2 },
  { key: 'sidebar:credit/bureaus',         module: 'credit', type: 'sidebar_item', section: 'Monitoramento',  label: 'Status Bureaus',  icon: 'Activity',      route: '/credit/bureaus',  sortOrder: 0 },
  { key: 'sidebar:credit/metrics',         module: 'credit', type: 'sidebar_item', section: 'Monitoramento',  label: 'Métricas',        icon: 'BarChart3',     route: '/credit/metrics',  sortOrder: 1 },

  // ── Compliance – sidebar ─────────────────────────────────────────────────────
  { key: 'sidebar:compliance/queue',       module: 'compliance', type: 'sidebar_item', section: 'Compliance', label: 'Fila de Análise',  icon: 'ShieldCheck',   route: '/compliance/queue',       sortOrder: 0 },
  { key: 'sidebar:compliance/alerts',      module: 'compliance', type: 'sidebar_item', section: 'Compliance', label: 'Alertas',          icon: 'AlertTriangle', route: '/compliance/alerts',      sortOrder: 1 },
  { key: 'sidebar:compliance/monitoring',  module: 'compliance', type: 'sidebar_item', section: 'Compliance', label: 'Monitoramento',    icon: 'Eye',           route: '/compliance/monitoring',  sortOrder: 2 },
  { key: 'sidebar:compliance/peps',        module: 'compliance', type: 'sidebar_item', section: 'KYC/AML/PLD', label: 'PEPs',           icon: 'UserCheck',     route: '/compliance/peps',        sortOrder: 0 },
  { key: 'sidebar:compliance/sanctions',   module: 'compliance', type: 'sidebar_item', section: 'KYC/AML/PLD', label: 'Sanções',        icon: 'Ban',           route: '/compliance/sanctions',   sortOrder: 1 },
  { key: 'sidebar:compliance/lawsuits',    module: 'compliance', type: 'sidebar_item', section: 'KYC/AML/PLD', label: 'Processos',      icon: 'Scale',         route: '/compliance/lawsuits',    sortOrder: 2 },
  { key: 'sidebar:compliance/reports',     module: 'compliance', type: 'sidebar_item', section: 'KYC/AML/PLD', label: 'Relatórios',     icon: 'FileText',      route: '/compliance/reports',     sortOrder: 3 },

  // ── Approval – sidebar ───────────────────────────────────────────────────────
  { key: 'sidebar:approval/queue',         module: 'approval', type: 'sidebar_item', section: 'Aprovação', label: 'Fila de Aprovação', icon: 'CheckCircle', route: '/approval/queue',    sortOrder: 0 },
  { key: 'sidebar:approval/history',       module: 'approval', type: 'sidebar_item', section: 'Aprovação', label: 'Histórico',         icon: 'History',     route: '/approval/history',  sortOrder: 1 },
  { key: 'sidebar:approval/metrics',       module: 'approval', type: 'sidebar_item', section: 'Aprovação', label: 'Métricas',          icon: 'BarChart3',   route: '/approval/metrics',  sortOrder: 2 },

  // ── Backoffice – sidebar ─────────────────────────────────────────────────────
  { key: 'sidebar:backoffice/operations',    module: 'backoffice', type: 'sidebar_item', section: 'Operações',     label: 'Operações Ativas',  icon: 'Layers',        route: '/backoffice/operations',    sortOrder: 0 },
  { key: 'sidebar:backoffice/homologation',  module: 'backoffice', type: 'sidebar_item', section: 'Operações',     label: 'Homologação',       icon: 'BadgeCheck',    route: '/backoffice/homologation',  sortOrder: 1 },
  { key: 'sidebar:backoffice/divergences',   module: 'backoffice', type: 'sidebar_item', section: 'Operações',     label: 'Divergências',      icon: 'AlertTriangle', route: '/backoffice/divergences',   sortOrder: 2 },
  { key: 'sidebar:backoffice/partner_docs',  module: 'backoffice', type: 'sidebar_item', section: 'Pós-Aprovação', label: 'Docs Sócios',       icon: 'FileCheck',     route: '/backoffice/partner-docs',  sortOrder: 0 },
  { key: 'sidebar:backoffice/contracts',     module: 'backoffice', type: 'sidebar_item', section: 'Pós-Aprovação', label: 'Contratos',         icon: 'FileSignature', route: '/backoffice/contracts',     sortOrder: 1 },
  { key: 'sidebar:backoffice/funds',         module: 'backoffice', type: 'sidebar_item', section: 'Pós-Aprovação', label: 'Fundos',            icon: 'Building2',     route: '/backoffice/funds',         sortOrder: 2 },

  // ── Legal – sidebar ──────────────────────────────────────────────────────────
  { key: 'sidebar:legal/contracts',         module: 'legal', type: 'sidebar_item', section: 'Contratos',   label: 'Fila de Contratos',    icon: 'FileSignature', route: '/legal/contracts',          sortOrder: 0 },
  { key: 'sidebar:legal/contracts_generate',module: 'legal', type: 'sidebar_item', section: 'Contratos',   label: 'Gerar Contrato',       icon: 'FilePlus',      route: '/legal/contracts/generate', sortOrder: 1 },
  { key: 'sidebar:legal/analysis',          module: 'legal', type: 'sidebar_item', section: 'Contratos',   label: 'Análise Contratual',   icon: 'FileSearch',    route: '/legal/analysis',           sortOrder: 2 },
  { key: 'sidebar:legal/regulations',       module: 'legal', type: 'sidebar_item', section: 'Regulatório', label: 'Regulamentos',         icon: 'BookOpen',      route: '/legal/regulations',        sortOrder: 0 },
  { key: 'sidebar:legal/extrajudicial',     module: 'legal', type: 'sidebar_item', section: 'Regulatório', label: 'Extrajudiciais',       icon: 'Gavel',         route: '/legal/extrajudicial',      sortOrder: 1 },
  { key: 'sidebar:legal/litigation',        module: 'legal', type: 'sidebar_item', section: 'Contencioso', label: 'Ações Judiciais',      icon: 'Scale',         route: '/legal/litigation',         sortOrder: 0 },
  { key: 'sidebar:legal/tracking',          module: 'legal', type: 'sidebar_item', section: 'Contencioso', label: 'Acompanhamento',       icon: 'Eye',           route: '/legal/tracking',           sortOrder: 1 },

  // ── Risk – sidebar ───────────────────────────────────────────────────────────
  { key: 'sidebar:risk/overview',           module: 'risk', type: 'sidebar_item', section: 'Gestão de Risco', label: 'Visão Geral',      icon: 'ShieldAlert',  route: '/risk/overview',          sortOrder: 0 },
  { key: 'sidebar:risk/management',         module: 'risk', type: 'sidebar_item', section: 'Gestão de Risco', label: 'Risco (1-30d)',    icon: 'AlertTriangle', route: '/risk/management',        sortOrder: 1 },
  { key: 'sidebar:risk/recovery',           module: 'risk', type: 'sidebar_item', section: 'Gestão de Risco', label: 'Recuperação',      icon: 'PhoneCall',    route: '/risk/recovery',          sortOrder: 2 },
  { key: 'sidebar:risk/litigation',         module: 'risk', type: 'sidebar_item', section: 'Gestão de Risco', label: 'Contencioso',      icon: 'Gavel',        route: '/risk/litigation',        sortOrder: 3 },
  { key: 'sidebar:risk/collection_rules',   module: 'risk', type: 'sidebar_item', section: 'Análise',         label: 'Régua de Cobrança',icon: 'GitBranch',    route: '/risk/collection-rules',  sortOrder: 0 },
  { key: 'sidebar:risk/metrics',            module: 'risk', type: 'sidebar_item', section: 'Análise',         label: 'Métricas',         icon: 'BarChart3',    route: '/risk/metrics',           sortOrder: 1 },
  { key: 'sidebar:risk/aging',              module: 'risk', type: 'sidebar_item', section: 'Análise',         label: 'Aging',            icon: 'Clock',        route: '/risk/aging',             sortOrder: 2 },

  // ── People – sidebar ─────────────────────────────────────────────────────────
  { key: 'sidebar:people/collaborators',    module: 'people', type: 'sidebar_item', section: 'Gestão de Pessoas', label: 'Colaboradores',        icon: 'Users',   route: '/people/collaborators',          sortOrder: 0 },
  { key: 'sidebar:people/team',             module: 'people', type: 'sidebar_item', section: 'Meu Time',          label: 'Colaboradores',        icon: 'Users',   route: '/people/team',                   sortOrder: 0 },
  { key: 'sidebar:people/team_reimbursements', module: 'people', type: 'sidebar_item', section: 'Meu Time',       label: 'Reembolsos do Time',   icon: 'Receipt', route: '/people/team/reimbursements',    sortOrder: 1 },
  { key: 'sidebar:people/dp_invoices',      module: 'people', type: 'sidebar_item', section: 'Departamento Pessoal', label: 'Notas Fiscais PJ',  icon: 'FileText',route: '/people/dp/invoices',            sortOrder: 0 },
  { key: 'sidebar:people/dp_reimbursements',module: 'people', type: 'sidebar_item', section: 'Departamento Pessoal', label: 'Reembolsos',        icon: 'Receipt', route: '/people/dp/reimbursements',     sortOrder: 1 },

  // ── Governance – sidebar ─────────────────────────────────────────────────────
  { key: 'sidebar:governance/overview',     module: 'governance', type: 'sidebar_item', section: 'Governança', label: 'Visão Geral', icon: 'Landmark',    route: '/governance',               sortOrder: 0 },
  { key: 'sidebar:governance/committees',   module: 'governance', type: 'sidebar_item', section: 'Governança', label: 'Comitês',     icon: 'Users',       route: '/governance/committees',    sortOrder: 1 },
  { key: 'sidebar:governance/actions',      module: 'governance', type: 'sidebar_item', section: 'Governança', label: 'Ações',       icon: 'CheckSquare', route: '/governance/actions',       sortOrder: 2 },

  // ── Knowledge – sidebar ──────────────────────────────────────────────────────
  { key: 'sidebar:knowledge/wiki',          module: 'knowledge', type: 'sidebar_item', section: 'Conhecimento', label: 'Wiki', icon: 'BookOpen', route: '/knowledge', sortOrder: 0 },

  // ── Learning – sidebar ───────────────────────────────────────────────────────
  { key: 'sidebar:learning/my_courses',     module: 'learning', type: 'sidebar_item', section: 'Treinamentos', label: 'Meus Cursos',     icon: 'GraduationCap', route: '/learning',       sortOrder: 0 },
  { key: 'sidebar:learning/admin',          module: 'learning', type: 'sidebar_item', section: 'Treinamentos', label: 'Gestão de Cursos', icon: 'BookOpen',     route: '/learning/admin', sortOrder: 1 },

  // ── Admin – sidebar ──────────────────────────────────────────────────────────
  { key: 'sidebar:admin/overview',          module: 'admin', type: 'sidebar_item', section: 'Sistema',        label: 'Visão Geral',       icon: 'LayoutDashboard', route: '/admin/overview',           sortOrder: 0 },
  { key: 'sidebar:admin/users',             module: 'admin', type: 'sidebar_item', section: 'Sistema',        label: 'Usuários',          icon: 'Users',           route: '/admin/users',              sortOrder: 1 },
  { key: 'sidebar:admin/regions',           module: 'admin', type: 'sidebar_item', section: 'Sistema',        label: 'Regiões',           icon: 'Globe',           route: '/admin/regions',            sortOrder: 2 },
  { key: 'sidebar:admin/teams',             module: 'admin', type: 'sidebar_item', section: 'Sistema',        label: 'Equipes',           icon: 'UsersRound',      route: '/admin/teams',              sortOrder: 3 },
  { key: 'sidebar:admin/segments',          module: 'admin', type: 'sidebar_item', section: 'Configurações',  label: 'Segmentos',         icon: 'Tags',            route: '/admin/segments',           sortOrder: 0 },
  { key: 'sidebar:admin/document_templates',module: 'admin', type: 'sidebar_item', section: 'Configurações',  label: 'Templates Docs',    icon: 'FileText',        route: '/admin/document-templates', sortOrder: 1 },
  { key: 'sidebar:admin/rules_engine',      module: 'admin', type: 'sidebar_item', section: 'Configurações',  label: 'Motor de Regras',   icon: 'Settings',        route: '/admin/rules-engine',       sortOrder: 2 },
  { key: 'sidebar:admin/funds',             module: 'admin', type: 'sidebar_item', section: 'Configurações',  label: 'Fundos',            icon: 'Building2',       route: '/admin/funds',              sortOrder: 3 },
  { key: 'sidebar:admin/goals',             module: 'admin', type: 'sidebar_item', section: 'Configurações',  label: 'Metas',             icon: 'Target',          route: '/admin/goals',              sortOrder: 4 },
  { key: 'sidebar:admin/roles',             module: 'admin', type: 'sidebar_item', section: 'Configurações',  label: 'Roles & Permissões',icon: 'ShieldCheck',     route: '/admin/roles',              sortOrder: 5 },
  { key: 'sidebar:admin/audit',             module: 'admin', type: 'sidebar_item', section: 'Auditoria',      label: 'Audit Trail',       icon: 'ScrollText',      route: '/admin/audit',              sortOrder: 0 },
  { key: 'sidebar:admin/logs',              module: 'admin', type: 'sidebar_item', section: 'Auditoria',      label: 'Logs',              icon: 'Terminal',        route: '/admin/logs',               sortOrder: 1 },
  { key: 'sidebar:admin/integrations',      module: 'admin', type: 'sidebar_item', section: 'Auditoria',      label: 'Integrações',       icon: 'Plug',            route: '/admin/integrations',       sortOrder: 2 },

  // ── Client tabs ──────────────────────────────────────────────────────────────
  { key: 'tab:chat',                  module: 'commercial',  type: 'client_tab', label: 'Chat',                    sortOrder: 0 },
  { key: 'tab:overview',              module: 'commercial',  type: 'client_tab', label: 'Visão Geral',             sortOrder: 1 },
  { key: 'tab:documents',             module: 'commercial',  type: 'client_tab', label: 'Documentos',              sortOrder: 2 },
  { key: 'tab:activities',            module: 'commercial',  type: 'client_tab', label: 'Atividades',              sortOrder: 3 },
  { key: 'tab:assignment_history',    module: 'commercial',  type: 'client_tab', label: 'Histórico de Atribuição', sortOrder: 4 },
  { key: 'tab:financial_data',        module: 'credit',      type: 'client_tab', label: 'Dados Financeiros',       sortOrder: 5 },
  { key: 'tab:bureau_results',        module: 'credit',      type: 'client_tab', label: 'Bureaus',                 sortOrder: 6 },
  { key: 'tab:ai_report',             module: 'credit',      type: 'client_tab', label: 'Relatório IA',            sortOrder: 7 },
  { key: 'tab:credit_history',        module: 'credit',      type: 'client_tab', label: 'Histórico de Crédito',    sortOrder: 8 },
  { key: 'tab:approval_decision',     module: 'approval',    type: 'client_tab', label: 'Decisão de Aprovação',    sortOrder: 9 },
  { key: 'tab:compliance_results',    module: 'compliance',  type: 'client_tab', label: 'Compliance',              sortOrder: 10 },
  { key: 'tab:compliance_screening',  module: 'compliance',  type: 'client_tab', label: 'Triagem Compliance',      sortOrder: 11 },
  { key: 'tab:pep_analysis',          module: 'compliance',  type: 'client_tab', label: 'Análise PEP',             sortOrder: 12 },
  { key: 'tab:sanctions_check',       module: 'compliance',  type: 'client_tab', label: 'Verificação Sanções',     sortOrder: 13 },
  { key: 'tab:lawsuit_details',       module: 'compliance',  type: 'client_tab', label: 'Processos Judiciais',     sortOrder: 14 },
  { key: 'tab:beneficial_owners',     module: 'compliance',  type: 'client_tab', label: 'Beneficiários Finais',    sortOrder: 15 },
  { key: 'tab:risk_classification',   module: 'compliance',  type: 'client_tab', label: 'Classificação de Risco',  sortOrder: 16 },
  { key: 'tab:partner_documents',     module: 'backoffice',  type: 'client_tab', label: 'Docs Sócios',             sortOrder: 17 },
  { key: 'tab:homologation_status',   module: 'backoffice',  type: 'client_tab', label: 'Status Homologação',      sortOrder: 18 },
  { key: 'tab:contract_status',       module: 'backoffice',  type: 'client_tab', label: 'Status Contrato',         sortOrder: 19 },
  { key: 'tab:fund_eligibility',      module: 'backoffice',  type: 'client_tab', label: 'Elegibilidade Fundo',     sortOrder: 20 },
  { key: 'tab:contracts',             module: 'legal',       type: 'client_tab', label: 'Contratos',               sortOrder: 21 },
  { key: 'tab:contract_analysis',     module: 'legal',       type: 'client_tab', label: 'Análise Contratual',      sortOrder: 22 },
  { key: 'tab:extrajudicial_history', module: 'legal',       type: 'client_tab', label: 'Histórico Extrajudicial', sortOrder: 23 },
  { key: 'tab:litigation_details',    module: 'legal',       type: 'client_tab', label: 'Detalhes Contencioso',    sortOrder: 24 },
  { key: 'tab:payment_history',       module: 'risk',        type: 'client_tab', label: 'Histórico de Pagamentos', sortOrder: 25 },
  { key: 'tab:collection_timeline',   module: 'risk',        type: 'client_tab', label: 'Timeline de Cobrança',    sortOrder: 26 },
  { key: 'tab:negotiation_history',   module: 'risk',        type: 'client_tab', label: 'Histórico de Negociação', sortOrder: 27 },
  { key: 'tab:contact_attempts',      module: 'risk',        type: 'client_tab', label: 'Tentativas de Contato',   sortOrder: 28 },

  // ── Client actions ───────────────────────────────────────────────────────────
  { key: 'action:edit_draft',                  module: 'commercial',  type: 'client_action', label: 'Editar Rascunho',               sortOrder: 0 },
  { key: 'action:upload_document',             module: 'commercial',  type: 'client_action', label: 'Enviar Documento',              sortOrder: 1 },
  { key: 'action:submit_for_analysis',         module: 'commercial',  type: 'client_action', label: 'Enviar para Análise',           sortOrder: 2 },
  { key: 'action:register_activity',           module: 'commercial',  type: 'client_action', label: 'Registrar Atividade',           sortOrder: 3 },
  { key: 'action:reassign_within_team',        module: 'commercial',  type: 'client_action', label: 'Reatribuir (Equipe)',           sortOrder: 4 },
  { key: 'action:reassign_within_region',      module: 'commercial',  type: 'client_action', label: 'Reatribuir (Região)',           sortOrder: 5 },
  { key: 'action:reassign_anywhere',           module: 'commercial',  type: 'client_action', label: 'Reatribuir (Qualquer)',         sortOrder: 6 },
  { key: 'action:trigger_bureau_requery',      module: 'credit',      type: 'client_action', label: 'Reconsultar Bureau',            sortOrder: 7 },
  { key: 'action:add_analyst_note',            module: 'credit',      type: 'client_action', label: 'Adicionar Nota (Analista)',     sortOrder: 8 },
  { key: 'action:flag_for_review',             module: 'credit',      type: 'client_action', label: 'Marcar para Revisão',           sortOrder: 9 },
  { key: 'action:override_auto_reject',        module: 'credit',      type: 'client_action', label: 'Sobrescrever Rejeição Auto',    sortOrder: 10 },
  { key: 'action:approve_credit',              module: 'approval',    type: 'client_action', label: 'Aprovar Crédito',               sortOrder: 11 },
  { key: 'action:reject_credit',               module: 'approval',    type: 'client_action', label: 'Rejeitar Crédito',              sortOrder: 12 },
  { key: 'action:approve_with_conditions',     module: 'approval',    type: 'client_action', label: 'Aprovar com Condições',         sortOrder: 13 },
  { key: 'action:request_additional_analysis', module: 'approval',    type: 'client_action', label: 'Solicitar Análise Adicional',   sortOrder: 14 },
  { key: 'action:add_approver_note',           module: 'approval',    type: 'client_action', label: 'Adicionar Nota (Aprovador)',    sortOrder: 15 },
  { key: 'action:approve_compliance',          module: 'compliance',  type: 'client_action', label: 'Aprovar Compliance',            sortOrder: 16 },
  { key: 'action:reject_compliance',           module: 'compliance',  type: 'client_action', label: 'Rejeitar Compliance',           sortOrder: 17 },
  { key: 'action:request_additional_info',     module: 'compliance',  type: 'client_action', label: 'Solicitar Info Adicional',      sortOrder: 18 },
  { key: 'action:add_compliance_note',         module: 'compliance',  type: 'client_action', label: 'Adicionar Nota (Compliance)',   sortOrder: 19 },
  { key: 'action:flag_suspicious_activity',    module: 'compliance',  type: 'client_action', label: 'Marcar Atividade Suspeita',     sortOrder: 20 },
  { key: 'action:escalate_to_pld',             module: 'compliance',  type: 'client_action', label: 'Escalar para PLD',              sortOrder: 21 },
  { key: 'action:trigger_homologation',        module: 'backoffice',  type: 'client_action', label: 'Iniciar Homologação',           sortOrder: 22 },
  { key: 'action:resolve_divergence',          module: 'backoffice',  type: 'client_action', label: 'Resolver Divergência',          sortOrder: 23 },
  { key: 'action:request_partner_docs',        module: 'backoffice',  type: 'client_action', label: 'Solicitar Docs Sócios',         sortOrder: 24 },
  { key: 'action:add_backoffice_note',         module: 'backoffice',  type: 'client_action', label: 'Adicionar Nota (Backoffice)',   sortOrder: 25 },
  { key: 'action:generate_contract',           module: 'legal',       type: 'client_action', label: 'Gerar Contrato',                sortOrder: 26 },
  { key: 'action:review_contract',             module: 'legal',       type: 'client_action', label: 'Revisar Contrato',              sortOrder: 27 },
  { key: 'action:reject_contract',             module: 'legal',       type: 'client_action', label: 'Rejeitar Contrato',             sortOrder: 28 },
  { key: 'action:send_to_signature',           module: 'legal',       type: 'client_action', label: 'Enviar para Assinatura',        sortOrder: 29 },
  { key: 'action:generate_extrajudicial',      module: 'legal',       type: 'client_action', label: 'Gerar Extrajudicial',           sortOrder: 30 },
  { key: 'action:approve_extrajudicial',       module: 'legal',       type: 'client_action', label: 'Aprovar Extrajudicial',         sortOrder: 31 },
  { key: 'action:register_lawsuit',            module: 'legal',       type: 'client_action', label: 'Registrar Ação Judicial',       sortOrder: 32 },
  { key: 'action:add_legal_note',              module: 'legal',       type: 'client_action', label: 'Adicionar Nota (Jurídico)',     sortOrder: 33 },
  { key: 'action:register_contact_attempt',    module: 'risk',        type: 'client_action', label: 'Registrar Tentativa de Contato',sortOrder: 34 },
  { key: 'action:register_negotiation',        module: 'risk',        type: 'client_action', label: 'Registrar Negociação',          sortOrder: 35 },
  { key: 'action:propose_settlement',          module: 'risk',        type: 'client_action', label: 'Propor Acordo',                 sortOrder: 36 },
  { key: 'action:escalate_to_recovery',        module: 'risk',        type: 'client_action', label: 'Escalar para Recuperação',      sortOrder: 37 },
  { key: 'action:escalate_to_litigation',      module: 'risk',        type: 'client_action', label: 'Escalar para Contencioso',      sortOrder: 38 },
  { key: 'action:request_extrajudicial',       module: 'risk',        type: 'client_action', label: 'Solicitar Extrajudicial',       sortOrder: 39 },
  { key: 'action:add_risk_note',               module: 'risk',        type: 'client_action', label: 'Adicionar Nota (Risco)',        sortOrder: 40 },

  // ── Global actions ───────────────────────────────────────────────────────────
  { key: 'global:create_client',              module: 'commercial',  type: 'global_action', label: 'Criar Cliente',                sortOrder: 0 },
  { key: 'global:reassign_client',            module: 'commercial',  type: 'global_action', label: 'Reatribuir Cliente',           sortOrder: 1 },
  { key: 'global:manage_teams',              module: 'commercial',  type: 'global_action', label: 'Gerenciar Equipes',             sortOrder: 2 },
  { key: 'global:manage_regions',            module: 'commercial',  type: 'global_action', label: 'Gerenciar Regiões',             sortOrder: 3 },
  { key: 'global:manage_goals',              module: 'commercial',  type: 'global_action', label: 'Gerenciar Metas',               sortOrder: 4 },
  { key: 'global:generate_coaf_report',      module: 'compliance',  type: 'global_action', label: 'Gerar Relatório COAF',         sortOrder: 5 },
  { key: 'global:configure_collection_rules',module: 'risk',        type: 'global_action', label: 'Configurar Régua de Cobrança', sortOrder: 6 },
  { key: 'global:review_fund_regulation',    module: 'legal',       type: 'global_action', label: 'Revisar Regulamento de Fundo', sortOrder: 7 },
  { key: 'global:create_collaborator',       module: 'people',      type: 'global_action', label: 'Criar Colaborador',            sortOrder: 8 },
  { key: 'global:create_user',               module: 'people',      type: 'global_action', label: 'Criar Usuário',                sortOrder: 9 },
  { key: 'global:manage_courses',            module: 'learning',    type: 'global_action', label: 'Gerenciar Cursos',             sortOrder: 10 },
  { key: 'global:manage_people_settings',    module: 'people',      type: 'global_action', label: 'Configurações de People',      sortOrder: 11 },
  { key: 'global:manage_roles',              module: 'admin',       type: 'global_action', label: 'Gerenciar Roles',              sortOrder: 12 },

  // ── Dashboard modules ────────────────────────────────────────────────────────
  { key: 'dashboard:pending_actions',         module: 'commercial',  type: 'dashboard_module', label: 'Ações Pendentes',          sortOrder: 0 },
  { key: 'dashboard:my_pipeline_summary',     module: 'commercial',  type: 'dashboard_module', label: 'Resumo Pipeline Pessoal',  sortOrder: 1 },
  { key: 'dashboard:my_goal_progress',        module: 'commercial',  type: 'dashboard_module', label: 'Progresso Meta Pessoal',   sortOrder: 2 },
  { key: 'dashboard:recent_updates',          module: 'commercial',  type: 'dashboard_module', label: 'Atualizações Recentes',    sortOrder: 3 },
  { key: 'dashboard:team_pending_actions',    module: 'commercial',  type: 'dashboard_module', label: 'Ações Pendentes Equipe',   sortOrder: 4 },
  { key: 'dashboard:team_pipeline_summary',   module: 'commercial',  type: 'dashboard_module', label: 'Resumo Pipeline Equipe',   sortOrder: 5 },
  { key: 'dashboard:team_goal_progress',      module: 'commercial',  type: 'dashboard_module', label: 'Progresso Meta Equipe',    sortOrder: 6 },
  { key: 'dashboard:team_ranking_mini',       module: 'commercial',  type: 'dashboard_module', label: 'Mini Ranking da Equipe',   sortOrder: 7 },
  { key: 'dashboard:clients_without_activity',module: 'commercial',  type: 'dashboard_module', label: 'Clientes sem Atividade',   sortOrder: 8 },
  { key: 'dashboard:region_pipeline_summary', module: 'commercial',  type: 'dashboard_module', label: 'Resumo Pipeline Regional', sortOrder: 9 },
  { key: 'dashboard:region_goal_progress',    module: 'commercial',  type: 'dashboard_module', label: 'Progresso Meta Regional',  sortOrder: 10 },
  { key: 'dashboard:team_comparison',         module: 'commercial',  type: 'dashboard_module', label: 'Comparação de Equipes',    sortOrder: 11 },
  { key: 'dashboard:region_volume_chart',     module: 'commercial',  type: 'dashboard_module', label: 'Gráfico Volume Regional',  sortOrder: 12 },
  { key: 'dashboard:critical_alerts',         module: 'commercial',  type: 'dashboard_module', label: 'Alertas Críticos',         sortOrder: 13 },
  { key: 'dashboard:national_pipeline_summary',module: 'commercial', type: 'dashboard_module', label: 'Resumo Pipeline Nacional', sortOrder: 14 },
  { key: 'dashboard:national_goal_progress',  module: 'commercial',  type: 'dashboard_module', label: 'Progresso Meta Nacional',  sortOrder: 15 },
  { key: 'dashboard:region_comparison',       module: 'commercial',  type: 'dashboard_module', label: 'Comparação de Regiões',    sortOrder: 16 },
  { key: 'dashboard:monthly_trends',          module: 'commercial',  type: 'dashboard_module', label: 'Tendências Mensais',       sortOrder: 17 },
  { key: 'dashboard:conversion_funnel',       module: 'commercial',  type: 'dashboard_module', label: 'Funil de Conversão',       sortOrder: 18 },
  { key: 'dashboard:top_operations',          module: 'commercial',  type: 'dashboard_module', label: 'Top Operações',            sortOrder: 19 },
  { key: 'dashboard:credit_queue_count',      module: 'credit',      type: 'dashboard_module', label: 'Volume Fila Crédito',      sortOrder: 20 },
  { key: 'dashboard:credit_sla_status',       module: 'credit',      type: 'dashboard_module', label: 'SLA Crédito',              sortOrder: 21 },
  { key: 'dashboard:bureau_health',           module: 'credit',      type: 'dashboard_module', label: 'Saúde dos Bureaus',        sortOrder: 22 },
  { key: 'dashboard:daily_throughput',        module: 'credit',      type: 'dashboard_module', label: 'Throughput Diário',        sortOrder: 23 },
  { key: 'dashboard:auto_reject_rate',        module: 'credit',      type: 'dashboard_module', label: 'Taxa Rejeição Auto',       sortOrder: 24 },
  { key: 'dashboard:compliance_queue_count',  module: 'compliance',  type: 'dashboard_module', label: 'Volume Fila Compliance',   sortOrder: 25 },
  { key: 'dashboard:active_alerts',           module: 'compliance',  type: 'dashboard_module', label: 'Alertas Ativos',           sortOrder: 26 },
  { key: 'dashboard:pep_hits',                module: 'compliance',  type: 'dashboard_module', label: 'Hits PEP',                 sortOrder: 27 },
  { key: 'dashboard:sanction_hits',           module: 'compliance',  type: 'dashboard_module', label: 'Hits Sanções',             sortOrder: 28 },
  { key: 'dashboard:monitoring_due',          module: 'compliance',  type: 'dashboard_module', label: 'Monitoramento Due',        sortOrder: 29 },
  { key: 'dashboard:approval_queue_count',    module: 'approval',    type: 'dashboard_module', label: 'Volume Fila Aprovação',    sortOrder: 30 },
  { key: 'dashboard:approval_sla_status',     module: 'approval',    type: 'dashboard_module', label: 'SLA Aprovação',            sortOrder: 31 },
  { key: 'dashboard:approval_volume_today',   module: 'approval',    type: 'dashboard_module', label: 'Volume Aprovações Hoje',   sortOrder: 32 },
  { key: 'dashboard:avg_ticket_in_queue',     module: 'approval',    type: 'dashboard_module', label: 'Ticket Médio em Fila',     sortOrder: 33 },
  { key: 'dashboard:approval_rate_trend',     module: 'approval',    type: 'dashboard_module', label: 'Tendência Taxa Aprovação',  sortOrder: 34 },
  { key: 'dashboard:operations_overview',     module: 'backoffice',  type: 'dashboard_module', label: 'Visão Geral Operações',    sortOrder: 35 },
  { key: 'dashboard:homologation_queue',      module: 'backoffice',  type: 'dashboard_module', label: 'Fila Homologação',         sortOrder: 36 },
  { key: 'dashboard:partner_docs_pending',    module: 'backoffice',  type: 'dashboard_module', label: 'Docs Sócios Pendentes',    sortOrder: 37 },
  { key: 'dashboard:divergences_active',      module: 'backoffice',  type: 'dashboard_module', label: 'Divergências Ativas',      sortOrder: 38 },
  { key: 'dashboard:contracts_pending_signature',module:'backoffice', type: 'dashboard_module', label: 'Contratos Aguardando Assinatura', sortOrder: 39 },
  { key: 'dashboard:contracts_queue_count',   module: 'legal',       type: 'dashboard_module', label: 'Volume Fila Contratos',    sortOrder: 40 },
  { key: 'dashboard:contracts_pending_review',module: 'legal',       type: 'dashboard_module', label: 'Contratos Pendentes Revisão',sortOrder: 41 },
  { key: 'dashboard:extrajudicial_queue',     module: 'legal',       type: 'dashboard_module', label: 'Fila Extrajudicial',       sortOrder: 42 },
  { key: 'dashboard:active_litigation',       module: 'legal',       type: 'dashboard_module', label: 'Contencioso Ativo',        sortOrder: 43 },
  { key: 'dashboard:regulation_reviews_pending',module:'legal',      type: 'dashboard_module', label: 'Revisões Regulatórias Pendentes',sortOrder: 44 },
  { key: 'dashboard:delinquency_overview',    module: 'risk',        type: 'dashboard_module', label: 'Visão Geral Inadimplência', sortOrder: 45 },
  { key: 'dashboard:risk_clients_count',      module: 'risk',        type: 'dashboard_module', label: 'Clientes em Risco',        sortOrder: 46 },
  { key: 'dashboard:recovery_clients_count',  module: 'risk',        type: 'dashboard_module', label: 'Clientes em Recuperação',  sortOrder: 47 },
  { key: 'dashboard:litigation_clients_count',module: 'risk',        type: 'dashboard_module', label: 'Clientes em Contencioso',  sortOrder: 48 },
  { key: 'dashboard:collection_effectiveness',module: 'risk',        type: 'dashboard_module', label: 'Eficácia de Cobrança',     sortOrder: 49 },
  { key: 'dashboard:aging_chart',             module: 'risk',        type: 'dashboard_module', label: 'Gráfico Aging',            sortOrder: 50 },
  { key: 'dashboard:escalation_trend',        module: 'risk',        type: 'dashboard_module', label: 'Tendência de Escalação',   sortOrder: 51 },
  { key: 'dashboard:system_health',           module: 'admin',       type: 'dashboard_module', label: 'Saúde do Sistema',         sortOrder: 52 },
  { key: 'dashboard:active_users',            module: 'admin',       type: 'dashboard_module', label: 'Usuários Ativos',          sortOrder: 53 },
  { key: 'dashboard:operations_volume',       module: 'admin',       type: 'dashboard_module', label: 'Volume de Operações',      sortOrder: 54 },
  { key: 'dashboard:integration_status',      module: 'admin',       type: 'dashboard_module', label: 'Status Integrações',       sortOrder: 55 },
  { key: 'dashboard:error_rate',              module: 'admin',       type: 'dashboard_module', label: 'Taxa de Erros',            sortOrder: 56 },
  { key: 'dashboard:storage_usage',           module: 'admin',       type: 'dashboard_module', label: 'Uso de Storage',           sortOrder: 57 },

  // ── Notifications ────────────────────────────────────────────────────────────
  { key: 'notification:document_rejected',       module: 'commercial', type: 'notification', label: 'Documento Rejeitado',             sortOrder: 0 },
  { key: 'notification:client_approved',         module: 'commercial', type: 'notification', label: 'Cliente Aprovado',                sortOrder: 1 },
  { key: 'notification:client_rejected',         module: 'commercial', type: 'notification', label: 'Cliente Rejeitado',               sortOrder: 2 },
  { key: 'notification:client_auto_rejected',    module: 'commercial', type: 'notification', label: 'Cliente Auto-Rejeitado',          sortOrder: 3 },
  { key: 'notification:client_reassigned_to_me', module: 'commercial', type: 'notification', label: 'Cliente Reatribuído para Mim',    sortOrder: 4 },
  { key: 'notification:client_reassigned_from_me',module:'commercial', type: 'notification', label: 'Cliente Reatribuído de Mim',      sortOrder: 5 },
  { key: 'notification:goal_achieved',           module: 'commercial', type: 'notification', label: 'Meta Atingida',                   sortOrder: 6 },
  { key: 'notification:client_inactive_7days',   module: 'commercial', type: 'notification', label: 'Cliente Inativo 7 Dias',          sortOrder: 7 },
  { key: 'notification:team_goal_achieved',      module: 'commercial', type: 'notification', label: 'Meta da Equipe Atingida',         sortOrder: 8 },
  { key: 'notification:region_goal_achieved',    module: 'commercial', type: 'notification', label: 'Meta Regional Atingida',          sortOrder: 9 },
  { key: 'notification:team_below_target',       module: 'commercial', type: 'notification', label: 'Equipe Abaixo da Meta',           sortOrder: 10 },
  { key: 'notification:national_goal_achieved',  module: 'commercial', type: 'notification', label: 'Meta Nacional Atingida',          sortOrder: 11 },
  { key: 'notification:large_operation_approved',module: 'commercial', type: 'notification', label: 'Operação Grande Aprovada',        sortOrder: 12 },
  { key: 'notification:region_below_target',     module: 'commercial', type: 'notification', label: 'Região Abaixo da Meta',           sortOrder: 13 },
  { key: 'notification:new_client_in_queue',     module: 'credit',     type: 'notification', label: 'Novo Cliente na Fila Crédito',    sortOrder: 14 },
  { key: 'notification:bureau_query_failed',     module: 'credit',     type: 'notification', label: 'Falha na Consulta Bureau',        sortOrder: 15 },
  { key: 'notification:bureau_unavailable',      module: 'credit',     type: 'notification', label: 'Bureau Indisponível',             sortOrder: 16 },
  { key: 'notification:auto_reject_override_requested', module: 'credit', type: 'notification', label: 'Solicitação Override Rejeição Auto', sortOrder: 17 },
  { key: 'notification:new_client_compliance_queue', module: 'compliance', type: 'notification', label: 'Novo Cliente na Fila Compliance', sortOrder: 18 },
  { key: 'notification:pep_match_found',         module: 'compliance', type: 'notification', label: 'Match PEP Encontrado',            sortOrder: 19 },
  { key: 'notification:sanction_match_found',    module: 'compliance', type: 'notification', label: 'Match Sanção Encontrado',         sortOrder: 20 },
  { key: 'notification:monitoring_alert',        module: 'compliance', type: 'notification', label: 'Alerta de Monitoramento',         sortOrder: 21 },
  { key: 'notification:coaf_report_due',         module: 'compliance', type: 'notification', label: 'Relatório COAF Pendente',         sortOrder: 22 },
  { key: 'notification:new_client_approval_queue',module:'approval',   type: 'notification', label: 'Novo Cliente na Fila Aprovação',  sortOrder: 23 },
  { key: 'notification:report_ready_for_review', module: 'approval',   type: 'notification', label: 'Relatório Pronto para Revisão',   sortOrder: 24 },
  { key: 'notification:approval_sla_warning',    module: 'approval',   type: 'notification', label: 'Aviso SLA Aprovação',             sortOrder: 25 },
  { key: 'notification:homologation_complete',   module: 'backoffice', type: 'notification', label: 'Homologação Concluída',           sortOrder: 26 },
  { key: 'notification:homologation_rejected',   module: 'backoffice', type: 'notification', label: 'Homologação Rejeitada',           sortOrder: 27 },
  { key: 'notification:partner_docs_uploaded',   module: 'backoffice', type: 'notification', label: 'Docs Sócios Enviados',            sortOrder: 28 },
  { key: 'notification:divergence_detected',     module: 'backoffice', type: 'notification', label: 'Divergência Detectada',           sortOrder: 29 },
  { key: 'notification:contract_signed',         module: 'backoffice', type: 'notification', label: 'Contrato Assinado',               sortOrder: 30 },
  { key: 'notification:contract_generation_ready',module:'legal',      type: 'notification', label: 'Contrato Pronto para Geração',    sortOrder: 31 },
  { key: 'notification:contract_review_requested',module:'legal',      type: 'notification', label: 'Revisão de Contrato Solicitada',  sortOrder: 32 },
  { key: 'notification:extrajudicial_auto_generated',module:'legal',   type: 'notification', label: 'Extrajudicial Gerado Auto',       sortOrder: 33 },
  { key: 'notification:litigation_update',       module: 'legal',      type: 'notification', label: 'Atualização Judicial',            sortOrder: 34 },
  { key: 'notification:signature_completed',     module: 'legal',      type: 'notification', label: 'Assinatura Concluída',            sortOrder: 35 },
  { key: 'notification:regulation_review_requested',module:'legal',    type: 'notification', label: 'Revisão Regulatória Solicitada',  sortOrder: 36 },
  { key: 'notification:client_entered_risk',     module: 'risk',       type: 'notification', label: 'Cliente Entrou em Risco',         sortOrder: 37 },
  { key: 'notification:client_entered_recovery', module: 'risk',       type: 'notification', label: 'Cliente Entrou em Recuperação',   sortOrder: 38 },
  { key: 'notification:client_entered_litigation',module:'risk',       type: 'notification', label: 'Cliente Entrou em Contencioso',   sortOrder: 39 },
  { key: 'notification:payment_received',        module: 'risk',       type: 'notification', label: 'Pagamento Recebido',              sortOrder: 40 },
  { key: 'notification:negotiation_deadline',    module: 'risk',       type: 'notification', label: 'Prazo de Negociação',             sortOrder: 41 },
  { key: 'notification:settlement_expired',      module: 'risk',       type: 'notification', label: 'Acordo Expirado',                 sortOrder: 42 },
  { key: 'notification:reimbursement_approved',  module: 'people',     type: 'notification', label: 'Reembolso Aprovado',              sortOrder: 43 },
  { key: 'notification:reimbursement_rejected',  module: 'people',     type: 'notification', label: 'Reembolso Rejeitado',             sortOrder: 44 },
  { key: 'notification:review_cycle_open',       module: 'people',     type: 'notification', label: 'Ciclo de Avaliação Aberto',       sortOrder: 45 },
  { key: 'notification:reimbursement_pending_approval',module:'people',type: 'notification', label: 'Reembolso Aguardando Aprovação',  sortOrder: 46 },
  { key: 'notification:onboarding_task_due',     module: 'people',     type: 'notification', label: 'Tarefa Onboarding Pendente',      sortOrder: 47 },
  { key: 'notification:review_cycle_deadline',   module: 'people',     type: 'notification', label: 'Prazo Ciclo Avaliação',           sortOrder: 48 },
  { key: 'notification:turnover_alert',          module: 'people',     type: 'notification', label: 'Alerta de Turnover',              sortOrder: 49 },
  { key: 'notification:pj_invoice_uploaded',     module: 'people',     type: 'notification', label: 'NF PJ Enviada',                  sortOrder: 50 },
  { key: 'notification:pj_invoice_overdue',      module: 'people',     type: 'notification', label: 'NF PJ Atrasada',                 sortOrder: 51 },
  { key: 'notification:reimbursement_pending_payment',module:'people', type: 'notification', label: 'Reembolso Aguardando Pagamento',  sortOrder: 52 },
  { key: 'notification:system_error',            module: 'admin',      type: 'notification', label: 'Erro do Sistema',                sortOrder: 53 },
  { key: 'notification:integration_down',        module: 'admin',      type: 'notification', label: 'Integração Indisponível',         sortOrder: 54 },
  { key: 'notification:security_alert',          module: 'admin',      type: 'notification', label: 'Alerta de Segurança',             sortOrder: 55 },
  { key: 'notification:new_user_created',        module: 'admin',      type: 'notification', label: 'Novo Usuário Criado',             sortOrder: 56 },
];

/** Helper: returns all feature keys for a given module */
export function getFeaturesForModule(moduleKey: string): FeatureCatalogEntry[] {
  return FEATURE_CATALOG.filter((f) => f.module === moduleKey);
}

/** Helper: returns all feature keys of a given type within a module */
export function getFeaturesForModuleAndType(moduleKey: string, type: FeatureType): FeatureCatalogEntry[] {
  return FEATURE_CATALOG.filter((f) => f.module === moduleKey && f.type === type);
}
