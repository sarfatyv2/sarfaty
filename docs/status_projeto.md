# Status do Projeto — Plataforma Sarfaty

**Última atualização:** 03 de Março de 2026  
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
│   ├── types/                        # Tipos, DomainException, ROLE_PERMISSIONS, 19 roles
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
| `clients` | `POST/GET/PATCH /api/clients`, `POST :id/submit`, `GET/POST/DELETE :id/documents`, `GET :id/documents/checklist`, `GET :id/documents/can-submit`, `GET/POST/PATCH/DELETE :id/contacts`, `GET/POST/PATCH/DELETE :id/addresses`, `GET/POST/PATCH/DELETE :id/bank-accounts`, `GET/POST/PATCH/DELETE :id/authorized-persons` | CRUD cliente + submit + checklist + docs + sub-resources (contatos, endereços, contas bancárias, pessoas autorizadas) |
| `cnpj` | `GET /api/cnpj/:cnpj/validate` | Validação CNPJ via BrasilAPI + sugestão de segmento |
| `segments` | `GET /api/segments`, `GET /credit-products`, `GET /guarantee-types` | Lookup de segmentos, produtos e garantias |
| `drawees` | `POST/GET/PATCH /api/drawees`, `GET/POST/PATCH/DELETE :id/contacts`, `GET/POST/PATCH/DELETE :id/addresses`, `GET/POST/PATCH/DELETE :id/bank-accounts` | CRUD sacados (PJ e PF) + sub-resources |
| `goals` | `POST/GET/PATCH/DELETE /api/goals`, `GET /api/goals/ranking` | CRUD metas comerciais (individual/equipe/região) + ranking |
| `pipeline` | `GET /api/pipeline`, `GET /api/pipeline/metrics` | Listagem do funil + métricas por fase |
| `notifications` | `GET /api/notifications`, `GET /unread-count`, `PATCH :id/read`, `PATCH /read-all` | Notificações com contagem e marcação de leitura (todos os roles) |
| `governance` | `POST/GET/PATCH /api/governance/committees`, `GET/POST/PATCH/DELETE :id/members`, `POST/GET/PATCH .../meetings`, `GET/POST/PATCH .../minute`, `POST .../minute/publish`, `GET/POST/PATCH/DELETE /api/governance/actions`, `GET/POST .../updates` | Comitês, reuniões, atas (rich text), ações e atualizações — DDD completo (12 use-cases) |
| `communication` | `POST/GET/PATCH/DELETE /api/wiki/categories`, `POST/GET/PATCH/DELETE /api/wiki/articles`, `POST/GET/PATCH/DELETE /api/intranet/announcements` | Wiki (base de conhecimento com rich text) + Intranet (comunicados com targetRoles) |
| `credit/compliance` | `GET /api/clients/:clientId/credit-analysis/compliance-results` | Verificações automatizadas de compliance: CGU (CEIS/CNEP/CEPIM), PGFN, CNDT, PEP, Sanções (OFAC), Trabalho Escravo, Validação de Endereço (ViaCEP), Mídia Negativa (OSINT via Gemini), Presença Digital. Disparadas automaticamente via eventos. Ver `compliance_checks_integracao.md` |

**Database — 89 schemas Drizzle:**

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
| 26 | `clients.ts` | `clients` (enriquecida com 18 campos PJ/compliance) | Comercial |
| 27 | `client-guarantees.ts` | `client_guarantees` | Comercial |
| 28 | `client-documents.ts` | `client_documents` | Comercial |
| 29 | `client-status-history.ts` | `client_status_history` | Comercial |
| 30 | `client-contacts.ts` | `client_contacts` | Comercial |
| 31 | `client-addresses.ts` | `client_addresses` | Comercial |
| 32 | `client-bank-accounts.ts` | `client_bank_accounts` | Comercial |
| 33 | `client-authorized-persons.ts` | `client_authorized_persons` | Comercial |
| 34 | `sales-goals.ts` | `sales_goals` (individual/equipe/região) | Comercial |
| 35 | `notifications.ts` | `notifications` | Comercial |
| 36 | `client-commercial-reports.ts` | `client_commercial_reports` (Relatórios parseados) | Comercial |
| 37 | `drawees.ts` | `drawees` (PJ e PF) | Sacados |
| 37 | `drawee-contacts.ts` | `drawee_contacts` | Sacados |
| 38 | `drawee-addresses.ts` | `drawee_addresses` (com campos billing legados) | Sacados |
| 39 | `drawee-bank-accounts.ts` | `drawee_bank_accounts` | Sacados |
| 40 | `drawee-documents.ts` | `drawee_documents` | Sacados |
| 41 | `drawee-groups.ts` | `drawee_groups` (Drawee ↔ EconomicGroup) | Sacados |
| 42 | `drawee-enabled-products.ts` | `drawee_enabled_products` | Sacados |
| 43 | `economic-groups.ts` | `economic_groups` | Grupos Econômicos |
| 44 | `economic-group-members.ts` | `economic_group_members` (FK clients) | Grupos Econômicos |
| 45 | `economic-group-persons.ts` | `economic_group_persons` | Grupos Econômicos |
| 46 | `economic-group-bank-accounts.ts` | `economic_group_bank_accounts` | Grupos Econômicos |
| 47 | `financial-accounts.ts` | `financial_accounts` (FK clients) | Financeiro |
| 48 | `financial-event-types.ts` | `financial_event_types` (lookup) | Financeiro |
| 49 | `financial-transactions.ts` | `financial_transactions` | Financeiro |
| 50 | `financial-pendencies.ts` | `financial_pendencies` | Financeiro |
| 51 | `financial-settlements.ts` | `financial_settlements` | Financeiro |
| 52 | `portfolio-positions.ts` | `portfolio_positions` (posições de fundo) | Portfólio |
| 53 | `market-rates.ts` | `market_rates` (CDI, SELIC, IPCA) | Portfólio |
| 54 | `debenture-issuers.ts` | `debenture_issuers` | Debêntures |
| 55 | `debenture-issuances.ts` | `debenture_issuances` | Debêntures |
| 56 | `debenture-series.ts` | `debenture_series` | Debêntures |
| 57 | `debenture-subscriptions.ts` | `debenture_subscriptions` (FK clients) | Debêntures |
| 58 | `debenture-valuations.ts` | `debenture_valuations` (cálculo diário) | Debêntures |
| 59 | `debenture-redemptions.ts` | `debenture_redemptions` | Debêntures |
| 60 | `suppliers.ts` | `suppliers` (PJ e PF) | Fornecedores |
| 61 | `supplier-contacts.ts` | `supplier_contacts` | Fornecedores |
| 62 | `supplier-addresses.ts` | `supplier_addresses` | Fornecedores |
| 63 | `supplier-bank-accounts.ts` | `supplier_bank_accounts` | Fornecedores |
| 64 | `supplier-documents.ts` | `supplier_documents` | Fornecedores |
| 65 | `vadu-company-results.ts` | `vadu_company_results` (resultado CNPJ) | Integrações |
| 66 | `vadu-person-results.ts` | `vadu_person_results` (resultado CPF) | Integrações |
| 67 | `creditbox-reports.ts` | `creditbox_reports` (relatório CreditBox) | Integrações |
| 68 | `cgu-check-results.ts` | `cgu_check_results` (CEIS, CNEP, CEPIM) | Compliance |
| 69 | `pgfn-check-results.ts` | `pgfn_check_results` (Dívida Ativa) | Compliance |
| 70 | `cndt-check-results.ts` | `cndt_check_results` (Certidão Trabalhista) | Compliance |
| 71 | `pep-check-results.ts` | `pep_check_results` (PEP) | Compliance |
| 72 | `sanctions-check-results.ts` | `sanctions_check_results` (Sanções OFAC) | Compliance |
| 73 | `slave-labor-check-results.ts` | `slave_labor_check_results` (Trabalho Escravo) | Compliance |
| 74 | `address-validation-results.ts` | `address_validation_results` (Validação Endereço) | Compliance |
| 75 | `negative-media-results.ts` | `negative_media_results` (Mídia Negativa/OSINT) | Compliance |
| 76 | `digital-presence-results.ts` | `digital_presence_results` (Presença Digital) | Compliance |
| 75 | `audit.ts` | `audit_logs` | Core |
| 76 | `learning-courses.ts` | `learning_courses` | Learning |
| 77 | `learning-modules.ts` | `learning_modules` | Learning |
| 78 | `learning-lessons.ts` | `learning_lessons` | Learning |
| 79 | `learning-enrollments.ts` | `learning_enrollments` | Learning |
| 80 | `learning-lesson-completions.ts` | `learning_lesson_completions` | Learning |
| 81 | `gov-committees.ts` | `gov_committees` | Governance |
| 82 | `gov-committee-members.ts` | `gov_committee_members` | Governance |
| 83 | `gov-meetings.ts` | `gov_meetings` | Governance |
| 84 | `gov-meeting-minutes.ts` | `gov_meeting_minutes` | Governance |
| 85 | `gov-action-items.ts` | `gov_action_items` | Governance |
| 86 | `gov-action-updates.ts` | `gov_action_updates` | Governance |
| 87 | `comm-wiki-categories.ts` | `comm_wiki_categories` | Communication |
| 88 | `comm-wiki-articles.ts` | `comm_wiki_articles` | Communication |
| 89 | `comm-announcements.ts` | `comm_announcements` | Communication |

**Env vars do backend:** `NODE_ENV`, `PORT` (4000), `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`, `VADU_API_KEY`, `CGU_API_KEY`, `GEMINI_API_KEY`.

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
    ├── clients/
    │   ├── page.tsx                   # Lista de clientes (cards + pipeline summary)
    │   ├── new/page.tsx               # Formulário multi-step (3 etapas)
    │   └── [id]/page.tsx              # Detalhe + tabs (Dados, Documentos, Contatos, Endereços, Contas, Pessoas Autorizadas)
    ├── drawees/
    │   ├── page.tsx                   # Lista de sacados (com filtro PJ/PF)
    │   ├── new/page.tsx               # Formulário multi-step PJ/PF
    │   └── [id]/page.tsx              # Detalhe + tabs (Dados, Contatos, Endereços, Contas Bancárias)
    ├── pipeline/
    │   └── page.tsx                   # Board kanban + métricas por fase
    ├── goals/
    │   └── page.tsx                   # Dashboard de metas (progress cards, ranking, tabela)
    ├── governance/
    │   ├── page.tsx                   # Dashboard Governança (KPIs + comitês + ações)
    │   ├── committees/
    │   │   ├── page.tsx               # Lista de comitês
    │   │   └── [id]/page.tsx          # Detalhe + membros + reuniões + ações
    │   └── actions/
    │       └── page.tsx               # Lista de itens de ação
    ├── knowledge/
    │   └── page.tsx                   # Wiki (sidebar de categorias + grid de artigos + leitor)
    ├── intranet/
    │   └── page.tsx                   # Comunicados internos
    └── [...slug]/page.tsx              # Catch-all "em construção"
```

**Novos componentes UI:** `RichTextEditor` (Tiptap) usado no editor de atas e artigos wiki. Exportado em `@nexus/ui`.

**Auth flow:** Middleware Next.js -> Supabase SSR -> refresh token -> redirect `/login` se não autenticado.

**Sidebar:** Layout responsivo (≥1024px: sidebar fixa; <1024px: Sheet deslizante). Server Component que recebe `role` e renderiza menus baseado em `ROLE_PERMISSIONS`. Detalhes em `design-system-ui-melhorias.md`.

**Componentes adicionais:** `MaskedInput` (react-imask) para CPF, CNPJ, telefone, CEP em formulários — Meu Perfil, edição RH, create-user, dependentes. Ver `people_implementacao.md`.

### 4.3 Packages compartilhados

**`@nexus/types`** — 19 roles definidos:
`sales_rep`, `sales_supervisor`, `sales_manager`, `sales_director`, `credit_analyst`, `compliance_officer`, `approver`, `backoffice`, `legal`, `risk_manager`, `recovery`, `litigation`, `employee`, `people_manager`, `hr`, `dp`, `hr_admin`, `governance`, `admin`

**`@nexus/types` — ROLE_PERMISSIONS:** Mapa completo com sidebar (inclui "Sacados" para roles comerciais/crédito, "Conhecimento/Wiki" para todos os roles, "Governança" para role governance), dashboardModules, clientTabs, clientActions, globalActions e notifications para cada role.

**`@nexus/types` — Novos types adicionados:**
- `client-extended.ts`: `ClientContact`, `ClientAddress`, `ClientBankAccount`, `ClientAuthorizedPerson`
- `drawee.ts`: `PersonType`, `Drawee`, `DraweeContact`, `DraweeAddress`, `DraweeBankAccount`, `DraweeDocument`
- `goal.ts`: `Goal`, `GoalScope`
- `pipeline.ts`: `PipelineMetrics`, `PipelineClient`
- `governance.ts`: `Committee`, `CommitteeMember`, `Meeting`, `MeetingMinute`, `ActionItem`, `ActionUpdate` + enums `CommitteeFrequency`, `CommitteeStatus`, `CommitteeMemberRole`, `MeetingStatus`, `MinuteStatus`, `ActionItemStatus`
- `communication.ts`: `WikiCategory`, `WikiArticle`, `Announcement` + enums `WikiArticleStatus`, `AnnouncementStatus`

**`@nexus/validators`** — Schemas: `loginSchema`, `createUserSchema`, `createCollaboratorSchema`, `updateCollaboratorSchema`, `updateCollaboratorAdminSchema`, `listCollaboratorsQuerySchema`, `paginationQuerySchema`, `emailSchema`, `cpfSchema`, `cnpjSchema`, `phoneSchema`, `uuidSchema`, `dateStringSchema`, `createClientSchema`, `updateClientSchema` (estendido com campos PJ/compliance), `uploadDocumentSchema`, `listClientsQuerySchema`.

**`@nexus/validators` — Novos schemas adicionados:**
- `client-sub-resources.schema.ts`: `createClientContactSchema`, `createClientAddressSchema`, `createClientBankAccountSchema`, `createClientAuthorizedPersonSchema` (e variantes `update`)
- `drawee.schema.ts`: `createDraweeSchema` (com superRefine PJ/PF), `updateDraweeSchema`, `listDraweesQuerySchema`, `createDraweeContactSchema`, `createDraweeAddressSchema`, `createDraweeBankAccountSchema`
- `goal.schema.ts`: `createGoalSchema`, `updateGoalSchema`, `listGoalsQuerySchema`
- `pipeline.schema.ts`: `pipelineQuerySchema`

**`@nexus/ui`** — 16+ componentes: Button, Input, Label, Card, Badge, Avatar, Separator, Skeleton, Dialog, Sheet, Select, ScrollArea, Switch, Table, Tabs, Textarea, Sonner (toast). Ver `design-system-ui-melhorias.md` para layout responsivo e tokens de design.

**`@nexus/utils`** — `formatCPF`, `formatCNPJ`, `formatCurrency`, `formatDate`, `formatPhone`, `assertNever`, `assertDefined`, `canPerformAction`, `canAccessTab`, `canPerformGlobalAction`, constantes (EMPLOYMENT_TYPES, REIMBURSEMENT_CATEGORIES, etc.).

### 4.4 Banco de Dados e Storage (Supabase)

- 91 tabelas (16 People + 36 Comercial/Sacados + 4 Grupos Econômicos + 5 Financeiro + 2 Portfólio + 6 Debêntures + 5 Fornecedores + 3 Integrações + 9 Compliance + 1 Core + 5 Learning + 6 Governance + 3 Communication) + 1 view (`collaborators_with_computed`) + trigger `on_auth_user_created`
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
- [x] Client enrichment PJ — 18 novos campos na entity `Client` e schema `clients` (inscrições, datas, compliance, grupo econômico, legados)
- [x] Client sub-resources — contatos, endereços, contas bancárias e pessoas autorizadas (DDD completo + endpoints CRUD)
- [x] Módulo NestJS `drawees` — CRUD sacados PJ/PF + sub-resources (contacts, addresses, bank accounts)
- [x] Módulo NestJS `pipeline` — listagem do funil + métricas por fase
- [x] Módulo NestJS `goals` — metas individuais/equipe/região + ranking
- [x] Frontend: lista de clientes, cadastro step 1-2-3, checklist dinâmico (completo)
- [x] Frontend: detalhe de cliente com tabs (Dados, Documentos, Contatos, Endereços, Contas, Pessoas Autorizadas)
- [x] Frontend: módulo sacados (lista, cadastro multi-step PJ/PF, detalhe com tabs)
- [x] Frontend: pipeline (board kanban + métricas)
- [x] Frontend: goals (dashboard com progress cards, ranking, tabela)
- [ ] Frontend: atividades comerciais

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
- [x] Módulo `credit/vadu` — adapters VADU (consulta CNPJ/CPF síncrona) + CreditBox (relatório assíncrono com polling e PDF). Ver `vadu_integracao.md`
- [x] Módulo `credit/compliance` — 9 verificações automáticas: CGU (CEIS/CNEP/CEPIM), PGFN, CNDT, PEP, Sanções (OFAC), Trabalho Escravo, Validação de Endereço (ViaCEP), Mídia Negativa (OSINT via Gemini API + Google Search Grounding), Presença Digital (DNS + HTTP probe). Disparadas automaticamente via eventos, exibidas na aba Bureau. Ver `compliance_checks_integracao.md`
- [ ] Módulo `credit` — adapters de bureaus adicionais (CERC, Upminer, Allcheck) com circuit breaker
- [ ] Módulo `compliance` — adapters comerciais (Neoway, idwall, BigData, Judit)
- [ ] Módulo `approval` — mesa aprovadora
- [ ] Módulo `legal` — contratos + extrajudiciais
- [ ] Módulo `communication` — email + WhatsApp
- [x] Módulo `audit` — append-only log (tabela `audit_logs` + `@Auditable()` decorator + interceptor global — ver `docs/audit_trail.md`)
- [x] Job CRON NF mensal dia 20 (PjInvoiceCronService)
- [x] Módulo `notifications` — listagem, contagem não lidas, marcação lida/todas lidas (todos os 19 roles)
- [x] Módulo `governance` — comitês, membros, reuniões, atas (rich text), itens de ação, atualizações (DDD completo, 12 use-cases, 3 controllers, 6 tabelas DB)
- [x] Módulo `communication` — wiki (categorias + artigos rich text) + intranet (comunicados com targetRoles) (3 tabelas DB)
- [x] Role `governance` — novo role com acesso completo a governance/wiki/intranet, sidebar configurado, check constraint DB atualizado
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
| `comercial_implementacao.md` | Implementação comercial: clients (enriquecido + sub-resources), drawees, goals, pipeline | ~250 |
| `spec_modulo_people.md` | Módulo People: tabelas, RLS, fluxos (reembolso, NF, onboarding, avaliação), dashboards, endpoints | ~1430 |
| `people_implementacao.md` | Implementação colaboradores: tabs (Dados/Editar/Dependentes), CLT/PJ, máscaras, layout scroll | ~180 |
| `spec_ux_interface_adaptativa.md` | ROLE_PERMISSIONS completo, sidebar, dashboard modules, abas, ações, notificações | ~1260 |
| `seguranca.md` | Segurança: SAST, DAST, SCA, secret scanning, hardening, RLS, CI/CD security pipeline | ~390 |
| `dicionario_dados.md` | Dicionário de dados: todas as 72 tabelas, colunas, tipos, constraints, FKs, RLS, diagrama ER | ~750 |
| `audit_trail.md` | Sistema de auditoria centralizado: interceptor, tabela, correlação | ~300 |
| `governance_communication_implementacao.md` | Módulos Governance (comitês, reuniões, atas, ações) e Communication (wiki, intranet): domínio, banco, endpoints, CRON, frontend, RBAC | ~400 |
| `vadu_integracao.md` | Integração VADU: consulta CNPJ/CPF síncrona + CreditBox assíncrono (polling, PDF, JSON). Adapters, domínio, persistência, frontend | ~100 |
| `compliance_checks_integracao.md` | Verificações de compliance: 9 fontes (CGU, PGFN, CNDT, PEP, Sanções, Trabalho Escravo, ViaCEP, Mídia Negativa/OSINT, Presença Digital). Arquitetura, adapters, use cases, cálculo de risco, testes | ~300 |

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
| SAST | Semgrep + CodeQL (complementares) |
| DAST | OWASP ZAP (baseline semanal) |
| Secret scanning | Gitleaks (CI + pre-commit) |
| HTTP security headers | @fastify/helmet (API) + custom headers (Next.js) |
| Rate limiting | @nestjs/throttler (100 req/min global) |
| RBAC enforcement | RbacGuard global (por action, não só por role) |
| ESLint security | eslint-plugin-security + eslint-plugin-no-secrets |
| Dependency scanning | pnpm audit (CI) + Dependabot (semanal) |

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
