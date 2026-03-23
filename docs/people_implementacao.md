# Implementação do Módulo People — Colaboradores, Reembolsos e NFs PJ

**Versão:** 1.2  
**Data:** 21 de Março de 2026  
**Status:** Em progresso  
**Referência:** `spec_modulo_people.md`  

---

## 1. Visão Geral

Este documento descreve as implementações realizadas no módulo People: colaboradores, reembolsos e notas fiscais PJ. Cobre o que foi desenvolvido além do Sprint 0.

---

## 2. Página de Detalhes do Colaborador

**Rota:** `/people/collaborators/[id]`  
**Arquivo:** `apps/web-backoffice/src/app/(dashboard)/people/collaborators/[id]/page.tsx`

### 2.1 Estrutura com Tabs

A página exibe o colaborador em abas:

| Tab | Valor | Visibilidade | Conteúdo |
|-----|-------|--------------|----------|
| Dados | `dados` | Sempre | Visualização somente-leitura (componente `CollaboratorDetail`) |
| Editar | `editar` | Apenas `hr`, `dp`, `hr_admin`, `admin` | Formulário de edição inline (componente `EditCollaboratorForm`) |
| Dependentes | `dependentes` | Sempre | Lista e CRUD de dependentes (componente `DependentsList`) |

### 2.2 Fluxo de Edição

- **Inline (sem modal):** O formulário de edição é exibido diretamente na aba, seguindo o mesmo padrão da página "Meu Perfil".
- **Roles com permissão:** `EDIT_COLLABORATOR_ROLES = ['hr', 'dp', 'hr_admin', 'admin']`
- **Endpoint:** `PATCH /api/people/collaborators/:id`
- **Validação:** Schema `updateCollaboratorAdminSchema` (`@nexus/validators`)

---

## 3. Dados CLT e PJ

### 3.1 Backend

- **Schemas Zod:** `cltDataSection` e `pjDataSection` em `updateCollaboratorAdminSchema` (packages/validators).
- **API:** Os endpoints `findById` e `findByProfileId` buscam e retornam `collaborator_clt_data` e `collaborator_pj_data` junto com o colaborador.
- **Update:** O repositório faz upsert nas tabelas `collaborator_clt_data` e `collaborator_pj_data` no `PATCH` do colaborador.
- **Entity:** A entidade de domínio inclui `cltData` e `pjData` opcionais.

### 3.2 Frontend

- **Visualização (aba Dados):** Seções "Dados CLT" e "Dados PJ" são exibidas conforme o `employmentType` do colaborador.
- **Edição (aba Editar):** Seções de dados CLT e PJ aparecem dinamicamente no formulário de acordo com o tipo de vínculo selecionado.

---

## 4. Máscaras em Inputs

### 4.1 Biblioteca

- **react-imask** — Usada para formatação de CPF, CNPJ, telefone e CEP durante a digitação.

### 4.2 Componente MaskedInput

**Arquivo:** `apps/web-backoffice/src/components/masked-input.tsx`

Interface baseada em `IMaskInput` com máscaras exportadas:

| Constante | Máscara | Uso |
|-----------|---------|-----|
| `CPF_MASK` | `000.000.000-00` | CPF |
| `CNPJ_MASK` | `00.000.000/0001-00` | CNPJ |
| `PHONE_MASK` | `(00) 0000-0000` / `(00) 00000-0000` | Telefone (fixo/celular) |
| `CEP_MASK` | `00000-000` | CEP |

**Uso com react-hook-form:** O `Controller` do react-hook-form é usado para integrar o `MaskedInput` (campo controlado com `value` e `onAccept`).

### 4.3 Onde as Máscaras São Aplicadas

| Formulário | Campos com máscara |
|------------|-------------------|
| Meu Perfil (`/people/me`) | Telefone, CEP |
| Edição RH (aba Editar) | CPF, Telefone, CEP, CNPJ (dados PJ) |
| Criar usuário (`/admin/users/new`) | CPF, Telefone, CEP, CNPJ |
| Dependentes (aba Dependentes) | CPF do dependente |

---

## 5. Layout e Scroll

### 5.1 Problema

Na página de detalhes do colaborador, o scroll permitia rolar além do conteúdo, exibindo uma área branca. O motivo era o comportamento padrão de flex items (`min-height: auto`), que impede o elemento de encolher e faz o scroll acontecer no body.

### 5.2 Correção

**Arquivo:** `apps/web-backoffice/src/app/(dashboard)/layout.tsx`

Foram adicionados `min-h-0` em dois pontos da cadeia flex:

1. **Wrapper flex:** `div.flex-1.min-h-0.flex.flex-col.overflow-hidden`
2. **Main:** `main.flex-1.min-h-0.overflow-y-auto.p-6.bg-muted/30`

Com isso, o flex item respeita o limite de altura do pai e o scroll permanece dentro do `main`, sem área branca extra.

---

## 6. Validators — Schemas Adicionados

**Arquivo:** `packages/validators/src/collaborator.schema.ts`

| Schema | Descrição |
|--------|-----------|
| `updateCollaboratorAdminSchema` | DTO para `PATCH` de colaborador pelo RH/DP (inclui seções CLT e PJ) |
| `listCollaboratorsQuerySchema` | Query params para listagem (`page`, `pageSize`, filtros) |

**Importante:** Após alterações em `@nexus/validators`, é necessário executar `pnpm --filter @nexus/validators build` para atualizar o `dist`. Caso contrário, a API pode retornar 500 ao consumir schemas não presentes no pacote compilado.

---

## 7. Reembolsos

### 7.1 Backend

- **Controller:** `ReimbursementsController` em `/api/people/reimbursements`
- **Fluxo:** colaborador cria (draft) → upload comprovante → pendente aprovação → gestor aprova/rejeita → DP paga
- **Visibilidade:** employee/hr (próprios), people_manager (equipe), dp/hr_admin/admin (todos)

### 7.2 Frontend

| Rota | Quem acessa | Função |
|------|-------------|--------|
| `/people/me/reimbursements` | employee, hr, people_manager | Criar, listar, acompanhar |
| `/people/team/reimbursements` | people_manager | Aprovar/rejeitar do time |
| `/people/dp/reimbursements` | dp, hr_admin, admin | Fila de aprovação e pagamento |

---

## 8. Notas Fiscais PJ

### 8.1 Backend

- **Controller:** `InvoicesController` em `/api/people/invoices`
- **CRON:** `PjInvoiceCronService` — gera NFs dia 20 de cada mês (status `pending_upload`) para PJs ativos
- **Fluxo:** sistema gera NF → colaborador faz upload → DP aprova/rejeita → DP paga

### 8.2 Frontend

| Rota | Quem acessa | Função |
|------|-------------|--------|
| `/people/me/invoices` | employee (PJ) | Enviar NF, acompanhar status |
| `/people/dp/invoices` | dp, hr_admin, admin | Fila de NFs (aprovar/pagar) |
| `/people/dp/invoices/overdue` | dp, hr_admin, admin | NFs atrasadas |

---

## 9. Storage (Supabase) — Bucket collaborator-documents

Compartilhado por reembolsos e NFs PJ:

- **Bucket:** `collaborator-documents` (privado)
- **Restrições:** 10MB máximo; tipos: PDF, JPEG, PNG, WebP
- **RLS:** colaborador SELECT/INSERT nos próprios paths; DP/HR/Admin SELECT em tudo
- **Paths:** Reembolsos: `reimbursements/{collaborator_id}/{reimbursement_id}/{filename}`. NFs: `invoices/{collaborator_id}/{year}-{month}/{filename}`

---

## 9b. Empresas Faturadoras (Billing Companies)

### 9b.1 Contexto

Em determinado momento do mês, o DP precisa informar a quais empresas cada colaborador PJ deve emitir a nota fiscal. Essa empresa pode variar mês a mês (ex: empresa A, B ou C conforme o contrato vigente). Para isso, foi criado o cadastro dinâmico de **Empresas Faturadoras** e o fluxo de **Atribuição de NFs**.

### 9b.2 Schema — Novas Tabelas e Colunas

**Nova tabela:** `billing_companies`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | Identificador único |
| `name` | `text` NOT NULL | Razão social |
| `trade_name` | `text` | Nome fantasia |
| `cnpj` | `text` UNIQUE NOT NULL | CNPJ (somente dígitos) |
| `is_active` | `boolean` DEFAULT `true` | Ativo/inativo |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |

**Colunas adicionadas em `pj_invoices`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `billing_company_id` | `uuid` FK → `billing_companies.id` | Empresa faturadora atribuída |
| `email_notified_at` | `timestamptz` | Quando o e-mail de notificação foi enviado |

**Migration:** `apps/api/src/database/migrations/0003_billing_companies_pj_invoices.sql`

### 9b.3 Backend — Estrutura DDD

#### Domain
- **Entidade:** `BillingCompany` — `apps/api/src/modules/people/domain/billing-company.entity.ts`
- **Repositório (interface):** `BillingCompanyRepository` — `apps/api/src/modules/people/domain/billing-company.repository.ts`

#### Infra
- **Repositório (Drizzle):** `DrizzleBillingCompanyRepository` — `apps/api/src/modules/people/infra/drizzle-billing-company.repository.ts`

#### Use Cases
| Arquivo | Descrição |
|---------|-----------|
| `list-billing-companies.use-case.ts` | Lista empresas; aceita flag `includeInactive` |
| `create-billing-company.use-case.ts` | Cria empresa; normaliza CNPJ para dígitos; valida CNPJ |
| `update-billing-company.use-case.ts` | Atualiza empresa; lança `NotFoundException` se não existir |
| `assign-invoice-billing-companies.use-case.ts` | Atribuição de empresas a NFs e disparo de e-mails |

#### Controller
- **`BillingCompaniesController`** — `apps/api/src/modules/people/controllers/billing-companies.controller.ts`

### 9b.4 Fluxo de Atribuição (`AssignInvoiceBillingCompaniesUseCase`)

1. Recebe `month`, `year` e um array de `assignments` (`billingCompanyId` + lista de `collaboratorIds`).
2. Valida que todos os colaboradores existem e são do tipo PJ.
3. Para cada colaborador, garante que existe uma `pj_invoice` no período (cria se não existir).
4. Atualiza `billing_company_id` na NF correspondente.
5. Dispara e-mail via `EmailService` (SendGrid) para cada colaborador com instruções de emissão.
6. Registra `email_notified_at` na NF após envio.

**Método privados extraídos para controle de complexidade:**
- `persistAssignments` — loop de persistência
- `assertCollaboratorEligible` — valida tipo PJ e existência
- `sendAssignmentEmails` — orquestra envio em lote
- `sendOneAssignmentEmail` — monta e envia e-mail individual

### 9b.5 E-mail (SendGrid)

**Módulo:** `EmailModule` — `apps/api/src/modules/email/`  
**Serviço:** `EmailService` — suporta template dinâmico SendGrid ou HTML inline como fallback.

**Template de e-mail:** `apps/api/src/modules/people/templates/pj-invoice-assignment-email.template.ts`  
Conteúdo: instruções de emissão, dados da empresa (nome, CNPJ formatado), período (mês/ano).

**Variáveis de ambiente necessárias:**

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `SENDGRID_API_KEY` | Sim | Chave de API do SendGrid |
| `SENDGRID_FROM_EMAIL` | Sim | E-mail remetente verificado |
| `SENDGRID_INVOICE_TEMPLATE_ID` | Não | ID de template dinâmico (usa HTML se ausente) |

### 9b.6 Shared Packages

**`@nexus/types`** — `packages/types/src/billing-company.ts`
```typescript
interface BillingCompany {
  id: string;
  name: string;
  tradeName?: string;
  cnpj: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

**`@nexus/validators`** — `packages/validators/src/billing-company.schema.ts`

| Schema | Uso |
|--------|-----|
| `createBillingCompanySchema` | POST `/people/billing-companies` |
| `updateBillingCompanySchema` | PATCH `/people/billing-companies/:id` |
| `assignInvoiceBillingCompaniesSchema` | POST `/people/invoices/assign-companies` |

### 9b.7 Frontend — Novas Telas

**Empresas Faturadoras (`/people/dp/billing-companies`)**
- Arquivo: `apps/web-backoffice/src/app/(dashboard)/people/dp/billing-companies/page.tsx`
- Tabela com nome, nome fantasia, CNPJ formatado e status (ativo/inativo).
- Dialog unificado para criar e editar (react-hook-form + MaskedInput para CNPJ).
- Toggle para exibir empresas inativas.

**Atribuição de NFs (`/people/dp/invoices/assign`)**
- Arquivo: `apps/web-backoffice/src/app/(dashboard)/people/dp/invoices/assign/page.tsx`
- Seletor de período (mês/ano).
- Grupos dinâmicos: cada grupo tem uma empresa faturadora selecionada + multi-select de colaboradores PJ.
- Resumo da atribuição antes do envio.
- Submit chama `POST /people/invoices/assign-companies` e dispara os e-mails.

**Tela de NFs do DP (`/people/dp/invoices`) — atualizada**
- Coluna "Empresa destino" exibe o `billingCompanyName` atribuído à NF.

**Tela de NFs do colaborador (`/people/me/invoices`) — atualizada**
- Coluna "Tomador (NF)" exibe o `billingCompanyName` para o colaborador saber para quem emitir.

---

## 10. Rotas People Implementadas

```
/people/me                    → Meu Perfil (edição própria)
/people/me/reimbursements     → Meus Reembolsos
/people/me/invoices           → Minhas NFs PJ
/people/collaborators          → Lista de colaboradores (RH/DP)
/people/collaborators/[id]     → Detalhe + Editar + Dependentes
/people/team                   → Meu Time (gestor)
/people/team/reimbursements   → Reembolsos do Time
/people/dp/reimbursements     → Reembolsos (fila DP)
/people/dp/invoices           → Notas Fiscais PJ
/people/dp/invoices/overdue   → NFs atrasadas
/people/dp/invoices/assign    → Atribuir empresas faturadoras + enviar e-mails
/people/dp/billing-companies  → CRUD de Empresas Faturadoras
```

---

## 11. API Endpoints Utilizados

### Colaboradores

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/people/collaborators` | Listagem com paginação |
| GET | `/people/collaborators/:id` | Detalhe (com cltData, pjData) |
| PATCH | `/people/collaborators/:id` | Atualização (RH/DP) |
| GET | `/people/collaborators/:id/dependents` | Listar dependentes |
| POST | `/people/collaborators/:id/dependents` | Criar dependente |
| DELETE | `/people/collaborators/:id/dependents/:did` | Remover dependente |
| GET | `/people/me` | Meu perfil completo |
| PATCH | `/people/me` | Atualizar meu perfil |

### Reembolsos

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/people/reimbursements` | Listagem (escopo por role) |
| POST | `/people/reimbursements` | Criar reembolso |
| PATCH | `/people/reimbursements/:id` | Atualizar (apenas draft) |
| POST | `/people/reimbursements/:id/upload` | Upload comprovante |
| POST | `/people/reimbursements/:id/approve` | Aprovar |
| POST | `/people/reimbursements/:id/reject` | Rejeitar |
| POST | `/people/reimbursements/:id/pay` | Marcar como pago |

### Notas Fiscais PJ

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/people/invoices` | Listagem (escopo por role) |
| GET | `/people/invoices/overdue` | NFs atrasadas |
| POST | `/people/invoices/:id/upload` | Upload NF |
| POST | `/people/invoices/:id/approve` | Aprovar |
| POST | `/people/invoices/:id/reject` | Rejeitar |
| POST | `/people/invoices/:id/pay` | Marcar como paga |
| POST | `/people/invoices/generate-monthly` | Gerar NFs do mês (DP) |
| POST | `/people/invoices/send-reminders` | Enviar lembretes |
| POST | `/people/invoices/assign-companies` | Atribuir empresas faturadoras + disparar e-mails |

### Empresas Faturadoras

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/people/billing-companies` | Listar (aceita `?includeInactive=true`) |
| POST | `/people/billing-companies` | Criar empresa |
| PATCH | `/people/billing-companies/:id` | Atualizar empresa |
