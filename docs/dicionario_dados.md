# Dicionario de Dados — Plataforma Sarfaty

**Versao:** 1.0  
**Data:** 14 de Fevereiro de 2026  
**Banco:** Supabase PostgreSQL 15+ (schema `public`)  
**Total de tabelas:** 36  

---

## Indice

| # | Modulo | Tabela | Descricao |
|---|--------|--------|-----------|
| 1 | Core | `profiles` | Usuarios do sistema (vinculado a auth.users) |
| 2 | Core | `regions` | Regioes comerciais |
| 3 | Core | `teams` | Times dentro de regioes |
| 4 | Core | `notifications` | Notificacoes in-app |
| 5 | Core | `audit_logs` | Trail de auditoria |
| 6 | Comercial | `clients` | Clientes (empresas) em pipeline de credito |
| 7 | Comercial | `client_documents` | Documentos enviados por clientes |
| 8 | Comercial | `client_guarantees` | Garantias vinculadas a clientes |
| 9 | Comercial | `client_status_history` | Historico de mudancas de status do cliente |
| 10 | Credito | `segments` | Segmentos de mercado |
| 11 | Credito | `segment_document_templates` | Templates de documentos por segmento |
| 12 | Credito | `credit_products` | Produtos de credito |
| 13 | Credito | `product_document_templates` | Templates de documentos por produto |
| 14 | Credito | `guarantee_types` | Tipos de garantia |
| 15 | Credito | `guarantee_document_templates` | Templates de documentos por garantia |
| 16 | Credito | `cnae_segment_mapping` | Mapeamento CNAE para segmentos |
| 17 | Credito | `range_age` | Faixas etarias (dashboards) |
| 18 | Credito | `range_tenure` | Faixas de tempo de empresa (dashboards) |
| 19 | People | `collaborators` | Colaboradores (dados completos de RH) |
| 20 | People | `collaborator_clt_data` | Dados especificos CLT |
| 21 | People | `collaborator_pj_data` | Dados especificos PJ |
| 22 | People | `collaborator_dependents` | Dependentes de colaboradores |
| 23 | People | `collaborator_documents` | Documentos de colaboradores |
| 24 | People | `collaborator_compensation` | Historico de movimentacoes salariais |
| 25 | People | `medical_plan_entries` | Plano medico (titulares e dependentes) |
| 26 | People | `reimbursements` | Solicitacoes de reembolso |
| 27 | People | `pj_invoices` | Notas fiscais PJ (mensal) |
| 28 | People | `onboarding_templates` | Templates de tarefas de onboarding |
| 29 | People | `onboarding_tasks` | Tarefas de onboarding por colaborador |
| 30 | People | `performance_review_cycles` | Ciclos de avaliacao de desempenho |
| 31 | People | `performance_reviews` | Avaliacoes individuais |
| 32 | Learning | `learning_courses` | Cursos |
| 33 | Learning | `learning_modules` | Modulos dentro de cursos |
| 34 | Learning | `learning_lessons` | Aulas dentro de modulos |
| 35 | Learning | `learning_enrollments` | Matriculas de colaboradores em cursos |
| 36 | Learning | `learning_lesson_completions` | Progresso por aula |

---

## Convencoes

- **PK:** Todas as tabelas usam `id uuid DEFAULT gen_random_uuid()` (exceto `range_age` e `range_tenure` que usam `serial`)
- **Timestamps:** `created_at timestamptz DEFAULT now()` e `updated_at timestamptz DEFAULT now()` na maioria das tabelas
- **RLS:** Habilitado em 100% das tabelas
- **Soft delete:** Nenhuma tabela usa soft delete; usam flags como `is_active`
- **Status fields:** Tipo `text` com defaults (ex: `'draft'`, `'pending'`)

---

## Modulo Core

### 1. profiles

Usuarios do sistema. O `id` e o mesmo do `auth.users.id` do Supabase.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | — | PK, FK para auth.users.id |
| `full_name` | text | NO | — | Nome completo |
| `email` | text | NO | — | Email (UNIQUE) |
| `phone` | text | YES | — | Telefone |
| `role` | text | NO | — | Role do sistema (sales_rep, admin, hr, etc.) |
| `is_active` | boolean | YES | true | Usuario ativo |
| `avatar_url` | text | YES | — | URL do avatar |
| `team_id` | uuid | YES | — | FK -> teams.id |
| `region_id` | uuid | YES | — | FK -> regions.id |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**Constraints:** PK(id), UNIQUE(email), FK(id -> auth.users), FK(team_id -> teams), FK(region_id -> regions)  
**RLS:** SELECT/UPDATE onde `id = auth.uid()`

---

### 2. regions

Regioes comerciais da empresa.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `name` | text | NO | — | Nome da regiao |
| `code` | text | NO | — | Codigo unico (UNIQUE) |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**RLS:** SELECT para authenticated

---

### 3. teams

Times dentro de regioes.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `name` | text | NO | — | Nome do time |
| `region_id` | uuid | NO | — | FK -> regions.id |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**RLS:** SELECT para authenticated

---

### 4. notifications

Notificacoes in-app para usuarios.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `profile_id` | uuid | NO | — | FK -> profiles.id |
| `type` | text | NO | — | Tipo da notificacao |
| `title` | text | NO | — | Titulo |
| `message` | text | NO | — | Mensagem |
| `client_id` | uuid | YES | — | FK -> clients.id (opcional) |
| `metadata` | jsonb | YES | — | Dados adicionais |
| `read_at` | timestamptz | YES | — | Quando foi lida |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT/UPDATE onde `profile_id = auth.uid()`

---

### 5. audit_logs

Trail de auditoria append-only. Documentado em detalhe em `docs/audit_trail.md`.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `correlation_id` | text | NO | — | ID de correlacao (X-Correlation-ID) |
| `actor_id` | uuid | NO | — | Quem executou a acao |
| `actor_role` | text | NO | — | Role do ator no momento |
| `action` | text | NO | — | Acao executada (ex: approve_reimbursement) |
| `entity_type` | text | NO | — | Tipo da entidade (ex: reimbursement) |
| `entity_id` | text | YES | — | ID da entidade afetada |
| `http_method` | text | NO | — | GET, POST, PATCH, DELETE |
| `path` | text | NO | — | Path da requisicao |
| `payload` | jsonb | YES | — | Body da requisicao |
| `metadata` | jsonb | YES | — | IP, user-agent, etc. |
| `created_at` | timestamptz | NO | now() | |

**RLS:** SELECT onde `actor_id = auth.uid()`

---

## Modulo Comercial

### 6. clients

Clientes (empresas) no pipeline de credito.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_name` | text | NO | — | Razao social |
| `cnpj` | text | NO | — | CNPJ (UNIQUE) |
| `trade_name` | text | YES | — | Nome fantasia |
| `segment_id` | uuid | NO | — | FK -> segments.id |
| `phone` | text | NO | — | Telefone |
| `email` | text | NO | — | Email |
| `address_street` | text | YES | — | Logradouro |
| `address_number` | text | YES | — | Numero |
| `address_complement` | text | YES | — | Complemento |
| `address_neighborhood` | text | YES | — | Bairro |
| `address_city` | text | YES | — | Cidade |
| `address_state` | text | YES | — | Estado (UF) |
| `address_zip` | text | YES | — | CEP |
| `credit_product_id` | uuid | NO | — | FK -> credit_products.id |
| `requested_amount` | numeric | YES | — | Valor solicitado |
| `approved_amount` | numeric | YES | — | Valor aprovado |
| `has_guarantees` | boolean | YES | false | Possui garantias |
| `is_judicial_recovery` | boolean | YES | false | Em recuperacao judicial |
| `working_capital_notes` | jsonb | YES | — | Notas sobre capital de giro |
| `status` | text | NO | 'draft' | Status do pipeline |
| `assigned_to` | uuid | NO | — | FK -> profiles.id (responsavel) |
| `team_id` | uuid | YES | — | FK -> teams.id |
| `region_id` | uuid | YES | — | FK -> regions.id |
| `cnpj_status` | text | YES | — | Status da validacao CNPJ |
| `cnpj_validated_at` | timestamptz | YES | — | Quando CNPJ foi validado |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |
| `submitted_at` | timestamptz | YES | — | Quando foi submetido para analise |
| `approved_at` | timestamptz | YES | — | Quando foi aprovado |
| `homologated_at` | timestamptz | YES | — | Quando foi homologado |

**Constraints:** PK(id), UNIQUE(cnpj), FK(segment_id, credit_product_id, assigned_to, team_id, region_id)  
**RLS:** Policies por role (sales_rep, supervisor, manager, director, operational, admin)

---

### 7. client_documents

Documentos enviados para clientes no processo de credito.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `document_type` | text | NO | — | Tipo do documento |
| `document_category` | text | NO | 'base' | Categoria (base, segment, product, guarantee) |
| `segment_template_id` | uuid | YES | — | FK -> segment_document_templates.id |
| `product_template_id` | uuid | YES | — | FK -> product_document_templates.id |
| `guarantee_template_id` | uuid | YES | — | FK -> guarantee_document_templates.id |
| `client_guarantee_id` | uuid | YES | — | FK -> client_guarantees.id |
| `document_label` | text | YES | — | Label amigavel |
| `reference_year` | integer | YES | — | Ano de referencia |
| `reference_month` | integer | YES | — | Mes de referencia |
| `partner_name` | text | YES | — | Nome do socio (se aplicavel) |
| `storage_path` | text | NO | — | Path no Supabase Storage |
| `file_name` | text | NO | — | Nome do arquivo |
| `file_size` | integer | YES | — | Tamanho em bytes |
| `mime_type` | text | YES | — | Tipo MIME |
| `validation_status` | text | YES | 'pending' | Status da validacao IA |
| `validation_result` | jsonb | YES | — | Resultado da validacao IA |
| `validated_at` | timestamptz | YES | — | Quando foi validado |
| `extracted_data` | jsonb | YES | — | Dados extraidos pela IA |
| `uploaded_by` | uuid | NO | — | FK -> profiles.id |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT via join com clients; DELETE restrito por status do cliente

---

### 8. client_guarantees

Garantias vinculadas a clientes.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `guarantee_type_id` | uuid | NO | — | FK -> guarantee_types.id |
| `description` | text | YES | — | Descricao da garantia |
| `estimated_value` | numeric | YES | — | Valor estimado |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT/INSERT/DELETE via join com clients

---

### 9. client_status_history

Historico de transicoes de status do cliente.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `from_status` | text | YES | — | Status anterior |
| `to_status` | text | NO | — | Novo status |
| `changed_by` | uuid | YES | — | FK -> profiles.id |
| `change_reason` | text | YES | — | Motivo da mudanca |
| `metadata` | jsonb | YES | — | Dados adicionais |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT via join com clients

---

## Modulo Credito (Tabelas de Referencia)

### 10. segments

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `name` | text | NO | — | Nome (UNIQUE) |
| `code` | text | NO | — | Codigo (UNIQUE) |
| `description` | text | YES | — | Descricao |
| `is_active` | boolean | YES | true | Ativo |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

### 11. segment_document_templates

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `segment_id` | uuid | NO | — | FK -> segments.id |
| `document_type` | text | NO | — | Tipo do documento |
| `document_label` | text | NO | — | Label amigavel |
| `description` | text | YES | — | |
| `is_required` | boolean | YES | true | Obrigatorio |
| `accepted_mime_types` | text[] | YES | {application/pdf} | Tipos aceitos |
| `max_file_size_mb` | integer | YES | 25 | Tamanho maximo |
| `sort_order` | integer | YES | 0 | Ordem de exibicao |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**Constraints:** UNIQUE(segment_id, document_type)

### 12. credit_products

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `name` | text | NO | — | Nome (UNIQUE) |
| `code` | text | NO | — | Codigo (UNIQUE) |
| `description` | text | YES | — | Descricao |
| `is_active` | boolean | YES | true | Ativo |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

### 13. product_document_templates

Estrutura identica a `segment_document_templates`, com FK para `credit_products` em vez de `segments`.
**Constraints:** UNIQUE(product_id, document_type)

### 14. guarantee_types

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `name` | text | NO | — | Nome (UNIQUE) |
| `code` | text | NO | — | Codigo (UNIQUE) |
| `description` | text | YES | — | |
| `is_active` | boolean | YES | true | |
| `created_at` | timestamptz | YES | now() | |

### 15. guarantee_document_templates

Estrutura identica a `segment_document_templates`, com FK para `guarantee_types`.
**Constraints:** UNIQUE(guarantee_type_id, document_type)

### 16. cnae_segment_mapping

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `cnae_code` | text | NO | — | Codigo CNAE |
| `cnae_group` | text | NO | — | Grupo CNAE |
| `segment_id` | uuid | NO | — | FK -> segments.id |
| `confidence` | text | YES | 'medium' | Confianca do mapeamento |
| `created_at` | timestamptz | YES | now() | |

### 17. range_age

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | integer | NO | serial | PK |
| `min_age` | integer | NO | — | Idade minima |
| `max_age` | integer | YES | — | Idade maxima |
| `label` | text | NO | — | Label (ex: "18-25") |

### 18. range_tenure

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | integer | NO | serial | PK |
| `min_years` | numeric | NO | — | Anos minimos |
| `max_years` | numeric | YES | — | Anos maximos |
| `label` | text | NO | — | Label (ex: "0-1 ano") |

---

## Modulo People

### 19. collaborators

Tabela principal de colaboradores (RH completo).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `profile_id` | uuid | YES | — | FK -> profiles.id (UNIQUE) |
| `is_active` | boolean | NO | true | Colaborador ativo |
| `registration_number` | text | YES | — | Matricula (UNIQUE) |
| `badge_number` | text | YES | — | Cracha |
| `employment_type` | text | NO | — | CLT ou PJ |
| `is_internal` | boolean | YES | true | Interno |
| `full_name` | text | NO | — | Nome completo |
| `social_name` | text | YES | — | Nome social |
| `date_of_birth` | date | YES | — | Data de nascimento |
| `gender` | text | YES | — | Genero |
| `marital_status` | text | YES | — | Estado civil |
| `nationality` | text | YES | 'Brasileira' | Nacionalidade |
| `cpf` | text | YES | — | CPF (UNIQUE) |
| `rg` | text | YES | — | RG |
| `rg_issuer` | text | YES | — | Orgao emissor |
| `voter_registration` | text | YES | — | Titulo de eleitor |
| `voter_zone` | text | YES | — | Zona |
| `voter_section` | text | YES | — | Secao |
| `military_cert` | text | YES | — | Certificado militar |
| `address_street` | text | YES | — | Logradouro |
| `address_number` | text | YES | — | Numero |
| `address_complement` | text | YES | — | Complemento |
| `address_neighborhood` | text | YES | — | Bairro |
| `address_city` | text | YES | — | Cidade |
| `address_state` | text | YES | — | UF |
| `address_zip` | text | YES | — | CEP |
| `phone` | text | YES | — | Telefone |
| `personal_email` | text | YES | — | Email pessoal |
| `corporate_email` | text | YES | — | Email corporativo |
| `extension` | text | YES | — | Ramal |
| `company` | text | YES | 'Sarfaty' | Empresa |
| `directorate` | text | YES | — | Diretoria |
| `department` | text | YES | — | Departamento |
| `branch` | text | YES | — | Filial |
| `manager_id` | uuid | YES | — | FK -> collaborators.id (self-ref) |
| `job_title` | text | YES | — | Cargo |
| `role_code` | text | YES | — | Codigo do cargo |
| `role_level` | text | YES | — | Nivel (Jr, Pl, Sr) |
| `start_date_original` | date | YES | — | Data admissao original |
| `start_date_current` | date | YES | — | Data admissao atual |
| `registration_date` | date | YES | — | Data de registro |
| `termination_date` | date | YES | — | Data de desligamento |
| `termination_reason` | text | YES | — | Motivo desligamento |
| `termination_year` | integer | YES | — | Ano desligamento |
| `has_medical_assistance` | boolean | YES | true | Tem plano medico |
| `medical_plan_notes` | text | YES | — | Obs. plano medico |
| `plr_eligible` | boolean | YES | false | Elegivel PLR |
| `thirteenth_pj` | boolean | YES | false | 13o PJ |
| `guaranteed_bonus` | numeric | YES | — | Bonus garantido |
| `commission_pct` | numeric | YES | — | % comissao |
| `bank_name` | text | YES | — | Banco |
| `bank_branch` | text | YES | — | Agencia |
| `bank_account` | text | YES | — | Conta |
| `bank_account_type` | text | YES | — | Tipo (corrente/poupanca) |
| `current_salary` | numeric | YES | — | Salario atual |
| `last_movement_date` | date | YES | — | Data ultima movimentacao |
| `last_movement_type` | text | YES | — | Tipo ultima movimentacao |
| `notes` | text | YES | — | Observacoes |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**Constraints:** PK(id), UNIQUE(cpf, profile_id, registration_number), FK(profile_id -> profiles, manager_id -> collaborators)  
**RLS:** Policies por role (hr, dp, admin, people_manager, self)

---

### 20. collaborator_clt_data

Dados especificos de colaboradores CLT. Relacao 1:1 com collaborators.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id (UNIQUE) |
| `ctps_number` | text | YES | — | Numero CTPS |
| `ctps_series` | text | YES | — | Serie CTPS |
| `pis_pasep` | text | YES | — | PIS/PASEP |
| `timesheet_system` | text | YES | 'ponto_mais' | Sistema de ponto |
| `timesheet_id` | text | YES | — | ID no sistema de ponto |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**RLS:** Policies por role (hr, dp, admin, self)

---

### 21. collaborator_pj_data

Dados especificos de colaboradores PJ. Relacao 1:1 com collaborators.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id (UNIQUE) |
| `company_name` | text | YES | — | Razao social PJ |
| `company_cnpj` | text | YES | — | CNPJ da PJ |
| `company_cnae` | text | YES | — | CNAE |
| `service_contract_path` | text | YES | — | Path do contrato no Storage |
| `contract_signed_at` | timestamptz | YES | — | Data assinatura contrato |
| `monthly_nf_amount` | numeric | YES | — | Valor mensal NF |
| `nf_due_day` | integer | YES | 25 | Dia de vencimento da NF |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**RLS:** Policies por role (hr, dp, admin, self)

---

### 22. collaborator_dependents

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `relationship` | text | NO | — | Parentesco |
| `full_name` | text | NO | — | Nome completo |
| `date_of_birth` | date | YES | — | Data nascimento |
| `cpf` | text | YES | — | CPF |
| `is_ir_dependent` | boolean | YES | false | Dependente IR |
| `is_health_plan` | boolean | YES | false | Incluido no plano |
| `notes` | text | YES | — | Observacoes |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**RLS:** Policies por role + self + manager

---

### 23. collaborator_documents

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `document_type` | text | NO | — | Tipo do documento |
| `document_label` | text | YES | — | Label |
| `storage_path` | text | NO | — | Path no Storage |
| `file_name` | text | NO | — | Nome do arquivo |
| `file_size` | integer | YES | — | Tamanho em bytes |
| `mime_type` | text | YES | — | Tipo MIME |
| `uploaded_by` | uuid | NO | — | FK -> profiles.id |
| `created_at` | timestamptz | YES | now() | |

**RLS:** Policies por role + self + manager

---

### 24. collaborator_compensation

Historico de movimentacoes salariais e promocoes.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `effective_date` | date | NO | — | Data efetiva |
| `movement_type` | text | NO | — | Tipo (admissao, promocao, reajuste, etc.) |
| `previous_salary` | numeric | YES | — | Salario anterior |
| `new_salary` | numeric | YES | — | Novo salario |
| `increase_amount` | numeric | YES | — | Valor do aumento |
| `increase_pct` | numeric | YES | — | % do aumento |
| `previous_role` | text | YES | — | Cargo anterior |
| `new_role` | text | YES | — | Novo cargo |
| `previous_level` | text | YES | — | Nivel anterior |
| `new_level` | text | YES | — | Novo nivel |
| `reason` | text | YES | — | Justificativa |
| `approved_by` | uuid | YES | — | FK -> profiles.id |
| `created_by` | uuid | NO | — | FK -> profiles.id |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT/INSERT para admin/hr/dp

---

### 25. medical_plan_entries

Entradas do plano medico (titulares e dependentes).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `plan_type` | text | YES | — | Tipo do plano |
| `provider` | text | YES | 'Agrega' | Operadora |
| `beneficiary_name` | text | NO | — | Nome do beneficiario |
| `beneficiary_relationship` | text | NO | — | Parentesco |
| `beneficiary_cpf` | text | YES | — | CPF |
| `is_active` | boolean | YES | true | Ativo |
| `enrollment_date` | date | YES | — | Data de inclusao |
| `cancellation_date` | date | YES | — | Data de exclusao |
| `monthly_cost` | numeric | YES | — | Custo mensal |
| `company_subsidy_pct` | numeric | YES | — | % subsidio empresa |
| `employee_cost` | numeric | YES | — | Custo colaborador |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**RLS:** SELECT onde `collaborator_id = auth.uid()`

---

### 26. reimbursements

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `title` | text | NO | — | Titulo |
| `description` | text | YES | — | Descricao |
| `category` | text | NO | — | Categoria (alimentacao, transporte, etc.) |
| `amount` | numeric | NO | — | Valor |
| `expense_date` | date | NO | — | Data da despesa |
| `receipt_path` | text | YES | — | Path do comprovante |
| `receipt_file_name` | text | YES | — | Nome do arquivo |
| `receipt_file_size` | integer | YES | — | Tamanho |
| `receipt_mime_type` | text | YES | — | MIME type |
| `receipt_uploaded_at` | timestamptz | YES | — | Upload timestamp |
| `status` | text | NO | 'pending' | Status (pending, approved, rejected, paid) |
| `approved_by` | uuid | YES | — | FK -> profiles.id |
| `approved_at` | timestamptz | YES | — | |
| `rejected_by` | uuid | YES | — | FK -> profiles.id |
| `rejected_at` | timestamptz | YES | — | |
| `rejection_reason` | text | YES | — | Motivo rejeicao |
| `paid_by` | uuid | YES | — | FK -> profiles.id |
| `paid_at` | timestamptz | YES | — | |
| `payment_reference` | text | YES | — | Referencia pagamento |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**RLS:** SELECT/INSERT onde `collaborator_id = auth.uid()`

---

### 27. pj_invoices

Notas fiscais mensais de colaboradores PJ.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `reference_month` | integer | NO | — | Mes referencia (1-12) |
| `reference_year` | integer | NO | — | Ano referencia |
| `invoice_number` | text | YES | — | Numero da NF |
| `invoice_amount` | numeric | NO | — | Valor da NF |
| `invoice_path` | text | YES | — | Path no Storage |
| `invoice_file_name` | text | YES | — | Nome do arquivo |
| `invoice_file_size` | integer | YES | — | Tamanho |
| `invoice_mime_type` | text | YES | — | MIME type |
| `status` | text | NO | 'pending' | Status do fluxo |
| `uploaded_by` | uuid | YES | — | FK -> profiles.id |
| `uploaded_at` | timestamptz | YES | — | |
| `reviewed_by` | uuid | YES | — | FK -> profiles.id |
| `reviewed_at` | timestamptz | YES | — | |
| `approved_by_finance_1` | uuid | YES | — | FK -> profiles.id |
| `approved_at_finance_1` | timestamptz | YES | — | |
| `approved_by_finance_2` | uuid | YES | — | FK -> profiles.id |
| `approved_at_finance_2` | timestamptz | YES | — | |
| `paid_at` | timestamptz | YES | — | |
| `payment_reference` | text | YES | — | |
| `rejection_reason` | text | YES | — | |
| `reminder_sent_at` | timestamptz | YES | — | Ultimo lembrete |
| `reminder_count` | integer | YES | 0 | Contagem lembretes |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**Constraints:** UNIQUE(collaborator_id, reference_month, reference_year)  
**RLS:** SELECT/INSERT onde `collaborator_id = auth.uid()`

---

### 28. onboarding_templates

Templates de tarefas de onboarding.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `type` | text | NO | — | Tipo (onboarding/offboarding) |
| `employment_type` | text | YES | — | CLT ou PJ |
| `task_order` | integer | NO | — | Ordem |
| `task_title` | text | NO | — | Titulo da tarefa |
| `task_description` | text | YES | — | Descricao |
| `responsible_area` | text | NO | — | Area responsavel |
| `due_days` | integer | YES | — | Prazo em dias |
| `is_required` | boolean | YES | true | Obrigatorio |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT para authenticated

---

### 29. onboarding_tasks

Instancias de tarefas por colaborador.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `template_id` | uuid | NO | — | FK -> onboarding_templates.id |
| `type` | text | NO | — | Tipo |
| `status` | text | NO | 'pending' | Status |
| `due_date` | date | YES | — | Data limite |
| `completed_at` | timestamptz | YES | — | Quando concluida |
| `completed_by` | uuid | YES | — | FK -> profiles.id |
| `notes` | text | YES | — | Observacoes |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT onde `collaborator_id = auth.uid()`

---

### 30. performance_review_cycles

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `name` | text | NO | — | Nome do ciclo |
| `start_date` | date | NO | — | Inicio |
| `end_date` | date | NO | — | Fim |
| `status` | text | NO | 'draft' | Status |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT para authenticated

---

### 31. performance_reviews

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `cycle_id` | uuid | NO | — | FK -> performance_review_cycles.id |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `reviewer_id` | uuid | NO | — | FK -> collaborators.id |
| `self_review_score` | numeric | YES | — | Nota autoavaliacao |
| `self_review_text` | text | YES | — | Texto autoavaliacao |
| `self_review_submitted_at` | timestamptz | YES | — | |
| `manager_review_score` | numeric | YES | — | Nota gestor |
| `manager_review_text` | text | YES | — | Texto gestor |
| `manager_review_submitted_at` | timestamptz | YES | — | |
| `calibrated_score` | numeric | YES | — | Nota calibrada |
| `calibration_notes` | text | YES | — | Notas calibracao |
| `calibrated_by` | uuid | YES | — | FK -> profiles.id |
| `calibrated_at` | timestamptz | YES | — | |
| `final_score` | numeric | YES | — | Nota final |
| `final_rating` | text | YES | — | Rating (A, B, C, D) |
| `development_plan` | text | YES | — | PDI |
| `goals_next_cycle` | text | YES | — | Metas proximo ciclo |
| `status` | text | NO | 'pending' | Status |
| `feedback_given_at` | timestamptz | YES | — | Quando feedback dado |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**Constraints:** UNIQUE(cycle_id, collaborator_id)  
**RLS:** SELECT onde `collaborator_id = auth.uid()`

---

## Modulo Learning

### 32. learning_courses

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `title` | text | NO | — | Titulo |
| `description` | text | YES | — | Descricao |
| `thumbnail_url` | text | YES | — | URL thumbnail |
| `category` | text | NO | — | Categoria |
| `target_roles` | text[] | NO | — | Roles alvo |
| `is_mandatory` | boolean | YES | false | Obrigatorio |
| `deadline_days` | integer | YES | — | Prazo em dias apos matricula |
| `status` | text | NO | 'draft' | Status (draft, published, archived) |
| `total_duration_seconds` | integer | YES | 0 | Duracao total |
| `created_by` | uuid | NO | — | FK -> profiles.id |
| `published_at` | timestamptz | YES | — | |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**RLS:** SELECT para authenticated

---

### 33. learning_modules

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `course_id` | uuid | NO | — | FK -> learning_courses.id |
| `title` | text | NO | — | Titulo |
| `sort_order` | integer | NO | 0 | Ordem |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT para authenticated

---

### 34. learning_lessons

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `module_id` | uuid | NO | — | FK -> learning_modules.id |
| `title` | text | NO | — | Titulo |
| `description` | text | YES | — | Descricao |
| `youtube_video_id` | text | NO | — | ID do video YouTube |
| `duration_seconds` | integer | NO | — | Duracao em segundos |
| `sort_order` | integer | NO | 0 | Ordem |
| `materials` | jsonb | YES | — | Materiais complementares |
| `quiz` | jsonb | YES | — | Perguntas do quiz |
| `min_quiz_score` | integer | YES | 70 | Nota minima quiz (%) |
| `created_at` | timestamptz | YES | now() | |

**RLS:** SELECT para authenticated

---

### 35. learning_enrollments

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `course_id` | uuid | NO | — | FK -> learning_courses.id |
| `collaborator_id` | uuid | NO | — | FK -> collaborators.id |
| `status` | text | NO | 'enrolled' | Status (enrolled, in_progress, completed) |
| `progress_pct` | integer | NO | 0 | % progresso |
| `enrolled_at` | timestamptz | YES | now() | |
| `started_at` | timestamptz | YES | — | |
| `completed_at` | timestamptz | YES | — | |
| `deadline_at` | timestamptz | YES | — | |
| `certificate_url` | text | YES | — | URL do certificado |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

**Constraints:** UNIQUE(course_id, collaborator_id)  
**RLS:** SELECT/INSERT onde `collaborator_id = auth.uid()`

---

### 36. learning_lesson_completions

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `enrollment_id` | uuid | NO | — | FK -> learning_enrollments.id |
| `lesson_id` | uuid | NO | — | FK -> learning_lessons.id |
| `watched_pct` | integer | NO | 0 | % assistido |
| `quiz_score` | integer | YES | — | Nota do quiz |
| `quiz_passed` | boolean | YES | — | Passou no quiz |
| `completed_at` | timestamptz | YES | — | |
| `created_at` | timestamptz | YES | now() | |

**Constraints:** UNIQUE(enrollment_id, lesson_id)  
**RLS:** SELECT/INSERT via join com learning_enrollments

---

## Diagrama de Relacionamentos

```
profiles (auth.users)
  |
  +-- notifications (profile_id)
  +-- audit_logs (actor_id)
  +-- clients.assigned_to
  |     +-- client_documents (client_id)
  |     +-- client_guarantees (client_id)
  |     +-- client_status_history (client_id)
  |
  +-- collaborators (profile_id)
        +-- collaborator_clt_data (1:1)
        +-- collaborator_pj_data (1:1)
        +-- collaborator_dependents (1:N)
        +-- collaborator_documents (1:N)
        +-- collaborator_compensation (1:N)
        +-- medical_plan_entries (1:N)
        +-- reimbursements (1:N)
        +-- pj_invoices (1:N)
        +-- onboarding_tasks (1:N)
        +-- performance_reviews (1:N)
        +-- learning_enrollments (1:N)
              +-- learning_lesson_completions (1:N)

regions
  +-- teams (region_id)

segments
  +-- segment_document_templates (1:N)
  +-- cnae_segment_mapping (1:N)

credit_products
  +-- product_document_templates (1:N)

guarantee_types
  +-- guarantee_document_templates (1:N)

learning_courses
  +-- learning_modules (1:N)
        +-- learning_lessons (1:N)

performance_review_cycles
  +-- performance_reviews (1:N)

onboarding_templates
  +-- onboarding_tasks (1:N)
```

---

## Estatisticas

| Metrica | Valor |
|---------|-------|
| Total de tabelas | 36 |
| Total de colunas | ~310 |
| Tabelas com RLS | 36/36 (100%) |
| Policies ativas | 70+ |
| Foreign keys | 55+ |
| Unique constraints | 15+ |
