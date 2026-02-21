# Implementação do Módulo Comercial — Cadastro de Cliente e Documentação

**Versão:** 3.0  
**Data:** 20 de Fevereiro de 2026  
**Status:** Backend + Frontend completos  
**Referência:** `spec_tecnico_modulo_comercial.md`  

---

## 1. Visão Geral

Este documento descreve a implementação do módulo comercial: cadastro de clientes, upload de documentação e checklist dinâmico. Cobre o fluxo "criar cliente e enviar documentação" — do cadastro pelo comercial até o envio para análise de crédito.

### 1.1 Escopo Implementado

- **Backend completo** — módulo NestJS `clients` com DDD (entity, repositories, use-cases, controllers)
- **Banco de dados** — 14 novas tabelas, RLS, funções SQL, bucket Storage
- **Seed data** — segmentos, produtos de crédito, tipos de garantia, templates de documentos
- **Tipos e validações compartilhados** — `@nexus/types` e `@nexus/validators`
- **Frontend completo** — lista de clientes (cards), formulário multi-step, detalhe com checklist de documentos
- **Utilitários compartilhados** — pipeline de status com fases, ícones, cores e helpers (`@nexus/utils`)

### 1.2 Escopo Pendente

- Atividades comerciais (página stub em `/activities`)
- Dashboard do comercial (página stub em `/dashboard`)

---

## 2. Banco de Dados — Migrations Supabase

Duas migrations aplicadas:

### 2.1 `create_commercial_tables` (20260213204924)

14 novas tabelas criadas:

| # | Tabela | Descrição |
|---|--------|-----------|
| 1 | `regions` | Regiões geográficas (hierarquia comercial) |
| 2 | `teams` | Equipes comerciais (FK region_id) |
| 3 | `segments` | Segmentos de mercado (Agro, Indústria, Comércio, Serviços, Imobiliário, Energia) |
| 4 | `credit_products` | Produtos de crédito (Capital de Giro, Antecipação, Aquisição, CRI/CRA, Real Estate, FIDCs) |
| 5 | `guarantee_types` | Tipos de garantia (Imóvel, Veículo, Recebíveis, Aval, Fiança, Seguro) |
| 6 | `segment_document_templates` | Templates de documentos por segmento |
| 7 | `product_document_templates` | Templates de documentos por produto |
| 8 | `guarantee_document_templates` | Templates de documentos por garantia |
| 9 | `cnae_segment_mapping` | Mapeamento CNAE → segmento sugerido |
| 10 | `clients` | Clientes (20 status possíveis, FK segment, product, assigned_to, team, region) |
| 11 | `client_guarantees` | Garantias do cliente (FK client, guarantee_type) |
| 12 | `client_documents` | Documentos do cliente (FK client, metadados, validation_status) |
| 13 | `client_status_history` | Histórico de transições de status (append-only) |
| 14 | `notifications` | Notificações para os usuários |

Alteração existente:
- **`profiles`** — adicionadas colunas `team_id` (FK teams) e `region_id` (FK regions) para hierarquia comercial

Seed data inserido:
- 6 segmentos de mercado
- 6 produtos de crédito
- 6 tipos de garantia
- 8 templates de documentos por segmento
- 6 templates por produto
- 12 templates por garantia

### 2.2 `commercial_rls_functions_storage` (20260213205033)

**Funções SQL auxiliares para RLS:**
- `get_my_role()` — retorna role do usuário autenticado
- `get_my_team_id()` — retorna team_id do perfil
- `get_my_region_id()` — retorna region_id do perfil

**RLS policies aplicadas em:**
- `clients` — comercial vê próprios; supervisor vê equipe; manager vê região; director/admin vê todos
- `client_documents` — mesmo padrão de `clients`
- `client_guarantees` — mesmo padrão de `clients`
- `client_status_history` — SELECT para comercial, INSERT via service_role
- `notifications` — usuário vê apenas suas notificações

**Funções SQL de negócio:**
- `get_document_checklist(client_uuid)` — retorna checklist dinâmico montado a partir de 4 fontes
- `can_submit_for_analysis(client_uuid)` — verifica se documentos obrigatórios estão todos enviados

**Storage:**
- Bucket `client-documents` (privado, 10MB, PDF/JPEG/PNG/WebP)
- RLS: comercial acessa paths dos próprios clientes; analistas/admin leem tudo

---

## 3. Schemas Drizzle (14 novos)

Todos em `apps/api/src/database/schema/`:

| Arquivo | Tabela |
|---------|--------|
| `regions.ts` | `regions` |
| `teams.ts` | `teams` |
| `segments.ts` | `segments` |
| `credit-products.ts` | `credit_products` |
| `guarantee-types.ts` | `guarantee_types` |
| `segment-document-templates.ts` | `segment_document_templates` |
| `product-document-templates.ts` | `product_document_templates` |
| `guarantee-document-templates.ts` | `guarantee_document_templates` |
| `cnae-segment-mapping.ts` | `cnae_segment_mapping` |
| `clients.ts` | `clients` |
| `client-guarantees.ts` | `client_guarantees` |
| `client-documents.ts` | `client_documents` |
| `client-status-history.ts` | `client_status_history` |
| `notifications.ts` | `notifications` |

Alteração: `profiles.ts` recebeu `teamId` e `regionId` com indices.

---

## 4. Tipos Compartilhados (`@nexus/types`)

**Arquivo:** `packages/types/src/client.ts`

| Export | Tipo | Descrição |
|--------|------|-----------|
| `CLIENT_STATUSES` | const tuple | 21 status possíveis do cliente |
| `ClientStatus` | type | Union type dos status |
| `EDITABLE_STATUSES` | array | Status que permitem edição (`draft`, `pending_documents`, `document_issues`) |
| `DOCUMENT_CATEGORIES` | const tuple | 6 categorias: `base`, `segment`, `product`, `guarantee`, `conditional`, `partner` |
| `DocumentCategory` | type | Union type das categorias |
| `VALIDATION_STATUSES` | const tuple | 5 status de validação de documento |
| `ValidationStatus` | type | Union type dos status de validação |
| `DocumentChecklistItem` | interface | Item do checklist (tipo, label, categoria, status, etc.) |
| `CanSubmitResult` | interface | Resultado da verificação de envio (`canSubmit`, `missingDocuments`) |
| `BASE_DOCUMENT_TYPES` | const array | 11 documentos base obrigatórios para toda operação |
| `CONDITIONAL_DOCUMENT_TYPES` | const array | 3 documentos condicionais (Recuperação Judicial) |

---

## 5. Schemas de Validação (`@nexus/validators`)

**Arquivo:** `packages/validators/src/client.schema.ts`

| Schema | Uso | Campos principais |
|--------|-----|-------------------|
| `createClientSchema` | `POST /clients` (Step 1) | `companyName`, `cnpj`, `phone`, `email`, `segmentId`, `creditProductId`, `requestedAmount`, endereço |
| `updateClientSchema` | `PATCH /clients/:id` (Step 2) | Todos os campos opcionais + `hasGuarantees`, `isJudicialRecovery`, `guarantees[]` |
| `uploadDocumentSchema` | `POST /clients/:id/documents` | `documentType`, `documentCategory`, `documentLabel`, referências (year, month, partner, template IDs) |
| `listClientsQuerySchema` | `GET /clients` | Extends `paginationQuerySchema` + `status`, `segmentId`, `search`, `assignedTo` |

---

## 6. Módulo NestJS — `clients`

**Diretório:** `apps/api/src/modules/clients/`

### 6.1 Estrutura DDD

```
modules/clients/
├── clients.module.ts                      # NestJS module
├── controllers/
│   ├── clients.controller.ts              # CRUD + submit
│   ├── documents.controller.ts            # Checklist + upload/delete
│   ├── cnpj.controller.ts                 # Validação CNPJ
│   └── segments.controller.ts             # Segmentos, produtos, garantias
├── use-cases/
│   ├── create-client.use-case.ts          # Criar cliente (draft)
│   ├── get-client.use-case.ts             # Buscar por ID
│   ├── list-clients.use-case.ts           # Listagem com paginação e filtros
│   ├── update-client.use-case.ts          # Atualizar dados + garantias
│   ├── submit-for-analysis.use-case.ts    # Enviar para análise de crédito
│   ├── get-document-checklist.use-case.ts # Montar checklist dinâmico
│   ├── can-submit.use-case.ts             # Verificar se pode enviar
│   ├── upload-document.use-case.ts        # Upload de documento
│   ├── delete-document.use-case.ts        # Remover documento
│   └── validate-cnpj.use-case.ts          # Validar CNPJ via BrasilAPI
├── domain/
│   ├── client.entity.ts                   # Entity com 20+ status, transições, invariantes
│   ├── client.repository.ts               # Interface ClientRepository
│   ├── client-document.repository.ts      # Interface ClientDocumentRepository
│   └── exceptions/
│       ├── client-not-found.exception.ts
│       ├── cnpj-already-exists.exception.ts
│       ├── cnpj-inactive.exception.ts
│       ├── invalid-status-transition.exception.ts
│       └── missing-required-documents.exception.ts
├── infra/
│   ├── drizzle-client.repository.ts       # Implementação Drizzle do ClientRepository
│   ├── drizzle-client-document.repository.ts # Implementação Drizzle do ClientDocumentRepository
│   ├── client-storage.service.ts          # Upload/delete no Supabase Storage
│   ├── cnpj-api.adapter.ts               # Adapter BrasilAPI (CNPJ + CNAE → segmento)
│   └── mappers/
│       ├── client.mapper.ts               # DB row ↔ Client entity
│       └── client-document.mapper.ts      # DB row → response object
└── dto/
    ├── create-client.dto.ts               # Re-export de @nexus/validators
    ├── update-client.dto.ts
    ├── upload-document.dto.ts
    └── list-clients-query.dto.ts
```

### 6.2 Entity — `Client`

A entidade de domínio encapsula todas as regras de negócio:

- **`create()`** — factory method, valida company name e email, inicia com status `draft`
- **`reconstitute()`** — reconstituição a partir do banco
- **`canEdit()`** — `true` se status ∈ {`draft`, `pending_documents`, `document_issues`}
- **`canUploadDocuments()`** — mesmo critério de `canEdit()`
- **`canDeleteDocuments()`** — mesmo critério de `canEdit()`
- **`canSubmitForAnalysis()`** — `true` se status ∈ {`draft`, `pending_documents`, `document_issues`}
- **`validateStatusTransition()`** — valida transição com base no mapa `VALID_TRANSITIONS`

**Mapa de transições de status:**

```
draft → pending_documents, cancelled
pending_documents → document_validation, cancelled
document_validation → document_issues, credit_analysis
document_issues → pending_documents, document_validation, cancelled
credit_analysis → auto_rejected, pending_report
pending_report → pending_approval
pending_approval → approved, rejected
approved → pending_partner_docs, pending_homologation
pending_partner_docs → partner_doc_validation
partner_doc_validation → pending_homologation, pending_partner_docs
pending_homologation → homologated, homologation_issues
homologation_issues → pending_homologation, cancelled
homologated → active
active → risk_management, settled
risk_management → recovery, active, settled
recovery → litigation, active, settled
litigation → settled
```

### 6.3 Checklist Dinâmico de Documentos

O checklist é montado a partir de **5 fontes** no `GetDocumentChecklistUseCase`:

| # | Fonte | Exemplo | Persistência |
|---|-------|---------|-------------|
| 1 | **Base** | Faturamento, IRPF, Balanços, etc. (11 tipos) | Hardcoded em `@nexus/types` (`BASE_DOCUMENT_TYPES`) |
| 2 | **Segmento** | Certificações Agro, Outorga Energia | `segment_document_templates` |
| 3 | **Produto** | Relatórios específicos do produto | `product_document_templates` |
| 4 | **Garantia** | Matrícula imóvel, CRLV veículo | `guarantee_document_templates` (por tipo de garantia do cliente) |
| 5 | **Condicional** | Plano RJ, Lista Credores (se `isJudicialRecovery`) | Hardcoded em `@nexus/types` (`CONDITIONAL_DOCUMENT_TYPES`) |

### 6.4 Validação de CNPJ

`ValidateCnpjUseCase` → `CnpjApiAdapter`:

1. Consulta BrasilAPI (`brasilapi.com.br/api/cnpj/v1/{cnpj}`)
2. Retorna razão social, nome fantasia, CNAE principal, endereço, situação cadastral
3. Cruza CNAE com tabela `cnae_segment_mapping` para sugerir segmento
4. Se CNPJ já existe na base, retorna `CnpjAlreadyExistsException`
5. Se situação cadastral ≠ ativa, retorna `CnpjInactiveException`

### 6.5 Upload de Documentos

`UploadDocumentUseCase` → `ClientStorageService`:

1. Verifica se cliente permite upload (`canUploadDocuments()`)
2. Gera path: `{clientId}/{category}/{documentType}/{uuid}-{filename}`
3. Upload para bucket `client-documents` via Supabase Storage
4. Persiste metadados em `client_documents`

---

## 7. API Endpoints

### 7.1 Clientes

| Método | Endpoint | Roles | Descrição |
|--------|----------|-------|-----------|
| POST | `/api/clients` | sales_*, admin | Criar cliente (draft) |
| GET | `/api/clients` | sales_*, credit_analyst, compliance_officer, approver, backoffice, legal, risk_manager, recovery, litigation, admin | Listagem com paginação e filtros |
| GET | `/api/clients/:id` | (mesmo acima) | Detalhe do cliente |
| PATCH | `/api/clients/:id` | sales_*, admin | Atualizar dados e garantias |
| POST | `/api/clients/:id/submit` | sales_*, admin | Enviar para análise |

### 7.2 Documentos

| Método | Endpoint | Roles | Descrição |
|--------|----------|-------|-----------|
| GET | `/api/clients/:id/documents/checklist` | sales_*, credit_analyst, compliance_officer, approver, backoffice, legal, risk_manager, recovery, litigation, admin | Checklist dinâmico |
| GET | `/api/clients/:id/documents/can-submit` | sales_*, admin | Verificar se pode enviar |
| GET | `/api/clients/:id/documents` | (mesmo de checklist) | Listar documentos enviados |
| POST | `/api/clients/:id/documents` | sales_*, admin | Upload de documento (multipart) |
| DELETE | `/api/clients/:id/documents/:docId` | sales_*, admin | Remover documento |

### 7.3 CNPJ

| Método | Endpoint | Roles | Descrição |
|--------|----------|-------|-----------|
| GET | `/api/cnpj/:cnpj/validate` | sales_*, admin | Validar CNPJ via BrasilAPI |

### 7.4 Segmentos/Lookup

| Método | Endpoint | Roles | Descrição |
|--------|----------|-------|-----------|
| GET | `/api/segments` | sales_*, credit_analyst, compliance_officer, approver, backoffice, admin | Listar segmentos ativos |
| GET | `/api/segments/credit-products` | (mesmo acima) | Listar produtos de crédito |
| GET | `/api/segments/guarantee-types` | (mesmo acima) | Listar tipos de garantia |

---

## 8. Exceptions de Domínio

| Exception | HTTP Status | Code | Quando |
|-----------|-------------|------|--------|
| `ClientNotFoundException` | 404 | `CLIENT_NOT_FOUND` | Cliente não encontrado pelo ID |
| `CnpjAlreadyExistsException` | 409 | `CNPJ_ALREADY_EXISTS` | CNPJ já cadastrado na base |
| `CnpjInactiveException` | 422 | `CNPJ_INACTIVE` | Situação cadastral não é ativa |
| `InvalidStatusTransitionException` | 422 | `INVALID_STATUS_TRANSITION` | Transição de status não permitida |
| `MissingRequiredDocumentsException` | 422 | `MISSING_REQUIRED_DOCUMENTS` | Tentativa de enviar sem documentos obrigatórios |

---

## 9. Fix Aplicado — TypeScript `main.ts`

Erro pré-existente de tipagem no `apps/api/src/main.ts`:

```
TS2345: Argument of type 'FastifyAdapter<...>' is not assignable to
parameter of type 'AbstractHttpAdapter<...>'.
Property 'instance' is protected but type 'FastifyAdapter' is not a class
derived from 'AbstractHttpAdapter'.
```

**Causa:** Incompatibilidade de tipos entre `FastifyAdapter` e `AbstractHttpAdapter` no NestJS 10 com TypeScript strict. Bug conhecido da lib.

**Correção:** Type assertion `as any` com comentário explicativo e eslint-disable.

---

## 10. Fluxo do Comercial — Resumo

```
1. Comercial valida CNPJ       → GET /api/cnpj/:cnpj/validate
2. Comercial cria cliente       → POST /api/clients (status: draft)
3. Comercial atualiza operação  → PATCH /api/clients/:id (garantias, produto, etc.)
4. Comercial consulta checklist → GET /api/clients/:id/documents/checklist
5. Comercial faz upload docs    → POST /api/clients/:id/documents (multipart)
6. Comercial verifica envio     → GET /api/clients/:id/documents/can-submit
7. Comercial envia p/ análise   → POST /api/clients/:id/submit (status: pending_documents → document_validation)
```

---

## 11. Frontend — Web Backoffice

**App:** `apps/web-backoffice` (Next.js 15, App Router)

### 11.1 Estrutura de Páginas

```
app/(dashboard)/
├── clients/
│   ├── page.tsx                          # Lista de clientes (cards + pipeline summary)
│   ├── new/
│   │   ├── page.tsx                      # Formulário multi-step (3 etapas)
│   │   └── _components/
│   │       ├── stepper.tsx               # Indicador de progresso das etapas
│   │       ├── cnpj-field.tsx            # Campo CNPJ com validação BrasilAPI
│   │       ├── guarantee-list.tsx        # Lista dinâmica de garantias
│   │       └── document-checklist.tsx    # Checklist com upload/reenvio/exclusão
│   ├── [id]/
│   │   ├── page.tsx                      # Detalhe do cliente (server component)
│   │   └── _components/
│   │       └── client-detail.tsx         # Tabs: Dados + Documentos
│   └── _components/
│       ├── clients-table.tsx             # Grid de cards dos clientes
│       ├── client-status-badge.tsx       # Badge com ícone + cor por fase
│       ├── client-filters.tsx            # Filtros: busca, status, segmento
│       └── pipeline-summary.tsx          # Cards de contagem por fase do pipeline
├── pipeline/
│   └── page.tsx                          # Stub — Pipeline visual (futuro)
├── goals/
│   └── page.tsx                          # Stub — Metas comerciais (futuro)
├── activities/
│   └── page.tsx                          # Stub — Atividades comerciais (futuro)
└── layout.tsx                            # Dashboard shell (sidebar + header)
```

### 11.2 Formulário de Cadastro — 3 Etapas

**Arquivo:** `apps/web-backoffice/src/app/(dashboard)/clients/new/page.tsx`

| Etapa | Nome | Campos | API |
|-------|------|--------|-----|
| 1 | Dados da Empresa | CNPJ (com validação), razão social, nome fantasia, telefone, email, endereço completo | `GET /api/cnpj/:cnpj/validate` |
| 2 | Operação de Crédito | Segmento, produto de crédito, valor pretendido, recuperação judicial, garantias (lista dinâmica) | `POST /api/clients`, `PATCH /api/clients/:id` |
| 3 | Documentos | Checklist dinâmico com upload, reenvio, exclusão e barra de progresso | `GET /api/clients/:id/documents/checklist`, `POST /api/clients/:id/documents` |

**Campo CNPJ (`cnpj-field.tsx`):**
- Validação automática ao digitar 14 dígitos
- Consulta BrasilAPI para auto-preencher razão social, nome fantasia e endereço
- Sugere segmento com base no CNAE principal
- Tratamento de erros: CNPJ não encontrado, inativo ou já cadastrado

**Lista de Garantias (`guarantee-list.tsx`):**
- Adicionar/remover garantias dinamicamente
- Cada garantia: tipo (select), descrição e valor estimado
- Tipos carregados via `GET /api/segments/guarantee-types`

**Checklist de Documentos (`document-checklist.tsx`):**
- Agrupado por categoria (Base, Segmento, Produto, Garantia, Condicional)
- Upload via input file (PDF, JPG, PNG, WebP, máx. 10MB)
- Reenvio para documentos já enviados ou inválidos
- Exclusão de documentos
- Barra de progresso: X de Y documentos obrigatórios enviados
- Botão "Enviar para Análise" (desabilitado até todos obrigatórios estarem ok)

### 11.3 Lista de Clientes — Cards

**Arquivo:** `apps/web-backoffice/src/app/(dashboard)/clients/_components/clients-table.tsx`

Cada cliente é exibido como um card horizontal (full-width) contendo:

- **Linha 1:** Nome da empresa + nome fantasia + mensagem "Próximo Passo" + badge de status com ícone
- **Linha 2:** CNPJ (monospace), segmento, valor pretendido, data de criação
- Card inteiro clicável (link para `/clients/:id`)
- Hover com shadow e borda primary

### 11.4 Pipeline Summary — Cards de Contagem

**Arquivo:** `apps/web-backoffice/src/app/(dashboard)/clients/_components/pipeline-summary.tsx`

6 cards no topo da página, cada um representando uma fase do pipeline:

| Fase | Status Agrupados | Ícone | Cor |
|------|-----------------|-------|-----|
| Cadastro | `draft` | Pencil | Cinza |
| Documentação | `pending_documents`, `document_validation`, `document_issues`, `pending_partner_docs`, `partner_doc_validation` | FileText | Azul |
| Análise | `credit_analysis`, `pending_report`, `auto_rejected` | Search | Violeta |
| Aprovação | `pending_approval`, `approved`, `rejected` | CheckCircle2 | Verde |
| Homologação | `pending_homologation`, `homologated`, `homologation_issues` | Shield | Indigo |
| Operação | `active`, `risk_management`, `recovery`, `litigation`, `settled`, `cancelled` | Activity | Teal |

Grid responsivo: 2 colunas (mobile) → 3 colunas (tablet) → 6 colunas (desktop).

### 11.5 Badge de Status com Ícone

**Arquivo:** `apps/web-backoffice/src/app/(dashboard)/clients/_components/client-status-badge.tsx`

- Cada status tem um ícone Lucide e cor Tailwind atribuídos
- Cores seguem a fase do pipeline (azul para documentação, violeta para análise, etc.)
- Overrides para status negativos: `document_issues` e `homologation_issues` em âmbar, `rejected` e `auto_rejected` em vermelho
- Dark mode suportado via classes `dark:bg-*` e `dark:text-*`

### 11.6 Detalhe do Cliente

**Arquivo:** `apps/web-backoffice/src/app/(dashboard)/clients/[id]/_components/client-detail.tsx`

Duas abas:

- **Dados:** informações da empresa, operação de crédito, datas
- **Documentos:** checklist completo com upload/reenvio/exclusão (reutiliza `DocumentChecklist`)

Tratamento de erros:
- Erro ao carregar checklist: toast + mensagem inline com botão "Tentar novamente"
- Checklist vazio: mensagem "Nenhum documento configurado para este segmento/produto"

---

## 12. Utilitários Compartilhados (`@nexus/utils`)

**Arquivo:** `packages/utils/src/client-status.ts`

### 12.1 Maps de Status

| Export | Tipo | Descrição |
|--------|------|-----------|
| `CLIENT_STATUS_LABELS` | `Record<ClientStatus, string>` | Labels em pt-BR para cada status |
| `CLIENT_STATUS_COLORS` | `Record<ClientStatus, StatusColor>` | Variante do Badge (default, secondary, destructive, outline) |
| `CLIENT_STATUS_MESSAGES` | `Record<string, string>` | Mensagem de ação para o comercial |
| `CLIENT_STATUS_PHASE` | `Record<ClientStatus, PipelinePhase>` | Mapeamento status → fase do pipeline |
| `CLIENT_STATUS_ICON` | `Record<ClientStatus, string>` | Nome do ícone Lucide para cada status |
| `PIPELINE_PHASE_STYLE` | `Record<PipelinePhase, string>` | Classes Tailwind (bg + text + dark) por fase |
| `CLIENT_STATUS_STYLE_OVERRIDE` | `Partial<Record<ClientStatus, string>>` | Override de estilo para status negativos (âmbar/vermelho) |
| `PIPELINE_PHASE_LABELS` | `Record<PipelinePhase, string>` | Labels em pt-BR para cada fase |
| `PIPELINE_PHASE_ORDER` | `PipelinePhase[]` | Ordem de exibição das fases |
| `ACTION_REQUIRED_STATUSES` | `ClientStatus[]` | Status que exigem ação do comercial |

### 12.2 Funções Helper

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `getStatusLabel(status)` | `string` | Label localizado do status |
| `getStatusColor(status)` | `StatusColor` | Variante do Badge |
| `getStatusMessage(status)` | `string` | Mensagem de ação |
| `getStatusPhase(status)` | `PipelinePhase` | Fase do pipeline |
| `getStatusStyle(status)` | `string` | Classes Tailwind (com override para negativos) |
| `isActionRequired(status)` | `boolean` | Se o comercial precisa agir |

### 12.3 Tipos

| Tipo | Descrição |
|------|-----------|
| `PipelinePhase` | `'registration' \| 'documentation' \| 'analysis' \| 'approval' \| 'homologation' \| 'operation'` |
| `StatusColor` | `'default' \| 'secondary' \| 'destructive' \| 'outline'` |

---

## 13. Bugs Corrigidos

### 13.1 Função SQL `get_document_checklist` — ORDER BY inválido

**Erro:** `PostgresError: invalid UNION/INTERSECT/EXCEPT ORDER BY clause`

**Causa:** A função usava `ORDER BY category, is_required DESC` no final de um `UNION ALL`. O PostgreSQL não permite referência por nome de coluna em `ORDER BY` de `UNION` — exige posição numérica.

**Correção:** Alterado para `ORDER BY 4, 5 DESC` (posições das colunas `category` e `is_required`). Função recriada diretamente no banco Supabase.

### 13.2 Campos `teamId` e `regionId` — UUID inválido

**Erro:** `invalid input syntax for type uuid: ""`

**Causa:** Na criação do cliente, `teamId` e `regionId` vinham de `user.user_metadata` que podia ser `undefined`. O controller usava `?? ''`, gerando string vazia enviada a colunas `UUID NOT NULL`.

**Correção (3 camadas):**
1. **Banco:** Migration para tornar `team_id` e `region_id` nullable (`DROP NOT NULL`)
2. **Drizzle schema + Entity:** Tipos atualizados para `string | null`
3. **Controller:** Alterado de `?? ''` para `|| null`

### 13.3 Validação CNPJ — 500 para CNPJ inválido

**Erro:** `GET /api/cnpj/:cnpj/validate` retornava 500 para CNPJs inexistentes/inválidos

**Causa:** `CnpjApiAdapter.validate()` lançava `Error` genérico quando BrasilAPI retornava não-200, causando 500 não tratado no NestJS.

**Correção:** Refatorado para retornar `CnpjValidationResult` com `canProceed: false` e `reason` em vez de lançar exceção. Trata: CNPJ com tamanho inválido, erro de rede, e respostas não-200 da BrasilAPI.

### 13.4 `ZodValidationPipe` — schema undefined

**Erro:** `Cannot read properties of undefined (reading 'safeParse')`

**Causa:** O package `@nexus/validators` não estava buildado. O import resolvia para `undefined`.

**Correção:** Rebuild do package (`pnpm --filter @nexus/validators build`) e restart da API.

### 13.5 Catch silencioso no checklist de documentos

**Problema:** Em `client-detail.tsx`, o `catch` do carregamento do checklist era `catch { /* ignore */ }`, mascarando erros da API (como o 500 da função SQL).

**Correção:**
- Substituído por `catch (err)` com `toast.error()` e state `checklistError`
- UI mostra mensagem de erro com ícone e botão "Tentar novamente"
- Quando checklist retorna vazio, exibe: "Nenhum documento configurado para este segmento/produto"

---

## 14. Linter — Correções Aplicadas

21 warnings corrigidos em 9 arquivos do frontend:

| Tipo de Correção | Descrição |
|------------------|-----------|
| `String#replace()` → `replaceAll()` | Uso consistente de `replaceAll` para substituição com regex |
| `isNaN` → `Number.isNaN` | Método mais preciso para checagem de NaN |
| Array index em `key` | Substituído por `crypto.randomUUID()` ou campo `key` em objetos |
| Ternários aninhados | Extraídos para funções helper (`getCircleClass`, `getLabelClass`, `getStatusBadgeVariant`) |
| Imports não utilizados | Removidos (`Separator`, `DOCUMENT_CATEGORY_LABELS`, `EDITABLE_STATUSES`) |
| Variáveis não utilizadas | Removidas (`canUpload`) |

---

## 15. Client Enrichment — Campos PJ

A entity `Client` e o schema `clients` foram enriquecidos com 18 novos campos para suportar dados completos de Pessoa Jurídica, compliance e rastreabilidade legada.

### 15.1 Novos campos na entity e tabela `clients`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `cnpj_root` | text \| null | Raiz do CNPJ (primeiros 8 dígitos) |
| `state_registration` | text \| null | Inscrição Estadual |
| `city_registration` | text \| null | Inscrição Municipal |
| `founded_at` | date \| null | Data de fundação |
| `established_at` | date \| null | Data de constituição |
| `closed_at` | timestamp \| null | Data de encerramento |
| `closure_reason` | text \| null | Motivo do encerramento |
| `is_pep` | boolean | Sócio/representante é Pessoa Politicamente Exposta |
| `is_pep_related` | boolean | Relacionado a PEP |
| `is_ofac_listed` | boolean | Constante na lista OFAC |
| `has_risk_profession` | boolean | Profissão de risco (compliance) |
| `has_risk_activity` | boolean | Atividade econômica de risco |
| `has_risk_city` | boolean | Município de risco |
| `risk_rating` | text \| null | Rating de risco atribuído |
| `revenue_situation` | text \| null | Situação de faturamento |
| `economic_group_id` | uuid \| null | FK → `economic_groups` |
| `legacy_sgs_id` | integer \| null | ID no sistema legado SGS |
| `legacy_nf_id` | integer \| null | ID no sistema legado NF |

### 15.2 Impacto em schemas Zod

O `updateClientSchema` (`@nexus/validators`) foi estendido com todos esses campos como opcionais. O `createClientSchema` mantém apenas os campos obrigatórios de criação.

### 15.3 Frontend

O formulário de cadastro (`clients/new/page.tsx`) expõe campos complementares na Etapa 1: `stateRegistration`, `cityRegistration`, `foundedAt` e o switch `isPep`.

---

## 16. Client Sub-resources

Quatro novos sub-módulos DDD foram adicionados ao módulo `clients`, cada um com entity, repository interface, repositório Drizzle, mapper, 4 use-cases (list, create, update, delete) e controller próprio.

### 16.1 Estrutura adicionada em `modules/clients/`

```
clients/
├── domain/
│   ├── client-contact.entity.ts
│   ├── client-contact.repository.ts
│   ├── client-address.entity.ts
│   ├── client-address.repository.ts
│   ├── client-bank-account.entity.ts
│   ├── client-bank-account.repository.ts
│   ├── client-authorized-person.entity.ts
│   └── client-authorized-person.repository.ts
├── infra/
│   ├── drizzle-client-contact.repository.ts
│   ├── drizzle-client-address.repository.ts
│   ├── drizzle-client-bank-account.repository.ts
│   ├── drizzle-client-authorized-person.repository.ts
│   └── mappers/
│       ├── client-contact.mapper.ts
│       ├── client-address.mapper.ts
│       ├── client-bank-account.mapper.ts
│       └── client-authorized-person.mapper.ts
├── use-cases/
│   ├── list-client-contacts.use-case.ts
│   ├── create-client-contact.use-case.ts
│   ├── update-client-contact.use-case.ts
│   ├── delete-client-contact.use-case.ts
│   └── (análogo para addresses, bank-accounts, authorized-persons)
└── controllers/
    ├── client-contacts.controller.ts
    ├── client-addresses.controller.ts
    ├── client-bank-accounts.controller.ts
    └── client-authorized-persons.controller.ts
```

### 16.2 Endpoints

| Método | Endpoint | Roles | Descrição |
|--------|----------|-------|-----------|
| GET | `/api/clients/:id/contacts` | sales_*, credit_analyst, admin | Listar contatos |
| POST | `/api/clients/:id/contacts` | sales_*, admin | Criar contato |
| PATCH | `/api/clients/:id/contacts/:subId` | sales_*, admin | Atualizar contato |
| DELETE | `/api/clients/:id/contacts/:subId` | sales_*, admin | Remover contato |
| GET | `/api/clients/:id/addresses` | sales_*, credit_analyst, admin | Listar endereços |
| POST | `/api/clients/:id/addresses` | sales_*, admin | Criar endereço |
| PATCH | `/api/clients/:id/addresses/:subId` | sales_*, admin | Atualizar endereço |
| DELETE | `/api/clients/:id/addresses/:subId` | sales_*, admin | Remover endereço |
| GET | `/api/clients/:id/bank-accounts` | sales_*, credit_analyst, admin | Listar contas bancárias |
| POST | `/api/clients/:id/bank-accounts` | sales_*, admin | Criar conta bancária |
| PATCH | `/api/clients/:id/bank-accounts/:subId` | sales_*, admin | Atualizar conta |
| DELETE | `/api/clients/:id/bank-accounts/:subId` | sales_*, admin | Remover conta |
| GET | `/api/clients/:id/authorized-persons` | sales_*, credit_analyst, admin | Listar pessoas autorizadas |
| POST | `/api/clients/:id/authorized-persons` | sales_*, admin | Criar pessoa autorizada |
| PATCH | `/api/clients/:id/authorized-persons/:subId` | sales_*, admin | Atualizar |
| DELETE | `/api/clients/:id/authorized-persons/:subId` | sales_*, admin | Remover |

### 16.3 Frontend

A página de detalhe do cliente (`clients/[id]`) foi expandida com 4 novas abas: Contatos, Endereços, Contas Bancárias e Pessoas Autorizadas. Cada aba é um componente independente em `_components/tabs/` que carrega dados sob demanda e oferece dialogs de criação/edição/exclusão.

---

## 17. Módulo Drawees (Sacados)

Módulo independente para cadastro e gestão de sacados (devedores em duplicatas/operações). Suporta Pessoa Jurídica (`company`) e Pessoa Física (`individual`).

### 17.1 Contexto de Negócio

O sacado é a entidade que deve pagar a duplicata ao cliente. A relação Cliente ↔ Sacado é estabelecida no nível da operação/título, não no cadastro. Um mesmo sacado pode ter duplicatas de múltiplos clientes, e seu perfil de crédito e compliance é gerenciado de forma independente.

### 17.2 Estrutura DDD

```
modules/drawees/
├── drawees.module.ts
├── controllers/
│   ├── drawees.controller.ts
│   ├── drawee-contacts.controller.ts
│   ├── drawee-addresses.controller.ts
│   └── drawee-bank-accounts.controller.ts
├── use-cases/
│   ├── create-drawee.use-case.ts       # Valida CNPJ/CPF duplicado antes de criar
│   ├── get-drawee.use-case.ts
│   ├── list-drawees.use-case.ts
│   └── update-drawee.use-case.ts
├── domain/
│   ├── drawee.entity.ts                # Suporta PJ e PF
│   ├── drawee.repository.ts
│   └── exceptions/
│       ├── drawee-not-found.exception.ts
│       └── cnpj-already-exists.exception.ts
└── infra/
    ├── drizzle-drawee.repository.ts
    ├── drizzle-drawee-contact.repository.ts
    ├── drizzle-drawee-address.repository.ts
    ├── drizzle-drawee-bank-account.repository.ts
    └── mappers/
        └── drawee.mapper.ts
```

### 17.3 Campos específicos de Sacados

Além dos campos comuns com Clientes (nome, CNPJ/CPF, compliance, grupo econômico), sacados têm:

- **PF:** `rg`, `birth_date`, `gender`, `rg_document_id`, `cnh_document_id`
- **Contatos extras:** `billing_email`, `xml_email` (entrega de NF-e), `billing_phone`
- **Endereço de cobrança:** campos `billing_*` paralelos ao endereço principal (legado SGS)
- **Habilitação por produto:** tabela `drawee_enabled_products` (FK `credit_products`)
- **Vínculo a grupo econômico:** tabela `drawee_groups` (FK `economic_groups`)
- **Documentos:** tabela `drawee_documents` com `extracted_data jsonb` para OCR futuro

### 17.4 Endpoints

| Método | Endpoint | Roles | Descrição |
|--------|----------|-------|-----------|
| POST | `/api/drawees` | sales_*, admin | Criar sacado |
| GET | `/api/drawees` | sales_*, credit_analyst, admin | Listar (filtros: status, personType, search) |
| GET | `/api/drawees/:id` | sales_*, credit_analyst, admin | Detalhe |
| PATCH | `/api/drawees/:id` | sales_*, admin | Atualizar |
| GET/POST/PATCH/DELETE | `/api/drawees/:id/contacts` | sales_*, credit_analyst, admin | Sub-resource contatos |
| GET/POST/PATCH/DELETE | `/api/drawees/:id/addresses` | sales_*, credit_analyst, admin | Sub-resource endereços |
| GET/POST/PATCH/DELETE | `/api/drawees/:id/bank-accounts` | sales_*, credit_analyst, admin | Sub-resource contas bancárias |

### 17.5 Schemas de Validação (`@nexus/validators`)

`createDraweeSchema` usa `superRefine` para validação condicional: CNPJ obrigatório para `personType = 'company'`, CPF obrigatório para `personType = 'individual'`.

### 17.6 Frontend

```
drawees/
├── page.tsx                       # Lista com filtros (search, status, personType)
├── _components/
│   ├── drawees-table.tsx          # Tabela com formatação CNPJ/CPF
│   ├── drawee-filters.tsx         # Filtros
│   └── drawee-status-badge.tsx    # Badge por status
├── new/
│   └── page.tsx                   # Formulário multi-step: tipo (PJ/PF) → dados → contato → endereço → conta
└── [id]/
    ├── page.tsx
    └── _components/
        ├── drawee-detail.tsx
        └── tabs/
            ├── drawee-contacts-tab.tsx
            ├── drawee-addresses-tab.tsx
            └── drawee-bank-accounts-tab.tsx
```

---

## 18. Módulos Goals e Pipeline

### 18.1 Módulo Goals (Metas Comerciais)

**Estrutura:** DDD completo com entity `Goal`, repository, 5 use-cases, controller.

**Escopo de meta:** Exatamente um de `profile_id`, `team_id` ou `region_id` deve estar preenchido (constraint no banco). Determina se é meta individual, de equipe ou regional.

**Endpoints:**

| Método | Endpoint | Roles | Descrição |
|--------|----------|-------|-----------|
| POST | `/api/goals` | sales_supervisor, sales_manager, sales_director, admin | Criar meta |
| GET | `/api/goals` | sales_rep, sales_supervisor, sales_manager, sales_director, admin | Listar metas (filtros: year, month, teamId, regionId) |
| GET | `/api/goals/ranking` | sales_supervisor, sales_manager, sales_director, admin | Ranking por período |
| PATCH | `/api/goals/:id` | sales_supervisor, sales_manager, sales_director, admin | Atualizar meta |
| DELETE | `/api/goals/:id` | sales_director, admin | Excluir meta |

**Frontend (`goals/page.tsx`):** Dashboard com progress cards (realizado vs meta), tabela de metas do período, ranking de performance e seletor de período (mês/ano).

### 18.2 Módulo Pipeline

**Estrutura:** Repository + 2 use-cases (`GetPipelineClientsUseCase`, `GetPipelineMetricsUseCase`) + controller. Sem entity própria — lê da tabela `clients`.

**Endpoints:**

| Método | Endpoint | Roles | Descrição |
|--------|----------|-------|-----------|
| GET | `/api/pipeline` | sales_rep, sales_supervisor, sales_manager, sales_director, credit_analyst, admin | Listagem kanban (filtros: segmentId, teamId, regionId — aplicados conforme role) |
| GET | `/api/pipeline/metrics` | (mesmo acima) | Contagem e valor por fase do funil |

**Frontend (`pipeline/page.tsx`):** Board kanban com colunas por fase do pipeline, cards de clientes arrastáveis, métricas de contagem e valor total por fase no topo.
