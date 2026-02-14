# Audit Trail — Sistema de Auditoria Centralizado

**Versao:** 1.0  
**Data:** 13 de Fevereiro de 2026  
**Status:** Implementado  

---

## 1. Visao Geral

O sistema de audit trail registra todas as acoes sensiveis realizadas na plataforma em uma tabela append-only no PostgreSQL. O objetivo e garantir rastreabilidade completa para compliance e auditoria: quem fez o que, quando, em qual recurso, com quais dados.

### 1.1 Escopo

Acoes rastreadas:
- Aprovacao, rejeicao e pagamento de reembolsos
- Upload, aprovacao, rejeicao e pagamento de notas fiscais PJ
- Criacao e edicao de colaboradores (incluindo mudanca de role)
- CRUD de dependentes
- Criacao de usuarios

Acoes **nao** rastreadas (por design):
- Leituras (GET) — nao sao acoes de escrita
- Operacoes em bulk automaticas (geracao mensal de NFs, envio de lembretes)

---

## 2. Arquitetura

```
Request → AuthGuard → AuditInterceptor → Controller → UseCase → Response
                            │
                            ├── Le metadata do @Auditable()
                            ├── Captura contexto (user, IP, correlationId)
                            └── Apos sucesso: AuditService.record() (fire-and-forget)
                                        │
                                        └── INSERT audit_logs (async, nao bloqueia response)
```

### 2.1 Componentes

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| `@Auditable()` decorator | `apps/api/src/common/decorators/auditable.decorator.ts` | Marca endpoints sensiveis com metadata (acao, entidade, parametro do ID) |
| `AuditInterceptor` | `apps/api/src/common/interceptors/audit-trail.interceptor.ts` | Interceptor global que detecta `@Auditable()`, captura contexto e dispara o log |
| `AuditService` | `apps/api/src/common/services/audit.service.ts` | Faz INSERT na tabela `audit_logs` de forma async fire-and-forget |
| `AuditModule` | `apps/api/src/common/audit.module.ts` | Modulo NestJS `@Global()` que exporta o `AuditService` |

### 2.2 Fluxo de Dados

1. Request chega e passa pelo `AuthGuard` (valida JWT, popula `request.user`)
2. `AuditInterceptor` verifica se o handler possui `@Auditable()` via `Reflector`
3. Se nao tiver: passa direto sem overhead
4. Se tiver: executa o handler normalmente
5. Apos sucesso (no `tap()` do Observable RxJS), chama `AuditService.record()` com:
   - `correlationId` — via `AsyncLocalStorage` do middleware de correlation ID
   - `actorId` / `actorRole` — do `request.user` (Supabase Auth)
   - `action` / `entityType` — do decorator metadata
   - `entityId` — do `request.params[idParam]` ou do response body
   - `httpMethod` / `path` — do request
   - `payload` — request body sanitizado
   - `metadata` — IP e User-Agent
6. O INSERT e **fire-and-forget**: nao bloqueia a response ao cliente

---

## 3. Tabela `audit_logs`

### 3.1 Schema

```sql
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id TEXT NOT NULL,
  actor_id      UUID NOT NULL,
  actor_role    TEXT NOT NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT,
  http_method   TEXT NOT NULL,
  path          TEXT NOT NULL,
  payload       JSONB,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.2 Campos

| Campo | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| `id` | UUID | PK auto-gerada | `a1b2c3d4-...` |
| `correlation_id` | TEXT | ID de correlacao do request (rastreia toda a cadeia) | `f8e7d6c5-...` |
| `actor_id` | UUID | ID do usuario que realizou a acao (profiles.id) | `b2c3d4e5-...` |
| `actor_role` | TEXT | Role do usuario no momento da acao | `hr_admin` |
| `action` | TEXT | Identificador da acao | `reimbursement.approve` |
| `entity_type` | TEXT | Tipo da entidade afetada | `reimbursement` |
| `entity_id` | TEXT | ID da entidade afetada (nullable para bulk ops) | `c3d4e5f6-...` |
| `http_method` | TEXT | Metodo HTTP | `POST` |
| `path` | TEXT | URL completa do request | `/api/people/reimbursements/abc/approve` |
| `payload` | JSONB | Request body sanitizado (sem senhas/tokens) | `{ "reason": "..." }` |
| `metadata` | JSONB | Contexto adicional | `{ "ip": "...", "userAgent": "..." }` |
| `created_at` | TIMESTAMPTZ | Timestamp imutavel da acao | `2026-02-13T14:30:00Z` |

### 3.3 Indexes

| Index | Colunas | Uso |
|-------|---------|-----|
| `idx_audit_logs_entity` | `(entity_type, entity_id)` | "Historico de acoes neste reembolso" |
| `idx_audit_logs_actor` | `(actor_id)` | "Tudo que o Roberto fez" |
| `idx_audit_logs_action` | `(action)` | "Todas as aprovacoes de reembolso" |
| `idx_audit_logs_created_at` | `(created_at DESC)` | Ordenacao cronologica |

### 3.4 Imutabilidade

- RLS habilitado na tabela
- A tabela e append-only por design: nenhum UPDATE ou DELETE e executado pela aplicacao
- Futuramente, pode-se adicionar `REVOKE UPDATE, DELETE` a nivel de banco para garantia extra

---

## 4. Uso do Decorator `@Auditable()`

### 4.1 Sintaxe

```typescript
@Auditable({
  action: 'reimbursement.approve',  // Identificador unico da acao
  entity: 'reimbursement',          // Tipo da entidade
  idParam: 'id',                    // Param da URL com o ID (default: 'id')
})
```

### 4.2 Endpoints Anotados

#### Reembolsos (`reimbursements.controller.ts`)

| Metodo | Rota | Action |
|--------|------|--------|
| POST | `/people/reimbursements` | `reimbursement.create` |
| POST | `/people/reimbursements/:id/approve` | `reimbursement.approve` |
| POST | `/people/reimbursements/:id/reject` | `reimbursement.reject` |
| POST | `/people/reimbursements/:id/pay` | `reimbursement.pay` |

#### Notas Fiscais PJ (`invoices.controller.ts`)

| Metodo | Rota | Action |
|--------|------|--------|
| POST | `/people/invoices/:id/upload` | `invoice.upload` |
| POST | `/people/invoices/:id/approve` | `invoice.approve` |
| POST | `/people/invoices/:id/reject` | `invoice.reject` |
| POST | `/people/invoices/:id/pay` | `invoice.pay` |

#### Colaboradores (`collaborators.controller.ts`)

| Metodo | Rota | Action |
|--------|------|--------|
| PATCH | `/people/collaborators/:id` | `collaborator.update` |

#### Dependentes (`dependents.controller.ts`)

| Metodo | Rota | Action |
|--------|------|--------|
| POST | `/people/collaborators/:collaboratorId/dependents` | `dependent.create` |
| PATCH | `/people/collaborators/:collaboratorId/dependents/:id` | `dependent.update` |
| DELETE | `/people/collaborators/:collaboratorId/dependents/:id` | `dependent.delete` |

#### Usuarios (`users.controller.ts`)

| Metodo | Rota | Action |
|--------|------|--------|
| POST | `/users` | `user.create` |

### 4.3 Como Adicionar Auditoria a Novos Endpoints

1. Importe o decorator:
```typescript
import { Auditable } from '../../../common/decorators/auditable.decorator';
```

2. Adicione acima do metodo do controller:
```typescript
@Post(':id/cancel')
@Roles('admin')
@Auditable({ action: 'order.cancel', entity: 'order' })
async cancel(@Param('id') id: string) { ... }
```

3. Pronto. O `AuditInterceptor` global faz o resto automaticamente.

---

## 5. Sanitizacao de Payload

O `AuditService` remove campos sensiveis do request body antes de gravar no banco. Campos sanitizados (substituidos por `[REDACTED]`):

- `password`
- `token`
- `secret`
- `accessToken`
- `refreshToken`
- `authorization`
- `creditCard`
- `cardNumber`
- `cvv`
- `ssn`
- `cpf`

A sanitizacao e recursiva — funciona em objetos aninhados e arrays.

---

## 6. Queries Uteis para Auditoria

### Historico de um reembolso especifico

```sql
SELECT action, actor_id, actor_role, payload, created_at
FROM audit_logs
WHERE entity_type = 'reimbursement' AND entity_id = '<uuid>'
ORDER BY created_at;
```

### Todas as acoes de um usuario

```sql
SELECT action, entity_type, entity_id, created_at
FROM audit_logs
WHERE actor_id = '<uuid>'
ORDER BY created_at DESC;
```

### Todas as aprovacoes de reembolso num periodo

```sql
SELECT actor_id, actor_role, entity_id, created_at
FROM audit_logs
WHERE action = 'reimbursement.approve'
  AND created_at BETWEEN '2026-02-01' AND '2026-02-28'
ORDER BY created_at;
```

### Contagem de acoes por usuario (ranking)

```sql
SELECT actor_id, actor_role, COUNT(*) as total_actions
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY actor_id, actor_role
ORDER BY total_actions DESC;
```

---

## 7. Decisoes de Design

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| Storage | PostgreSQL (mesma instancia Supabase) | Volume moderado de acoes sensiveis; consultavel via SQL; mesma infra |
| Imutabilidade | Append-only (sem UPDATE/DELETE) | Garante integridade do log de auditoria |
| Performance | Fire-and-forget (async sem await) | Nao impacta latencia das respostas; erro no audit nao falha o request |
| Escopo | Apenas acoes sensiveis via `@Auditable()` | Evita volume desnecessario; facil de expandir adicionando o decorator |
| Before-state | Nao capturado nesta versao | Payload do request ja indica o que foi alterado; diff completo pode ser adicionado futuramente |
| Sanitizacao | Recursiva em campos sensiveis | Previne vazamento de dados em logs |

---

## 8. Evolucoes Futuras

- **Captura de before-state:** Decorator `@AuditWithSnapshot()` que busca o estado anterior da entidade antes da operacao, permitindo diff completo
- **Particionamento por mes:** Se o volume crescer, particionar a tabela `audit_logs` por `created_at`
- **Dashboard de auditoria no backoffice:** Tela para admin/compliance visualizar e filtrar o log
- **Exportacao:** Endpoint para exportar audit logs em CSV/XLSX para auditorias externas
- **Retencao:** Politica de retencao (ex: mover logs > 2 anos para cold storage)
- **RLS granular:** Policies para que cada role veja apenas os logs relevantes

---

## 9. Arquivos Relacionados

### Novos

| Arquivo | Descricao |
|---------|-----------|
| `apps/api/src/database/schema/audit.ts` | Schema Drizzle da tabela `audit_logs` |
| `apps/api/src/common/decorators/auditable.decorator.ts` | Decorator `@Auditable()` |
| `apps/api/src/common/interceptors/audit-trail.interceptor.ts` | Interceptor global de auditoria |
| `apps/api/src/common/services/audit.service.ts` | Service de escrita no banco |
| `apps/api/src/common/audit.module.ts` | Modulo NestJS global |

### Modificados

| Arquivo | Modificacao |
|---------|-------------|
| `apps/api/src/database/schema/index.ts` | Exporta `auditLogs` |
| `apps/api/src/app.module.ts` | Registra `AuditModule` + `AuditInterceptor` |
| `apps/api/src/modules/people/controllers/reimbursements.controller.ts` | `@Auditable()` em 4 endpoints |
| `apps/api/src/modules/people/controllers/invoices.controller.ts` | `@Auditable()` em 4 endpoints |
| `apps/api/src/modules/people/controllers/collaborators.controller.ts` | `@Auditable()` em 1 endpoint |
| `apps/api/src/modules/people/controllers/dependents.controller.ts` | `@Auditable()` em 3 endpoints |
| `apps/api/src/modules/users/controllers/users.controller.ts` | `@Auditable()` em 1 endpoint |
