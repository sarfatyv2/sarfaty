# Sprint 0 — Documento de Entrega

**Versão:** 1.0  
**Data:** 12 de Fevereiro de 2026  
**Status:** Concluído  

---

## 1. Objetivo do Sprint

Construir o scaffold completo da plataforma corporativa Sarfaty com excelência em arquitetura e padrões de código. Ao final deste sprint, qualquer desenvolvedor consegue pegar um módulo de negócio e construir sobre a base pronta, sem precisar tomar decisões de infra.

**Entrega funcional:**
- Login via Supabase Auth (sem signup público)
- Sidebar adaptativa que muda por role do usuário
- Health check endpoint na API
- Toda a infraestrutura cross-cutting pronta (guards, filters, interceptors, logger, correlation ID)
- 16 tabelas do módulo People espelhadas em Drizzle ORM schemas
- CI verificando types, lint e testes
- Testes unitários passando

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Monorepo | Turborepo + pnpm workspaces | Turbo 2.x, pnpm 9.x |
| Runtime | Node.js | 22 LTS |
| Linguagem | TypeScript (strict mode) | 5.7+ |
| Backend | NestJS + Fastify | NestJS 10.x |
| Frontend | Next.js (App Router) | 15.x |
| UI | React + Tailwind CSS + shadcn/ui | React 19 |
| ORM | Drizzle ORM | 0.38+ |
| Banco de dados | Supabase (PostgreSQL 15+) | Cloud |
| Autenticação | Supabase Auth | JWT + Refresh Tokens |
| Validação | Zod | 3.24+ |
| Logging | Pino (structured) | 9.x |
| Testes | Vitest | 2.x |
| CI | GitHub Actions | — |

---

## 3. Estrutura do Monorepo

```
sarfaty/
├── apps/
│   ├── api/                        # Backend NestJS + Fastify
│   └── web-backoffice/             # Frontend Next.js 15
├── packages/
│   ├── config/                     # TSconfigs, ESLint, Tailwind preset
│   ├── types/                      # Tipos, DomainException, ROLE_PERMISSIONS
│   ├── validators/                 # Schemas Zod compartilhados
│   ├── utils/                      # Formatters, assertions, constants
│   └── ui/                         # Design system (shadcn/ui)
├── docs/                           # Documentação do projeto
├── .github/workflows/ci.yml        # Pipeline de CI
├── turbo.json                      # Pipeline do Turborepo
├── pnpm-workspace.yaml             # Configuração de workspaces
└── package.json                    # Root scripts
```

**Total de arquivos de código criados:** ~126

---

## 4. Packages Compartilhados

### 4.1 `@nexus/config`

Configurações base reutilizadas por todos os apps e packages.

| Arquivo | Descrição |
|---------|-----------|
| `typescript/base.json` | TSconfig strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`) |
| `typescript/nestjs.json` | Extends base + `emitDecoratorMetadata`, `experimentalDecorators`, `CommonJS` |
| `typescript/nextjs.json` | Extends base + JSX preserve, DOM libs, `noEmit` |
| `eslint/base.js` | Regras base: zero `any`, consistent-type-imports, no-console warn |
| `eslint/nestjs.js` | Extends base + `no-floating-promises` |
| `eslint/nextjs.js` | Extends base + `next/core-web-vitals` |
| `tailwind/preset.ts` | Cores da marca Sarfaty, fonte Inter |

### 4.2 `@nexus/types`

Tipos centrais da plataforma. Todos os apps importam daqui.

| Arquivo | Exports |
|---------|---------|
| `roles.ts` | `ROLES` (18 roles: `sales_rep`, `admin`, `hr`, `credit_analyst`, etc.), tipo `Role` |
| `profile.ts` | Interface `Profile` |
| `collaborator.ts` | Interface `Collaborator`, tipos `EmploymentType`, `BankAccountType` |
| `exceptions.ts` | Classe abstrata `DomainException` com `code`, `httpStatus`, `metadata` |
| `api.ts` | `ApiResponse<T>`, `ApiErrorResponse`, `PaginatedResponse<T>`, `PaginationMeta` |
| `permissions.ts` | `ROLE_PERMISSIONS` — mapa completo com sidebar, dashboardModules, clientTabs, clientActions, globalActions e notifications para cada um dos 18 roles |

**Os 18 roles definidos:**
`sales_rep`, `sales_supervisor`, `sales_manager`, `sales_director`, `credit_analyst`, `compliance_officer`, `approver`, `backoffice`, `legal`, `risk_manager`, `recovery`, `litigation`, `employee`, `people_manager`, `hr`, `dp`, `hr_admin`, `admin`

### 4.3 `@nexus/validators`

Schemas Zod compartilhados entre frontend e backend.

| Arquivo | Schemas exportados |
|---------|-------------------|
| `common.ts` | `emailSchema`, `cpfSchema`, `cnpjSchema`, `phoneSchema`, `uuidSchema`, `dateStringSchema` |
| `auth.schema.ts` | `loginSchema` → tipo `LoginDto` |
| `pagination.schema.ts` | `paginationQuerySchema` → tipo `PaginationQueryDto` |
| `collaborator.schema.ts` | `createCollaboratorSchema`, `updateCollaboratorSchema` → tipos inferidos |

### 4.4 `@nexus/utils`

Funções utilitárias puras.

| Arquivo | Exports |
|---------|---------|
| `format.ts` | `formatCPF`, `formatCNPJ`, `formatCurrency` (BRL), `formatDate` (dd/MM/yyyy), `formatPhone` |
| `assertions.ts` | `assertNever` (exhaustiveness check), `assertDefined` (null guard) |
| `constants.ts` | `EMPLOYMENT_TYPES`, `REIMBURSEMENT_CATEGORIES`, `REIMBURSEMENT_STATUSES`, `MOVEMENT_TYPES`, `PJ_INVOICE_STATUSES`, `DEPENDENT_RELATIONSHIPS`, `DOCUMENT_TYPES` — todos como `as const` |
| `permissions.ts` | `canPerformAction`, `canAccessTab`, `canPerformGlobalAction` |

### 4.5 `@nexus/ui`

Design system mínimo viável baseado em shadcn/ui.

| Componente | Variantes |
|-----------|-----------|
| `Button` | default, destructive, outline, secondary, ghost, link / sm, default, lg, icon |
| `Input` | — |
| `Label` | — |
| `Card` | Card, CardHeader, CardTitle, CardDescription, CardContent |
| `Badge` | default, secondary, destructive, outline |
| `Avatar` | Avatar, AvatarImage, AvatarFallback |
| `Separator` | horizontal, vertical |
| `Skeleton` | — |
| `cn()` | Utility `clsx` + `tailwind-merge` |

---

## 5. API Backend (`apps/api`)

### 5.1 Bootstrap

- **Framework:** NestJS com `FastifyAdapter` (2-3x mais rápido que Express)
- **Logger:** Pino integrado via `nestjs-pino` (JSON estruturado, `pino-pretty` em dev)
- **Swagger:** Disponível em `/api/docs`
- **Global prefix:** `/api`
- **CORS:** Configurável via env `CORS_ORIGINS`
- **Graceful shutdown:** `app.enableShutdownHooks()`
- **Env validation:** Zod valida todas as envs no boot — app não sobe se env estiver inválida

### 5.2 Variáveis de Ambiente

```
NODE_ENV          development | production | test
PORT              4000 (default)
DATABASE_URL      Connection string do Supabase
SUPABASE_URL      URL do projeto Supabase
SUPABASE_ANON_KEY Chave anon (pública)
SUPABASE_SERVICE_ROLE_KEY  Chave service_role (secreta)
CORS_ORIGINS      http://localhost:3000
```

### 5.3 Infraestrutura Cross-Cutting

Tudo que qualquer módulo futuro vai usar, já pronto:

| Tipo | Arquivo | Responsabilidade |
|------|---------|-----------------|
| **Guard** | `auth.guard.ts` | Valida JWT do Supabase via `supabase.auth.getUser(token)` |
| **Guard** | `roles.guard.ts` | Verifica se o role do user está na lista via `@Roles('admin', 'hr')` |
| **Guard** | `rbac.guard.ts` | Verifica actions específicas via `@RequireActions('approve_credit')` usando `ROLE_PERMISSIONS` |
| **Decorator** | `@Public()` | Marca endpoint como público (bypass do AuthGuard) |
| **Decorator** | `@Roles()` | Define quais roles acessam o endpoint |
| **Decorator** | `@RequireActions()` | Define quais actions são necessárias |
| **Decorator** | `@CurrentUser()` | Extrai o user autenticado do request |
| **Filter** | `domain-exception.filter.ts` | Captura `DomainException` e retorna `{ error: { code, message, statusCode, correlationId, timestamp } }` |
| **Interceptor** | `logging.interceptor.ts` | Loga `method`, `url`, `statusCode`, `duration`, `correlationId` |
| **Interceptor** | `timeout.interceptor.ts` | Timeout de 30s por request |
| **Middleware** | `correlation-id.middleware.ts` | Gera UUID v4, seta `X-Correlation-ID` no header, disponibiliza via `AsyncLocalStorage` |
| **Pipe** | `zod-validation.pipe.ts` | Valida body/query/params com schema Zod |

### 5.4 Módulo Auth

Endpoints implementados:

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/login` | Login com email + senha | Público |
| POST | `/api/auth/refresh` | Refresh do token | Público |
| GET | `/api/auth/me` | Retorna profile do user logado | Autenticado |

**Arquitetura DDD leve:**
```
modules/auth/
├── auth.module.ts
├── controllers/
│   └── auth.controller.ts
├── use-cases/
│   ├── login.use-case.ts          # supabase.auth.signInWithPassword
│   ├── refresh-token.use-case.ts  # supabase.auth.refreshSession
│   └── get-profile.use-case.ts    # SELECT FROM profiles
└── domain/
    └── exceptions/
        ├── invalid-credentials.exception.ts  # code: INVALID_CREDENTIALS, 401
        └── session-expired.exception.ts      # code: SESSION_EXPIRED, 401
```

### 5.5 Módulo Health

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/health` | Status da API + DB ping | Público |

Retorna: `{ data: { status, version, uptime, database, timestamp } }`

### 5.6 Drizzle ORM — 16 Schemas

Cada tabela do Supabase tem um schema correspondente em `apps/api/src/database/schema/`:

| # | Schema | Tabela | Relacionamentos |
|---|--------|--------|-----------------|
| 1 | `profiles.ts` | `profiles` | PK `id` (uuid, ref `auth.users`) |
| 2 | `collaborators.ts` | `collaborators` | FK `profile_id` → profiles, self-ref `manager_id` |
| 3 | `collaborator-clt-data.ts` | `collaborator_clt_data` | 1:1 FK → collaborators |
| 4 | `collaborator-pj-data.ts` | `collaborator_pj_data` | 1:1 FK → collaborators |
| 5 | `collaborator-dependents.ts` | `collaborator_dependents` | FK → collaborators |
| 6 | `collaborator-compensation.ts` | `collaborator_compensation` | FK → collaborators, FK → profiles |
| 7 | `collaborator-documents.ts` | `collaborator_documents` | FK → collaborators, FK → profiles |
| 8 | `range-tenure.ts` | `range_tenure` | Lookup table |
| 9 | `range-age.ts` | `range_age` | Lookup table |
| 10 | `reimbursements.ts` | `reimbursements` | FK → collaborators, FK → profiles |
| 11 | `pj-invoices.ts` | `pj_invoices` | FK → collaborators, FK → profiles |
| 12 | `onboarding-templates.ts` | `onboarding_templates` | Standalone |
| 13 | `onboarding-tasks.ts` | `onboarding_tasks` | FK → collaborators, FK → onboarding_templates |
| 14 | `performance-review-cycles.ts` | `performance_review_cycles` | Standalone |
| 15 | `performance-reviews.ts` | `performance_reviews` | FK → cycles, FK → collaborators, FK → profiles |
| 16 | `medical-plan-entries.ts` | `medical_plan_entries` | FK → collaborators |

**Database module:** `DatabaseModule` é `@Global()` e provê o Drizzle `db` instance via DI (`@Inject(DRIZZLE)`).

### 5.7 Testes

| Tipo | Arquivo | Descrição |
|------|---------|-----------|
| Unit | `domain-exception.spec.ts` | Testa hierarquia de exceções (3 testes) |
| E2E | `health.e2e-spec.ts` | Testa GET /api/health (skip sem DB real) |
| Factory | `profile.factory.ts` | Factory de Profile para testes |
| Helper | `create-test-app.ts` | Cria NestJS app para e2e |

**Runner:** Vitest (mais rápido que Jest, ESM nativo).

---

## 6. Frontend Backoffice (`apps/web-backoffice`)

### 6.1 Stack

- **Next.js 15** com App Router
- **Tailwind CSS** com design tokens via CSS variables (shadcn/ui theme)
- **Supabase SSR** (`@supabase/ssr`) para auth server-side

### 6.2 Autenticação

| Arquivo | Responsabilidade |
|---------|-----------------|
| `lib/supabase/client.ts` | Client browser (anon key, para componentes client) |
| `lib/supabase/server.ts` | Client server (cookies, para Server Components) |
| `lib/supabase/middleware.ts` | Refresh do token + redirect para `/login` se não autenticado |
| `middleware.ts` | Entry point do middleware Next.js, protege todas as rotas exceto `/login` |

**Fluxo:**
1. Usuário acessa qualquer rota
2. Middleware verifica se tem sessão ativa no Supabase
3. Se não tem → redirect para `/login`
4. Se tem → refresh do token e segue

### 6.3 Estrutura de Rotas

```
app/
├── layout.tsx                         # Root layout (Inter font, pt-BR)
├── page.tsx                           # Redirect / → /login
├── globals.css                        # Theme tokens (shadcn/ui)
├── (auth)/
│   ├── layout.tsx                     # Layout centralizado (sem sidebar)
│   └── login/page.tsx                 # Tela de login
└── (dashboard)/
    ├── layout.tsx                     # Layout com Sidebar + Header + auth guard
    ├── admin/overview/page.tsx        # Dashboard do admin
    ├── overview/page.tsx              # Dashboard genérico
    └── [...slug]/page.tsx             # Catch-all "Módulo em construção"
```

### 6.4 Sidebar Adaptativa

A sidebar é um Server Component que recebe o `role` do usuário logado e renderiza os menus com base no `ROLE_PERMISSIONS` de `@nexus/types`.

**Como funciona:**
1. `(dashboard)/layout.tsx` busca o user via `supabase.auth.getUser()`
2. Extrai `role` dos `user_metadata`
3. Passa `role` para `<Sidebar role={role} />`
4. Sidebar consulta `ROLE_PERMISSIONS[role].sidebar` e renderiza as seções
5. Ícones dinâmicos via `lucide-react`
6. Item ativo destacado com base no `pathname`

**Cada role vê menus diferentes.** Ex: `admin` vê Sistema + Configurações + Auditoria. `sales_rep` vê Comercial. `credit_analyst` vê Crédito + Monitoramento.

### 6.5 Header

- Avatar com iniciais do nome
- Badge com o label do role
- Botão de logout

### 6.6 Login

- Form com email + senha
- Validação client-side
- Chama `supabase.auth.signInWithPassword()`
- Redirect para `ROLE_PERMISSIONS[role].homeRoute` (cada role tem sua home)

---

## 7. Banco de Dados (Supabase)

### 7.1 Tabelas Criadas

16 tabelas + 1 view + 2 triggers criados via migrations no Supabase:

**Trigger automático:** Quando um usuário é criado no `auth.users`, o trigger `on_auth_user_created` cria automaticamente um registro em `profiles` com os dados do `user_metadata` (full_name, email, role).

**View:** `collaborators_with_computed` calcula `years_at_company` e `age_years` dinamicamente (campos que dependem de `CURRENT_DATE` e não podem ser `GENERATED ALWAYS AS STORED`).

### 7.2 Cadeia de Dados

```
auth.users (Supabase Auth)
    ↓ trigger on_auth_user_created
profiles (id = auth.users.id)
    ↓ collaborators.profile_id
collaborators
    ↓ tabelas dependentes (clt_data, pj_data, dependents, compensation, documents, etc.)
```

### 7.3 Gestão de Usuários

**Não existe signup público.** Todo acesso é criado por admin ou RH. O signup do Supabase Auth está desabilitado. A criação será via endpoint NestJS `POST /api/users` (Sprint 1+).

---

## 8. CI/CD

### GitHub Actions (`.github/workflows/ci.yml`)

- **Trigger:** Push/PR para `main` e `develop`
- **Node:** 22
- **Cache:** pnpm store + turbo cache
- **Steps:** `pnpm install` → `turbo typecheck` → `turbo lint` → `turbo test`
- **Concorrência:** Cancela runs anteriores do mesmo branch

---

## 9. Padrões de Código Estabelecidos

### 9.1 TypeScript

- `strict: true` em todos os packages
- `noUncheckedIndexedAccess: true` nos packages compartilhados
- `exactOptionalPropertyTypes: true` nos packages compartilhados
- `skipLibCheck: true` nos apps (necessário por incompatibilidade com libs externas)
- Zero `any` — CI deve quebrar

### 9.2 Exceções

Hierarquia tipada via `DomainException`:

```typescript
DomainException (abstract)
├── InvalidCredentialsException   // code: INVALID_CREDENTIALS, 401
├── SessionExpiredException       // code: SESSION_EXPIRED, 401
└── ... (futuras exceções de domínio)
```

O `DomainExceptionFilter` global converte para response padronizada com `correlationId`.

### 9.3 API Response

Toda response segue:

```typescript
// Sucesso
{ data: T }

// Erro
{ error: { code, message, statusCode, correlationId, timestamp, metadata? } }

// Paginação
{ data: T[], pagination: { total, page, pageSize, totalPages } }
```

### 9.4 Logging

- Pino com JSON estruturado
- Correlation ID automático em cada request
- Zero `console.log`

### 9.5 Cursor Rules

10 regras criadas em `.cursor/rules/` para enforçar padrões:

| Rule | Escopo |
|------|--------|
| `project-overview.mdc` | Contexto geral do projeto |
| `git-conventions.mdc` | Conventional Commits, branching |
| `monorepo-structure.mdc` | Organização de packages e apps |
| `api-conventions.mdc` | Padrões de resposta, versionamento |
| `database-drizzle.mdc` | Padrões do Drizzle ORM |
| `error-handling.mdc` | Hierarquia de exceções |
| `nestjs-architecture.mdc` | DDD leve, módulos NestJS |
| `nextjs-frontend.mdc` | App Router, Server Components |
| `testing-standards.mdc` | Vitest, factories, e2e |
| `typescript-standards.mdc` | Strict mode, naming conventions |

---

## 10. Usuário de Teste

| Campo | Valor |
|-------|-------|
| Email | `admin@sarfaty.com` |
| Senha | `Sarfaty@2026` |
| Role | `admin` |
| Profile criado | Sim (via trigger automático) |

---

## 11. Como Rodar Localmente

```bash
# Pré-requisitos: Node 22, pnpm 9+

# 1. Instalar dependências
pnpm install

# 2. Criar .env.local em apps/web-backoffice/ com:
#    NEXT_PUBLIC_SUPABASE_URL=...
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 3. Frontend (porta 3000)
pnpm --filter web-backoffice dev

# 4. API (porta 4000) — requer DATABASE_URL e SUPABASE_SERVICE_ROLE_KEY
pnpm --filter api dev

# 5. Typecheck global
npx turbo typecheck

# 6. Testes
pnpm --filter api test
```

---

## 12. O que NÃO entrou no Sprint 0

| Item | Sprint planejado |
|------|-----------------|
| Módulos de negócio (People CRUD, Commercial, Credit) | Sprint 1+ |
| RLS policies no banco | Sprint 1 (junto com módulos) |
| Endpoint de criação de usuários (`POST /api/users`) | Sprint 1 |
| Temporal.io setup | Sprint 2+ |
| Redis / BullMQ | Sprint 2+ |
| Workers Python | Fase futura |
| `web-client` (portal do cliente) | Sprint 2+ |
| Deploy (Vercel, Railway) | Sprint 1 |
| OpenTelemetry / Prometheus | Sprint 2+ (Pino logger já está) |
| Testes de integração com DB real | Sprint 1 |
| DataTable, Kanban e componentes complexos de UI | Sprint 1+ |
