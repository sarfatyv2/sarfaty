# Arquitetura do Sistema — Plataforma Sarfaty

**Versão:** 1.1  
**Data:** Fevereiro 2026  
**Status:** Draft  

---

## 1. Decisões Arquiteturais

### 1.1 Resumo das Decisões

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Estrutura do projeto | Monorepo (Turborepo) | Compartilha tipos, validações, configs. Deploy independente por app |
| Backend framework | NestJS (TypeScript) + Fastify | DI, módulos, guards, decorators. Fastify 2-3x mais rápido que Express, schema validation nativa |
| Frontend framework | Next.js 15 (App Router) | SSR, Server Components, middleware de auth, otimização automática |
| Banco principal | Supabase (PostgreSQL 15+) | RLS nativo, Auth, Storage, Realtime, Edge Functions, hosting managed |
| ORM | Drizzle ORM | Type-safe, SQL-first, migrations programáticas, performance superior ao Prisma |
| Validação | Zod | Schema compartilhado entre front e back via monorepo |
| Orquestração de workflows | Temporal.io | State machine durável, retries, compensações, visibilidade do fluxo |
| Filas | Supabase Queue (pgmq) + BullMQ fallback | Para jobs simples usa pgmq, para volume alto usa BullMQ com Redis |
| Workers de IA | Python (FastAPI) — fase futura | Ecossistema de IA/LLM maduro, LangChain, OCR, processamento de docs |
| Arquitetura backend | DDD leve (Controller → UseCase → Domain → Repository) | Separação de concerns, testabilidade, regras de negócio isoladas no domínio |
| HTTP adapter | Fastify (em vez de Express) | Performance 2-3x superior, schema validation nativa, melhor suporte TypeScript |
| Logging | Pino (structured logging) | JSON logs estruturados, correlation ID, performance superior ao Winston |
| Observabilidade | OpenTelemetry + Pino + Prometheus | Tracing distribuído, métricas por endpoint, structured logging |
| Comunicação inter-serviços | Events (pgmq/BullMQ) + HTTP (sincrono) | Event-driven para async, HTTP para queries síncronas |
| Cache | Redis (Upstash) | Sessões, rate limiting, cache de consultas, filas BullMQ |
| Storage de arquivos | Supabase Storage (S3) | Upload direto do frontend, RLS nos buckets, CDN integrado |
| Auth | Supabase Auth + custom RBAC | JWT, refresh tokens, MFA. RBAC via tabela profiles + RLS |
| Deploy | Vercel (frontends) + Railway/Fly.io (NestJS) + Supabase (DB) | Deploy automático, preview environments, escala automática |
| CI/CD | GitHub Actions + Turborepo | Build/test/deploy por workspace afetado, não rebuilda tudo |
| Monitoramento | Grafana Cloud + Sentry + OpenTelemetry | Métricas, logs, traces, error tracking, tracing distribuído |

### 1.2 Por que Monorepo?

Num sistema com 2 frontends (portal do cliente + backoffice), 1 API backend, e workers, o monorepo resolve problemas reais:

- **Tipos compartilhados:** O tipo `Client` é definido UMA vez e usado no frontend, backend e workers. Se muda o schema, o TypeScript quebra em compile time nos 3 lugares.
- **Validações compartilhadas:** Schemas Zod de formulários são definidos no pacote `@nexus/validators` e usados tanto no frontend (validação do form) quanto no backend (validação da API).
- **Deploy independente:** Turborepo faz build só do que mudou. Se você mexeu só no portal do cliente, só ele é redeployado.
- **Consistência:** Uma PR toca frontend + backend + tipos, e você revisa tudo junto.

### 1.3 Arquitetura do Backend — DDD Leve

O NestJS deve operar com qualidade equivalente a um Spring Boot bem feito. Isso exige 4 camadas bem definidas:

```
Controller → UseCase (Service) → Domain (Entities) → Repository (Infra)
     ↓              ↓                   ↓                    ↓
  HTTP/DTO     Orquestração      Regras de Negócio      Persistência
  Validação    Transações        Validações de          (Drizzle ORM)
  (Zod)        Eventos           Invariantes
```

**Princípios inegociáveis:**

1. **Zero `any` em todo o projeto.** TypeScript `strict: true` com regras adicionais (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). O CI deve quebrar se aparecer `any`.

2. **Domain Entities encapsulam regras de negócio.** A entidade `Client` sabe quais transições de status são válidas. O UseCase orquestra, não decide.

3. **Repository é um contrato do domínio.** A interface `ClientRepository` vive no domínio. A implementação `DrizzleClientRepository` vive na camada de infra. O domínio não sabe que Drizzle existe.

4. **Exception hierarchy tipada.** Exceções de domínio (`InvalidStatusTransitionException`, `MissingDocumentsException`) são classes com `code` e `httpStatus`. Um `ExceptionFilter` global converte para HTTP response. Zero `try/catch` nos controllers.

5. **Validação em 2 camadas.** DTOs validados por Zod (shape dos dados). Domain entities validam invariantes de negócio (regras).

6. **Fastify em vez de Express.** Performance 2-3x superior, schema validation nativa, melhor suporte a TypeScript. Troca trivial no bootstrap do NestJS.

7. **Structured logging com Pino.** Zero `console.log`. Correlation ID em cada request. Logs em JSON estruturado. 

8. **Observabilidade de primeiro dia.** OpenTelemetry para tracing distribuído, Prometheus client para métricas (latência, throughput, error rate por endpoint), Pino para logs.

**Exemplo — Estrutura de um módulo NestJS:**

```
modules/clients/
├── clients.module.ts              # NestJS module registration
├── controllers/
│   └── clients.controller.ts      # HTTP layer (DTOs in, responses out)
├── use-cases/
│   ├── create-client.use-case.ts  # Orquestra criação
│   ├── submit-client.use-case.ts  # Orquestra submissão para análise
│   └── reassign-client.use-case.ts
├── domain/
│   ├── client.entity.ts           # Regras de negócio, transições de status
│   ├── client.repository.ts       # Interface (contrato)
│   ├── events/
│   │   ├── client-submitted.event.ts
│   │   └── client-approved.event.ts
│   └── exceptions/
│       ├── client-not-found.exception.ts
│       ├── invalid-status-transition.exception.ts
│       └── missing-documents.exception.ts
├── infra/
│   ├── drizzle-client.repository.ts  # Implementação Drizzle
│   └── mappers/
│       └── client.mapper.ts          # DB row ↔ Domain entity
└── dto/
    ├── create-client.dto.ts       # Zod schema
    ├── update-client.dto.ts
    └── submit-client.dto.ts
```

### 1.4 Hierarquia de Exceções

```typescript
// packages/types/src/exceptions.ts

abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
  readonly metadata?: Record<string, unknown>;
}

// Cada módulo define suas exceções específicas
class ClientNotFoundException extends DomainException {
  readonly code = 'CLIENT_NOT_FOUND';
  readonly httpStatus = 404;
}

class InvalidStatusTransitionException extends DomainException {
  readonly code = 'INVALID_STATUS_TRANSITION';
  readonly httpStatus = 422;
}

class InsufficientPermissionsException extends DomainException {
  readonly code = 'INSUFFICIENT_PERMISSIONS';
  readonly httpStatus = 403;
}
```

### 1.5 TypeScript Config — Não Negociável

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 1.6 Performance — Fastify

O NestJS usa Express por padrão. Trocamos por Fastify no bootstrap:

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ logger: false }), // Pino gerenciado pelo NestJS
);
```

Benefícios: ~2-3x requests/segundo vs Express, schema validation nativa, plugin system robusto.

### 1.7 Observabilidade

```
Request → Correlation ID Middleware → Pino Logger → OpenTelemetry Tracer
                                           ↓
                                     Grafana Cloud
                                     ├── Logs (Loki)
                                     ├── Métricas (Prometheus)
                                     └── Traces (Tempo)
```

Cada request carrega um `correlationId` que aparece em logs, traces e métricas. Quando algo falha, um ID conecta tudo.

---

## 2. Estrutura do Monorepo

```
nexus/
├── apps/
│   ├── web-client/                  # Portal do Cliente (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (portal)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── documents/
│   │   │   │   │   └── upload/
│   │   │   │   ├── operation/
│   │   │   │   │   └── [id]/
│   │   │   │   └── contracts/
│   │   │   │       └── sign/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── web-backoffice/              # Backoffice Interno (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx       # Sidebar + header + RBAC guard
│   │   │   │   ├── overview/        # Dashboard executivo
│   │   │   │   ├── commercial/
│   │   │   │   │   ├── clients/
│   │   │   │   │   │   ├── page.tsx           # Lista + pipeline
│   │   │   │   │   │   ├── new/page.tsx       # Novo cliente
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx       # Detalhe do cliente
│   │   │   │   │   │       ├── documents/     # Docs + checklist
│   │   │   │   │   │       └── activities/    # Histórico de atividades
│   │   │   │   │   ├── pipeline/
│   │   │   │   │   ├── goals/
│   │   │   │   │   └── team/
│   │   │   │   ├── credit/
│   │   │   │   │   ├── queue/               # Fila de análise
│   │   │   │   │   ├── reports/             # Relatórios do agente
│   │   │   │   │   └── [id]/               # Análise individual
│   │   │   │   ├── compliance/
│   │   │   │   │   ├── screening/
│   │   │   │   │   ├── alerts/
│   │   │   │   │   └── monitoring/
│   │   │   │   ├── approval/
│   │   │   │   │   ├── queue/               # Fila da mesa
│   │   │   │   │   └── [id]/               # Tela de aprovação
│   │   │   │   ├── legal/
│   │   │   │   │   ├── contracts/
│   │   │   │   │   │   ├── queue/           # Fila do jurídico
│   │   │   │   │   │   ├── generate/        # Gerar contrato
│   │   │   │   │   │   └── [id]/           # Revisão do contrato
│   │   │   │   │   ├── extrajudicial/
│   │   │   │   │   └── regulations/
│   │   │   │   ├── backoffice/
│   │   │   │   │   ├── homologation/
│   │   │   │   │   └── operations/
│   │   │   │   ├── risk/
│   │   │   │   │   ├── management/
│   │   │   │   │   ├── recovery/
│   │   │   │   │   └── litigation/
│   │   │   │   └── admin/
│   │   │   │       ├── users/
│   │   │   │       ├── segments/            # CRUD de segmentos + docs
│   │   │   │       ├── regions/
│   │   │   │       ├── teams/
│   │   │   │       └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── api/                          # API Backend (NestJS + Fastify)
│   │   ├── src/
│   │   │   ├── main.ts               # Bootstrap com FastifyAdapter + Pino
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── common/               # Infra cross-cutting (não é domínio)
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   └── rbac.guard.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── public.decorator.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── audit-trail.interceptor.ts
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   └── timeout.interceptor.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── domain-exception.filter.ts  # Mapeia DomainException → HTTP
│   │   │   │   ├── pipes/
│   │   │   │   │   └── zod-validation.pipe.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── correlation-id.middleware.ts
│   │   │   │   │   └── rate-limit.middleware.ts
│   │   │   │   └── logger/
│   │   │   │       └── pino-logger.service.ts      # Structured logging com Pino
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── auth.controller.ts
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   ├── login.use-case.ts
│   │   │   │   │   │   └── refresh-token.use-case.ts
│   │   │   │   │   └── strategies/
│   │   │   │   │       ├── supabase.strategy.ts
│   │   │   │   │       └── jwt.strategy.ts
│   │   │   │   │
│   │   │   │   ├── clients/               # Exemplo de módulo com DDD leve
│   │   │   │   │   ├── clients.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── clients.controller.ts
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   ├── create-client.use-case.ts
│   │   │   │   │   │   ├── submit-client.use-case.ts
│   │   │   │   │   │   └── reassign-client.use-case.ts
│   │   │   │   │   ├── domain/
│   │   │   │   │   │   ├── client.entity.ts        # Regras de negócio
│   │   │   │   │   │   ├── client.repository.ts    # Interface (contrato)
│   │   │   │   │   │   ├── events/
│   │   │   │   │   │   │   ├── client-submitted.event.ts
│   │   │   │   │   │   │   └── client-approved.event.ts
│   │   │   │   │   │   └── exceptions/
│   │   │   │   │   │       ├── client-not-found.exception.ts
│   │   │   │   │   │       └── invalid-status-transition.exception.ts
│   │   │   │   │   ├── infra/
│   │   │   │   │   │   ├── drizzle-client.repository.ts  # Implementação
│   │   │   │   │   │   └── mappers/
│   │   │   │   │   │       └── client.mapper.ts    # DB row ↔ Domain entity
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-client.dto.ts    # Zod schema
│   │   │   │   │       ├── update-client.dto.ts
│   │   │   │   │       └── submit-client.dto.ts
│   │   │   │   │
│   │   │   │   ├── documents/
│   │   │   │   │   ├── documents.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── documents.controller.ts
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   ├── upload-document.use-case.ts
│   │   │   │   │   │   └── get-checklist.use-case.ts
│   │   │   │   │   ├── domain/
│   │   │   │   │   │   ├── document.entity.ts
│   │   │   │   │   │   ├── document-checklist.ts   # Value object
│   │   │   │   │   │   ├── document.repository.ts
│   │   │   │   │   │   └── exceptions/
│   │   │   │   │   │       └── invalid-document.exception.ts
│   │   │   │   │   └── infra/
│   │   │   │   │       └── drizzle-document.repository.ts
│   │   │   │   │
│   │   │   │   ├── segments/
│   │   │   │   │   ├── segments.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── segments.controller.ts
│   │   │   │   │   ├── domain/
│   │   │   │   │   │   └── segment.repository.ts
│   │   │   │   │   └── infra/
│   │   │   │   │       └── drizzle-segment.repository.ts
│   │   │   │   │
│   │   │   │   ├── pipeline/
│   │   │   │   │   ├── pipeline.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── pipeline.controller.ts
│   │   │   │   │   └── use-cases/
│   │   │   │   │       └── get-pipeline-metrics.use-case.ts
│   │   │   │   │
│   │   │   │   ├── goals/
│   │   │   │   │   ├── goals.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── goals.controller.ts
│   │   │   │   │   ├── domain/
│   │   │   │   │   │   └── goal.entity.ts
│   │   │   │   │   └── use-cases/
│   │   │   │   │       └── update-goal-achievement.use-case.ts
│   │   │   │   │
│   │   │   │   ├── credit/
│   │   │   │   │   ├── credit.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── credit.controller.ts
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   └── run-credit-analysis.use-case.ts
│   │   │   │   │   ├── domain/
│   │   │   │   │   │   ├── bureau-result.entity.ts
│   │   │   │   │   │   └── bureau.adapter.ts       # Interface (port)
│   │   │   │   │   └── infra/
│   │   │   │   │       └── adapters/               # Implementações (adapters)
│   │   │   │   │           ├── cerc.adapter.ts
│   │   │   │   │           ├── vadu.adapter.ts
│   │   │   │   │           ├── upminer.adapter.ts
│   │   │   │   │           ├── allcheck.adapter.ts
│   │   │   │   │           └── bureau-circuit-breaker.ts
│   │   │   │   │
│   │   │   │   ├── compliance/
│   │   │   │   │   ├── compliance.module.ts
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   └── run-compliance-check.use-case.ts
│   │   │   │   │   ├── domain/
│   │   │   │   │   │   └── compliance-provider.adapter.ts  # Interface (port)
│   │   │   │   │   └── infra/
│   │   │   │   │       └── adapters/
│   │   │   │   │           ├── neoway.adapter.ts
│   │   │   │   │           ├── idwall.adapter.ts
│   │   │   │   │           ├── bigdata.adapter.ts
│   │   │   │   │           └── judit.adapter.ts
│   │   │   │   │
│   │   │   │   ├── approval/
│   │   │   │   │   ├── approval.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── approval.controller.ts
│   │   │   │   │   ├── domain/
│   │   │   │   │   │   └── approval-decision.entity.ts
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── approve-credit.use-case.ts
│   │   │   │   │       └── reject-credit.use-case.ts
│   │   │   │   │
│   │   │   │   ├── legal/
│   │   │   │   │   ├── legal.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── contracts.controller.ts
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── generate-contract.use-case.ts
│   │   │   │   │       └── generate-extrajudicial.use-case.ts
│   │   │   │   │
│   │   │   │   ├── communication/
│   │   │   │   │   ├── communication.module.ts
│   │   │   │   │   └── infra/
│   │   │   │   │       ├── email.service.ts
│   │   │   │   │       ├── whatsapp.service.ts
│   │   │   │   │       └── notification.service.ts
│   │   │   │   │
│   │   │   │   ├── cnpj/
│   │   │   │   │   ├── cnpj.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── cnpj.controller.ts
│   │   │   │   │   └── infra/
│   │   │   │   │       └── brasil-api.service.ts    # BrasilAPI + cache Redis
│   │   │   │   │
│   │   │   │   └── audit/
│   │   │   │       ├── audit.module.ts
│   │   │   │       └── infra/
│   │   │   │           └── audit.service.ts         # Append-only log
│   │   │   │
│   │   │   ├── workflows/                           # Temporal.io workflows
│   │   │   │   ├── credit-analysis.workflow.ts
│   │   │   │   ├── document-validation.workflow.ts
│   │   │   │   ├── homologation.workflow.ts
│   │   │   │   ├── contract-generation.workflow.ts
│   │   │   │   ├── delinquency-escalation.workflow.ts
│   │   │   │   └── activities/
│   │   │   │       ├── bureau.activities.ts
│   │   │   │       ├── compliance.activities.ts
│   │   │   │       ├── notification.activities.ts
│   │   │   │       └── document.activities.ts
│   │   │   │
│   │   │   └── database/
│   │   │       ├── drizzle.config.ts
│   │   │       ├── schema/                          # Drizzle table definitions
│   │   │       │   ├── index.ts
│   │   │       │   ├── clients.ts
│   │   │       │   ├── documents.ts
│   │   │       │   ├── segments.ts
│   │   │       │   ├── profiles.ts
│   │   │       │   ├── regions.ts
│   │   │       │   ├── teams.ts
│   │   │       │   ├── goals.ts
│   │   │       │   ├── notifications.ts
│   │   │       │   └── audit.ts
│   │   │       └── migrations/
│   │   ├── test/
│   │   │   ├── unit/                                # Testes de domain entities
│   │   │   ├── integration/                         # Testes de use-cases + repos
│   │   │   └── e2e/                                 # Testes de endpoints
│   │   └── package.json
│   │
│   └── workers/                       # Workers de IA (Python)
│       ├── document_validator/
│       │   ├── main.py
│       │   ├── ocr.py
│       │   ├── extractor.py
│       │   └── validator.py
│       ├── credit_report/
│       │   ├── main.py
│       │   ├── consolidator.py
│       │   └── report_generator.py
│       ├── contract_generator/
│       │   ├── main.py
│       │   ├── templates/
│       │   └── generator.py
│       ├── extrajudicial_generator/
│       │   ├── main.py
│       │   └── generator.py
│       ├── shared/
│       │   ├── llm_client.py
│       │   ├── queue_consumer.py
│       │   └── supabase_client.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   ├── types/                         # Tipos TypeScript compartilhados
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── document.ts
│   │   │   ├── segment.ts
│   │   │   ├── profile.ts
│   │   │   ├── pipeline.ts
│   │   │   ├── goal.ts
│   │   │   ├── notification.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── validators/                    # Schemas Zod compartilhados
│   │   ├── src/
│   │   │   ├── client.schema.ts
│   │   │   ├── document.schema.ts
│   │   │   ├── segment.schema.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                            # Componentes UI compartilhados (design system)
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── file-upload.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── pipeline-kanban.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                        # Configs compartilhadas
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   └── utils/                         # Funções utilitárias
│       ├── src/
│       │   ├── format.ts              # formatCNPJ, formatCurrency, etc.
│       │   ├── permissions.ts         # canView, canEdit, canReassign
│       │   ├── status.ts             # mapas de status → labels
│       │   └── index.ts
│       └── package.json
│
├── infra/                             # Infraestrutura
│   ├── docker/
│   │   ├── docker-compose.yml         # Dev local
│   │   ├── docker-compose.prod.yml
│   │   ├── api.Dockerfile
│   │   └── workers.Dockerfile
│   ├── terraform/                     # IaC (se AWS/GCP)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── modules/
│   └── k8s/                           # Kubernetes manifests (se necessário)
│       ├── api/
│       ├── workers/
│       └── temporal/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Lint + test + typecheck
│       ├── deploy-client.yml          # Deploy portal do cliente
│       ├── deploy-backoffice.yml      # Deploy backoffice
│       ├── deploy-api.yml             # Deploy API
│       └── deploy-workers.yml         # Deploy workers Python
│
├── turbo.json                         # Turborepo pipeline config
├── package.json                       # Root workspace
├── pnpm-workspace.yaml
└── README.md
```

---

## 3. Diagrama de Arquitetura (C4 — Container Level)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│                                                                          │
│   ┌──────────────┐          ┌───────────────────┐                       │
│   │ Portal       │          │ Backoffice         │                       │
│   │ do Cliente   │          │ (Comercial, Mesa,  │                       │
│   │ (Next.js)    │          │  Jurídico, etc.)   │                       │
│   │              │          │ (Next.js)          │                       │
│   └──────┬───────┘          └────────┬───────────┘                       │
│          │                           │                                    │
└──────────┼───────────────────────────┼────────────────────────────────────┘
           │          HTTPS            │
           ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY                                     │
│                    (Vercel Edge / Kong)                                    │
│              Rate Limiting · Auth · CORS · WAF                            │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         API BACKEND (NestJS)                              │
│                                                                           │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐    │
│  │ Clients │ │Documents │ │ Credit   │ │Compliance│ │ Approval    │    │
│  │ Module  │ │ Module   │ │ Module   │ │ Module   │ │ Module      │    │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬──────┘    │
│       │           │            │             │              │            │
│  ┌────┴────┐ ┌────┴─────┐ ┌───┴──────┐ ┌───┴──────┐ ┌─────┴──────┐    │
│  │ Legal   │ │Pipeline  │ │  Goals   │ │ Comms    │ │  Audit     │    │
│  │ Module  │ │ Module   │ │ Module   │ │ Module   │ │  Module    │    │
│  └─────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────┘    │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    Temporal.io Client                              │    │
│  │         (Workflows: credit, docs, homologation, etc.)             │    │
│  └──────────────────────────────┬───────────────────────────────────┘    │
└─────────────────────────────────┼────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│   Temporal.io    │  │     Redis        │  │    Supabase              │
│   Server         │  │   (Upstash)      │  │                          │
│                  │  │                  │  │  ┌──────────────────┐    │
│  Workflows:      │  │  • Cache         │  │  │  PostgreSQL 15+  │    │
│  • Credit        │  │  • Sessions      │  │  │  + RLS Policies  │    │
│  • Documents     │  │  • Rate Limit    │  │  └──────────────────┘    │
│  • Homologation  │  │  • BullMQ Jobs   │  │  ┌──────────────────┐    │
│  • Contract      │  │                  │  │  │  Storage (S3)    │    │
│  • Escalation    │  │                  │  │  │  Docs / PDFs     │    │
│                  │  │                  │  │  └──────────────────┘    │
└────────┬─────────┘  └──────────────────┘  │  ┌──────────────────┐    │
         │                                   │  │  Auth             │    │
         │                                   │  │  JWT + MFA        │    │
         ▼                                   │  └──────────────────┘    │
┌──────────────────────────────────────┐    │  ┌──────────────────┐    │
│        Workers Python (FastAPI)       │    │  │  Realtime         │    │
│                                       │    │  │  WebSockets       │    │
│  ┌──────────────┐ ┌───────────────┐  │    │  └──────────────────┘    │
│  │ Document     │ │ Credit Report │  │    │  ┌──────────────────┐    │
│  │ Validator    │ │ Generator     │  │    │  │  Edge Functions   │    │
│  │ (OCR + LLM) │ │ (LLM)        │  │    │  │  CNPJ, Webhooks   │    │
│  └──────────────┘ └───────────────┘  │    │  └──────────────────┘    │
│  ┌──────────────┐ ┌───────────────┐  │    └──────────────────────────┘
│  │ Contract     │ │ Extrajudicial │  │
│  │ Generator    │ │ Generator     │  │
│  │ (LLM)       │ │ (LLM)        │  │
│  └──────────────┘ └───────────────┘  │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                  │
│                                                                           │
│  ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐            │
│  │ CERC   │ │ VADU   │ │Upminer  │ │Allcheck│ │ Neoway   │            │
│  └────────┘ └────────┘ └─────────┘ └────────┘ └──────────┘            │
│  ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐            │
│  │ idwall │ │BigData │ │ Judit   │ │ Egea   │ │ DataJud  │            │
│  └────────┘ └────────┘ └─────────┘ └────────┘ └──────────┘            │
│  ┌────────────┐ ┌───────────┐ ┌──────────────┐                         │
│  │ Twilio     │ │ Clicksign │ │ BrasilAPI    │                         │
│  │ (WhatsApp) │ │ (Assinat.)│ │ (CNPJ)       │                         │
│  └────────────┘ └───────────┘ └──────────────┘                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Fluxo de Dados — Operação de Crédito Completa

```
                    Temporal.io Workflow: CreditOperationWorkflow
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  1. CADASTRO         2. VALIDAÇÃO        3. BUREAUS                 │
│  ┌──────────┐       ┌──────────────┐    ┌───────────────────┐      │
│  │Comercial │──────▶│ Doc Validator │───▶│ CERC + VADU +     │      │
│  │cria no   │       │ Worker (Py)  │    │ Upminer + Allcheck│      │
│  │backoffice│       │ OCR + LLM    │    │ (paralelo)        │      │
│  └──────────┘       └──────────────┘    └────────┬──────────┘      │
│       │                    │                      │                  │
│       │              [se inválido]          [se restritivo]          │
│       │              volta pro              indeferimento            │
│       │              comercial              automático               │
│       │                                           │                  │
│       │                                           ▼                  │
│  4. COMPLIANCE       5. RELATÓRIO IA     6. MESA APROVADORA        │
│  ┌──────────────┐   ┌──────────────┐    ┌───────────────────┐      │
│  │Neoway+idwall │──▶│Credit Report │───▶│ Comitê decide:    │      │
│  │+Judit+Egea   │   │Worker (Py)   │    │ valor, taxa,      │      │
│  │(paralelo)    │   │consolida +   │    │ condições         │      │
│  └──────────────┘   │gera insights │    └────────┬──────────┘      │
│       │              └──────────────┘             │                  │
│  [se PLD/sanção]                            [se reprovado]          │
│  indeferimento                              notifica comercial      │
│  automático                                       │                  │
│                                                   ▼                  │
│  7. NOTIFICAÇÃO      8. DOCS SÓCIOS       9. HOMOLOGAÇÃO           │
│  ┌──────────────┐   ┌──────────────┐    ┌───────────────────┐      │
│  │Email +       │──▶│Cliente sobe  │───▶│ Motor de regras   │      │
│  │WhatsApp      │   │docs no portal│    │ verifica          │      │
│  │"aprovado!"   │   │+ validação IA│    │ elegibilidade     │      │
│  └──────────────┘   └──────────────┘    │ do fundo          │      │
│                                          └────────┬──────────┘      │
│                                                   │                  │
│  10. CONTRATO        11. ASSINATURA       12. LIBERAÇÃO             │
│  ┌──────────────┐   ┌──────────────┐    ┌───────────────────┐      │
│  │Contract Gen  │──▶│ Clicksign /  │───▶│ Status → 'active' │      │
│  │Worker (Py)   │   │ D4Sign       │    │ Crédito liberado  │      │
│  │gera contrato │   │ assinatura   │    │                   │      │
│  └──────────────┘   └──────────────┘    └───────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

         PÓS-CRÉDITO (workflow separado: DelinquencyEscalationWorkflow)

┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Adimplente ──▶ G. Risco (1-30d) ──▶ Recuperação (31-90d)          │
│                                              │                       │
│                                              ▼                       │
│                                      Contencioso (90d+)             │
│                                      ┌──────────────┐              │
│                                      │Extrajudicial │              │
│                                      │Generator (Py)│              │
│                                      │auto → jurídico│              │
│                                      └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Temporal.io — Workflows Detalhados

### 5.1 CreditAnalysisWorkflow

O workflow principal que orquestra toda a análise de crédito:

```typescript
// apps/api/src/workflows/credit-analysis.workflow.ts

import { proxyActivities, sleep, condition } from '@temporalio/workflow';
import type * as activities from './activities';

const { 
  validateDocuments, 
  queryBureaus, 
  runCompliance, 
  generateReport,
  notifyCommercial,
  notifyClient 
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: { maximumAttempts: 3, backoffCoefficient: 2 },
});

export async function creditAnalysisWorkflow(clientId: string): Promise<CreditResult> {
  
  // 1. Validar documentos (chama worker Python)
  const docResult = await validateDocuments(clientId);
  
  if (!docResult.allValid) {
    await notifyCommercial(clientId, 'document_issues', docResult.issues);
    
    // Espera até 7 dias pelo reenvio, checando a cada hora
    const resubmitted = await condition(
      () => checkDocumentsResubmitted(clientId),
      '7 days'
    );
    
    if (!resubmitted) {
      return { status: 'cancelled', reason: 'Documentos não reenviados em 7 dias' };
    }
    
    // Re-valida
    const revalidation = await validateDocuments(clientId);
    if (!revalidation.allValid) {
      return { status: 'cancelled', reason: 'Documentos inválidos após reenvio' };
    }
  }

  // 2. Consultar bureaus (em paralelo)
  const [cerc, vadu, upminer, allcheck] = await Promise.all([
    queryBureaus(clientId, 'cerc'),
    queryBureaus(clientId, 'vadu'),
    queryBureaus(clientId, 'upminer'),
    queryBureaus(clientId, 'allcheck'),
  ]);

  // 3. Verificar indeferimento automático
  const bureauResult = evaluateBureauResults({ cerc, vadu, upminer, allcheck });
  if (bureauResult.autoReject) {
    await notifyCommercial(clientId, 'auto_rejected', bureauResult.reason);
    return { status: 'auto_rejected', reason: bureauResult.reason };
  }

  // 4. Compliance (em paralelo)
  const [neoway, idwall, judit] = await Promise.all([
    runCompliance(clientId, 'neoway'),
    runCompliance(clientId, 'idwall'),
    runCompliance(clientId, 'judit'),
  ]);

  // 5. Verificar indeferimento por compliance
  const complianceResult = evaluateComplianceResults({ neoway, idwall, judit });
  if (complianceResult.autoReject) {
    await notifyCommercial(clientId, 'auto_rejected', complianceResult.reason);
    return { status: 'auto_rejected', reason: complianceResult.reason };
  }

  // 6. Gerar relatório consolidado (chama worker Python)
  const report = await generateReport(clientId, {
    bureaus: { cerc, vadu, upminer, allcheck },
    compliance: { neoway, idwall, judit },
  });

  // 7. Enfileirar para mesa aprovadora
  return { status: 'pending_approval', reportId: report.id };
}
```

### 5.2 DelinquencyEscalationWorkflow

```typescript
// apps/api/src/workflows/delinquency-escalation.workflow.ts

export async function delinquencyEscalationWorkflow(clientId: string): Promise<void> {
  
  // Monitora diariamente
  while (true) {
    await sleep('24 hours');
    
    const daysOverdue = await getDaysOverdue(clientId);
    const currentStatus = await getClientStatus(clientId);
    
    if (daysOverdue === 0) {
      // Voltou a pagar — reseta
      if (currentStatus !== 'active') {
        await updateStatus(clientId, 'active');
      }
      continue;
    }
    
    // Escalonamento automático
    if (daysOverdue >= 1 && daysOverdue <= 30 && currentStatus !== 'risk_management') {
      await updateStatus(clientId, 'risk_management');
      await notifyTeam(clientId, 'risk_management');
    }
    
    if (daysOverdue >= 31 && daysOverdue <= 90 && currentStatus !== 'recovery') {
      await updateStatus(clientId, 'recovery');
      await notifyTeam(clientId, 'recovery');
    }
    
    if (daysOverdue > 90 && currentStatus !== 'litigation') {
      await updateStatus(clientId, 'litigation');
      await notifyTeam(clientId, 'litigation');
      // Gera extrajudicial automaticamente
      await generateExtrajudicial(clientId);
    }
  }
}
```

---

## 6. Adapters de Bureaus e Compliance

### 6.1 Interface Comum (Adapter Pattern)

Cada bureau/fornecedor implementa a mesma interface. Isso permite trocar fornecedores sem mudar o fluxo:

```typescript
// apps/api/src/modules/credit/bureaus/bureau.interface.ts

export interface BureauAdapter {
  name: string;
  query(cnpj: string): Promise<BureauResult>;
  healthCheck(): Promise<boolean>;
}

export interface BureauResult {
  provider: string;
  success: boolean;
  queriedAt: Date;
  responseTimeMs: number;
  data: Record<string, any>;       // Dados brutos do fornecedor
  normalizedData: NormalizedBureauData;  // Dados normalizados
  autoRejectReasons: string[];     // Motivos de indeferimento automático
}

export interface NormalizedBureauData {
  score?: number;
  hasRestrictions: boolean;
  restrictions: Restriction[];
  protestAmount: number;
  protestCount: number;
  lawsuitCount: number;
  // ... mais campos normalizados
}
```

```typescript
// apps/api/src/modules/credit/bureaus/cerc.adapter.ts

@Injectable()
export class CercAdapter implements BureauAdapter {
  name = 'cerc';
  
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly cache: CacheService,
  ) {}

  async query(cnpj: string): Promise<BureauResult> {
    const start = Date.now();
    
    try {
      const response = await firstValueFrom(
        this.http.post(this.config.get('CERC_API_URL'), {
          cnpj: cnpj.replace(/\D/g, ''),
          // ... params específicos da CERC
        }, {
          headers: {
            'Authorization': `Bearer ${this.config.get('CERC_API_KEY')}`,
          },
          timeout: 30000, // 30s timeout
        })
      );

      return {
        provider: 'cerc',
        success: true,
        queriedAt: new Date(),
        responseTimeMs: Date.now() - start,
        data: response.data,
        normalizedData: this.normalize(response.data),
        autoRejectReasons: this.checkAutoReject(response.data),
      };
    } catch (error) {
      // Circuit breaker handled by opossum wrapper
      throw new BureauUnavailableException('cerc', error);
    }
  }

  private normalize(data: any): NormalizedBureauData {
    // Normaliza os dados da CERC pro formato interno
    return {
      hasRestrictions: data.receivables?.some(r => r.status === 'blocked'),
      restrictions: [],
      protestAmount: 0,
      protestCount: 0,
      lawsuitCount: 0,
    };
  }

  private checkAutoReject(data: any): string[] {
    const reasons: string[] = [];
    // Regras de indeferimento automático específicas da CERC
    return reasons;
  }

  async healthCheck(): Promise<boolean> {
    // Ping no endpoint de health da CERC
    return true;
  }
}
```

### 6.2 Circuit Breaker

```typescript
// apps/api/src/modules/credit/bureaus/bureau-circuit-breaker.ts

import CircuitBreaker from 'opossum';

export function wrapWithCircuitBreaker(adapter: BureauAdapter): BureauAdapter {
  const breaker = new CircuitBreaker(
    (cnpj: string) => adapter.query(cnpj),
    {
      timeout: 30000,           // 30s timeout
      errorThresholdPercentage: 50,  // Abre se 50% falhar
      resetTimeout: 30000,      // Tenta fechar após 30s
      volumeThreshold: 5,       // Mínimo de 5 requests para avaliar
    }
  );

  breaker.on('open', () => {
    logger.warn(`Circuit breaker OPEN for ${adapter.name}`);
    metrics.circuitBreakerState.set({ provider: adapter.name }, 1);
  });

  breaker.on('halfOpen', () => {
    logger.info(`Circuit breaker HALF-OPEN for ${adapter.name}`);
  });

  breaker.on('close', () => {
    logger.info(`Circuit breaker CLOSED for ${adapter.name}`);
    metrics.circuitBreakerState.set({ provider: adapter.name }, 0);
  });

  return {
    ...adapter,
    query: (cnpj: string) => breaker.fire(cnpj),
  };
}
```

---

## 7. Workers Python — Comunicação

### 7.1 Arquitetura de Comunicação

```
NestJS API                    Workers Python
    │                              │
    │  1. Publica job na fila      │
    ├─────────────────────────────▶│
    │  (BullMQ via Redis)          │
    │                              │  2. Processa (OCR, LLM, etc.)
    │                              │
    │  3. Resultado via callback   │
    │◀─────────────────────────────┤
    │  (HTTP POST para NestJS)     │
    │                              │
    │  4. Ou: atualiza direto      │
    │  no Supabase (via client)    │
```

### 7.2 Exemplo: Job de Validação de Documento

```python
# apps/workers/document_validator/main.py

from fastapi import FastAPI
from shared.queue_consumer import QueueConsumer
from shared.supabase_client import supabase
from shared.llm_client import llm
from ocr import extract_text
from validator import validate_document

app = FastAPI()
consumer = QueueConsumer(queue_name='document-validation')

@consumer.handler('validate_document')
async def handle_validate(job_data: dict):
    client_id = job_data['client_id']
    document_id = job_data['document_id']
    storage_path = job_data['storage_path']
    document_type = job_data['document_type']
    
    # 1. Baixar documento do Supabase Storage
    file_bytes = supabase.storage.from_('client-documents').download(storage_path)
    
    # 2. OCR se necessário
    text = extract_text(file_bytes)
    
    # 3. Validar com LLM
    validation = await validate_document(
        text=text,
        document_type=document_type,
        expected_fields=get_expected_fields(document_type)
    )
    
    # 4. Extrair dados estruturados
    extracted = await llm.extract_structured_data(
        text=text,
        schema=get_extraction_schema(document_type)
    )
    
    # 5. Atualizar no Supabase
    supabase.table('client_documents').update({
        'validation_status': 'valid' if validation.is_valid else 'invalid',
        'validation_result': validation.to_dict(),
        'extracted_data': extracted,
        'validated_at': 'now()'
    }).eq('id', document_id).execute()
    
    # 6. Callback para NestJS (Temporal activity completion)
    await notify_workflow(client_id, document_id, validation)
```

---

## 8. Supabase Realtime — Atualizações em Tempo Real

### 8.1 O que atualiza em tempo real

| Evento | Quem vê | Canal |
|--------|---------|-------|
| Status do cliente mudou | Comercial responsável | `clients:assigned_to=eq.{userId}` |
| Documento validado | Comercial responsável | `client_documents:client_id=eq.{clientId}` |
| Nova operação na fila | Analista de crédito | `clients:status=eq.credit_analysis` |
| Operação na fila da mesa | Mesa aprovadora | `clients:status=eq.pending_approval` |
| Nova notificação | Usuário alvo | `notifications:profile_id=eq.{userId}` |
| Contrato na fila | Jurídico | Canal custom `legal-queue` |

### 8.2 Implementação no Frontend

```typescript
// packages/utils/src/realtime.ts

export function useClientUpdates(userId: string) {
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`user-${userId}-clients`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'clients',
        filter: `assigned_to=eq.${userId}`
      }, (payload) => {
        // Status mudou
        if (payload.old.status !== payload.new.status) {
          toast.info(`${payload.new.company_name}: ${statusLabel(payload.new.status)}`);
          queryClient.invalidateQueries(['clients']);
          queryClient.invalidateQueries(['pipeline']);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `profile_id=eq.${userId}`
      }, (payload) => {
        toast.info(payload.new.title);
        queryClient.invalidateQueries(['notifications']);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);
}
```

---

## 9. Deploy e Environments

### 9.1 Environments

| Environment | Frontends | API | Workers | DB | Uso |
|------------|-----------|-----|---------|-----|-----|
| Local | `localhost:3000/3001` | `localhost:4000` | `localhost:8000` | Supabase local (Docker) | Desenvolvimento |
| Preview | Vercel Preview | Railway preview | — | Supabase staging | PR review |
| Staging | `staging.app.com` | `staging-api.app.com` | Railway staging | Supabase staging | Testes integrados |
| Production | `app.com` / `admin.app.com` | `api.app.com` | Railway prod | Supabase prod | Produção |

### 9.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml

name: CI
on:
  pull_request:
    branches: [main, develop]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      client: ${{ steps.filter.outputs.client }}
      backoffice: ${{ steps.filter.outputs.backoffice }}
      api: ${{ steps.filter.outputs.api }}
      workers: ${{ steps.filter.outputs.workers }}
      packages: ${{ steps.filter.outputs.packages }}
    steps:
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            client: ['apps/web-client/**', 'packages/**']
            backoffice: ['apps/web-backoffice/**', 'packages/**']
            api: ['apps/api/**', 'packages/**']
            workers: ['apps/workers/**']
            packages: ['packages/**']

  typecheck-and-lint:
    needs: detect-changes
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo typecheck lint

  test-api:
    needs: detect-changes
    if: needs.detect-changes.outputs.api == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo test --filter=api

  test-workers:
    needs: detect-changes
    if: needs.detect-changes.outputs.workers == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: cd apps/workers && pip install -r requirements.txt
      - run: cd apps/workers && pytest
```

### 9.3 Turborepo Config

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

---

## 10. Segurança na Arquitetura

### 10.1 Gestão de Usuários — Sem Signup Público

**Não existe cadastro público.** Todo acesso à plataforma é criado por um admin ou pelo RH durante o processo de admissão (onboarding). O signup do Supabase Auth é **desabilitado** (Authentication > Providers > Email > "Allow new users to sign up" = false).

**Quem pode criar usuários:**

| Role | Pode criar | Contexto |
|------|-----------|----------|
| `admin` | Qualquer tipo de usuário | Gestão geral da plataforma |
| `hr` / `hr_admin` | Colaboradores + usuários internos | Fluxo de admissão (onboarding) |

**Fluxo de criação de usuário:**

```
1. Admin/RH cadastra o colaborador (tabela collaborators)
2. Na mesma operação, marca "criar acesso à plataforma"
3. Backend NestJS chama supabase.auth.admin.createUser() (server-side, service_role key)
4. Trigger on_auth_user_created gera automaticamente o profile
5. O profile_id é vinculado ao collaborator
6. Colaborador recebe email/convite para definir senha
```

**Decisão:** A criação de usuários será feita via endpoint do NestJS (`POST /api/users`), protegido por `@Roles('admin', 'hr', 'hr_admin')`. Não será usada Edge Function para isso — o NestJS permite encapsular tudo num UseCase com transação (criar auth user + profile + link ao collaborator), guards de autorização, validação Zod compartilhada, e rollback em caso de falha.

**Trigger automático no banco:**

```sql
-- Quando auth.users recebe um INSERT, cria profile automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Cadeia de dados:**

```
auth.users (Supabase Auth)
    ↓ profiles.id REFERENCES auth.users(id) — criado via trigger automático
profiles
    ↓ collaborators.profile_id REFERENCES profiles(id) — vinculado pelo backend
collaborators
```

> **Nota:** Nem todo usuário é um collaborator. Um auditor externo pode ter profile + login mas não ter registro em collaborators. O vínculo profile → collaborator é controlado pelo backend.

### 10.2 Fluxo de Autenticação

```
Browser → Supabase Auth (login) → JWT + Refresh Token
  │
  ├── Frontend: JWT no header Authorization
  │
  └── API NestJS: 
      ├── AuthGuard valida JWT com Supabase
      ├── RbacGuard verifica role no profiles
      └── AuditInterceptor loga toda ação
```

### 10.3 Proteção entre Camadas

```
Internet ──▶ Vercel Edge (WAF + Rate Limit)
               │
               ▼
          Frontend (Next.js)
               │ Server Components chamam API
               ▼
          API NestJS
               │ AuthGuard + RbacGuard + AuditInterceptor
               ▼
          Supabase (RLS filtra dados)
               │ Mesmo que API tenha bug, RLS protege
               ▼
          Dados
```

A segurança opera em 4 camadas independentes. Se uma falhar, as outras seguram: (1) sem signup público — só admin/RH criam usuários, (2) o AuthGuard no NestJS valida o JWT, (3) o RbacGuard verifica se o role tem permissão pra aquele endpoint, e (4) o RLS do Supabase filtra os dados mesmo que o backend passe a query errada. Cinto, suspensório, airbag e capacete.

---

## 11. Estimativa de Custos Mensais (Produção Inicial)

| Serviço | Plano | Estimativa |
|---------|-------|-----------|
| Supabase | Pro ($25) + compute addon | ~$100/mês |
| Vercel | Pro (2 apps) | ~$40/mês |
| Railway | Pro (API + Workers) | ~$50-100/mês |
| Upstash Redis | Pro | ~$30/mês |
| Temporal Cloud | Starter | ~$100/mês |
| Grafana Cloud | Free → Pro | $0-50/mês |
| Sentry | Team | ~$26/mês |
| Twilio (WhatsApp) | Pay-per-use | ~$50-200/mês |
| SendGrid (Email) | Essentials | ~$20/mês |
| Clicksign | Por assinatura | ~$100-300/mês |
| **Total estimado** | | **~$500-1000/mês** |

> Esse custo é para o início da operação (até ~500 clientes ativos). Escala conforme volume. Os bureaus e fornecedores de compliance são cobrados à parte (por consulta) e dependem do volume contratado.

---

## 12. Decisões Pendentes

| Decisão | Opções | Impacto | Quando decidir | Status |
|---------|--------|---------|----------------|--------|
| Hosting da API | Railway vs Fly.io vs AWS ECS | Performance, custo, complexidade | Antes do sprint 1 | Pendente |
| Temporal Cloud vs Self-hosted | Cloud ($100/mês) vs Kubernetes | Custo vs operação | Antes do sprint 1 | **Decidido: Cloud** |
| Fornecedor de WhatsApp | Twilio vs API direta Meta | Custo vs facilidade | Sprint 2 | Pendente |
| Assinatura digital | Clicksign vs D4Sign vs DocuSign | Preço por assinatura, integração | Sprint 3 | Pendente |
| ~~Monorepo tooling~~ | ~~Turborepo vs Nx~~ | ~~DX, velocidade de build~~ | ~~Antes do sprint 1~~ | **Decidido: Turborepo** |
| Design System | shadcn/ui vs Radix + custom | Velocidade vs customização | Sprint 1 | Pendente |
| ~~HTTP adapter NestJS~~ | ~~Express vs Fastify~~ | ~~Performance~~ | ~~Antes do sprint 1~~ | **Decidido: Fastify** |
| ~~Arquitetura backend~~ | ~~Flat services vs DDD~~ | ~~Qualidade, testabilidade~~ | ~~Antes do sprint 1~~ | **Decidido: DDD leve** |
| ~~Criação de usuários~~ | ~~Edge Function vs NestJS endpoint~~ | ~~Transações, autorização~~ | ~~Antes do sprint 1~~ | **Decidido: NestJS endpoint** |
| ~~Signup público~~ | ~~Aberto vs Controlado~~ | ~~Segurança~~ | ~~Antes do sprint 1~~ | **Decidido: Desabilitado (só admin/RH criam)** |
| ~~ORM~~ | ~~Prisma vs Drizzle~~ | ~~Performance, type-safety, SQL-first~~ | ~~Antes do sprint 1~~ | **Decidido: Drizzle ORM** |

---

## 13. Próximos Passos

1. **Inicializar o monorepo** com Turborepo, instalar dependências base
2. **Configurar Supabase** — criar projeto, rodar migrations do spec comercial
3. **Scaffold do NestJS** — módulos base, auth guard, RBAC
4. **Scaffold do Next.js** — layout do backoffice, routing, auth
5. **Proof of Concept** — fluxo completo: cadastro → upload doc → validação → consulta bureau (mockado)
6. **Definir contratos de API** — OpenAPI/Swagger para todos os endpoints
7. **Setup de CI/CD** — GitHub Actions + deploy automático
