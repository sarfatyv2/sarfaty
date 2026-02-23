# Implementação dos Módulos Governance e Communication

**Versão:** 1.0  
**Data:** 23 de Fevereiro de 2026  
**Status:** Implementado  

---

## 1. Visão Geral

Dois módulos NestJS que cobrem governança corporativa e comunicação interna da Sarfaty:

- **`governance`** — gerencia comitês, membros, reuniões, atas e itens de ação com rastreabilidade completa.
- **`communication`** — cobre base de conhecimento interna (wiki com rich text) e comunicados institucionais (intranet).

Ambos seguem o padrão DDD leve de 4 camadas: `Controller → UseCase → Domain → Repository`.

---

## 2. Módulo Governance

### 2.1 Entidades e Modelo de Domínio

#### Committee

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | `string` (UUID) | Identificador único |
| `name` | `string` | Nome do comitê (mín. 2 chars) |
| `description` | `string \| null` | Descrição livre |
| `regulation` | `string \| null` | Texto do regulamento (rich text) |
| `frequency` | `CommitteeFrequency` | `weekly`, `biweekly`, `monthly`, `quarterly`, `adhoc` |
| `status` | `CommitteeStatus` | `active`, `inactive` |
| `createdBy` | `string` (UUID) | Profile que criou |

**Métodos do domínio:**
- `create(props)` — factory, status inicial `active`, valida nome (≥2 chars)
- `reconstitute(props)` — reconstituição do banco
- `isActive()` — `status === 'active'`

#### Meeting

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | `string` (UUID) | Identificador único |
| `committeeId` | `string` (UUID) | FK → Committee |
| `title` | `string` | Título da reunião |
| `description` | `string \| null` | Pauta ou descrição |
| `scheduledAt` | `Date` | Data/hora agendada |
| `locationOrLink` | `string \| null` | Local ou link de videoconferência |
| `status` | `MeetingStatus` | `scheduled`, `happening`, `completed`, `canceled` |
| `createdBy` | `string` (UUID) | Profile que criou |

#### MeetingMinute (Ata)

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | `string` (UUID) | Identificador único |
| `meetingId` | `string` (UUID) | FK → Meeting (1:1) |
| `content` | `unknown` (JSON) | Conteúdo rich text (formato Tiptap/ProseMirror) |
| `status` | `MinuteStatus` | `draft`, `published` |
| `publishedAt` | `Date \| null` | Data de publicação |
| `publishedBy` | `string \| null` | Profile que publicou |
| `createdBy` | `string` (UUID) | Profile que criou |

**Regra:** só pode publicar ata em status `draft`. Após publicação, `status` muda para `published` e `publishedAt` é definido.

#### ActionItem (Item de Ação)

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | `string` (UUID) | Identificador único |
| `committeeId` | `string` (UUID) | FK → Committee |
| `minuteId` | `string \| null` | FK → MeetingMinute (opcional) |
| `title` | `string` | Título da ação |
| `description` | `string \| null` | Descrição detalhada |
| `assigneeId` | `string \| null` | Profile responsável |
| `groupLabel` | `string \| null` | Agrupador livre (ex: "Regulatório", "Financeiro") |
| `dueDate` | `Date \| null` | Prazo |
| `status` | `ActionItemStatus` | `todo`, `in_progress`, `blocked`, `done` |
| `createdBy` | `string` (UUID) | Profile que criou |

**Métodos do domínio:**
- `create(props)` — factory, status inicial `todo`
- `isOverdue()` — `dueDate < now && status !== 'done'`
- `isDueSoon(withinDays = 3)` — prazo nos próximos N dias e não concluído
- `toPlainObject()` — expõe `isOverdue` e `isDueSoon` computados no response

#### CommitteeMember

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | `string` (UUID) | Identificador único |
| `committeeId` | `string` (UUID) | FK → Committee |
| `profileId` | `string` (UUID) | FK → Profile |
| `role` | `CommitteeMemberRole` | `president`, `secretary`, `member` |
| `invitedBy` | `string` (UUID) | Profile que convidou |

**Invariante:** cada profile pode ser membro de um comitê apenas uma vez (`member_already_exists` exception).

---

### 2.2 Estrutura de Diretórios

```
apps/api/src/modules/governance/
├── governance.module.ts
├── controllers/
│   ├── committees.controller.ts     # Comitês + membros
│   ├── meetings.controller.ts       # Reuniões + atas
│   └── actions.controller.ts        # Itens de ação + atualizações
├── use-cases/
│   ├── create-committee.use-case.ts
│   ├── list-committees.use-case.ts
│   ├── get-committee.use-case.ts
│   ├── update-committee.use-case.ts
│   ├── invite-member.use-case.ts
│   ├── create-meeting.use-case.ts
│   ├── upsert-minute.use-case.ts    # Cria ou atualiza a ata (1:1 por reunião)
│   ├── publish-minute.use-case.ts
│   ├── create-action-item.use-case.ts
│   ├── list-action-items.use-case.ts
│   ├── update-action-item.use-case.ts
│   └── add-action-update.use-case.ts
├── domain/
│   ├── committee.entity.ts
│   ├── committee.repository.ts      # Interface + COMMITTEE_REPOSITORY symbol
│   ├── committee-member.repository.ts
│   ├── meeting.entity.ts
│   ├── meeting-minute.entity.ts
│   ├── meeting.repository.ts        # Interface MEETING_REPOSITORY + MINUTE_REPOSITORY
│   ├── action-item.entity.ts
│   ├── action-update.entity.ts
│   ├── action-item.repository.ts    # Interface ACTION_ITEM_REPOSITORY + ACTION_UPDATE_REPOSITORY
│   └── exceptions/
│       ├── committee-not-found.exception.ts
│       ├── meeting-not-found.exception.ts
│       ├── action-item-not-found.exception.ts
│       └── member-already-exists.exception.ts
├── infra/
│   ├── drizzle-committee.repository.ts
│   ├── drizzle-committee-member.repository.ts
│   ├── drizzle-meeting.repository.ts
│   ├── drizzle-action-item.repository.ts
│   ├── action-reminder.scheduler.ts  # CRON diário para lembretes
│   └── mappers/
│       ├── committee.mapper.ts
│       ├── meeting.mapper.ts
│       ├── meeting-minute.mapper.ts
│       └── action-item.mapper.ts
└── dto/                               # Re-exports de @nexus/validators
```

---

### 2.3 Banco de Dados — Tabelas Governance

#### `gov_committees`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | Gerado no banco |
| `name` | `TEXT NOT NULL` | Nome do comitê |
| `description` | `TEXT` | Descrição |
| `regulation` | `TEXT` | Regulamento (rich text JSON) |
| `frequency` | `TEXT NOT NULL` | `weekly`/`biweekly`/`monthly`/`quarterly`/`adhoc` |
| `status` | `TEXT NOT NULL` | `active`/`inactive` (default `active`) |
| `created_by` | `UUID` FK → `profiles` | |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

#### `gov_committee_members`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | |
| `committee_id` | `UUID` FK → `gov_committees` | |
| `profile_id` | `UUID` FK → `profiles` | |
| `role` | `TEXT NOT NULL` | `president`/`secretary`/`member` |
| `invited_by` | `UUID` FK → `profiles` | |
| `created_at` | `TIMESTAMPTZ` | |

**Constraint:** `UNIQUE(committee_id, profile_id)` — evita membros duplicados.

#### `gov_meetings`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | |
| `committee_id` | `UUID` FK → `gov_committees` | |
| `title` | `TEXT NOT NULL` | |
| `description` | `TEXT` | |
| `scheduled_at` | `TIMESTAMPTZ NOT NULL` | Data/hora da reunião |
| `location_or_link` | `TEXT` | Local ou URL |
| `status` | `TEXT NOT NULL` | `scheduled`/`happening`/`completed`/`canceled` |
| `created_by` | `UUID` FK → `profiles` | |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

#### `gov_meeting_minutes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | |
| `meeting_id` | `UUID` FK → `gov_meetings` UNIQUE | 1:1 com reunião |
| `content` | `JSONB` | Rich text (formato Tiptap) |
| `status` | `TEXT NOT NULL` | `draft`/`published` |
| `published_at` | `TIMESTAMPTZ` | |
| `published_by` | `UUID` FK → `profiles` | |
| `created_by` | `UUID` FK → `profiles` | |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

#### `gov_action_items`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | |
| `committee_id` | `UUID` FK → `gov_committees` | |
| `minute_id` | `UUID` FK → `gov_meeting_minutes` | Opcional — quando gerada de uma ata |
| `title` | `TEXT NOT NULL` | |
| `description` | `TEXT` | |
| `assignee_id` | `UUID` FK → `profiles` | Responsável (opcional) |
| `group_label` | `TEXT` | Agrupador (ex: "Regulatório") |
| `due_date` | `DATE` | Prazo |
| `status` | `TEXT NOT NULL` | `todo`/`in_progress`/`blocked`/`done` |
| `created_by` | `UUID` FK → `profiles` | |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

#### `gov_action_updates`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | |
| `action_item_id` | `UUID` FK → `gov_action_items` | |
| `author_id` | `UUID` FK → `profiles` | |
| `comment` | `TEXT NOT NULL` | Atualização de progresso |
| `status_change` | `TEXT` | Status anterior → novo (ex: `todo→in_progress`) |
| `created_at` | `TIMESTAMPTZ` | |

---

### 2.4 API — Endpoints

#### Comitês

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/governance/committees` | MANAGE_ROLES | Criar comitê |
| `GET` | `/api/governance/committees` | READ_ROLES | Listar (filtro `status`, `search`, paginação) |
| `GET` | `/api/governance/committees/:id` | READ_ROLES | Detalhe do comitê |
| `PATCH` | `/api/governance/committees/:id` | MANAGE_ROLES | Atualizar comitê |
| `GET` | `/api/governance/committees/:id/members` | READ_ROLES | Listar membros (com profile enriquecido) |
| `POST` | `/api/governance/committees/:id/members` | MANAGE_ROLES | Convidar membro |
| `PATCH` | `/api/governance/committees/:id/members/:memberId/role` | MANAGE_ROLES | Alterar role do membro |
| `DELETE` | `/api/governance/committees/:id/members/:memberId` | MANAGE_ROLES | Remover membro |

#### Reuniões e Atas

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/governance/committees/:committeeId/meetings` | MANAGE_ROLES | Criar reunião |
| `GET` | `/api/governance/committees/:committeeId/meetings` | READ_ROLES | Listar reuniões (filtro `status`, paginação) |
| `GET` | `/api/governance/committees/:committeeId/meetings/:meetingId` | READ_ROLES | Detalhe da reunião |
| `PATCH` | `/api/governance/committees/:committeeId/meetings/:meetingId` | MANAGE_ROLES | Atualizar reunião |
| `GET` | `/api/governance/committees/:committeeId/meetings/:meetingId/minute` | READ_ROLES | Obter ata (null se não existe) |
| `POST` | `/api/governance/committees/:committeeId/meetings/:meetingId/minute` | MANAGE_ROLES | Criar ou atualizar ata (upsert) |
| `POST` | `/api/governance/committees/:committeeId/meetings/:meetingId/minute/publish` | MANAGE_ROLES | Publicar ata (draft → published) |

#### Itens de Ação

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/governance/committees/:committeeId/actions` | MANAGE_ROLES | Criar item de ação |
| `GET` | `/api/governance/actions` | READ_ROLES | Listar ações (filtros: `committeeId`, `status`, `assigneeId`, paginação) |
| `GET` | `/api/governance/actions/:id` | READ_ROLES | Detalhe do item |
| `PATCH` | `/api/governance/actions/:id` | READ_ROLES | Atualizar status/prazo/responsável |
| `DELETE` | `/api/governance/actions/:id` | MANAGE_ROLES | Excluir item |
| `GET` | `/api/governance/actions/:id/updates` | READ_ROLES | Listar atualizações de progresso |
| `POST` | `/api/governance/actions/:id/updates` | READ_ROLES | Adicionar atualização de progresso |

**MANAGE_ROLES:** `governance`, `admin`, `legal`, `compliance_officer`, `backoffice`  
**READ_ROLES:** MANAGE_ROLES + `sales_director`, `hr_admin`, `people_manager`

---

### 2.5 CRON — ActionReminderScheduler

**Arquivo:** `apps/api/src/modules/governance/infra/action-reminder.scheduler.ts`

| Job | Horário | Ação |
|-----|---------|------|
| `sendDueSoonReminders` | Diariamente às **8h** (America/Sao_Paulo) | Notifica responsáveis de ações com prazo nos próximos 3 dias |
| `sendOverdueReminders` | Diariamente às **9h** (America/Sao_Paulo) | Notifica responsáveis de ações com prazo vencido |

Usa `NotificationDispatcherService` (módulo Notifications é `@Global()`). Falhas são logadas e não afetam o fluxo principal.

---

## 3. Módulo Communication

### 3.1 Entidades e Modelo de Domínio

#### WikiCategory

Estrutura em árvore com auto-referência (`parentId`). Sem entity de domínio própria — CRUD direto via repository (sem regras de negócio).

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | `string` (UUID) | |
| `name` | `string` | Nome da categoria |
| `slug` | `string` | URL-friendly, único |
| `description` | `string \| null` | |
| `parentId` | `string \| null` | FK → self (hierarquia) |
| `sortOrder` | `number` | Ordem de exibição |
| `children?` | `WikiCategory[]` | Populado no frontend via `buildCategoryTree()` |

#### WikiArticle

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | `string` (UUID) | |
| `categoryId` | `string` (UUID) | FK → WikiCategory |
| `title` | `string` | Título do artigo |
| `slug` | `string` | URL-friendly, único |
| `content` | `unknown` (JSON) | Rich text (formato Tiptap/ProseMirror) |
| `status` | `WikiArticleStatus` | `draft`, `published` |
| `authorId` | `string` (UUID) | Quem criou |
| `lastUpdatedBy` | `string \| null` | Última edição |
| `publishedAt` | `Date \| null` | Data de publicação |

**Métodos do domínio:**
- `create(props)` — factory, status inicial `draft`, `publishedAt = null`
- `canPublish()` — `status === 'draft'`
- Quando `PATCH` com `status: 'published'` e `publishedAt` é null → `publishedAt` é definido automaticamente

#### Announcement (Comunicado)

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | `string` (UUID) | |
| `title` | `string` | Título do comunicado |
| `content` | `string` (rich text) | Corpo do comunicado |
| `coverImageUrl` | `string \| null` | Imagem de capa |
| `targetRoles` | `Role[]` | Roles que devem ver o comunicado |
| `status` | `AnnouncementStatus` | `draft`, `published`, `archived` |
| `authorId` | `string` (UUID) | Quem criou |
| `publishedAt` | `Date \| null` | Data de publicação |
| `expiresAt` | `Date \| null` | Data de expiração |

**Filtragem:** `GET /intranet/announcements` filtra automaticamente por `targetRoles` contendo o role do usuário autenticado — cada usuário vê apenas comunicados direcionados ao seu papel.

---

### 3.2 Estrutura de Diretórios

```
apps/api/src/modules/communication/
├── communication.module.ts
├── controllers/
│   ├── wiki.controller.ts           # Categorias + artigos
│   └── intranet.controller.ts       # Comunicados
├── domain/
│   ├── wiki-article.entity.ts
│   ├── wiki.repository.ts           # WIKI_CATEGORY_REPOSITORY + WIKI_ARTICLE_REPOSITORY
│   ├── announcement.entity.ts
│   ├── announcement.repository.ts   # ANNOUNCEMENT_REPOSITORY
│   └── exceptions/
│       ├── wiki-article-not-found.exception.ts
│       └── announcement-not-found.exception.ts
├── infra/
│   ├── drizzle-wiki.repository.ts
│   ├── drizzle-announcement.repository.ts
│   └── mappers/
│       ├── wiki-article.mapper.ts
│       └── announcement.mapper.ts
└── (sem use-cases explícitos — lógica simples direto nos controllers com repositories injetados)
```

> **Nota:** O módulo Communication é mais simples que Governance. Por não ter regras de negócio complexas além de publicação de status, os controllers interagem diretamente com repositories e entidades, sem camada de use-case intermediária — exceto `WikiArticle` que tem um entity com `create()` e `canPublish()`.

---

### 3.3 Banco de Dados — Tabelas Communication

#### `comm_wiki_categories`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | |
| `name` | `TEXT NOT NULL` | |
| `slug` | `TEXT UNIQUE NOT NULL` | URL-friendly |
| `description` | `TEXT` | |
| `parent_id` | `UUID` FK → self | Hierarquia de categorias |
| `sort_order` | `INTEGER NOT NULL` | Ordem de exibição |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

#### `comm_wiki_articles`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | |
| `category_id` | `UUID` FK → `comm_wiki_categories` | |
| `title` | `TEXT NOT NULL` | |
| `slug` | `TEXT UNIQUE NOT NULL` | |
| `content` | `JSONB` | Rich text (formato Tiptap) |
| `status` | `TEXT NOT NULL` | `draft`/`published` (default `draft`) |
| `author_id` | `UUID` FK → `profiles` | |
| `last_updated_by` | `UUID` FK → `profiles` | |
| `published_at` | `TIMESTAMPTZ` | Definido automaticamente na publicação |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

**Índice:** `idx_wiki_articles_category` em `(category_id, status)`.

#### `comm_announcements`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` PK | |
| `title` | `TEXT NOT NULL` | |
| `content` | `TEXT NOT NULL` | Rich text |
| `cover_image_url` | `TEXT` | |
| `target_roles` | `TEXT[] NOT NULL` | Array de roles destinatários |
| `status` | `TEXT NOT NULL` | `draft`/`published`/`archived` |
| `author_id` | `UUID` FK → `profiles` | |
| `published_at` | `TIMESTAMPTZ` | |
| `expires_at` | `TIMESTAMPTZ` | |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

**Índice:** `idx_announcements_target_roles` usando `GIN` em `target_roles` para filtros eficientes por role.

---

### 3.4 API — Endpoints

#### Wiki — Categorias

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/wiki/categories` | Todos (19 roles) | Listar todas as categorias (árvore plana — frontend monta hierarquia) |
| `POST` | `/api/wiki/categories` | EDITOR_ROLES | Criar categoria |
| `PATCH` | `/api/wiki/categories/:id` | EDITOR_ROLES | Atualizar categoria |
| `DELETE` | `/api/wiki/categories/:id` | EDITOR_ROLES | Excluir categoria |

#### Wiki — Artigos

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/wiki/articles` | Todos (19 roles) | Listar artigos (filtro `categoryId`, `status`, `search`, paginação) |
| `GET` | `/api/wiki/articles/:slug` | Todos (19 roles) | Buscar artigo por slug |
| `POST` | `/api/wiki/articles` | EDITOR_ROLES | Criar artigo (status inicial `draft`) |
| `PATCH` | `/api/wiki/articles/:id` | EDITOR_ROLES | Atualizar (publicar via `status: 'published'`) |
| `DELETE` | `/api/wiki/articles/:id` | EDITOR_ROLES | Excluir artigo |

#### Intranet — Comunicados

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/intranet/announcements` | Todos (19 roles) | Listar publicados filtrados pelo role do usuário |
| `GET` | `/api/intranet/announcements/admin` | AUTHOR_ROLES | Listar todos (sem filtro de role, para gestão) |
| `GET` | `/api/intranet/announcements/:id` | AUTHOR_ROLES | Detalhe (gestão) |
| `POST` | `/api/intranet/announcements` | AUTHOR_ROLES | Criar comunicado |
| `PATCH` | `/api/intranet/announcements/:id` | AUTHOR_ROLES | Atualizar / publicar / arquivar |
| `DELETE` | `/api/intranet/announcements/:id` | AUTHOR_ROLES | Excluir comunicado |

**EDITOR_ROLES / AUTHOR_ROLES:** `admin`, `governance`, `hr_admin`, `people_manager`, `legal`, `compliance_officer`

---

## 4. Pacotes Compartilhados

### 4.1 `@nexus/types`

#### `packages/types/src/governance.ts`

| Export | Tipo | Descrição |
|--------|------|-----------|
| `COMMITTEE_FREQUENCIES` | `const tuple` | `weekly`, `biweekly`, `monthly`, `quarterly`, `adhoc` |
| `CommitteeFrequency` | `type` | Union type |
| `COMMITTEE_STATUSES` | `const tuple` | `active`, `inactive` |
| `CommitteeStatus` | `type` | Union type |
| `COMMITTEE_MEMBER_ROLES` | `const tuple` | `president`, `secretary`, `member` |
| `CommitteeMemberRole` | `type` | Union type |
| `MEETING_STATUSES` | `const tuple` | `scheduled`, `happening`, `completed`, `canceled` |
| `MeetingStatus` | `type` | Union type |
| `MINUTE_STATUSES` | `const tuple` | `draft`, `published` |
| `MinuteStatus` | `type` | Union type |
| `ACTION_ITEM_STATUSES` | `const tuple` | `todo`, `in_progress`, `blocked`, `done` |
| `ActionItemStatus` | `type` | Union type |
| `Committee` | `interface` | Shape da entity serializada |
| `CommitteeMember` | `interface` | Com `profile?` enriquecido |
| `Meeting` | `interface` | Shape da entity |
| `MeetingMinute` | `interface` | Com content como `unknown` (JSON Tiptap) |
| `ActionItem` | `interface` | Com `assignee?` enriquecido |
| `ActionUpdate` | `interface` | Com `author?` enriquecido |

#### `packages/types/src/communication.ts`

| Export | Tipo | Descrição |
|--------|------|-----------|
| `WikiCategory` | `interface` | Com `children?: WikiCategory[]` para árvore no frontend |
| `WikiArticle` | `interface` | Com content como `unknown` (JSON Tiptap) |
| `WikiArticleStatus` | `type` | `'draft' \| 'published'` |
| `Announcement` | `interface` | Com `targetRoles: Role[]` |
| `AnnouncementStatus` | `type` | `'draft' \| 'published' \| 'archived'` |

### 4.2 `@nexus/validators`

#### `packages/validators/src/governance.schema.ts`

| Schema | Endpoint | Campos principais |
|--------|----------|-------------------|
| `createCommitteeSchema` | `POST /governance/committees` | `name`, `description?`, `regulation?`, `frequency` |
| `updateCommitteeSchema` | `PATCH /governance/committees/:id` | Todos opcionais (partial) |
| `listCommitteesQuerySchema` | `GET /governance/committees` | Herda paginação + `status?`, `search?` |
| `inviteMemberSchema` | `POST .../members` | `profileId`, `role` |
| `updateMemberRoleSchema` | `PATCH .../members/:id/role` | `role` |
| `createMeetingSchema` | `POST .../meetings` | `title`, `description?`, `scheduledAt`, `locationOrLink?` |
| `updateMeetingSchema` | `PATCH .../meetings/:id` | Todos opcionais |
| `listMeetingsQuerySchema` | `GET .../meetings` | Herda paginação + `status?`, `sortOrder` |
| `upsertMinuteSchema` | `POST .../minute` | `content` (JSON Tiptap) |
| `createActionItemSchema` | `POST .../actions` | `title`, `description?`, `assigneeId?`, `groupLabel?`, `dueDate?`, `minuteId?` |
| `updateActionItemSchema` | `PATCH /governance/actions/:id` | Todos opcionais + `status?` |
| `listActionItemsQuerySchema` | `GET /governance/actions` | Herda paginação + `committeeId?`, `status?`, `assigneeId?` |
| `createActionUpdateSchema` | `POST .../updates` | `comment`, `statusChange?` |

#### `packages/validators/src/communication.schema.ts`

| Schema | Endpoint | Campos principais |
|--------|----------|-------------------|
| `createWikiCategorySchema` | `POST /wiki/categories` | `name`, `slug`, `description?`, `parentId?`, `sortOrder` |
| `updateWikiCategorySchema` | `PATCH /wiki/categories/:id` | Todos opcionais |
| `createWikiArticleSchema` | `POST /wiki/articles` | `categoryId`, `title`, `slug`, `content?` |
| `updateWikiArticleSchema` | `PATCH /wiki/articles/:id` | Todos opcionais + `status?` |
| `listWikiArticlesQuerySchema` | `GET /wiki/articles` | Herda paginação + `categoryId?`, `status?`, `search?` |
| `createAnnouncementSchema` | `POST /intranet/announcements` | `title`, `content`, `targetRoles[]`, `coverImageUrl?`, `expiresAt?` |
| `updateAnnouncementSchema` | `PATCH .../announcements/:id` | Todos opcionais + `status?` |
| `listAnnouncementsQuerySchema` | `GET /intranet/announcements` | Herda paginação + `status?`, `search?` |

---

## 5. Frontend — Web Backoffice

### 5.1 Módulo Governance

**Rota:** `apps/web-backoffice/src/app/(dashboard)/governance/`

```
governance/
├── page.tsx                          # Dashboard (KPIs + comitês ativos + ações pendentes)
├── _components/
│   └── governance-dashboard.tsx     # KPI cards, CommitteeCard, ActionItemRow
├── committees/
│   ├── page.tsx                      # Lista de comitês (CommitteesList)
│   ├── _components/
│   │   └── committees-list.tsx
│   └── [id]/
│       ├── page.tsx                  # Detalhe do comitê
│       └── _components/
│           └── committee-detail.tsx  # Tabs: Visão Geral, Membros, Reuniões, Ações
└── actions/
    ├── page.tsx                      # Lista de todos os itens de ação
    └── _components/
```

**Dashboard** (`/governance`):
- 4 KPI cards: Comitês ativos, Ações pendentes, Em andamento, Bloqueadas
- Grid de comitês ativos (máx 6) com hover animado
- Coluna de ações pendentes (status ≠ `done`) com indicator colorido por status e alerta de prazo vencido

### 5.2 Módulo Knowledge (Wiki)

**Rota:** `apps/web-backoffice/src/app/(dashboard)/knowledge/`

```
knowledge/
├── page.tsx                           # Server Component — resolve role e canEdit
└── _components/
    └── wiki-layout.tsx                # Client Component — layout completo
```

**Layout (`wiki-layout.tsx`):**
- Sidebar esquerda (240px): cabeçalho, "Todos os artigos", árvore de categorias, botão "Nova Categoria"
- Área principal: header com título da categoria, contagem, search, botão "Novo Artigo"
- Grid de artigos (1/2/3 colunas por breakpoint) com `ArticleCard`
- Leitor de artigo: breadcrumb de volta, metadados, `RichTextEditor` em modo `readOnly`

**Controle de acesso (frontend):**
- `page.tsx` (Server Component) lê o role do Supabase e passa `canEdit: boolean`
- `canEdit = true` apenas para: `admin`, `governance`, `hr_admin`, `people_manager`, `legal`, `compliance_officer`
- Botões "Novo Artigo", "Nova Categoria" e "Criar artigo" (empty state) são condicionais ao `canEdit`

### 5.3 Módulo Intranet

**Rota:** `apps/web-backoffice/src/app/(dashboard)/intranet/`

```
intranet/
├── page.tsx
└── _components/
```

---

## 6. Rich Text Editor (`@nexus/ui`)

**Arquivo:** `packages/ui/src/rich-text-editor.tsx`  
**Tecnologia:** Tiptap (baseado em ProseMirror)

Usado tanto nas atas de reunião quanto nos artigos da wiki.

| Prop | Tipo | Descrição |
|------|------|-----------|
| `value` | `unknown` | Conteúdo em formato JSON Tiptap |
| `onChange` | `(value: unknown) => void` | Callback de edição |
| `readOnly` | `boolean` | Modo leitura (sem toolbar, sem cursor de edição) |
| `toolbar` | `boolean` | Exibir/ocultar barra de ferramentas |
| `minHeight` | `string` | CSS min-height (ex: `'300px'`) |

O conteúdo é armazenado como `JSONB` no PostgreSQL e serializado/deserializado como `unknown` para evitar acoplamento ao schema do Tiptap.

---

## 7. Permissões RBAC — Resumo

| Ação | MANAGE / EDITOR / AUTHOR | READ (leitura) |
|------|--------------------------|----------------|
| Governance (criar/editar/excluir) | `governance`, `admin`, `legal`, `compliance_officer`, `backoffice` | + `sales_director`, `hr_admin`, `people_manager` |
| Wiki (criar/editar artigos) | `governance`, `admin`, `hr_admin`, `people_manager`, `legal`, `compliance_officer` | Todos os 19 roles |
| Intranet (criar comunicados) | `governance`, `admin`, `hr_admin`, `people_manager`, `legal`, `compliance_officer` | Todos os 19 roles (filtrado por `targetRoles`) |

---

## 8. Como Adicionar um Novo Tipo de Comitê / Frequência

1. Adicionar o valor em `COMMITTEE_FREQUENCIES` em `packages/types/src/governance.ts`
2. Atualizar `createCommitteeSchema` em `packages/validators/src/governance.schema.ts`
3. Atualizar o `CHECK` constraint no banco via migration
4. Rebuild: `pnpm --filter @nexus/types build && pnpm --filter @nexus/validators build`

## 9. Como Adicionar uma Nova Seção da Wiki

1. Criar categoria via `POST /api/wiki/categories` com `parentId: null` (raiz) ou `parentId: <id>` (sub-categoria)
2. A hierarquia é construída no frontend por `buildCategoryTree()` em `wiki-layout.tsx`
3. Não há limite de profundidade, mas o design suporta bem até 2 níveis

## 10. Fluxo Completo — Criação de Ata

```
1. Reunião criada (status: scheduled)
2. Reunião acontece → status atualizado para happening
3. Editor acessa /governance/committees/:id → aba Reuniões → clica em reunião
4. POST /api/.../minute com { content: <tiptap-json> }  ← upsert: cria se não existe, atualiza se existe
5. Edita, salva (PATCH também via POST upsert)
6. POST /api/.../minute/publish → status: draft → published, publishedAt = now
7. Ata publicada fica visível para todos os READ_ROLES em modo leitura
```
