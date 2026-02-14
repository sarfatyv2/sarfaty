# Permissões por Role — Plataforma Sarfaty

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Referência:** `packages/types/src/permissions.ts`, controllers da API

---

## 1. Roles Disponíveis

| Código | Nome |
|--------|------|
| `sales_rep` | Comercial |
| `sales_supervisor` | Supervisor Comercial |
| `sales_manager` | Gerente Regional |
| `sales_director` | Diretor Comercial |
| `credit_analyst` | Analista de Crédito |
| `compliance_officer` | Compliance |
| `approver` | Mesa Aprovadora |
| `backoffice` | Backoffice |
| `legal` | Jurídico |
| `risk_manager` | Gestão de Risco |
| `recovery` | Recuperação |
| `litigation` | Contencioso |
| `employee` | Colaborador |
| `people_manager` | Gestor de Pessoas |
| `hr` | RH |
| `dp` | Departamento Pessoal |
| `hr_admin` | Admin RH |
| `admin` | Administrador |

Um usuário pode ter múltiplos roles (ex: `sales_rep` + `employee`).

---

## 2. Módulo People — Reembolsos

### Visibilidade na Listagem (GET /people/reimbursements)

| Role | Escopo |
|------|--------|
| `dp`, `hr_admin`, `admin` | **Todos** os reembolsos da empresa |
| `people_manager` | Reembolsos **apenas da equipe** (subordinados diretos e indiretos) |
| `employee`, `hr` | **Apenas os próprios** reembolsos |

### Ações por Endpoint

| Endpoint | employee | people_manager | hr | dp | hr_admin | admin |
|----------|:--------:|:--------------:|:--:|:--:|:--------:|:-----:|
| GET (listar) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST (criar) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH (atualizar) | ✅* | ✅* | ✅* | ✅* | ✅* | ✅* |
| POST :id/upload (comprovante) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST :id/approve | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST :id/reject | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST :id/pay | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

\* UPDATE: apenas o próprio colaborador pode atualizar seus reembolsos em status `draft`.

### Fluxo

```
Colaborador cria → Gestor aprova/rejeita → DP paga
```

---

## 3. Módulo People — Notas Fiscais PJ

### Visibilidade na Listagem (GET /people/invoices)

| Role | Escopo |
|------|--------|
| `dp`, `hr_admin`, `admin` | **Todas** as NFs da empresa |
| `employee`, `people_manager`, `hr` | **Apenas as próprias** NFs (colaborador PJ) |

### Ações por Endpoint

| Endpoint | employee | people_manager | hr | dp | hr_admin | admin |
|----------|:--------:|:--------------:|:--:|:--:|:--------:|:-----:|
| GET (listar) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /overdue (atrasadas) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| POST :id/upload (enviar NF) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST :id/approve | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| POST :id/reject | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| POST :id/pay | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| POST /send-reminders | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| POST /generate-monthly | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## 3.1 CRON — Geração mensal de NFs PJ

O job roda **dia 20 de cada mês às 9h (America/Sao_Paulo)**. Cria `pj_invoices` com status `pending_upload` para todos os colaboradores PJ ativos que ainda não têm NF naquele mês/ano.

**Arquivo:** `apps/api/src/modules/people/pj-invoice-cron.service.ts`

**Execução manual:** `POST /people/invoices/generate-monthly` (dp, hr_admin, admin) — botão "Gerar NFs do mês" na tela DP.

---

## 4. Módulo People — Colaboradores

| Endpoint | people_manager | hr | dp | hr_admin | admin |
|----------|:--------------:|:--:|:--:|:--------:|:-----:|
| GET /people/collaborators | ✅* | ✅ | ✅ | ✅ | ✅ |
| GET /people/collaborators/:id | ✅* | ✅ | ✅ | ✅ | ✅ |
| PATCH /people/collaborators/:id | ❌ | ✅ | ✅ | ✅ | ✅ |

\* `people_manager` vê **apenas o time** (subordinados). O backend força `managerId` na query.

---

## 5. Módulo People — Dependentes

| Endpoint | hr | dp | hr_admin | admin |
|----------|:--:|:--:|:--------:|:-----:|
| GET /people/collaborators/:id/dependents | ✅ | ✅ | ✅ | ✅ |
| POST /people/collaborators/:id/dependents | ✅ | ✅ | ✅ | ✅ |
| PATCH /people/collaborators/:id/dependents/:did | ✅ | ✅ | ✅ | ✅ |
| DELETE /people/collaborators/:id/dependents/:did | ✅ | ✅ | ✅ | ✅ |

Colaborador vê os próprios dependentes via `/people/me/dependents` (sem restrição de role na API; requer perfil vinculado).

---

## 6. Módulo People — Meu Perfil

| Endpoint | Qualquer autenticado |
|----------|----------------------|
| GET /people/me | ✅ |
| PATCH /people/me | ✅ |
| GET /people/me/dependents | ✅ |

O usuário só acessa seus próprios dados. O backend valida pelo `profile_id`.

---

## 7. Rotas do Frontend (Sidebar)

### Meu Espaço (todos os roles)

- `/people/me` — Meu Perfil
- `/people/me/invoices` — Minhas NFs
- `/people/me/reimbursements` — Meus Reembolsos

### Meu Time (people_manager)

- `/people/team` — Colaboradores
- `/people/team/reimbursements` — Reembolsos do Time

### Gestão de Pessoas (hr)

- `/people/collaborators` — Colaboradores

### Departamento Pessoal (dp, hr_admin)

- `/people/collaborators` — Colaboradores
- `/people/dp/invoices` — Notas Fiscais PJ
- `/people/dp/reimbursements` — Reembolsos
- `/people/dp/invoices/overdue` — NFs Atrasadas

---

## 7.1 Listagem de Usuários (GET /users)

| Role | Acesso |
|------|--------|
| `hr`, `dp`, `hr_admin`, `admin` | ✅ (listagem e busca de usuários — usado no seletor de gestor) |
| Demais roles | ❌ |

---

## 8. Regra de Herança

- **admin** tem acesso a tudo (herda implicitamente).
- **hr_admin** tem as permissões de RH + DP.
- Todos os roles possuem a seção **Meu Espaço** (perfil, NFs e reembolsos).

---

## 9. Onde Está Implementado

| Item | Local |
|------|-------|
| Roles e sidebar | `packages/types/src/permissions.ts` |
| Validação no backend | `@Roles()` nos controllers |
| Lógica de filtro (quem vê o quê) | Use cases (ex: `list-reimbursements.use-case.ts`) |
