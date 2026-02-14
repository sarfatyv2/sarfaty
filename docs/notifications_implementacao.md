# Implementação do Sistema de Notificações

**Versão:** 1.0  
**Data:** 14 de Fevereiro de 2026  
**Status:** Implementado  

---

## 1. Visão Geral

Sistema de notificações automáticas integrado à plataforma Sarfaty. As notificações são disparadas automaticamente por ações de negócio (criação de cliente, aprovação de reembolso, publicação de curso, etc.) via event-driven architecture. O sistema cobre backend (NestJS), frontend (Next.js) e push em tempo real (Supabase Realtime).

**Princípios:**
- Event-driven — use-cases emitem eventos, handlers criam notificações (desacoplados)
- Notificação por role — cada tipo de notificação é direcionado aos perfis corretos (RBAC)
- Tempo real — Supabase Realtime faz push para o frontend via canal PostgreSQL
- Append-only — notificações são imutáveis após criação; apenas `read_at` é alterado

---

## 2. Arquitetura

### 2.1 Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS + Fastify + Drizzle ORM |
| Event Bus | `@nestjs/event-emitter` (EventEmitter2) |
| Frontend | Next.js 15 (App Router) + Tailwind + shadcn/ui |
| Banco | Supabase PostgreSQL (tabela `notifications` com RLS) |
| Realtime | Supabase Realtime (canal `postgres_changes`) |
| Tipos compartilhados | `@nexus/types`, `@nexus/validators`, `@nexus/utils` |

### 2.2 Fluxo de Dados

```
UseCase (ex: ApproveReimbursement)
  ↓ eventEmitter.emit('reimbursement.approved', payload)
EventHandler (PeopleNotificationHandler)
  ↓ resolve destinatários via NotificationResolverService
  ↓ cria notificações via NotificationDispatcherService
NotificationRepository → INSERT na tabela notifications
  ↓ Supabase Realtime detecta INSERT
Frontend (NotificationBell) → toast + badge update
```

### 2.3 Padrão DDD-light

```
Controller → UseCase → Domain Entity → Repository (interface)
                                            ↓
                                   Drizzle Repository (infra)

EventHandler → NotificationResolverService → NotificationDispatcherService → Repository
```

---

## 3. Banco de Dados

### 3.1 Tabela `notifications` (já existia)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | ID da notificação |
| `profile_id` | `UUID` FK → `profiles.id` | Destinatário |
| `type` | `TEXT` | Tipo da notificação (ex: `reimbursement_approved`) |
| `title` | `TEXT` | Título curto (ex: "Reembolso aprovado") |
| `message` | `TEXT` | Mensagem detalhada |
| `client_id` | `UUID` FK → `clients.id` | Referência ao cliente (opcional) |
| `metadata` | `JSONB` | Dados adicionais (IDs de recursos, razões, etc.) |
| `read_at` | `TIMESTAMPTZ` | Quando foi lida (NULL = não lida) |
| `created_at` | `TIMESTAMPTZ` | Data de criação |

**Índice:** `idx_notifications_profile` em `(profile_id, read_at)`.

**RLS:** Usuário vê apenas suas próprias notificações (`profile_id = auth.uid()`).

---

## 4. Backend — Módulo NestJS `notifications`

### 4.1 Estrutura de Diretórios

```
apps/api/src/modules/notifications/
├── notifications.module.ts              # @Global() module
├── controllers/
│   └── notifications.controller.ts      # 4 endpoints REST
├── use-cases/
│   ├── list-notifications.use-case.ts   # Listar paginado
│   ├── get-unread-count.use-case.ts     # Contagem de não lidas
│   ├── mark-as-read.use-case.ts         # Marcar individual
│   └── mark-all-as-read.use-case.ts     # Marcar todas
├── domain/
│   ├── notification.entity.ts           # Entity com reconstitute + toPlainObject
│   ├── notification.repository.ts       # Interface + Symbol NOTIFICATION_REPOSITORY
│   └── events/
│       ├── client-events.ts             # ClientCreatedEvent, ClientSubmittedEvent
│       ├── people-events.ts             # Reimbursement*, Invoice* events
│       └── learning-events.ts           # CoursePublishedEvent
├── infra/
│   ├── drizzle-notification.repository.ts    # Implementação Drizzle
│   ├── notification-dispatcher.service.ts    # Envia notificações (single + bulk)
│   ├── notification-resolver.service.ts      # Resolve destinatários
│   └── mappers/
│       └── notification.mapper.ts            # DB row → Entity
├── handlers/
│   ├── client-notification.handler.ts        # @OnEvent('client.*')
│   ├── people-notification.handler.ts        # @OnEvent('reimbursement.*', 'invoice.*')
│   └── learning-notification.handler.ts      # @OnEvent('course.*')
└── dto/
    └── list-notifications-query.dto.ts       # Re-export de @nexus/validators
```

### 4.2 Módulo — `@Global()`

O módulo é global para que `NotificationDispatcherService` e `NotificationResolverService` possam ser injetados em qualquer módulo sem import explícito. O `EventEmitterModule.forRoot({ wildcard: true })` está registrado no `app.module.ts`.

### 4.3 Entity — `Notification`

Entidade imutável (append-only). Métodos:
- `reconstitute(props)` — reconstituição a partir do banco
- `isRead()` — verifica se `readAt !== null`
- `toPlainObject()` — serialização para response HTTP

### 4.4 Repository — Interface

| Método | Retorno | Descrição |
|--------|---------|-----------|
| `create(data)` | `Notification` | Criar uma notificação |
| `createMany(data[])` | `void` | Bulk insert (dedup no dispatcher) |
| `findByProfileId(filters)` | `PaginatedNotifications` | Listar com paginação + filtro unread |
| `countUnreadByProfileId(id)` | `number` | Contagem de não lidas |
| `markAsRead(id, profileId)` | `boolean` | Marcar individual (retorna se atualizou) |
| `markAllAsRead(profileId)` | `number` | Marcar todas (retorna quantas atualizou) |
| `findById(id)` | `Notification \| null` | Buscar por ID |

---

## 5. API — Endpoints

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/notifications` | Todos os 18 roles | Listar notificações (paginado, filtro `unreadOnly`) |
| `GET` | `/api/notifications/unread-count` | Todos os 18 roles | Contagem de não lidas |
| `PATCH` | `/api/notifications/read-all` | Todos os 18 roles | Marcar todas como lidas |
| `PATCH` | `/api/notifications/:id/read` | Todos os 18 roles | Marcar individual como lida |

### 5.1 Query Params — Listagem

Herda de `paginationQuerySchema`:

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `page` | `number` | `1` | Página atual |
| `pageSize` | `number` | `20` | Itens por página (máx 100) |
| `sortOrder` | `'asc' \| 'desc'` | `'desc'` | Ordenação (sempre por `created_at`) |
| `unreadOnly` | `boolean` | `false` | Filtrar apenas não lidas |

---

## 6. Event System

### 6.1 Dependência

`@nestjs/event-emitter` (EventEmitter2) registrado com `wildcard: true` em `app.module.ts`.

### 6.2 Domain Events

| Evento | Classe | Payload |
|--------|--------|---------|
| `client.created` | `ClientCreatedEvent` | `clientId`, `companyName`, `actorId`, `actorName`, `teamId` |
| `client.submitted` | `ClientSubmittedEvent` | `clientId`, `companyName`, `actorId`, `actorName` |
| `reimbursement.approved` | `ReimbursementApprovedEvent` | `reimbursementId`, `collaboratorId`, `title`, `actorId` |
| `reimbursement.rejected` | `ReimbursementRejectedEvent` | `reimbursementId`, `collaboratorId`, `title`, `reason`, `actorId` |
| `reimbursement.pending_approval` | `ReimbursementPendingApprovalEvent` | `reimbursementId`, `collaboratorId`, `title`, `amount` |
| `invoice.approved` | `InvoiceApprovedEvent` | `invoiceId`, `collaboratorId`, `referenceMonth`, `referenceYear`, `actorId` |
| `invoice.rejected` | `InvoiceRejectedEvent` | `invoiceId`, `collaboratorId`, `referenceMonth`, `referenceYear`, `reason`, `actorId` |
| `course.published` | `CoursePublishedEvent` | `courseId`, `courseTitle`, `targetRoles`, `actorId` |

### 6.3 Use-Cases Integrados

| Módulo | Use Case | Evento Emitido | Destinatários |
|--------|----------|----------------|---------------|
| **Clients** | `CreateClientUseCase` | `client.created` | Supervisores da equipe do comercial |
| **Clients** | `SubmitForAnalysisUseCase` | `client.submitted` | Analistas de crédito |
| **People** | `ApproveReimbursementUseCase` | `reimbursement.approved` | Colaborador dono do reembolso |
| **People** | `RejectReimbursementUseCase` | `reimbursement.rejected` | Colaborador dono do reembolso |
| **People** | `ApproveInvoiceUseCase` | `invoice.approved` | Colaborador PJ dono da NF |
| **People** | `RejectInvoiceUseCase` | `invoice.rejected` | Colaborador PJ dono da NF |
| **Learning** | `PublishCourseUseCase` | `course.published` | Colaboradores dos `targetRoles` do curso |

Cada integração é uma única linha: `this.eventEmitter.emit(Event.EVENT_NAME, new Event(...))`.

---

## 7. Serviços de Infraestrutura

### 7.1 NotificationResolverService

Resolve `profile_id`s destinatários dado um contexto. Métodos:

| Método | Descrição |
|--------|-----------|
| `resolveByRoles(roles[])` | Profiles ativos com qualquer dos roles dados |
| `resolveByTeam(teamId, roles?)` | Profiles de uma equipe, opcionalmente filtrado por role |
| `resolveProfileByCollaboratorId(id)` | Profile ID de um colaborador |
| `resolveManagerForCollaborator(id)` | Gestores (`people_manager`, `sales_supervisor`) da equipe do colaborador |

### 7.2 NotificationDispatcherService

Cria notificações no banco. Métodos:

| Método | Descrição |
|--------|-----------|
| `sendToProfile(input)` | Envia para um único profile |
| `sendToProfiles(ids[], notification)` | Envia para múltiplos (bulk insert com dedup) |

Ambos usam `try/catch` com logging — falhas de notificação não afetam o fluxo principal.

---

## 8. Event Handlers

### 8.1 ClientNotificationHandler

| Evento | Tipo DB | Título | Destinatários |
|--------|---------|--------|---------------|
| `client.created` | `client_approved` | "Novo cliente cadastrado" | Supervisores da equipe |
| `client.submitted` | `new_client_in_queue` | "Novo cliente na fila de análise" | Analistas de crédito |

### 8.2 PeopleNotificationHandler

| Evento | Tipo DB | Título | Destinatários |
|--------|---------|--------|---------------|
| `reimbursement.approved` | `reimbursement_approved` | "Reembolso aprovado" | Colaborador dono |
| `reimbursement.rejected` | `reimbursement_rejected` | "Reembolso recusado" | Colaborador dono |
| `reimbursement.pending_approval` | `reimbursement_pending_approval` | "Reembolso pendente de aprovação" | Gestores do time |
| `invoice.approved` | `pj_invoice_uploaded` | "Nota fiscal aprovada" | Colaborador PJ |
| `invoice.rejected` | `pj_invoice_overdue` | "Nota fiscal rejeitada" | Colaborador PJ |

### 8.3 LearningNotificationHandler

| Evento | Tipo DB | Título | Destinatários |
|--------|---------|--------|---------------|
| `course.published` | `review_cycle_open` | "Novo curso disponível" | Profiles dos `targetRoles` do curso |

---

## 9. Pacotes Compartilhados

### 9.1 `@nexus/types` — `packages/types/src/notification.ts`

| Export | Tipo | Descrição |
|--------|------|-----------|
| `NOTIFICATION_TYPES` | `const tuple` | 64 tipos possíveis de notificação |
| `NotificationType` | `type` | Union type dos tipos |
| `NotificationEventType` | `type` | Union type dos eventos de domínio |
| `NotificationEventPayload` | `interface` | Payload base dos eventos |

### 9.2 `@nexus/validators` — `packages/validators/src/notification.schema.ts`

| Schema | Uso | Campos |
|--------|-----|--------|
| `listNotificationsQuerySchema` | `GET /notifications` | Herda `paginationQuerySchema` + `unreadOnly: boolean` |

### 9.3 `@nexus/utils` — `packages/utils/src/notification-config.ts`

| Export | Tipo | Descrição |
|--------|------|-----------|
| `NOTIFICATION_TYPE_LABELS` | `Partial<Record>` | Labels em pt-BR para cada tipo |
| `NOTIFICATION_TYPE_ICONS` | `Partial<Record>` | Nome do ícone Lucide para cada tipo |
| `getNotificationTypeLabel(type)` | `function` | Retorna label ou fallback (o próprio type) |
| `getNotificationTypeIcon(type)` | `function` | Retorna ícone ou fallback (`'Bell'`) |

---

## 10. Frontend — Web Backoffice

### 10.1 NotificationBell — Componente no Header

**Arquivo:** `apps/web-backoffice/src/components/notification-bell.tsx`

- Botão circular de 40px com ícone de sino no header
- Badge vermelho com contagem de não lidas (máx "99+")
- Dropdown com as 8 últimas notificações ao clicar
- Cada item mostra: título, mensagem (2 linhas), tempo relativo, ponto azul se não lida
- Botão "Marcar todas como lidas" no topo do dropdown
- Link "Ver todas as notificações" no rodapé do dropdown
- Polling de 30s para atualizar contagem
- Supabase Realtime para push instantâneo

### 10.2 Página `/notifications`

**Arquivo:** `apps/web-backoffice/src/app/(dashboard)/notifications/page.tsx`

- Lista completa paginada (20 por página)
- Toggle de filtro: "Todas" / "Não lidas"
- Botão "Marcar todas como lidas"
- Cada notificação mostra:
  - Ícone circular por tipo (Lucide icons)
  - Título + data/hora formatada
  - Mensagem completa
  - Badge com label do tipo
  - Link "Ver detalhes" para o recurso relacionado
  - Botão check para marcar individual como lida
- Paginação com botões "Anterior" / "Próxima" e contagem total

### 10.3 Links de Navegação

| Tipo de Notificação | Link |
|---------------------|------|
| Notificação com `clientId` | `/clients/{clientId}` |
| Metadata com `reimbursementId` | `/people/me/reimbursements` |
| Metadata com `invoiceId` | `/people/me/invoices` |
| Metadata com `courseId` | `/learning/{courseId}` |

### 10.4 Supabase Realtime

**Hook:** `apps/web-backoffice/src/hooks/use-notification-realtime.ts`

- Escuta canal `notifications:{userId}` via Supabase Realtime
- Filtra `INSERT` na tabela `notifications` com `profile_id=eq.{userId}`
- Ao receber nova notificação:
  - Exibe toast com título e mensagem (sonner, 5s)
  - Atualiza contagem de não lidas no bell
  - Recarrega lista se o dropdown estiver aberto
- Cleanup automático ao desmontar o componente

---

## 11. Alterações no Header

**Arquivo:** `apps/web-backoffice/src/components/header.tsx`

- `NotificationBell` adicionado à esquerda do `UserMenu`
- Sino em botão circular 40px com borda e fundo sutil
- Avatar do usuário aumentado de 32px para 40px (`h-10 w-10`)
- Gap de 8px entre sino e avatar

---

## 12. Permissões (RBAC)

Todos os 18 roles têm acesso aos endpoints de notificação. A segurança é garantida por:

1. **RLS no banco** — usuário só vê notificações com `profile_id` = seu ID
2. **Controller** — usa `@CurrentUser()` para filtrar por `user.id`
3. **Handlers** — resolvem destinatários via `NotificationResolverService` que consulta roles e teams ativos

---

## 13. Como Adicionar Novos Eventos

Para adicionar um novo tipo de notificação:

1. **Criar event class** em `modules/notifications/domain/events/` com payload e `EVENT_NAME`
2. **Criar handler** (ou adicionar `@OnEvent()` a um handler existente) em `modules/notifications/handlers/`
3. **Emitir evento** no use-case com `this.eventEmitter.emit(Event.EVENT_NAME, new Event(...))`
4. **Adicionar tipo** em `NOTIFICATION_TYPES` em `packages/types/src/notification.ts`
5. **Adicionar label/ícone** em `packages/utils/src/notification-config.ts`
6. **Rebuild packages** — `pnpm --filter @nexus/types build && pnpm --filter @nexus/utils build`
