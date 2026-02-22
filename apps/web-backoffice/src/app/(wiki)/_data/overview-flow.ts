import type { Node, Edge } from '@xyflow/react';

export const overviewNodes: Node[] = [
  // Hub central
  {
    id: 'hub',
    type: 'moduleNode',
    position: { x: 620, y: 280 },
    data: { label: 'Plataforma\nSarfaty', isHub: true, color: 'green' },
  },

  // Módulos operacionais (esquerda/cima)
  {
    id: 'commercial',
    type: 'moduleNode',
    position: { x: 60, y: 80 },
    data: { label: 'Comercial', description: 'Ciclo de vida de clientes', color: 'green' },
  },
  {
    id: 'credit',
    type: 'moduleNode',
    position: { x: 280, y: 30 },
    data: { label: 'Crédito', description: 'Vadu + Creditbox', color: 'blue' },
  },
  {
    id: 'drawees',
    type: 'moduleNode',
    position: { x: 500, y: 30 },
    data: { label: 'Sacados', description: 'Gestão de devedores', color: 'sky' },
  },
  {
    id: 'pipeline',
    type: 'moduleNode',
    position: { x: 720, y: 30 },
    data: { label: 'Pipeline', description: '7 estágios do funil', color: 'amber' },
  },
  {
    id: 'goals',
    type: 'moduleNode',
    position: { x: 950, y: 80 },
    data: { label: 'Metas', description: 'Ind. / Equipe / Região', color: 'orange' },
  },

  // Módulos financeiros (direita)
  {
    id: 'financial',
    type: 'moduleNode',
    position: { x: 1150, y: 200 },
    data: { label: 'Financeiro', description: 'Contas e transações', color: 'teal' },
  },
  {
    id: 'debentures',
    type: 'moduleNode',
    position: { x: 1150, y: 360 },
    data: { label: 'Debêntures', description: 'Emissões e séries', color: 'indigo' },
  },

  // Módulos de suporte (baixo)
  {
    id: 'people',
    type: 'moduleNode',
    position: { x: 60, y: 480 },
    data: { label: 'Pessoas', description: 'RH + DP', color: 'rose' },
  },
  {
    id: 'learning',
    type: 'moduleNode',
    position: { x: 280, y: 520 },
    data: { label: 'Aprendizagem', description: 'Cursos e trilhas', color: 'purple' },
  },
  {
    id: 'econgroups',
    type: 'moduleNode',
    position: { x: 500, y: 520 },
    data: { label: 'Grupos Econ.', description: 'Grupos econômicos', color: 'sky' },
  },

  // Infraestrutura (abaixo do hub)
  {
    id: 'notifications',
    type: 'moduleNode',
    position: { x: 740, y: 520 },
    data: { label: 'Notificações', description: 'Eventos em tempo real', color: 'amber' },
  },
  {
    id: 'audit',
    type: 'moduleNode',
    position: { x: 960, y: 480 },
    data: { label: 'Auditoria', description: 'Trilha imutável', color: 'slate' },
  },
  {
    id: 'auth',
    type: 'moduleNode',
    position: { x: 720, y: 460 },
    data: { label: 'Auth + RBAC', description: '18 roles', color: 'slate' },
  },
];

const edgeStyle = { stroke: 'hsl(150, 20%, 70%)', strokeWidth: 1.5 };
const accentEdge = { stroke: 'hsl(48, 100%, 42%)', strokeWidth: 2 };

export const overviewEdges: Edge[] = [
  // Commercial connections
  { id: 'e-com-cred', source: 'commercial', target: 'credit', animated: true, style: edgeStyle, label: 'consulta' },
  { id: 'e-com-pipe', source: 'commercial', target: 'pipeline', style: edgeStyle },
  { id: 'e-com-goals', source: 'commercial', target: 'goals', style: edgeStyle },
  { id: 'e-com-notif', source: 'commercial', target: 'notifications', style: edgeStyle },

  // Drawees
  { id: 'e-draw-econ', source: 'drawees', target: 'econgroups', style: edgeStyle },

  // Financial
  { id: 'e-fin-deb', source: 'financial', target: 'debentures', style: edgeStyle },

  // People
  { id: 'e-peo-learn', source: 'people', target: 'learning', animated: true, style: edgeStyle, label: 'auto-enroll' },
  { id: 'e-peo-notif', source: 'people', target: 'notifications', style: edgeStyle },

  // Hub to infrastructure
  { id: 'e-hub-auth', source: 'hub', target: 'auth', style: accentEdge },
  { id: 'e-hub-audit', source: 'hub', target: 'audit', style: accentEdge },
  { id: 'e-hub-notif', source: 'hub', target: 'notifications', style: accentEdge },

  // All to audit
  { id: 'e-com-audit', source: 'commercial', target: 'audit', style: { stroke: 'hsl(150, 15%, 75%)', strokeWidth: 1 }, type: 'straight' },
  { id: 'e-peo-audit', source: 'people', target: 'audit', style: { stroke: 'hsl(150, 15%, 75%)', strokeWidth: 1 }, type: 'straight' },
];
