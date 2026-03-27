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
  BookOpen,
  Landmark,
  MessageSquare,
  FileSpreadsheet,
  ScanSearch,
  Package,
  CalendarDays,
  Flag,
  ArrowRight,
  ListChecks,
  Building2,
  Home,
  PenLine,
  Wallet,
  LayoutDashboard,
  FileText,
  Receipt,
  TrendingUp,
  Calculator,
} from 'lucide-react';

interface DeliveryItem {
  label: string;
  description: string;
  status: 'done' | 'in_progress' | 'planned';
  icon: React.ElementType;
  deadline?: string;
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
    deadline: '31 Mar 2026',
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
    label: 'Análise Automática de Sacados',
    description:
      'Compliance completo automatizado por sacado: PEP, sanções, PGFN, CNDT, CGU, trabalho escravo, presença digital e mídia negativa — com tabelas dedicadas por tipo de risco.',
    status: 'in_progress',
    icon: ScanSearch,
    deadline: '25 Abr 2026',
  },
  {
    label: 'Sistema de Visitas',
    description:
      'Módulo de registro e acompanhamento de visitas comerciais, com formulário estruturado, evidências fotográficas e geolocalização.',
    status: 'planned',
    icon: Briefcase,
    deadline: '25 Abr 2026',
  },
  {
    label: 'Módulo de Crédito',
    description:
      'Gestão completa do ciclo de crédito: originação, análise de risco, proposta, formalização e acompanhamento de posições de crédito ativas da carteira.',
    status: 'planned',
    icon: CreditCard,
    deadline: '30 Abr 2026',
  },
  {
    label: 'RH — Integração de Ponto e Benefícios',
    description:
      'Conexão com sistema de controle de ponto eletrônico e ampliação das integrações de benefícios além do Flash.',
    status: 'planned',
    icon: Users,
    deadline: '30 Abr 2026',
  },
  {
    label: 'Integração Netfactor (Crédito Aprovado)',
    description:
      'Envio automatizado dos dados aprovados pelo comitê de crédito para o Netfactor, eliminando retrabalho de digitação no sistema legado.',
    status: 'planned',
    icon: ArrowRightLeft,
    deadline: '30 Abr 2026',
  },
  {
    label: 'Integração CERC',
    description:
      'Validação de duplicata mercantil via API CERC com OAuth, criação de lote, sincronização de constatações/eventos/partes e extração de NFe via Gemini.',
    status: 'in_progress',
    icon: ArrowRightLeft,
    deadline: '30 Abr 2026',
  },
];

const delivery3: DeliveryItem[] = [
  {
    label: 'Comunicação Interna (Wiki + Intranet)',
    description:
      'Wiki corporativa com categorias e artigos em rich text para base de conhecimento, e intranet de comunicados oficiais para toda a empresa.',
    status: 'in_progress',
    icon: MessageSquare,
    deadline: '16 Mai 2026',
  },
  {
    label: 'Governança — Comitês de Crédito',
    description:
      'Comitês com reuniões, atas em rich text, itens de ação com responsáveis e prazos, atualizações de status e lembretes automáticos via CRON.',
    status: 'in_progress',
    icon: Landmark,
    deadline: '30 Mai 2026',
  },
  {
    label: 'Pipeline Comercial e Metas',
    description:
      'Funil visual com 7 estágios, métricas de conversão, metas por nível (individual, equipe, região) e ranking de performance entre comerciais.',
    status: 'in_progress',
    icon: BarChart2,
    deadline: '13 Jun 2026',
  },
  {
    label: 'Finalização da Área Comercial',
    description:
      'Conclusão dos fluxos pendentes do módulo comercial: aprovação final, integração completa com sacados e refinamento da transição de status.',
    status: 'planned',
    icon: Briefcase,
    deadline: '20 Jun 2026',
  },
  {
    label: 'Dashboard Visual para Comerciais',
    description:
      'Painel com KPIs operacionais: carteira ativa, pipeline, metas vs. realizado, aging de propostas e alertas de ação — otimizado para o dia a dia do representante.',
    status: 'planned',
    icon: BarChart2,
    deadline: '27 Jun 2026',
  },
  {
    label: 'Acompanhamento de Visitas com IA',
    description:
      'Painel para gerentes e diretores acompanharem visitas em tempo real, com resumos gerados por IA e insights sobre performance da equipe comercial.',
    status: 'planned',
    icon: Bot,
    deadline: '27 Jun 2026',
  },
  {
    label: 'Análise Documental com IA',
    description:
      'Agente que lê documentos enviados pelo cliente (PDFs, balanços, contratos sociais) e valida se o conteúdo bate com o esperado — CNPJ, razão social, datas de validade, assinaturas — reduzindo erros de checklist para zero.',
    status: 'planned',
    icon: ScanSearch,
    deadline: '27 Jun 2026',
  },
  {
    label: 'Treinamento e Implantação',
    description:
      'Programa de treinamento por role, documentação de uso e rollout faseado para todas as áreas da empresa.',
    status: 'planned',
    icon: GraduationCap,
    deadline: '27 Jun 2026',
  },
  {
    label: 'Plataforma de Aprendizagem (LMS)',
    description:
      'Cursos com módulos e vídeo-aulas, matrículas automáticas em obrigatórios, trilhas de progresso e quiz — base para treinamento dos novos processos.',
    status: 'done',
    icon: BookOpen,
  },
];

const delivery4: DeliveryItem[] = [
  {
    label: 'Automação de Duplicatas (CNAB)',
    description:
      'Aprovação e reprovação em lote de recebíveis comerciais via CNAB, com recálculo automático de valor aprovado na operação e rastreabilidade por título.',
    status: 'in_progress',
    icon: FileSpreadsheet,
    deadline: '11 Jul 2026',
  },
  {
    label: 'Módulo Jurídico',
    description:
      'Gestão de processos judiciais, prazos, audiências e documentos legais vinculados a clientes e operações de crédito.',
    status: 'planned',
    icon: Scale,
    deadline: '11 Jul 2026',
  },
  {
    label: 'Produto — Nota Comercial',
    description:
      'Modelagem do produto Nota Comercial: regras de elegibilidade, parâmetros de pricing, prazos, taxas e vínculo ao portfólio de posições do cedente.',
    status: 'planned',
    icon: Package,
    deadline: '18 Jul 2026',
  },
  {
    label: 'Complementação Documental Pós-Comitê',
    description:
      'Checklist dinâmico de documentos remanescentes após aprovação em comitê, com notificações automáticas ao cliente e rastreio de pendências por tipo de produto.',
    status: 'planned',
    icon: ListChecks,
    deadline: '25 Jul 2026',
  },
  {
    label: 'Módulo de Checagem Pré-Formalização',
    description:
      'Engine de validação automatizada que verifica pendências de compliance, documentação, garantias e aprovações antes de liberar o avanço da operação para a etapa de formalização.',
    status: 'planned',
    icon: ShieldCheck,
    deadline: '31 Jul 2026',
  },
];

const delivery5: DeliveryItem[] = [
  {
    label: 'Produto — Gravame',
    description:
      'Modelagem do produto Gravame: estrutura de garantia real, registro de ativos vinculados, parâmetros de LTV, controle de liberação e baixa de gravame.',
    status: 'planned',
    icon: Package,
    deadline: '11 Set 2026',
  },
  {
    label: 'Módulo de Bureaus para Gravame',
    description:
      'Consultas automatizadas a bureaus e bases externas para validação e enriquecimento de dados de ativos dados em gravame: DETRAN, cartório de registro de imóveis, BACEN e demais fontes.',
    status: 'planned',
    icon: ScanSearch,
    deadline: '11 Set 2026',
  },
  {
    label: 'Cadastro e Apresentação de Garantias',
    description:
      'Registro de ativos dados em garantia — imóveis, veículos e recebíveis — com vinculação à operação de crédito, fotos e documentação comprobatória.',
    status: 'planned',
    icon: Home,
    deadline: '11 Set 2026',
  },
  {
    label: 'Análise Técnica de Garantias',
    description:
      'Avaliação técnica e laudo de garantias por tipo de ativo, com integração a bases de referência (IPCA, FIPE, RGI) e fluxo de aprovação interno.',
    status: 'planned',
    icon: FileSearch,
    deadline: '25 Set 2026',
  },
  {
    label: 'Consulta de Ônus e Restrições',
    description:
      'Verificação automatizada de ônus, hipotecas e restrições em cartórios e órgãos competentes, com persistência de resultados para auditoria.',
    status: 'planned',
    icon: ScanSearch,
    deadline: '25 Set 2026',
  },
];

const delivery6: DeliveryItem[] = [
  {
    label: 'Formalização com os Fundos de Crédito',
    description:
      'Vinculação e registro formal das operações aprovadas junto aos fundos de crédito: alocação de cotas, controle de limite disponível, geração de boletim de subscrição e confirmação de aceite pelo gestor.',
    status: 'planned',
    icon: Building2,
    deadline: '09 Out 2026',
  },
  {
    label: 'Geração de Contratos',
    description:
      'Geração automática de minutas contratuais por tipo de produto (CNAB, nota comercial, gravame), com variáveis dinâmicas e templates aprovados pelo jurídico.',
    status: 'planned',
    icon: FileText,
    deadline: '09 Out 2026',
  },
  {
    label: 'Agente IA — Preenchimento de Minutas',
    description:
      'Agente que recebe os dados da operação aprovada e preenche automaticamente a minuta contratual — partes, valores, prazos, garantias e cláusulas específicas por produto — entregando o documento pronto para revisão jurídica.',
    status: 'planned',
    icon: Bot,
    deadline: '23 Out 2026',
  },
  {
    label: 'Assinatura Digital de Contratos',
    description:
      'Fluxo de assinatura eletrônica com gestão de signatários, ordem de assinatura, lembretes automáticos e rastreabilidade completa do processo.',
    status: 'planned',
    icon: PenLine,
    deadline: '23 Out 2026',
  },
  {
    label: 'Liberação de Desembolso',
    description:
      'Workflow de aprovação e execução do desembolso com integração bancária, registro de TED/PIX, confirmação de liquidação e notificação ao cliente.',
    status: 'planned',
    icon: Wallet,
    deadline: '06 Nov 2026',
  },
  {
    label: 'Painel de Acompanhamento Pós-Liberação',
    description:
      'Visão consolidada de todas as operações liberadas: saldo devedor, parcelas, vencimentos, histórico de pagamentos e alertas de inadimplência.',
    status: 'planned',
    icon: LayoutDashboard,
    deadline: '20 Nov 2026',
  },
];

const delivery7: DeliveryItem[] = [
  {
    label: 'Agente IA — Monitoramento Contínuo de Carteira',
    description:
      'Agente que roda diariamente e detecta sinais de deterioração antes da inadimplência: atraso emergindo, mudança de rating em bureau, ações judiciais novas, concentração de vencimentos — gerando alertas proativos com prioridade para o time de cobrança.',
    status: 'planned',
    icon: Eye,
    deadline: '11 Set 2026',
  },
  {
    label: 'Régua de Cobrança Automatizada',
    description:
      'Configuração de régua de cobrança por tipo de cliente e produto, com disparo automático de notificações via WhatsApp, e-mail e SMS em D-3, D-0 e pós-vencimento.',
    status: 'planned',
    icon: Receipt,
    deadline: '25 Set 2026',
  },
  {
    label: 'Gestão de Inadimplência',
    description:
      'Painel centralizado de inadimplência com aging por faixas, score de recuperação, priorização de carteira e acionamento de fluxos de renegociação.',
    status: 'planned',
    icon: TrendingUp,
    deadline: '09 Out 2026',
  },
  {
    label: 'Portal de Negociação com Devedores',
    description:
      'Ambiente self-service para clientes inadimplentes proporem e simularem acordos de renegociação, com aprovação interna e geração automática de boletos.',
    status: 'planned',
    icon: MessageSquare,
    deadline: '23 Out 2026',
  },
  {
    label: 'Contas a Pagar e Receber',
    description:
      'Módulo financeiro completo para lançamento, categorização e conciliação de obrigações e recebíveis, com integrações bancárias para importação de extratos.',
    status: 'planned',
    icon: Wallet,
    deadline: '06 Nov 2026',
  },
  {
    label: 'Fluxo de Caixa e Projeções',
    description:
      'Visualização diária, semanal e mensal do fluxo de caixa realizado e projetado, com cenários de sensibilidade e alertas de liquidez mínima.',
    status: 'planned',
    icon: BarChart2,
    deadline: '20 Nov 2026',
  },
  {
    label: 'Conciliação Bancária',
    description:
      'Importação automática de OFX/CNAB, matching inteligente de lançamentos, identificação de divergências e aprovação do conciliador.',
    status: 'planned',
    icon: FileText,
    deadline: '11 Dez 2026',
  },
  {
    label: 'Agente IA — Explicação de Divergências',
    description:
      'Quando o matching automático não consegue casar um lançamento, o agente analisa o contexto (descrição, valor, data, contraparte) e gera uma hipótese explicável — eliminando a fila de "pendentes sem justificativa" e reduzindo o tempo de fechamento contábil.',
    status: 'planned',
    icon: ArrowRightLeft,
    deadline: '08 Jan 2027',
  },
  {
    label: 'Lançamentos Contábeis Automatizados',
    description:
      'Geração automática de lançamentos contábeis a partir de eventos operacionais (concessão, pagamento, inadimplência), com plano de contas configurável.',
    status: 'planned',
    icon: Calculator,
    deadline: '08 Jan 2027',
  },
  {
    label: 'Balancete e DRE',
    description:
      'Emissão de balancete mensal e Demonstração do Resultado do Exercício com drill-down por conta, comparativos entre períodos e exportação em PDF/XLSX.',
    status: 'planned',
    icon: LayoutDashboard,
    deadline: '06 Fev 2027',
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
    deadlineText: 'text-emerald-600',
  },
  in_progress: {
    icon: Circle,
    label: 'Em andamento',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    deadlineText: 'text-amber-600',
  },
  planned: {
    icon: Circle,
    label: 'Planejado',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-500',
    dot: 'bg-slate-300',
    deadlineText: 'text-slate-500',
  },
};

interface GanttPhase {
  id: number;
  label: string;
  desc: string;
  start: number;
  end: number;
  pct: number;
  colorFill: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
}

const GANTT_PHASES: GanttPhase[] = [
  {
    id: 1,
    label: 'Fase 1',
    desc: 'Fundação Operacional',
    start: 0,
    end: 1,
    pct: 92,
    colorFill: '#059669',
    colorBg: '#ecfdf5',
    colorBorder: '#a7f3d0',
    colorText: '#065f46',
  },
  {
    id: 2,
    label: 'Fase 2',
    desc: 'Expansão Comercial',
    start: 1,
    end: 2.5,
    pct: 0,
    colorFill: '#d97706',
    colorBg: '#fffbeb',
    colorBorder: '#fde68a',
    colorText: '#78350f',
  },
  {
    id: 3,
    label: 'Fase 3',
    desc: 'Governança e IA',
    start: 2,
    end: 3.5,
    pct: 14,
    colorFill: '#0284c7',
    colorBg: '#f0f9ff',
    colorBorder: '#bae6fd',
    colorText: '#075985',
  },
  {
    id: 4,
    label: 'Fase 4',
    desc: 'Produtos e Formalização',
    start: 3,
    end: 4.5,
    pct: 0,
    colorFill: '#7c3aed',
    colorBg: '#f5f3ff',
    colorBorder: '#ddd6fe',
    colorText: '#4c1d95',
  },
  {
    id: 5,
    label: 'Fase 5',
    desc: 'Análise de Garantias',
    start: 4,
    end: 5.5,
    pct: 0,
    colorFill: '#0d9488',
    colorBg: '#f0fdfa',
    colorBorder: '#99f6e4',
    colorText: '#134e4a',
  },
  {
    id: 6,
    label: 'Fase 6',
    desc: 'Contratação e Liberação',
    start: 5,
    end: 6.5,
    pct: 0,
    colorFill: '#047857',
    colorBg: '#ecfdf5',
    colorBorder: '#6ee7b7',
    colorText: '#064e3b',
  },
  {
    id: 7,
    label: 'Fase 7',
    desc: 'Cobrança, Financeiro e Contabilidade',
    start: 6,
    end: 13,
    pct: 0,
    colorFill: '#be185d',
    colorBg: '#fdf2f8',
    colorBorder: '#f9a8d4',
    colorText: '#831843',
  },
];

const GANTT_MONTHS = ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar*'];
const GANTT_TOTAL = 13;

interface PartBannerProps {
  readonly number: string;
  readonly title: string;
  readonly subtitle: string;
  readonly period: string;
  readonly phaseSteps: ReadonlyArray<{ readonly label: string }>;
  readonly startPhase: number;
  readonly variant: 'warm' | 'dark' | 'rose';
}

const PART_BANNER_CONFIGS = {
  warm: {
    bg: 'bg-gradient-to-br from-[hsl(44,52%,88%)] to-[hsl(46,45%,93%)]',
    gridColor: 'hsl(40,60%,50%)',
    watermarkColor: 'text-[hsl(44,35%,76%)]',
    dotColor: 'bg-[hsl(38,70%,45%)]',
    labelColor: 'text-[hsl(35,25%,45%)]',
    periodStyle: 'bg-[hsl(45,50%,97%)] border-[hsl(45,25%,82%)] text-[hsl(35,25%,45%)]',
    titleColor: 'text-[hsl(35,35%,15%)]',
    subtitleColor: 'text-[hsl(35,15%,42%)]',
    stepCardStyle: 'bg-white/60 border-[hsl(45,25%,82%)]',
    stepAccentColor: 'text-[hsl(38,70%,42%)]',
    stepLabelColor: 'text-[hsl(35,30%,20%)]',
    arrowColor: 'text-[hsl(35,20%,58%)]',
  },
  dark: {
    bg: 'bg-gradient-to-br from-[hsl(215,40%,12%)] to-[hsl(222,35%,18%)]',
    gridColor: 'white',
    watermarkColor: 'text-white/[0.04]',
    dotColor: 'bg-teal-400',
    labelColor: 'text-slate-400',
    periodStyle: 'bg-white/[0.07] border-white/[0.1] text-slate-300',
    titleColor: 'text-white',
    subtitleColor: 'text-slate-400',
    stepCardStyle: 'bg-white/[0.07] border-white/[0.09]',
    stepAccentColor: 'text-teal-400',
    stepLabelColor: 'text-slate-200',
    arrowColor: 'text-slate-600',
  },
  rose: {
    bg: 'bg-gradient-to-br from-[hsl(340,55%,90%)] to-[hsl(345,40%,95%)]',
    gridColor: 'hsl(340,60%,60%)',
    watermarkColor: 'text-[hsl(340,30%,80%)]',
    dotColor: 'bg-[hsl(340,65%,50%)]',
    labelColor: 'text-[hsl(340,25%,45%)]',
    periodStyle: 'bg-[hsl(340,50%,97%)] border-[hsl(340,25%,82%)] text-[hsl(340,25%,45%)]',
    titleColor: 'text-[hsl(340,35%,15%)]',
    subtitleColor: 'text-[hsl(340,15%,42%)]',
    stepCardStyle: 'bg-white/60 border-[hsl(340,25%,82%)]',
    stepAccentColor: 'text-[hsl(340,65%,45%)]',
    stepLabelColor: 'text-[hsl(340,30%,20%)]',
    arrowColor: 'text-[hsl(340,20%,65%)]',
  },
} as const;

function PartBanner({ number, title, subtitle, period, phaseSteps, startPhase, variant }: PartBannerProps) {
  const cfg = PART_BANNER_CONFIGS[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className={`relative overflow-hidden rounded-2xl ${cfg.bg} p-8`}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${cfg.gridColor} 0px, ${cfg.gridColor} 1px, transparent 1px, transparent 50px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Large watermark number */}
      <div
        className={`absolute right-6 -bottom-4 text-[10rem] font-black leading-none select-none pointer-events-none ${cfg.watermarkColor}`}
      >
        {number}
      </div>

      <div className="relative">
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${cfg.labelColor}`}>
              Parte {number}
            </span>
          </div>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${cfg.periodStyle}`}>
            {period}
          </span>
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold mb-2 leading-snug ${cfg.titleColor}`}>
          {title}
        </h2>

        {/* Subtitle */}
        <p className={`text-sm leading-relaxed mb-7 max-w-2xl ${cfg.subtitleColor}`}>
          {subtitle}
        </p>

        {/* Phase flow */}
        <div className="flex items-center gap-2 flex-wrap">
          {phaseSteps.flatMap((step, i) => [
            <div
              key={step.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg.stepCardStyle}`}
            >
              <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.stepAccentColor}`}>
                F{startPhase + i}
              </span>
              <span className={`text-[11px] font-semibold ${cfg.stepLabelColor}`}>
                {step.label}
              </span>
            </div>,
            i < phaseSteps.length - 1 ? (
              <ArrowRight
                key={`arrow-${step.label}`}
                size={11}
                className={cfg.arrowColor}
              />
            ) : null,
          ])}
        </div>
      </div>
    </motion.div>
  );
}

function RoadmapTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12 rounded-2xl border border-[hsl(30,20%,86%)] bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(45,60%,93%)] border border-[hsl(45,40%,85%)]">
          <Flag size={13} className="text-[hsl(38,70%,35%)]" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[hsl(35,25%,45%)]">
          Cronograma Geral · Mar 2026 — Mar 2027
        </span>
      </div>

      {/* Month header + tracks */}
      <div className="flex items-start gap-4">
        {/* Phase labels column */}
        <div className="w-36 shrink-0 space-y-2">
          <div className="h-6 mb-3" /> {/* spacer for month headers */}
          {GANTT_PHASES.map((phase) => (
            <div key={phase.id} className="h-11 flex flex-col justify-center pr-3">
              <span className="text-[11px] font-bold text-[hsl(150,50%,15%)] leading-none">{phase.label}</span>
              <span className="text-[10px] text-[hsl(150,15%,50%)] leading-tight mt-0.5">{phase.desc}</span>
            </div>
          ))}
        </div>

        {/* Timeline tracks */}
        <div className="flex-1 min-w-0">
          {/* Month header */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GANTT_TOTAL}, 1fr)` }} className="mb-3">
            {GANTT_MONTHS.map((month) => (
              <div key={month} className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{month}</span>
              </div>
            ))}
          </div>

          {/* Phase bars */}
          <div className="relative space-y-2">
            {/* Vertical month dividers */}
            <div className="absolute inset-0 pointer-events-none" style={{ display: 'grid', gridTemplateColumns: `repeat(${GANTT_TOTAL}, 1fr)` }}>
              {GANTT_MONTHS.map((month, i) => (
                <div
                  key={month}
                  className={`h-full ${i > 0 ? 'border-l border-dashed border-slate-100' : ''}`}
                />
              ))}
            </div>

            {GANTT_PHASES.map((phase) => {
              const leftPct = (phase.start / GANTT_TOTAL) * 100;
              const widthPct = ((phase.end - phase.start) / GANTT_TOTAL) * 100;

              return (
                <div key={phase.id} className="relative h-11">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-7 rounded-full border overflow-hidden"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      backgroundColor: phase.colorBg,
                      borderColor: phase.colorBorder,
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: phase.colorFill }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${phase.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 + phase.id * 0.12 }}
                    />
                    <span
                      className="absolute inset-0 flex items-center justify-end pr-3 text-[9px] font-bold"
                      style={{ color: phase.colorText }}
                    >
                      {phase.pct}% concluído
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today marker note */}
          <p className="mt-3 text-[9px] text-slate-400 italic">
            Início do período: Mar 2026 · Conclusão prevista: Mar 2027 · *Mar* = Mar 2027
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-[hsl(30,20%,92%)] flex flex-wrap gap-4">
        {GANTT_PHASES.map((phase) => (
          <div key={phase.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: phase.colorBg, borderColor: phase.colorBorder }}>
              <div className="w-full h-full rounded-full" style={{ backgroundColor: phase.colorFill, opacity: 0.8 }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: phase.colorText }}>{phase.label}</span>
            <span className="text-[10px] text-slate-400">—</span>
            <span className="text-[10px] text-slate-500">{phase.desc}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DeliveryCard({ item, index }: { readonly item: DeliveryItem; readonly index: number }) {
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
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-[hsl(150,50%,12%)] leading-tight">{item.label}</span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}
          >
            {config.label}
          </span>
        </div>
        <p className="text-xs text-[hsl(150,15%,42%)] leading-relaxed">{item.description}</p>

        {item.deadline && item.status !== 'done' && (
          <div className={`flex items-center gap-1 mt-2.5 pt-2 border-t ${config.border}`}>
            <CalendarDays size={10} className={config.deadlineText} />
            <span className={`text-[9px] font-semibold ${config.deadlineText}`}>
              Prazo: {item.deadline}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DeliveryStats({ items }: { readonly items: DeliveryItem[] }) {
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {done} concluído{done > 1 ? 's' : ''}
          </span>
        )}
        {inProgress > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {inProgress} em andamento
          </span>
        )}
        {planned > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            {planned} planejado{planned > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

interface PhaseBlockProps {
  readonly phase: number;
  readonly title: string;
  readonly subtitle: string;
  readonly dateRange: string;
  readonly accentColor: string;
  readonly accentBg: string;
  readonly accentBorder: string;
  readonly accentText: string;
  readonly items: DeliveryItem[];
}

function PhaseBlock({
  title,
  subtitle,
  dateRange,
  accentColor,
  accentBg,
  accentBorder,
  accentText,
  items,
}: Omit<PhaseBlockProps, 'phase'>) {
  return (
    <div className="relative">
      {/* Colored left accent strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
        style={{ backgroundColor: accentColor }}
      />

      <div className="pl-6">
        <div className="mb-2">
          <SectionHeading title={title} subtitle={subtitle} />
        </div>

        {/* Date range pill */}
        <div className="flex items-center gap-2 -mt-4 mb-6">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: accentBg, borderColor: accentBorder, color: accentText }}
          >
            <CalendarDays size={10} />
            {dateRange}
          </div>
        </div>

        <DeliveryStats items={items} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item, i) => (
            <DeliveryCard key={item.label} item={item} index={i} />
          ))}
        </div>
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
            <span className="text-sm font-semibold text-[hsl(35,25%,45%)] uppercase tracking-widest">
              Roadmap
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight text-[hsl(35,35%,15%)]">
            Roadmap da Plataforma
          </h1>
          <p className="text-[hsl(35,20%,40%)] text-base leading-relaxed max-w-xl">
            Plataforma Sarfaty em duas partes e sete fases. A Parte 1 conduz o cliente do primeiro cadastro até a decisão do comitê de crédito. A Parte 2 cobre a formalização nos fundos, análise de garantias e liberação do desembolso.
          </p>
        </div>
      </section>

      <div className="px-8 py-10 max-w-5xl space-y-16">
        <RoadmapTimeline />

        {/* ── PARTE 1 ─────────────────────────────────── */}
        <PartBanner
          number="01"
          title="Do Cadastro ao Comitê de Crédito"
          subtitle="Fundação da plataforma, expansão comercial e de crédito, e governança operacional — todo o percurso do cliente desde o primeiro contato até a decisão do comitê."
          period="Jan — Jun 2026"
          phaseSteps={[
            { label: 'Fundação Operacional' },
            { label: 'Expansão e Crédito' },
            { label: 'Governança e IA' },
          ]}
          startPhase={1}
          variant="warm"
        />

        <PhaseBlock
          phase={1}
          title="Entrega 1 — Fundação Operacional"
          subtitle="Cadastro de clientes, integrações de bureaus e compliance, extração inteligente de documentos (OCR/IA), módulo de RH completo, autenticação JWT e estruturação do banco de dados."
          dateRange="Jan — Mar 2026"
          accentColor="#059669"
          accentBg="#ecfdf5"
          accentBorder="#a7f3d0"
          accentText="#065f46"
          items={delivery1}
        />

        <PhaseBlock
          phase={2}
          title="Entrega 2 — Expansão Comercial e Crédito"
          subtitle="Módulo de crédito, análise automatizada de sacados, integração CERC, sistema de visitas, enriquecimento do RH e integração Netfactor."
          dateRange="Abr — Mai 2026"
          accentColor="#d97706"
          accentBg="#fffbeb"
          accentBorder="#fde68a"
          accentText="#78350f"
          items={delivery2}
        />

        <PhaseBlock
          phase={3}
          title="Entrega 3 — Comercial, Governança e IA"
          subtitle="Comunicação interna, comitês de crédito, pipeline e metas, finalização e dashboards comerciais, acompanhamento de visitas com IA, LMS e treinamento."
          dateRange="Mai — Jun 2026"
          accentColor="#0284c7"
          accentBg="#f0f9ff"
          accentBorder="#bae6fd"
          accentText="#075985"
          items={delivery3}
        />

        {/* ── PARTE 2 ─────────────────────────────────── */}
        <PartBanner
          number="02"
          title="Da Formalização à Liberação do Crédito"
          subtitle="Complementação documental, seleção do produto de crédito, análise de garantias, formalização nos fundos e liberação do desembolso ao cliente."
          period="Jul — Nov 2026"
          phaseSteps={[
            { label: 'Produtos e Formalização' },
            { label: 'Análise de Garantias' },
            { label: 'Contratação e Liberação' },
          ]}
          startPhase={4}
          variant="dark"
        />

        <PhaseBlock
          phase={4}
          title="Entrega 4 — Produtos Estruturados e Formalização"
          subtitle="Automação de duplicatas via CNAB, módulo jurídico, nota comercial, gravame e complementação documental pós-comitê."
          dateRange="Jul 2026"
          accentColor="#7c3aed"
          accentBg="#f5f3ff"
          accentBorder="#ddd6fe"
          accentText="#4c1d95"
          items={delivery4}
        />

        <PhaseBlock
          phase={5}
          title="Entrega 5 — Análise e Formalização de Garantias"
          subtitle="Cadastro de garantias, avaliação técnica por tipo de ativo (imóvel, veículo, recebíveis) e consulta automatizada de ônus e restrições em cartório."
          dateRange="Set 2026"
          accentColor="#0d9488"
          accentBg="#f0fdfa"
          accentBorder="#99f6e4"
          accentText="#134e4a"
          items={delivery5}
        />

        <PhaseBlock
          phase={6}
          title="Entrega 6 — Contratação e Liberação do Crédito"
          subtitle="Geração e assinatura digital de contratos, workflow de liberação de desembolso com integração bancária e painel de acompanhamento pós-liberação."
          dateRange="Out — Nov 2026"
          accentColor="#047857"
          accentBg="#ecfdf5"
          accentBorder="#6ee7b7"
          accentText="#064e3b"
          items={delivery6}
        />

        {/* ── PARTE 3 ─────────────────────────────────── */}
        <PartBanner
          number="03"
          title="Cobrança, Financeiro e Contabilidade"
          subtitle="Régua de cobrança automatizada, gestão de inadimplência, portal de negociação, fluxo de caixa, conciliação bancária, lançamentos contábeis e integração com ERP/SPED."
          period="Set 2026 — Mar 2027"
          phaseSteps={[
            { label: 'Cobrança' },
            { label: 'Financeiro' },
            { label: 'Contabilidade' },
          ]}
          startPhase={7}
          variant="rose"
        />

        <PhaseBlock
          phase={7}
          title="Entrega 7 — Cobrança, Financeiro e Contabilidade"
          subtitle="Módulo completo de cobrança com régua automatizada, gestão financeira com fluxo de caixa e conciliação bancária, e contabilidade integrada com ERP/SPED."
          dateRange="Set 2026 — Mar 2027"
          accentColor="#be185d"
          accentBg="#fdf2f8"
          accentBorder="#f9a8d4"
          accentText="#831843"
          items={delivery7}
        />

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
