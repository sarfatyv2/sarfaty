# Status do Projeto — Plataforma Sarfaty

**Última atualização:** 13 de Fevereiro de 2026  
**Referência rápida para contexto do projeto**

---

## 1. O que é

Plataforma corporativa integrada da Sarfaty. Interface única adaptativa por role — mesma aplicação, experiência diferente por papel do usuário. Cobre: comercial, crédito, compliance, jurídico, backoffice, gestão de risco e people (RH + DP).

---

## 2. Stack

| Camada | Tecnologia |
|--------|-----------|
| Monorepo | Turborepo + pnpm 9.x |
| Runtime | Node.js 22 LTS |
| Linguagem | TypeScript 5.7+ (strict, zero `any`) |
| Backend | NestJS 10.x + Fastify |
| Frontend | Next.js 15 (App Router) + React 19 |
| UI | Tailwind CSS + shadcn/ui |
| ORM | Drizzle ORM 0.38+ |
| Banco | Supabase (PostgreSQL 15+) |
| Auth | Supabase Auth (JWT + Refresh Tokens) |
| Validação | Zod 3.24+ |
| Logging | Pino 9.x (structured) |
| Testes | Vitest 2.x |
| CI | GitHub Actions |

---

## 3. Estrutura do Monorepo

```
sarfaty/
├── apps/
│   ├── api/                          # Backend NestJS + Fastify (porta 4000)
│   └── web-backoffice/               # Frontend Next.js 15 (porta 3000)
├── packages/
│   ├── config/                       # TSconfigs, ESLint, Tailwind preset
│   ├── types/                        # Tipos, DomainException, ROLE_PERMISSIONS, 18 roles
│   ├── validators/                   # Schemas Zod compartilhados (auth, user, collaborator, pagination, common)
│   ├── utils/                        # Formatters, assertions, constants, permissions helpers
│   └── ui/                           # Design system (15+ componentes shadcn/ui)
├── docs/                             # Especificações e documentação
├── .github/workflows/ci.yml          # Pipeline CI
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**Apps que NÃO existem ainda:** `web-client` (portal do cliente), `workers` (Python/IA).

---

## 4. O que está PRONTO (Sprint 0)

### 4.1 Backend (`apps/api`)

**Infraestrutura cross-cutting (tudo pronto):**

| Tipo | Arquivo | O que faz |
|------|---------|-----------|
| Guard | `auth.guard.ts` | Valida JWT do Supabase |
| Guard | `roles.guard.ts` | Verifica role via `@Roles()` |
| Guard | `rbac.guard.ts` | Verifica actions via `@RequireActions()` |
| Decorator | `@Public()` | Bypass do AuthGuard |
| Decorator | `@Roles()` | Define roles permitidos |
| Decorator | `@RequireActions()` | Define actions necessárias |
| Decorator | `@CurrentUser()` | Extrai user do request |
| Filter | `domain-exception.filter.ts` | DomainException -> HTTP response |
| Interceptor | `logging.interceptor.ts` | Log de method, url, status, duration, correlationId |
| Interceptor | `timeout.interceptor.ts` | 30s timeout |
| Middleware | `correlation-id.middleware.ts` | UUID v4 em cada request |
| Pipe | `zod-validation.pipe.ts` | Valida body/query/params com Zod |

**Módulos implementados:**

| Módulo | Endpoints | Status |
|--------|-----------|--------|
| `auth` | `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me` | Completo |
| `health` | `GET /api/health` | Completo |
| `users` | `POST /api/users`, `GET /api/users` | DDD completo (entity, repository, use-cases, Drizzle repo, Supabase auth adapter) |
| `people/collaborators` | `GET/PATCH /api/people/collaborators`, `GET/POST/DELETE /api/people/collaborators/:id/dependents`, `GET/PATCH /api/people/me` | Listagem, detalhe, edição (CLT/PJ), dependentes, visibilidade por role |
| `people/reimbursements` | `GET/POST/PATCH /api/people/reimbursements`, `POST :id/upload`, `POST :id/approve`, `POST :id/reject`, `POST :id/pay` | Fluxo colaborador → gestor → DP; upload comprovante; visibilidade por role |
| `people/invoices` | `GET /api/people/invoices`, `GET /overdue`, `POST :id/upload`, `POST :id/approve`, `POST :id/reject`, `POST :id/pay`, `POST /generate-monthly`, `POST /send-reminders` | NF PJ mensal; CRON dia 20; aprovação/pagamento DP |
| `clients` | `POST/GET/PATCH /api/clients`, `POST :id/submit`, `GET/POST/DELETE :id/documents`, `GET :id/documents/checklist`, `GET :id/documents/can-submit` | CRUD cliente + submit + checklist dinâmico + upload docs |
| `cnpj` | `GET /api/cnpj/:cnpj/validate` | Validação CNPJ via BrasilAPI + sugestão de segmento |
| `segments` | `GET /api/segments`, `GET /credit-products`, `GET /guarantee-types` | Lookup de segmentos, produtos e garantias |

**Database — 16 schemas Drizzle (módulo People) + 14 schemas (módulo Comercial):**

| # | Schema | Tabela | Módulo |
|---|--------|--------|--------|
| 1 | `profiles.ts` | `profiles` (PK = auth.users.id) | People |
| 2 | `collaborators.ts` | `collaborators` (FK profile_id, self-ref manager_id) | People |
| 3 | `collaborator-clt-data.ts` | `collaborator_clt_data` (1:1 collaborators) | People |
| 4 | `collaborator-pj-data.ts` | `collaborator_pj_data` (1:1 collaborators) | People |
| 5 | `collaborator-dependents.ts` | `collaborator_dependents` | People |
| 6 | `collaborator-compensation.ts` | `collaborator_compensation` (append-only) | People |
| 7 | `collaborator-documents.ts` | `collaborator_documents` | People |
| 8 | `range-tenure.ts` | `range_tenure` (lookup) | People |
| 9 | `range-age.ts` | `range_age` (lookup) | People |
| 10 | `reimbursements.ts` | `reimbursements` | People |
| 11 | `pj-invoices.ts` | `pj_invoices` | People |
| 12 | `onboarding-templates.ts` | `onboarding_templates` | People |
| 13 | `onboarding-tasks.ts` | `onboarding_tasks` | People |
| 14 | `performance-review-cycles.ts` | `performance_review_cycles` | People |
| 15 | `performance-reviews.ts` | `performance_reviews` | People |
| 16 | `medical-plan-entries.ts` | `medical_plan_entries` | People |
| 17 | `regions.ts` | `regions` | Comercial |
| 18 | `teams.ts` | `teams` | Comercial |
| 19 | `segments.ts` | `segments` | Comercial |
| 20 | `credit-products.ts` | `credit_products` | Comercial |
| 21 | `guarantee-types.ts` | `guarantee_types` | Comercial |
| 22 | `segment-document-templates.ts` | `segment_document_templates` | Comercial |
| 23 | `product-document-templates.ts` | `product_document_templates` | Comercial |
| 24 | `guarantee-document-templates.ts` | `guarantee_document_templates` | Comercial |
| 25 | `cnae-segment-mapping.ts` | `cnae_segment_mapping` | Comercial |
| 26 | `clients.ts` | `clients` | Comercial |
| 27 | `client-guarantees.ts` | `client_guarantees` | Comercial |
| 28 | `client-documents.ts` | `client_documents` | Comercial |
| 29 | `client-status-history.ts` | `client_status_history` | Comercial |
| 30 | `notifications.ts` | `notifications` | Comercial |

**Env vars do backend:** `NODE_ENV`, `PORT` (4000), `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`.

### 4.2 Frontend (`apps/web-backoffice`)

**Rotas implementadas:**

```
src/app/
├── layout.tsx                         # Root (Inter font, pt-BR)
├── page.tsx                           # Redirect / -> /login
├── globals.css                        # Theme tokens shadcn
├── (auth)/
│   └── login/page.tsx                 # Login (email + senha)
└── (dashboard)/
    ├── layout.tsx                     # Sidebar + Header + auth guard (min-h-0 para scroll correto)
    ├── overview/page.tsx              # Dashboard genérico
    ├── admin/
    │   ├── overview/page.tsx          # Dashboard admin
    │   └── users/
    │       ├── page.tsx               # Lista de usuários
    │       └── new/page.tsx           # Criar usuário
    ├── people/
    │   ├── me/
    │   │   ├── page.tsx               # Meu Perfil (edição própria)
    │   │   ├── reimbursements/page.tsx # Meus Reembolsos
    │   │   └── invoices/page.tsx      # Minhas NFs PJ
    │   ├── collaborators/
    │   │   ├── page.tsx               # Lista de colaboradores
    │   │   └── [id]/page.tsx          # Detalhe + Editar + Dependentes (tabs)
    │   ├── team/
    │   │   ├── page.tsx               # Meu Time (gestor)
    │   │   └── reimbursements/page.tsx # Reembolsos do Time
    │   └── dp/
    │       ├── reimbursements/page.tsx # Reembolsos (fila DP)
    │       └── invoices/
    │           ├── page.tsx           # Notas Fiscais PJ
    │           └── overdue/page.tsx   # NFs atrasadas
    └── [...slug]/page.tsx              # Catch-all "em construção"
```

**Auth flow:** Middleware Next.js -> Supabase SSR -> refresh token -> redirect `/login` se não autenticado.

**Sidebar:** Layout responsivo (≥1024px: sidebar fixa; <1024px: Sheet deslizante). Server Component que recebe `role` e renderiza menus baseado em `ROLE_PERMISSIONS`. Detalhes em `design-system-ui-melhorias.md`.

**Componentes adicionais:** `MaskedInput` (react-imask) para CPF, CNPJ, telefone, CEP em formulários — Meu Perfil, edição RH, create-user, dependentes. Ver `people_implementacao.md`.

### 4.3 Packages compartilhados

**`@nexus/types`** — 18 roles definidos:
`sales_rep`, `sales_supervisor`, `sales_manager`, `sales_director`, `credit_analyst`, `compliance_officer`, `approver`, `backoffice`, `legal`, `risk_manager`, `recovery`, `litigation`, `employee`, `people_manager`, `hr`, `dp`, `hr_admin`, `admin`

**`@nexus/types` — ROLE_PERMISSIONS:** Mapa completo com sidebar, dashboardModules, clientTabs, clientActions, globalActions e notifications para cada role.

**`@nexus/validators`** — Schemas: `loginSchema`, `createUserSchema`, `createCollaboratorSchema`, `updateCollaboratorSchema`, `updateCollaboratorAdminSchema`, `listCollaboratorsQuerySchema`, `paginationQuerySchema`, `emailSchema`, `cpfSchema`, `cnpjSchema`, `phoneSchema`, `uuidSchema`, `dateStringSchema`, `createClientSchema`, `updateClientSchema`, `uploadDocumentSchema`, `listClientsQuerySchema`.

**`@nexus/ui`** — 16+ componentes: Button, Input, Label, Card, Badge, Avatar, Separator, Skeleton, Dialog, Sheet, Select, ScrollArea, Switch, Table, Tabs, Textarea, Sonner (toast). Ver `design-system-ui-melhorias.md` para layout responsivo e tokens de design.

**`@nexus/utils`** — `formatCPF`, `formatCNPJ`, `formatCurrency`, `formatDate`, `formatPhone`, `assertNever`, `assertDefined`, `canPerformAction`, `canAccessTab`, `canPerformGlobalAction`, constantes (EMPLOYMENT_TYPES, REIMBURSEMENT_CATEGORIES, etc.).

### 4.4 Banco de Dados e Storage (Supabase)

- 16 tabelas People + 14 tabelas Comercial + 1 view (`collaborators_with_computed`) + trigger `on_auth_user_created`
- **Não existe signup público** — todo acesso criado por admin/RH
- Cadeia: `auth.users` -> trigger -> `profiles` -> `collaborators`
- **RLS policies (tabelas):** NENHUMA criada ainda
- **Storage:** bucket `collaborator-documents` privado, RLS em `storage.objects` (self SELECT/INSERT, DP SELECT), `file_size_limit` 10MB, `allowed_mime_types` PDF + JPEG/PNG/WebP. Paths: `reimbursements/{collab_id}/{reimb_id}/{file}`, `invoices/{collab_id}/{year}-{month}/{file}`
- **Storage:** bucket `client-documents` privado, RLS (comercial acessa próprios clientes, analistas/admin leem todos), 10MB, PDF + JPEG/PNG/WebP

### 4.5 Testes e CI

- Vitest configurado, 3 testes unitários (domain-exception), 1 e2e (health), factory de Profile
- GitHub Actions: push/PR para main/develop -> pnpm install -> turbo typecheck -> lint -> test

### 4.6 Usuário de Teste

| Campo | Valor |
|-------|-------|
| Email | `admin@sarfaty.com` |
| Senha | `Sarfaty@2026` |
| Role | `admin` |

---

## 5. O que NÃO está pronto — Roadmap

### 5.1 Sprint 1 — Módulos de Negócio

**Módulo Comercial (spec: `spec_tecnico_modulo_comercial.md`, impl: `comercial_implementacao.md`):**

- [x] Migrations Supabase: `regions`, `teams`, `segments`, `credit_products`, `clients`, `client_documents`, `client_guarantees`, `client_status_history`, `notifications`, `segment_document_templates`, `product_document_templates`, `guarantee_document_templates`, `guarantee_types`, `cnae_segment_mapping` (14 tabelas + seed data)
- [x] RLS policies para hierarquia comercial (5 níveis: sales_rep → supervisor → manager → director → admin)
- [x] Módulo NestJS `clients` — CRUD + DDD (entity com 20 status, transições, repository, 10 use-cases)
- [x] Módulo NestJS `documents` — upload Supabase Storage + checklist dinâmico (5 fontes: base + segmento + produto + garantia + condicional)
- [x] Módulo NestJS `segments` — listagem de segmentos, produtos de crédito e tipos de garantia
- [x] Módulo NestJS `cnpj` — validação via BrasilAPI + sugestão de segmento por CNAE
- [x] Supabase Storage: bucket `client-documents` com RLS
- [x] Tipos compartilhados (`@nexus/types` — `ClientStatus`, `DocumentChecklistItem`, `BASE_DOCUMENT_TYPES`, etc.)
- [x] Schemas Zod compartilhados (`@nexus/validators` — `createClientSchema`, `uploadDocumentSchema`, etc.)
- [ ] Módulo NestJS `pipeline` — métricas do funil (materialized view)
- [ ] Módulo NestJS `goals` — metas individuais/equipe/região + trigger de atualização
- [ ] Frontend: lista de clientes, cadastro step 1-2-3, checklist dinâmico, pipeline kanban/funil, metas, atividades

**Módulo People (spec: `spec_modulo_people.md`, impl: `people_implementacao.md`):**

- [x] Módulo NestJS `people/collaborators` — CRUD listagem, detalhe, edição, dependentes, dados CLT/PJ (visibilidade por role)
- [x] Módulo NestJS `people/reimbursements` — fluxo colaborador → gestor → DP (criar, upload comprovante, aprovar, rejeitar, pagar)
- [x] Módulo NestJS `people/invoices` — NF PJ mensal (upload, aprovação, rejeição, pagamento, CRON dia 20, NFs atrasadas, lembretes)
- [ ] Módulo NestJS `people/onboarding` — geração automática de checklist por tipo CLT/PJ
- [ ] Módulo NestJS `people/reviews` — avaliação 4 fases (auto → gestor → calibração → devolutiva)
- [ ] RLS policies People (employee → gestor → RH/DP)
- [x] Frontend: Meu Espaço (perfil, reembolsos, NFs)
- [x] Frontend: Meu Time (gestor, reembolsos do time)
- [x] Frontend: DP dashboard (reembolsos, NFs, NFs atrasadas)
- [ ] Frontend: benefícios, avaliações; RH dashboard completo
- [x] Supabase Storage: bucket `collaborator-documents` (RLS, 10MB, PDF/images)
- [ ] Migração de dados do Excel (134 colaboradores, 90 colunas)

**Infraestrutura Sprint 1:**

- [ ] RLS policies em todas as tabelas
- [ ] Testes de integração com DB real
- [ ] DataTable, Kanban e componentes complexos de UI
- [ ] Deploy (Vercel + Railway)

### 5.2 Sprint 2+ — Automações e Integrações

- [ ] Temporal.io Cloud — workflows: `CreditAnalysisWorkflow`, `DelinquencyEscalationWorkflow`, `DocumentValidationWorkflow`, `HomologationWorkflow`, `ContractGenerationWorkflow`
- [ ] Redis (Upstash) + BullMQ
- [ ] Módulo `credit` — adapters de bureaus (CERC, VADU, Upminer, Allcheck) com circuit breaker
- [ ] Módulo `compliance` — adapters (Neoway, idwall, BigData, Judit)
- [ ] Módulo `approval` — mesa aprovadora
- [ ] Módulo `legal` — contratos + extrajudiciais
- [ ] Módulo `communication` — email + WhatsApp
- [x] Módulo `audit` — append-only log (tabela `audit_logs` + `@Auditable()` decorator + interceptor global — ver `docs/audit_trail.md`)
- [x] Job CRON NF mensal dia 20 (PjInvoiceCronService)
- [ ] Jobs CRON (cobrança dias 5/10/15, alertas onboarding, aniversário empresa)
- [ ] `web-client` (portal do cliente — Next.js)
- [ ] OpenTelemetry + Prometheus + Grafana
- [ ] Supabase Realtime (notificações em tempo real)

### 5.3 Fase Futura

- [ ] Workers Python (FastAPI): document_validator (OCR + LLM), credit_report (LLM), contract_generator (LLM), extrajudicial_generator (LLM)
- [ ] Integrações reais com bureaus e compliance
- [ ] Integrações People (Ponto Mais, Flash, Agrega, FinBlue)
- [ ] Assinatura digital (Clicksign/D4Sign)
- [ ] MFA obrigatório por role

---

## 6. Arquitetura Backend — Padrão DDD Leve

Cada módulo segue:

```
modules/{nome}/
├── {nome}.module.ts              # NestJS module
├── controllers/
│   └── {nome}.controller.ts      # HTTP layer (DTOs in, responses out)
├── use-cases/
│   └── {ação}.use-case.ts        # Orquestra, não decide
├── domain/
│   ├── {nome}.entity.ts          # Regras de negócio, invariantes
│   ├── {nome}.repository.ts      # Interface (contrato)
│   ├── events/                   # Domain events
│   └── exceptions/               # DomainException subclasses
├── infra/
│   ├── drizzle-{nome}.repository.ts  # Implementação Drizzle
│   └── mappers/
│       └── {nome}.mapper.ts      # DB row <-> Domain entity
└── dto/
    └── {ação}.dto.ts             # Zod schema
```

**Princípios:**
1. Zero `any` — CI quebra
2. Domain entities encapsulam regras de negócio
3. Repository é contrato do domínio (interface), implementação na infra
4. Exception hierarchy tipada (DomainException -> subclasses com code + httpStatus)
5. Validação em 2 camadas: Zod (shape) + Domain (invariantes)
6. Structured logging com Pino, zero console.log

**Response padrão:**
```typescript
{ data: T }                                              // sucesso
{ error: { code, message, statusCode, correlationId, timestamp, metadata? } }  // erro
{ data: T[], pagination: { total, page, pageSize, totalPages } }               // paginação
```

---

## 7. Interface Adaptativa — Como funciona

Toda a lógica de "quem vê o quê" vive em `ROLE_PERMISSIONS` (`@nexus/types`):

```typescript
ROLE_PERMISSIONS[role] = {
  label,           // Nome amigável
  homeRoute,       // Rota após login
  sidebar,         // Menus da sidebar
  dashboardModules, // Módulos do dashboard
  clientTabs,      // Abas na página do cliente
  clientActions,   // Ações disponíveis
  globalActions,   // Ações globais
  notifications,   // Tipos de notificação
}
```

O frontend consome esse mapa e renderiza por composição — zero condicionais espalhadas.

---

## 8. Specs de Referência

| Documento | Conteúdo | Linhas |
|-----------|----------|--------|
| `sprint_0_entrega.md` | Tudo que foi entregue no Sprint 0 | ~480 |
| `arquitetura_sistema_plataforma_credito.md` | Arquitetura completa, decisões, diagramas, workflows Temporal, adapters, deploy | ~1390 |
| `spec_tecnico_modulo_comercial.md` | Módulo comercial: tabelas, RLS, fluxo, checklist dinâmico, pipeline, metas, endpoints | ~1800 |
| `comercial_implementacao.md` | Implementação comercial: tabelas, schemas, módulo NestJS clients, endpoints, checklist, CNPJ | ~250 |
| `spec_modulo_people.md` | Módulo People: tabelas, RLS, fluxos (reembolso, NF, onboarding, avaliação), dashboards, endpoints | ~1430 |
| `people_implementacao.md` | Implementação colaboradores: tabs (Dados/Editar/Dependentes), CLT/PJ, máscaras, layout scroll | ~180 |
| `spec_ux_interface_adaptativa.md` | ROLE_PERMISSIONS completo, sidebar, dashboard modules, abas, ações, notificações | ~1260 |

---

## 9. Decisões Tomadas

| Decisão | Escolha |
|---------|---------|
| Monorepo tooling | Turborepo |
| HTTP adapter NestJS | Fastify |
| ORM | Drizzle ORM |
| Arquitetura backend | DDD leve (4 camadas) |
| Criação de usuários | NestJS endpoint (não Edge Function) |
| Signup público | Desabilitado (só admin/RH criam) |
| Temporal.io | Cloud (não self-hosted) |

**Decisões pendentes:** hosting da API (Railway vs Fly.io), fornecedor WhatsApp (Twilio vs Meta), assinatura digital (Clicksign vs D4Sign), design system (shadcn ou customizar mais).

---

## 10. Como Rodar

```bash
# Instalar dependências
pnpm install

# Frontend (porta 3000)
pnpm --filter web-backoffice dev

# API (porta 4000)
pnpm --filter api dev

# Typecheck
npx turbo typecheck

# Testes
pnpm --filter api test
```

Env vars necessárias em `.env.local` (raiz) ou nos apps individuais:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
