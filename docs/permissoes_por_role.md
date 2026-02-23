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
| `governance` | Governança |
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

## 8. Módulo Governance — Comitês, Reuniões e Ações

### Permissões por Endpoint

| Endpoint | governance | admin | legal | compliance_officer | backoffice | sales_director | hr_admin | people_manager |
|----------|:----------:|:-----:|:-----:|:-----------------:|:---------:|:--------------:|:--------:|:--------------:|
| POST /governance/committees | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /governance/committees | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /governance/committees/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /governance/committees/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /governance/committees/:id/members | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /governance/committees/:id/members | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| PATCH .../members/:memberId/role | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| DELETE .../members/:memberId | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST .../meetings | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET .../meetings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET .../meetings/:meetingId | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH .../meetings/:meetingId | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET .../meetings/:meetingId/minute | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST .../meetings/:meetingId/minute | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST .../meetings/:meetingId/minute/publish | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /governance/committees/:committeeId/actions | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /governance/actions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /governance/actions/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /governance/actions/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DELETE /governance/actions/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /governance/actions/:id/updates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /governance/actions/:id/updates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**MANAGE_ROLES** (criar/editar/excluir): `governance`, `admin`, `legal`, `compliance_officer`, `backoffice`  
**READ_ROLES** (leitura): MANAGE_ROLES + `sales_director`, `hr_admin`, `people_manager`

---

## 9. Módulo Communication — Wiki e Intranet

### Wiki (Base de Conhecimento)

| Endpoint | Leitura (todos autenticados) | Edição (EDITOR_ROLES) |
|----------|:---------------------------:|:--------------------:|
| GET /wiki/categories | ✅ todos | — |
| POST /wiki/categories | — | ✅ |
| PATCH /wiki/categories/:id | — | ✅ |
| DELETE /wiki/categories/:id | — | ✅ |
| GET /wiki/articles | ✅ todos | — |
| GET /wiki/articles/:slug | ✅ todos | — |
| POST /wiki/articles | — | ✅ |
| PATCH /wiki/articles/:id | — | ✅ |
| DELETE /wiki/articles/:id | — | ✅ |

**EDITOR_ROLES**: `admin`, `governance`, `hr_admin`, `people_manager`, `legal`, `compliance_officer`  
**Leitura**: todos os 19 roles autenticados

### Intranet (Comunicados)

| Endpoint | Todos autenticados | AUTHOR_ROLES |
|----------|--------------------|:------------:|
| GET /intranet/announcements | ✅ (filtrado por targetRoles) | — |
| GET /intranet/announcements/admin | ❌ | ✅ |
| GET /intranet/announcements/:id | ❌ | ✅ |
| POST /intranet/announcements | ❌ | ✅ |
| PATCH /intranet/announcements/:id | ❌ | ✅ |
| DELETE /intranet/announcements/:id | ❌ | ✅ |

**AUTHOR_ROLES**: `admin`, `governance`, `hr_admin`, `people_manager`, `legal`, `compliance_officer`

---

## 10. Módulo Notifications

Todos os 19 roles autenticados têm acesso a todos os endpoints:

| Endpoint | Todos autenticados |
|----------|--------------------|
| GET /notifications | ✅ |
| GET /notifications/unread-count | ✅ |
| PATCH /notifications/read-all | ✅ |
| PATCH /notifications/:id/read | ✅ |

---

## 11. Regra de Herança

- **admin** tem acesso a tudo (herda implicitamente).
- **hr_admin** tem as permissões de RH + DP.
- **governance** tem acesso completo aos módulos Governance, Communication/Wiki e Intranet.
- Todos os roles possuem a seção **Meu Espaço** (perfil, NFs e reembolsos).
- Todos os roles possuem a seção **Conhecimento** (Wiki — leitura).

---

## 12. Onde Está Implementado

| Item | Local |
|------|-------|
| Roles e sidebar | `packages/types/src/permissions.ts` |
| Validação no backend | `@Roles()` nos controllers |
| Lógica de filtro (quem vê o quê) | Use cases (ex: `list-reimbursements.use-case.ts`) |
| Governance controllers | `apps/api/src/modules/governance/controllers/` |
| Communication controllers | `apps/api/src/modules/communication/controllers/` |
| Notifications controller | `apps/api/src/modules/notifications/controllers/` |
