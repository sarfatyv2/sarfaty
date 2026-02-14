# Implementação do Módulo People — Colaboradores, Reembolsos e NFs PJ

**Versão:** 1.1  
**Data:** 14 de Fevereiro de 2026  
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
