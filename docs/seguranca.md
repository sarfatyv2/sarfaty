# Seguranca — Plataforma Sarfaty

**Versao:** 1.0  
**Data:** 14 de Fevereiro de 2026  
**Status:** Implementado  

---

## 1. Visao Geral

A plataforma Sarfaty adota uma estrategia de seguranca em multiplas camadas, combinando analise estatica (SAST), analise dinamica (DAST), scanning de dependencias (SCA), secret scanning, hardening de aplicacao e Row Level Security no banco de dados. O objetivo e proteger dados sensiveis de clientes, colaboradores e operacoes financeiras em todas as camadas da stack.

### 1.1 Principios

- **Defense in Depth**: multiplas camadas independentes de protecao
- **Least Privilege**: usuarios e servicos so acessam o que precisam
- **Shift Left**: seguranca integrada no CI/CD, nao apenas em producao
- **Zero Trust na camada de dados**: RLS no PostgreSQL como ultima barreira

---

## 2. Arquitetura de Seguranca

```
+------------------+    +-------------------+    +------------------+
|   Pre-Commit     |    |   CI/CD Pipeline  |    |   Periodico      |
|  (Local Dev)     |    |  (Push / PR)      |    |  (Semanal)       |
+------------------+    +-------------------+    +------------------+
| Husky + Gitleaks |    | Semgrep (SAST)    |    | CodeQL (SAST)    |
| (secret scan)    |    | CodeQL (SAST)     |    | OWASP ZAP (DAST) |
|                  |    | Gitleaks (secrets) |    | Dependabot (SCA) |
|                  |    | pnpm audit (SCA)  |    |                  |
|                  |    | ESLint Security   |    |                  |
+------------------+    +-------------------+    +------------------+
                               |
                               v
                    +---------------------+
                    | GitHub Security Tab |
                    | (SARIF + Advisors)  |
                    +---------------------+

+----------------------------------------------------------+
|                  Application Layer                         |
+----------------------------------------------------------+
| NestJS API:                                               |
|   - @fastify/helmet (HTTP security headers)               |
|   - @nestjs/throttler (rate limiting: 100 req/min)        |
|   - AuthGuard global (JWT via Supabase)                   |
|   - RbacGuard global (RBAC por action)                    |
|   - ZodValidationPipe (validacao por rota)                |
|   - AuditInterceptor (trail de auditoria)                 |
|   - CORS restrito por env var                             |
|                                                           |
| Next.js Frontend:                                         |
|   - Security headers (HSTS, X-Frame-Options, CSP, etc.)  |
|   - poweredByHeader: false                                |
+----------------------------------------------------------+

+----------------------------------------------------------+
|                   Database Layer                          |
+----------------------------------------------------------+
| Supabase PostgreSQL:                                      |
|   - RLS habilitado em 100% das tabelas (36/36)           |
|   - 70+ policies ativas                                  |
|   - Funcoes com search_path fixo                         |
|   - Backend usa service_role (bypass RLS)                |
|   - Frontend usa anon key (RLS ativo)                    |
+----------------------------------------------------------+
```

---

## 3. SAST (Static Application Security Testing)

### 3.1 Semgrep

**Arquivo:** `.github/workflows/security.yml` (job `sast`)

Semgrep roda em cada push e PR, analisando o codigo com as seguintes rulesets:

- `p/typescript` — vulnerabilidades especificas de TypeScript
- `p/javascript` — vulnerabilidades JS genericas
- `p/nodejs` — problemas comuns do Node.js (path traversal, SSRF, etc.)
- `p/owasp-top-ten` — cobertura das 10 principais vulnerabilidades OWASP

**O que detecta:**
- SQL injection
- XSS (cross-site scripting)
- Path traversal
- Insecure crypto
- Command injection
- SSRF (Server-Side Request Forgery)
- Hardcoded secrets

Os resultados sao exportados em formato SARIF e aparecem na aba **Security** do GitHub.

### 3.2 CodeQL

**Arquivo:** `.github/workflows/codeql.yml`

CodeQL e a ferramenta nativa do GitHub para analise de seguranca. Roda:
- Em cada push/PR para `main` e `develop`
- Semanalmente (segunda-feira, 4h AM UTC)

Configurado com `security-extended` queries para cobertura maxima em JavaScript/TypeScript.

### 3.3 ESLint Security Plugins

**Arquivo:** `packages/config/eslint/base.js`

Dois plugins adicionados ao config base compartilhado (aplicado em todos os apps e packages):

| Plugin | Funcao |
|--------|--------|
| `eslint-plugin-security` | Detecta patterns inseguros: `eval()`, `child_process`, non-literal `require()`, `RegExp` inseguro, `Buffer()` deprecated |
| `eslint-plugin-no-secrets` | Detecta strings que parecem secrets hardcoded (API keys, tokens, passwords) |

Configuracao relevante:
- `security/recommended-legacy` — todas as regras recomendadas
- `security/detect-object-injection` — desabilitado (muitos falsos positivos em TS)
- `no-secrets/no-secrets` — nivel `error`

---

## 4. DAST (Dynamic Application Security Testing)

### 4.1 OWASP ZAP Full (Authenticated)

**Arquivo:** `.github/workflows/dast.yml`

OWASP ZAP (Zed Attack Proxy) e o scanner DAST mais utilizado no mundo. Configurado para:
- **Schedule semanal:** segunda-feira, 3h AM UTC
- **Dispatch manual:** via GitHub Actions com URL customizada
- **Scan autenticado obrigatorio:** token JWT valido obtido via `scripts/zap-auth.js`

O full scan autenticado faz spider + active/passive scan, detectando:
- Missing security headers
- Cookies inseguros (sem HttpOnly, Secure, SameSite)
- Information disclosure
- Configuracoes incorretas de CORS
- Vulnerabilidades de JS conhecidas

**Regras customizadas:** `.zap/rules.tsv` define severidade por finding.

**Pre-requisitos obrigatorios:**
- configurar a variable `STAGING_URL` no repositorio GitHub (Settings > Variables)
- configurar `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` em GitHub Secrets
- workflow falha quando autenticacao nao e obtida (sem fallback para scan anonimo)

---

## 5. Scanning de Dependencias (SCA)

### 5.1 pnpm audit

**Arquivo:** `.github/workflows/security.yml` (job `dependency-audit`)

Roda `pnpm audit --audit-level=high` em cada push/PR. Identifica dependencias com CVEs conhecidos e falha o job para severidade alta/critica.

### 5.2 Dependabot

**Arquivo:** `.github/dependabot.yml`

Configurado para:
- **npm:** verifica semanalmente (segunda, 8h BRT), abre ate 10 PRs
- **GitHub Actions:** verifica semanalmente para manter actions atualizadas
- PRs agrupadas por tipo (production vs development dependencies)
- Labels automaticas: `dependencies`, `security`
- Commits seguem o padrao: `chore(deps): ...`

---

## 6. Secret Scanning

### 6.1 Gitleaks no CI

**Arquivo:** `.github/workflows/security.yml` (job `secrets`)

Gitleaks analisa todo o historico git em busca de secrets vazados:
- API keys
- Tokens de autenticacao
- Passwords hardcoded
- Private keys
- Connection strings

Roda com `fetch-depth: 0` para escanear todo o historico de commits.

### 6.2 Pre-commit Hook Local

**Arquivo:** `.husky/pre-commit`

Husky executa `gitleaks protect --staged` antes de cada commit, bloqueando o commit se detectar secrets nos arquivos staged.

**Instalacao para devs:**
```bash
# macOS
brew install gitleaks

# Linux
sudo apt install gitleaks
# ou
go install github.com/gitleaks/gitleaks/v8@latest
```

O hook e ativado automaticamente ao rodar `pnpm install` (via script `prepare`).

---

## 7. Hardening da Aplicacao

### 7.1 HTTP Security Headers (API)

**Arquivo:** `apps/api/src/main.ts`  
**Pacote:** `@fastify/helmet`

Helmet adiciona automaticamente os seguintes headers:

| Header | Valor | Protecao |
|--------|-------|----------|
| `X-Content-Type-Options` | `nosniff` | Previne MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Previne clickjacking |
| `X-DNS-Prefetch-Control` | `off` | Controla DNS prefetch |
| `X-Download-Options` | `noopen` | Previne download automatico (IE) |
| `X-Permitted-Cross-Domain-Policies` | `none` | Bloqueia Flash/PDF cross-domain |
| `Referrer-Policy` | `no-referrer` | Controla informacao de referrer |
| `Content-Security-Policy` | Padrao Helmet | Previne XSS (habilitado em producao) |

CSP e desabilitado em desenvolvimento para nao interferir com Swagger UI e hot-reload.

### 7.1.1 Swagger em Producao

`/api/docs` e publicado apenas fora de producao (`NODE_ENV !== production`) para reduzir exposicao operacional.

### 7.2 HTTP Security Headers (Frontend)

**Arquivo:** `apps/web-backoffice/next.config.ts`

Headers customizados aplicados a todas as rotas (`/(.*)`):

| Header | Valor |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` |
| `X-XSS-Protection` | `1; mode=block` |
| `X-DNS-Prefetch-Control` | `on` |

Alem disso, `poweredByHeader: false` remove o header `X-Powered-By: Next.js`.

### 7.3 Rate Limiting

**Arquivo:** `apps/api/src/app.module.ts`  
**Pacote:** `@nestjs/throttler`

Configuracao global:
- **TTL:** 60 segundos
- **Limit:** 100 requisicoes por IP por janela

O `ThrottlerGuard` e registrado como `APP_GUARD`, protegendo todas as rotas automaticamente. Para rotas que precisam de limites diferentes, usar o decorator `@Throttle()`.

Rotas de autenticacao possuem throttling dedicado:
- `POST /api/auth/login` -> `5 req/min`
- `POST /api/auth/refresh` -> `10 req/min`

### 7.4 Autenticacao e Autorizacao

**Fluxo de guards (ordem de execucao):**

```
Request
  |
  v
AuthGuard (JWT validation via Supabase)
  |
  v
ThrottlerGuard (rate limiting)
  |
  v
RbacGuard (RBAC por action via @RequireActions)
  |
  v
Controller
```

| Guard | Arquivo | Funcao |
|-------|---------|--------|
| `AuthGuard` | `apps/api/src/common/guards/auth.guard.ts` | Valida JWT Bearer token via `supabaseAdmin.auth.getUser()`. Rotas `@Public()` sao isentas. |
| `ThrottlerGuard` | `@nestjs/throttler` | Limita requisicoes por IP. |
| `RbacGuard` | `apps/api/src/common/guards/rbac.guard.ts` | Verifica se o role do usuario tem permissao para a action requerida via `@RequireActions()`. Usa `ROLE_PERMISSIONS` de `@nexus/types`. |

**Rotas publicas (sem autenticacao):**
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/health`

### 7.5 Validacao de Input

Validacao via `ZodValidationPipe` aplicado por rota com schemas de `@nexus/validators`:

```typescript
@Body(new ZodValidationPipe(createClientSchema)) dto: CreateClientDto
```

Os schemas Zod sao compartilhados entre frontend e backend via `packages/validators`.

### 7.5.1 Validacao de Upload por Assinatura de Arquivo

Uploads criticos (People e Learning) validam:
- tamanho maximo permitido
- `mimetype` informado
- **assinatura binaria real (magic bytes)** para PDF/JPEG/PNG/WebP

Arquivos com assinatura invalida ou mismatch entre `mimetype` e conteudo sao rejeitados.

### 7.5.2 Resiliencia em Integracoes Externas

Integracoes externas (Vadu, CreditBox e BrasilAPI) usam:
- timeout por request (AbortController)
- retry com backoff para falhas transientes (5xx/429)
- limite maximo de tentativas para evitar loops

### 7.6 CORS

**Arquivo:** `apps/api/src/main.ts`

```typescript
app.enableCors({ origin: env.CORS_ORIGINS.split(','), credentials: true });
```

Origins controladas pela env var `CORS_ORIGINS`. Em desenvolvimento: `http://localhost:3000`. Em producao: dominio(s) do frontend.

---

## 8. Seguranca do Banco de Dados

### 8.1 Row Level Security (RLS)

**100% das tabelas publicas possuem RLS habilitado (36/36).**

As policies seguem 3 padroes:

#### Tabelas de Referencia (read-only para authenticated)
Tabelas de lookup que todos os usuarios autenticados precisam ler:

| Tabela | Policy |
|--------|--------|
| `regions` | `authenticated_read_regions` |
| `teams` | `authenticated_read_teams` |
| `segments` | `authenticated_read_segments` |
| `credit_products` | `authenticated_read_credit_products` |
| `guarantee_types` | `authenticated_read_guarantee_types` |
| `learning_courses` | `authenticated_read_learning_courses` |
| `learning_modules` | `authenticated_read_learning_modules` |
| `learning_lessons` | `authenticated_read_learning_lessons` |
| `onboarding_templates` | `authenticated_read_onboarding_templates` |
| `performance_review_cycles` | `authenticated_read_performance_review_cycles` |
| `cnae_segment_mapping` | `authenticated_read_cnae_segment_mapping` |
| `segment_document_templates` | `authenticated_read_segment_document_templates` |
| `product_document_templates` | `authenticated_read_product_document_templates` |
| `range_tenure` | `authenticated_read_range_tenure` |
| `range_age` | `authenticated_read_range_age` |
| `guarantee_document_templates` | `authenticated_read_guarantee_document_templates` |

#### Tabelas User-Scoped (acesso ao proprio dado)
Usuarios so acessam seus proprios registros:

| Tabela | Coluna de Scoping | Operacoes |
|--------|--------------------|-----------|
| `profiles` | `id = auth.uid()` | SELECT, UPDATE |
| `onboarding_tasks` | `collaborator_id = auth.uid()` | SELECT |
| `pj_invoices` | `collaborator_id = auth.uid()` | SELECT, INSERT |
| `medical_plan_entries` | `collaborator_id = auth.uid()` | SELECT |
| `reimbursements` | `collaborator_id = auth.uid()` | SELECT, INSERT |
| `performance_reviews` | `collaborator_id = auth.uid()` | SELECT |
| `learning_enrollments` | `collaborator_id = auth.uid()` | SELECT, INSERT |
| `learning_lesson_completions` | via `enrollment_id` join | SELECT, INSERT |
| `audit_logs` | `actor_id = auth.uid()` | SELECT |

#### Tabelas com RBAC por Role (modulo comercial e people)
Policies granulares baseadas no role do usuario:

- **clients**: `sales_rep` ve so seus clientes; `sales_supervisor` ve do time; `sales_manager` ve da regiao; `sales_director`/`admin` ve tudo
- **collaborators**: `hr`/`dp`/`admin` ve tudo; `people_manager` ve do time; usuario ve a si mesmo
- **collaborator_***: idem, com policies especificas por sub-tabela

### 8.2 Funcoes SQL

Todas as funcoes do schema `public` possuem `search_path` fixado:

| Funcao | Proposito |
|--------|-----------|
| `get_my_role()` | Retorna o role do usuario autenticado |
| `get_my_team_id()` | Retorna o team_id do usuario |
| `get_my_region_id()` | Retorna o region_id do usuario |
| `can_submit_for_analysis(uuid)` | Verifica se cliente pode ser submetido para analise |
| `get_document_checklist(uuid)` | Retorna checklist de documentos do cliente |

Fixar o `search_path` previne ataques de search_path hijacking, onde um usuario malicioso poderia criar objetos em outro schema para interceptar chamadas de funcao.

### 8.3 Modelo de Acesso

```
Frontend (anon key)  -->  PostgREST  -->  RLS filtra dados
                                          (policies aplicadas)

Backend (service_role)  -->  Drizzle ORM  -->  RLS ignorado (bypass)
                                               Permissoes via AuthGuard + RbacGuard
```

- O **frontend** usa a `anon key` e o RLS filtra automaticamente.
- O **backend** usa a `service_role key` (bypass RLS) e aplica permissoes via guards no NestJS.

---

## 9. Variáveis de Ambiente e Secrets

### 9.1 Validacao

**Arquivo:** `apps/api/src/config/env.ts`

Todas as env vars sao validadas via Zod no bootstrap da API. Se alguma estiver faltando ou invalida, a aplicacao nao inicia:

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});
```

### 9.2 Boas Praticas

- `.env.local` nunca e commitado (no `.gitignore`)
- `.env.example` commitado com todas as variaveis sem valores
- Gitleaks bloqueia commits com secrets tanto no CI quanto localmente
- Em producao, usar o gerenciador de secrets do provedor de hosting

---

## 10. Audit Trail

Documentado separadamente em `docs/audit_trail.md`. Resume:

- Interceptor global `AuditInterceptor` registra acoes marcadas com `@Auditable()`
- Tabela `audit_logs` append-only com RLS
- Campos: `actor_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `payload`, `metadata` (IP, user-agent)
- Correlacao via `correlation_id` (header `X-Correlation-ID`)

---

## 11. Workflows de CI/CD

### 11.1 Pipeline de Seguranca

| Workflow | Arquivo | Trigger | Jobs |
|----------|---------|---------|------|
| **Security** | `.github/workflows/security.yml` | Push/PR em main/develop | `sast` (Semgrep), `secrets` (Gitleaks), `dependency-audit` (pnpm audit) |
| **CodeQL** | `.github/workflows/codeql.yml` | Push/PR em main/develop + semanal | `analyze` (CodeQL SAST) |
| **DAST** | `.github/workflows/dast.yml` | Semanal + manual dispatch | `zap-baseline` (OWASP ZAP) |

### 11.2 Pipeline Existente

| Workflow | Arquivo | Trigger | Jobs |
|----------|---------|---------|------|
| **CI** | `.github/workflows/ci.yml` | Push/PR em main/develop | `ci` (typecheck, lint com plugins de seguranca, test) |

### 11.3 Dependabot

**Arquivo:** `.github/dependabot.yml`

- Verifica npm e GitHub Actions semanalmente
- Abre PRs automaticos com labels `dependencies` e `security`
- Commits no formato `chore(deps): ...`

---

## 12. Checklist para Novos Desenvolvedores

1. **Instalar gitleaks:** `brew install gitleaks`
2. **Rodar `pnpm install`** (ativa husky automaticamente)
3. **Nunca commitar secrets** — o pre-commit hook bloqueia, mas verificar antes
4. **Usar `@RequireActions()` em novos endpoints** que precisam de permissao especifica
5. **Usar `ZodValidationPipe` em todo `@Body()`** — nunca confiar em input do usuario
6. **Novas tabelas Supabase devem ter RLS habilitado** e policies configuradas
7. **Nunca expor a `service_role key`** no frontend ou em logs
8. **Testar localmente com `pnpm lint`** — os plugins de seguranca rodam no lint

---

## 13. Acoes Manuais Pendentes

| Acao | Onde | Prioridade |
|------|------|-----------|
| Habilitar Leaked Password Protection | Supabase Dashboard > Authentication > Providers > Email | Alta |
| Configurar `STAGING_URL` como variable do repositorio | GitHub > Settings > Variables | Media (necessario para DAST semanal) |
| Configurar `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` para DAST autenticado | GitHub > Settings > Secrets and variables > Actions | Alta |
| Avaliar Content Security Policy (CSP) para o frontend | `apps/web-backoffice/next.config.ts` | Baixa (requer mapear todos os dominios externos) |

---

## 14. Ferramentas e Dependencias de Seguranca

| Pacote/Ferramenta | Versao | Escopo | Tipo |
|-------------------|--------|--------|------|
| `@fastify/helmet` | latest | `apps/api` | Dependency |
| `@nestjs/throttler` | latest | `apps/api` | Dependency |
| `eslint-plugin-security` | latest | `packages/config` | DevDependency |
| `eslint-plugin-no-secrets` | latest | `packages/config` | DevDependency |
| `husky` | ^9.x | root | DevDependency |
| Semgrep | CI container | GitHub Actions | CI |
| CodeQL | GitHub native | GitHub Actions | CI |
| Gitleaks | CI + local | GitHub Actions + Husky | CI + Local |
| OWASP ZAP | CI action | GitHub Actions | CI |
| Dependabot | GitHub native | GitHub | Automatico |

---

## 15. Checklist de Release Seguro

Antes de merge para `main`/`develop`, validar:

1. **SAST/SCA/Secrets**
   - Security workflow verde (`Semgrep`, `Gitleaks`, `pnpm audit`)
   - CodeQL sem findings abertas de severidade alta/critica
2. **DAST**
   - ZAP autenticado executado com sucesso no ambiente alvo
   - Sem findings bloqueantes conforme threshold do workflow
3. **Auth e autorizacao**
   - Endpoints novos protegidos por `AuthGuard` (ou `@Public()` justificado)
   - Permissoes por role revisadas (`@Roles` e/ou `@RequireActions`)
4. **Entrada e arquivos**
   - Input validado com Zod
   - Uploads com limite de tamanho e validacao de assinatura binaria
5. **Observabilidade segura**
   - Sem tokens/senhas/chaves em logs e audit trail
   - Correlation ID presente para rastreabilidade
6. **Integracoes externas**
   - Timeout/retry aplicados
   - Erros sem vazamento de segredo em logs
