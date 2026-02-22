import type { Node, Edge } from '@xyflow/react';

export const dddNodes: Node[] = [
  {
    id: 'controller',
    type: 'layerNode',
    position: { x: 100, y: 20 },
    data: {
      label: 'Controller Layer',
      sublabel: 'HTTP • Validação Zod • Respostas',
      items: ['ClientsController', 'CreditController', 'PeopleController', 'PipelineController'],
      color: 'blue',
    },
  },
  {
    id: 'usecase',
    type: 'layerNode',
    position: { x: 100, y: 170 },
    data: {
      label: 'Use Case Layer',
      sublabel: 'Orquestração • Sem regras de negócio',
      items: ['CreateClientUseCase', 'ApproveCreditUseCase', 'EnrollLearningUseCase'],
      color: 'purple',
    },
  },
  {
    id: 'domain',
    type: 'layerNode',
    position: { x: 100, y: 320 },
    data: {
      label: 'Domain Layer',
      sublabel: 'Entidades • Regras de negócio • Interfaces de repo',
      items: ['Client', 'Drawee', 'Collaborator', 'IClientRepository'],
      color: 'green',
    },
  },
  {
    id: 'infra',
    type: 'layerNode',
    position: { x: 500, y: 320 },
    data: {
      label: 'Repository (Infra)',
      sublabel: 'Drizzle ORM • Supabase queries',
      items: ['DrizzleClientRepository', 'DrizzlePeopleRepository'],
      color: 'amber',
    },
  },
];

export const dddEdges: Edge[] = [
  {
    id: 'e-ctrl-uc',
    source: 'controller',
    target: 'usecase',
    label: 'chama',
    style: { stroke: 'hsl(150, 30%, 55%)', strokeWidth: 2 },
    labelStyle: { fontSize: 10, fill: 'hsl(150, 15%, 50%)' },
    animated: true,
  },
  {
    id: 'e-uc-domain',
    source: 'usecase',
    target: 'domain',
    label: 'usa',
    style: { stroke: 'hsl(150, 30%, 55%)', strokeWidth: 2 },
    labelStyle: { fontSize: 10, fill: 'hsl(150, 15%, 50%)' },
    animated: true,
  },
  {
    id: 'e-infra-domain',
    source: 'infra',
    target: 'domain',
    sourceHandle: 'l',
    label: 'implementa',
    style: { stroke: 'hsl(48, 80%, 50%)', strokeWidth: 2 },
    labelStyle: { fontSize: 10, fill: 'hsl(48, 60%, 40%)' },
    animated: false,
  },
];

export const monorepoNodes: Node[] = [
  {
    id: 'apps',
    type: 'layerNode',
    position: { x: 80, y: 20 },
    data: {
      label: 'apps/',
      sublabel: 'Aplicações — podem importar de packages/',
      items: ['web-backoffice', 'web-client', 'api', 'workers'],
      color: 'blue',
    },
  },
  {
    id: 'pkg-types',
    type: 'layerNode',
    position: { x: 80, y: 170 },
    data: {
      label: '@nexus/types',
      sublabel: 'Tipos compartilhados — leaf node (zero deps)',
      items: ['Role', 'ClientStatus', 'FunnelStage', 'ROLE_PERMISSIONS'],
      color: 'green',
    },
  },
  {
    id: 'pkg-validators',
    type: 'layerNode',
    position: { x: 80, y: 310 },
    data: {
      label: '@nexus/validators',
      sublabel: 'Schemas Zod — front e back usam o mesmo schema',
      items: ['createClientSchema', 'createCollaboratorSchema'],
      color: 'purple',
    },
  },
  {
    id: 'pkg-ui',
    type: 'layerNode',
    position: { x: 80, y: 450 },
    data: {
      label: '@nexus/ui',
      sublabel: 'Design system — shadcn/ui customizados',
      items: ['Button', 'Card', 'Dialog', 'Table', 'Sheet'],
      color: 'amber',
    },
  },
  {
    id: 'pkg-config',
    type: 'layerNode',
    position: { x: 500, y: 170 },
    data: {
      label: '@nexus/config',
      sublabel: 'Configs — ESLint, TS, Tailwind, permissões',
      items: ['tailwind.config', 'tsconfig', 'eslint.config'],
      color: 'sky',
    },
  },
  {
    id: 'pkg-utils',
    type: 'layerNode',
    position: { x: 500, y: 310 },
    data: {
      label: '@nexus/utils',
      sublabel: 'Funções utilitárias',
      items: ['formatCNPJ', 'formatCurrency', 'permissionsHelper'],
      color: 'teal',
    },
  },
];

export const monorepoEdges: Edge[] = [
  { id: 'e-apps-types', source: 'apps', target: 'pkg-types', style: { stroke: 'hsl(150, 30%, 60%)', strokeWidth: 1.5 } },
  { id: 'e-apps-val', source: 'apps', target: 'pkg-validators', style: { stroke: 'hsl(150, 30%, 60%)', strokeWidth: 1.5 } },
  { id: 'e-apps-ui', source: 'apps', target: 'pkg-ui', style: { stroke: 'hsl(150, 30%, 60%)', strokeWidth: 1.5 } },
  { id: 'e-val-types', source: 'pkg-validators', target: 'pkg-types', sourceHandle: 'l', label: 'usa', style: { stroke: 'hsl(150, 20%, 70%)', strokeWidth: 1 }, labelStyle: { fontSize: 9 } },
  { id: 'e-utils-types', source: 'pkg-utils', target: 'pkg-types', sourceHandle: 'l', style: { stroke: 'hsl(150, 20%, 70%)', strokeWidth: 1 } },
  { id: 'e-config-types', source: 'pkg-config', target: 'pkg-types', style: { stroke: 'hsl(150, 20%, 70%)', strokeWidth: 1 } },
];

export type { Node, Edge };
