# Dicionario de Dados — Plataforma Sarfaty

**Versao:** 2.0  
**Data:** 20 de Fevereiro de 2026  
**Banco:** Supabase PostgreSQL 15+ (schema `public`)  
**Total de tabelas:** 72  

---

## Indice

| # | Modulo | Tabela | Descricao |
|---|--------|--------|-----------|
| 1 | Core | `profiles` | Usuarios do sistema (vinculado a auth.users) |
| 2 | Core | `regions` | Regioes comerciais |
| 3 | Core | `teams` | Times dentro de regioes |
| 4 | Core | `notifications` | Notificacoes in-app |
| 5 | Core | `audit_logs` | Trail de auditoria |
| 6 | Comercial | `clients` | Clientes PJ em pipeline de credito (enriquecida) |
| 7 | Comercial | `client_documents` | Documentos enviados por clientes |
| 8 | Comercial | `client_guarantees` | Garantias vinculadas a clientes |
| 9 | Comercial | `client_status_history` | Historico de mudancas de status do cliente |
| 10 | Comercial | `client_contacts` | Contatos do cliente |
| 11 | Comercial | `client_addresses` | Enderecos do cliente |
| 12 | Comercial | `client_bank_accounts` | Contas bancarias do cliente |
| 13 | Comercial | `client_authorized_persons` | Pessoas autorizadas a representar o cliente |
| 14 | Comercial | `sales_goals` | Metas comerciais (individual/equipe/regiao) |
| 15 | Credito | `segments` | Segmentos de mercado |
| 16 | Credito | `segment_document_templates` | Templates de documentos por segmento |
| 17 | Credito | `credit_products` | Produtos de credito |
| 18 | Credito | `product_document_templates` | Templates de documentos por produto |
| 19 | Credito | `guarantee_types` | Tipos de garantia |
| 20 | Credito | `guarantee_document_templates` | Templates de documentos por garantia |
| 21 | Credito | `cnae_segment_mapping` | Mapeamento CNAE para segmentos |
| 22 | Credito | `range_age` | Faixas etarias (dashboards) |
| 23 | Credito | `range_tenure` | Faixas de tempo de empresa (dashboards) |
| 24 | Sacados | `drawees` | Sacados (PJ e PF) |
| 25 | Sacados | `drawee_contacts` | Contatos do sacado |
| 26 | Sacados | `drawee_addresses` | Enderecos do sacado (com campos billing legados) |
| 27 | Sacados | `drawee_bank_accounts` | Contas bancarias do sacado |
| 28 | Sacados | `drawee_documents` | Documentos do sacado |
| 29 | Sacados | `drawee_groups` | Vinculo sacado-grupo economico |
| 30 | Sacados | `drawee_enabled_products` | Produtos habilitados por sacado |
| 31 | Grupos Economicos | `economic_groups` | Grupos economicos |
| 32 | Grupos Economicos | `economic_group_members` | Membros do grupo (FK clients) |
| 33 | Grupos Economicos | `economic_group_persons` | Pessoas fisicas do grupo |
| 34 | Grupos Economicos | `economic_group_bank_accounts` | Contas bancarias do grupo |
| 35 | Financeiro | `financial_accounts` | Contas financeiras de clientes |
| 36 | Financeiro | `financial_event_types` | Tipos de eventos financeiros (lookup) |
| 37 | Financeiro | `financial_transactions` | Transacoes financeiras |
| 38 | Financeiro | `financial_pendencies` | Pendencias financeiras |
| 39 | Financeiro | `financial_settlements` | Liquidacoes de pendencias |
| 40 | Portfolio | `portfolio_positions` | Posicoes de fundo (titulos) |
| 41 | Portfolio | `market_rates` | Taxas de mercado (CDI, SELIC, IPCA) |
| 42 | Debentures | `debenture_issuers` | Emissores de debentures |
| 43 | Debentures | `debenture_issuances` | Emissoes de debentures |
| 44 | Debentures | `debenture_series` | Series de uma emissao |
| 45 | Debentures | `debenture_subscriptions` | Subscricoes (FK clients como debentistas) |
| 46 | Debentures | `debenture_valuations` | Calculos diarios de rendimento |
| 47 | Debentures | `debenture_redemptions` | Resgates de debentures |
| 48 | Fornecedores | `suppliers` | Fornecedores (PJ e PF) |
| 49 | Fornecedores | `supplier_contacts` | Contatos do fornecedor |
| 50 | Fornecedores | `supplier_addresses` | Enderecos do fornecedor |
| 51 | Fornecedores | `supplier_bank_accounts` | Contas bancarias do fornecedor |
| 52 | Fornecedores | `supplier_documents` | Documentos do fornecedor |
| 53 | Integracoes | `vadu_company_results` | Resultado de consulta CNPJ (Vadu) |
| 54 | Integracoes | `vadu_person_results` | Resultado de consulta CPF (Vadu) |
| 55 | People | `collaborators` | Colaboradores (dados completos de RH) |
| 56 | People | `collaborator_clt_data` | Dados especificos CLT |
| 57 | People | `collaborator_pj_data` | Dados especificos PJ |
| 58 | People | `collaborator_dependents` | Dependentes de colaboradores |
| 59 | People | `collaborator_documents` | Documentos de colaboradores |
| 60 | People | `collaborator_compensation` | Historico de movimentacoes salariais |
| 61 | People | `medical_plan_entries` | Plano medico (titulares e dependentes) |
| 62 | People | `reimbursements` | Solicitacoes de reembolso |
| 63 | People | `pj_invoices` | Notas fiscais PJ (mensal) |
| 64 | People | `onboarding_templates` | Templates de tarefas de onboarding |
| 65 | People | `onboarding_tasks` | Tarefas de onboarding por colaborador |
| 66 | People | `performance_review_cycles` | Ciclos de avaliacao de desempenho |
| 67 | People | `performance_reviews` | Avaliacoes individuais |
| 68 | Learning | `learning_courses` | Cursos |
| 69 | Learning | `learning_modules` | Modulos dentro de cursos |
| 70 | Learning | `learning_lessons` | Aulas dentro de modulos |
| 71 | Learning | `learning_enrollments` | Matriculas de colaboradores em cursos |
| 72 | Learning | `learning_lesson_completions` | Progresso por aula |

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
| `cnpj_root` | text | YES | — | Raiz do CNPJ (primeiros 8 digitos) |
| `state_registration` | text | YES | — | Inscricao Estadual |
| `city_registration` | text | YES | — | Inscricao Municipal |
| `founded_at` | date | YES | — | Data de fundacao |
| `established_at` | date | YES | — | Data de constituicao |
| `closed_at` | timestamptz | YES | — | Data de encerramento |
| `closure_reason` | text | YES | — | Motivo do encerramento |
| `is_pep` | boolean | NO | false | Socio/representante e Pessoa Politicamente Exposta |
| `is_pep_related` | boolean | NO | false | Relacionado a PEP |
| `is_ofac_listed` | boolean | NO | false | Constante na lista OFAC |
| `has_risk_profession` | boolean | NO | false | Profissao de risco |
| `has_risk_activity` | boolean | NO | false | Atividade economica de risco |
| `has_risk_city` | boolean | NO | false | Municipio de risco |
| `risk_rating` | text | YES | — | Rating de risco atribuido |
| `revenue_situation` | text | YES | — | Situacao de faturamento |
| `economic_group_id` | uuid | YES | — | FK -> economic_groups.id |
| `legacy_sgs_id` | integer | YES | — | ID no sistema legado SGS |
| `legacy_nf_id` | integer | YES | — | ID no sistema legado NF |
| `registration_status` | text | NO | 'prospect' | Status de cadastro (prospect, active, inactive, blocked, closed) |
| `cnpj_status` | text | YES | — | Status da validacao CNPJ |
| `cnpj_validated_at` | timestamptz | YES | — | Quando CNPJ foi validado |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |
| `submitted_at` | timestamptz | YES | — | Quando foi submetido para analise |
| `approved_at` | timestamptz | YES | — | Quando foi aprovado |
| `homologated_at` | timestamptz | YES | — | Quando foi homologado |

**Constraints:** PK(id), UNIQUE(cnpj), FK(segment_id, credit_product_id, assigned_to, team_id, region_id, economic_group_id)  
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

## Modulo Comercial — Sub-resources de Clientes

### 37. client_contacts

Contatos vinculados a um cliente (comercial, financeiro, operacional, cobranca).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `contact_name` | text | YES | — | Nome do contato |
| `use_type` | text | YES | — | Tipo de uso (commercial, financial, operational, billing) |
| `email` | text | YES | — | Email principal |
| `email_secondary` | text | YES | — | Email secundario |
| `phone` | text | YES | — | Telefone fixo |
| `phone_mobile` | text | YES | — | Celular |
| `phone_sms` | text | YES | — | Telefone SMS |
| `whatsapp` | boolean | NO | false | Aceita WhatsApp |
| `homepage` | text | YES | — | Site |
| `notes` | text | YES | — | Observacoes |
| `is_primary` | boolean | NO | false | Contato principal |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(client_id)

---

### 38. client_addresses

Enderecos de um cliente por tipo de uso.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `use_type` | text | YES | — | Tipo (commercial, fiscal, correspondence, billing) |
| `street` | text | YES | — | Logradouro |
| `number` | text | YES | — | Numero |
| `without_number` | boolean | NO | false | Sem numero |
| `complement` | text | YES | — | Complemento |
| `neighborhood` | text | YES | — | Bairro |
| `zip_code` | text | YES | — | CEP |
| `city` | text | YES | — | Cidade |
| `state` | char(2) | YES | — | UF |
| `is_primary` | boolean | NO | false | Endereco principal |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(client_id)

---

### 39. client_bank_accounts

Contas bancarias de um cliente.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `bank_code` | text | YES | — | Codigo do banco |
| `bank_name` | text | YES | — | Nome do banco |
| `branch` | text | YES | — | Agencia |
| `account_number` | text | YES | — | Numero da conta |
| `account_type` | text | YES | — | Tipo (checking, savings, payment) |
| `pix_key` | text | YES | — | Chave PIX |
| `nickname` | text | YES | — | Apelido da conta |
| `opened_at` | date | YES | — | Data de abertura |
| `closed_at` | date | YES | — | Data de encerramento |
| `status` | text | NO | 'active' | Status (active, closed, blocked) |
| `is_primary` | boolean | NO | false | Conta principal |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(client_id)

---

### 40. client_authorized_persons

Pessoas autorizadas a representar o cliente (socios, procuradores, representantes legais).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `authorization_type` | text | YES | — | Tipo (partner, attorney, legal_representative, authorized) |
| `full_name` | text | NO | — | Nome completo |
| `cpf` | text | YES | — | CPF |
| `phone` | text | YES | — | Telefone |
| `email` | text | YES | — | Email |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(client_id)

---

### 41. sales_goals

Metas comerciais por periodo. Exatamente um de `profile_id`, `team_id` ou `region_id` deve estar preenchido.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `profile_id` | uuid | YES | — | FK -> profiles.id (meta individual) |
| `team_id` | uuid | YES | — | FK -> teams.id (meta de equipe) |
| `region_id` | uuid | YES | — | FK -> regions.id (meta regional) |
| `period_year` | integer | NO | — | Ano |
| `period_month` | integer | NO | — | Mes (1-12) |
| `goal_amount` | numeric(15,2) | NO | — | Valor meta |
| `goal_count` | integer | YES | — | Quantidade meta |
| `achieved_amount` | numeric(15,2) | NO | 0 | Valor realizado |
| `achieved_count` | integer | NO | 0 | Quantidade realizada |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** CHECK(exatamente um de profile_id/team_id/region_id nao nulo), FK(profile_id, team_id, region_id)

---

## Modulo Sacados

### 42. drawees

Sacados (devedores de duplicatas). Suporta Pessoa Juridica (`company`) e Pessoa Fisica (`individual`).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `person_type` | text | NO | 'company' | Tipo (company, individual) |
| `cpf` | text | YES | — | CPF (PF) |
| `cnpj` | text | YES | — | CNPJ (PJ, UNIQUE) |
| `cnpj_root` | text | YES | — | Raiz do CNPJ (primeiros 8 digitos) |
| `trade_name` | text | YES | — | Nome fantasia |
| `company_name` | text | NO | — | Razao social / nome |
| `legal_name` | text | YES | — | Nome legal |
| `rg` | text | YES | — | RG (PF) |
| `birth_date` | date | YES | — | Data de nascimento (PF) |
| `gender` | text | YES | — | Genero (PF) |
| `rg_document_id` | uuid | YES | — | FK -> drawee_documents (documento RG) |
| `cnh_document_id` | uuid | YES | — | FK -> drawee_documents (documento CNH) |
| `is_pep` | boolean | NO | false | Pessoa Politicamente Exposta |
| `is_ofac_listed` | boolean | NO | false | Constante na lista OFAC |
| `risk_rating` | text | YES | — | Rating de risco |
| `credit_score` | integer | YES | — | Score de credito |
| `assigned_to` | uuid | YES | — | FK -> profiles.id |
| `segment_id` | uuid | YES | — | FK -> segments.id |
| `economic_group_id` | uuid | YES | — | FK -> economic_groups.id |
| `status` | text | NO | 'active' | Status (active, inactive, blocked) |
| `blocked_at` | timestamptz | YES | — | Data de bloqueio |
| `block_reason` | text | YES | — | Motivo do bloqueio |
| `legacy_sgs_id` | integer | YES | — | ID no sistema legado SGS |
| `legacy_nf_id` | integer | YES | — | ID no sistema legado NF |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** UNIQUE(cnpj), FK(assigned_to, segment_id, economic_group_id)

---

### 43. drawee_contacts

Contatos do sacado. Possui campos extras em relacao a `client_contacts` para operacoes financeiras.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `drawee_id` | uuid | NO | — | FK -> drawees.id |
| `contact_name` | text | YES | — | Nome do contato |
| `use_type` | text | YES | — | Tipo (commercial, financial, operational, billing) |
| `email` | text | YES | — | Email principal |
| `email_secondary` | text | YES | — | Email secundario |
| `billing_email` | text | YES | — | Email de cobranca |
| `xml_email` | text | YES | — | Email para entrega de NF-e (XML) |
| `phone` | text | YES | — | Telefone fixo |
| `phone_mobile` | text | YES | — | Celular |
| `phone_sms` | text | YES | — | Telefone SMS |
| `billing_phone` | text | YES | — | Telefone de cobranca |
| `whatsapp` | boolean | NO | false | Aceita WhatsApp |
| `homepage` | text | YES | — | Site |
| `notes` | text | YES | — | Observacoes |
| `is_primary` | boolean | NO | false | Contato principal |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(drawee_id)

---

### 44. drawee_addresses

Enderecos do sacado. Possui campos `billing_*` legados do sistema SGS para endereco de cobranca separado.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `drawee_id` | uuid | NO | — | FK -> drawees.id |
| `use_type` | text | YES | — | Tipo (commercial, fiscal, correspondence, billing) |
| `street` | text | YES | — | Logradouro |
| `number` | text | YES | — | Numero |
| `without_number` | boolean | NO | false | Sem numero |
| `complement` | text | YES | — | Complemento |
| `neighborhood` | text | YES | — | Bairro |
| `zip_code` | text | YES | — | CEP |
| `city` | text | YES | — | Cidade |
| `state` | char(2) | YES | — | UF |
| `billing_street` | text | YES | — | Logradouro cobranca (legado) |
| `billing_number` | text | YES | — | Numero cobranca (legado) |
| `billing_complement` | text | YES | — | Complemento cobranca (legado) |
| `billing_neighborhood` | text | YES | — | Bairro cobranca (legado) |
| `billing_zip_code` | text | YES | — | CEP cobranca (legado) |
| `billing_city` | text | YES | — | Cidade cobranca (legado) |
| `billing_state` | char(2) | YES | — | UF cobranca (legado) |
| `is_primary` | boolean | NO | false | Endereco principal |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(drawee_id)

---

### 45. drawee_bank_accounts

Contas bancarias do sacado.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `drawee_id` | uuid | NO | — | FK -> drawees.id |
| `bank_code` | text | YES | — | Codigo do banco |
| `bank_name` | text | YES | — | Nome do banco |
| `branch` | text | YES | — | Agencia |
| `account_number` | text | YES | — | Numero da conta |
| `account_type` | text | YES | — | Tipo (checking, savings, payment) |
| `pix_key` | text | YES | — | Chave PIX |
| `nickname` | text | YES | — | Apelido |
| `opened_at` | date | YES | — | Data de abertura |
| `closed_at` | date | YES | — | Data de encerramento |
| `status` | text | NO | 'active' | Status (active, closed, blocked) |
| `is_primary` | boolean | NO | false | Conta principal |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(drawee_id)

---

### 46. drawee_documents

Documentos do sacado. Campo `extracted_data` reservado para OCR/IA futura.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `drawee_id` | uuid | NO | — | FK -> drawees.id |
| `document_type` | text | NO | — | Tipo do documento |
| `document_category` | text | NO | 'base' | Categoria |
| `document_label` | text | YES | — | Label amigavel |
| `storage_path` | text | NO | — | Path no Storage |
| `file_name` | text | NO | — | Nome original do arquivo |
| `file_size` | integer | YES | — | Tamanho em bytes |
| `mime_type` | text | YES | — | Tipo MIME |
| `validation_status` | text | YES | 'pending' | Status de validacao |
| `validation_result` | jsonb | YES | — | Resultado da validacao |
| `validated_at` | timestamptz | YES | — | Quando validado |
| `extracted_data` | jsonb | YES | — | Dados extraidos (futuro OCR/IA) |
| `uploaded_by` | uuid | NO | — | FK -> profiles.id |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(drawee_id, uploaded_by)

---

### 47. drawee_groups

Vincula sacados a grupos economicos.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `drawee_id` | uuid | NO | — | FK -> drawees.id |
| `economic_group_id` | uuid | NO | — | FK -> economic_groups.id |
| `joined_at` | date | YES | — | Data de entrada no grupo |
| `left_at` | date | YES | — | Data de saida do grupo |
| `is_headquarters` | boolean | NO | false | E a sede do grupo |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(drawee_id, economic_group_id)

---

### 48. drawee_enabled_products

Produtos de credito habilitados para um sacado.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `drawee_id` | uuid | NO | — | FK -> drawees.id |
| `credit_product_id` | uuid | NO | — | FK -> credit_products.id |
| `enabled_at` | date | YES | — | Data de habilitacao |
| `disabled_at` | date | YES | — | Data de desabilitacao |
| `disabled_reason` | text | YES | — | Motivo da desabilitacao |
| `is_active` | boolean | NO | true | Habilitado |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(drawee_id, credit_product_id)

---

## Modulo Grupos Economicos

### 49. economic_groups

Grupos economicos que agregam clientes e sacados relacionados.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `name` | text | NO | — | Nome do grupo |
| `type` | text | YES | — | Tipo do grupo |
| `active_since` | date | YES | — | Data de inicio das atividades |
| `inactive_since` | date | YES | — | Data de inatividade |
| `status` | text | NO | 'active' | Status |
| `legacy_sgs_id` | integer | YES | — | ID no sistema legado SGS |
| `legacy_nf_id` | integer | YES | — | ID no sistema legado NF |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

---

### 50. economic_group_members

Membros (clientes) de um grupo economico.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `economic_group_id` | uuid | NO | — | FK -> economic_groups.id |
| `member_type` | text | NO | — | Tipo de membro |
| `client_id` | uuid | YES | — | FK -> clients.id |
| `joined_at` | date | YES | — | Data de entrada |
| `left_at` | date | YES | — | Data de saida |
| `is_headquarters` | boolean | NO | false | E a sede do grupo |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(economic_group_id, client_id)

---

### 51. economic_group_persons

Pessoas fisicas vinculadas ao grupo economico (socios, representantes).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `economic_group_id` | uuid | NO | — | FK -> economic_groups.id |
| `relationship_type` | text | YES | — | Tipo de vinculo |
| `full_name` | text | NO | — | Nome completo |
| `cpf_cnpj` | text | YES | — | CPF ou CNPJ |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(economic_group_id)

---

### 52. economic_group_bank_accounts

Contas bancarias do grupo economico.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `economic_group_id` | uuid | NO | — | FK -> economic_groups.id |
| `bank_code` | text | YES | — | Codigo do banco |
| `bank_name` | text | YES | — | Nome do banco |
| `branch` | text | YES | — | Agencia |
| `account_number` | text | YES | — | Numero da conta |
| `account_type` | text | YES | — | Tipo |
| `pix_key` | text | YES | — | Chave PIX |
| `nickname` | text | YES | — | Apelido |
| `opened_at` | date | YES | — | Data de abertura |
| `closed_at` | date | YES | — | Data de encerramento |
| `status` | text | NO | 'active' | Status |
| `is_primary` | boolean | NO | false | Conta principal |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(economic_group_id)

---

## Modulo Financeiro

### 53. financial_accounts

Contas financeiras de clientes no sistema legado (SGS/NF). Usadas para rastrear saldos e movimentos.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `account_type` | text | NO | — | Tipo de conta |
| `bank_code` | text | YES | — | Codigo do banco |
| `branch` | text | YES | — | Agencia |
| `account_number` | text | YES | — | Numero da conta |
| `status` | text | NO | 'active' | Status (active, blocked, closed) |
| `block_type` | text | YES | — | Tipo de bloqueio |
| `block_reason` | text | YES | — | Motivo do bloqueio |
| `fees` | numeric(18,4) | YES | — | Tarifas |
| `opened_at` | date | YES | — | Data de abertura |
| `closed_at` | date | YES | — | Data de encerramento |
| `legacy_nf_id` | integer | YES | — | ID no sistema legado NF |
| `legacy_sgs_id` | integer | YES | — | ID no sistema legado SGS |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(client_id)

---

### 54. financial_event_types

Lookup de tipos de eventos financeiros (debitos, creditos, taxas).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `legacy_nf_code` | integer | YES | — | Codigo no sistema NF |
| `legacy_sgs_code` | integer | YES | — | Codigo no sistema SGS |
| `name` | text | NO | — | Nome do tipo de evento |
| `entry_type` | char(1) | NO | — | D (Debito) ou C (Credito) |
| `description` | text | YES | — | Descricao |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |

---

### 55. financial_transactions

Transacoes financeiras em contas de clientes.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `financial_account_id` | uuid | NO | — | FK -> financial_accounts.id |
| `event_type_id` | uuid | YES | — | FK -> financial_event_types.id |
| `amount` | numeric(18,4) | NO | — | Valor |
| `entry_type` | char(1) | NO | — | D (Debito) ou C (Credito) |
| `description` | text | YES | — | Descricao |
| `transaction_date` | date | NO | — | Data da transacao |
| `reference_nf_code` | integer | YES | — | Referencia sistema NF |
| `reference_sgs_code` | integer | YES | — | Referencia sistema SGS |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(financial_account_id, event_type_id)

---

### 56. financial_pendencies

Pendencias financeiras (titulos a receber/pagar).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `financial_account_id` | uuid | NO | — | FK -> financial_accounts.id |
| `event_type_id` | uuid | YES | — | FK -> financial_event_types.id |
| `drawee_id` | uuid | YES | — | FK -> drawees.id (sacado da pendencia) |
| `original_amount` | numeric(18,4) | NO | — | Valor original |
| `corrected_amount` | numeric(18,4) | YES | — | Valor corrigido |
| `settled_amount` | numeric(18,4) | YES | — | Valor liquidado |
| `pending_date` | date | NO | — | Data da pendencia |
| `settlement_date` | date | YES | — | Data de liquidacao |
| `is_reversal` | boolean | NO | false | E uma reversao |
| `notes` | text | YES | — | Observacoes |
| `legacy_nf_code` | integer | YES | — | Codigo legado NF |
| `legacy_sgs_code` | integer | YES | — | Codigo legado SGS |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(financial_account_id, event_type_id, drawee_id)

---

### 57. financial_settlements

Liquidacoes de pendencias financeiras (N:N entre transacoes e pendencias).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `transaction_id` | uuid | NO | — | FK -> financial_transactions.id |
| `pendency_id` | uuid | NO | — | FK -> financial_pendencies.id |
| `settled_amount` | numeric(18,4) | NO | — | Valor liquidado |
| `settlement_date` | date | NO | — | Data da liquidacao |
| `notes` | text | YES | — | Observacoes |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(transaction_id, pendency_id)

---

## Modulo Portfolio

### 58. portfolio_positions

Posicoes de fundo (titulos em carteira). Importado de arquivos de gestoras.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `fund_name` | text | NO | — | Nome do fundo |
| `fund_cnpj` | text | YES | — | CNPJ do fundo |
| `position_date` | date | NO | — | Data da posicao |
| `client_id` | uuid | YES | — | FK -> clients.id (cedente, se identificado) |
| `drawee_id` | uuid | YES | — | FK -> drawees.id (sacado, se identificado) |
| `cedent_doc` | text | YES | — | CNPJ/CPF do cedente |
| `drawee_doc` | text | YES | — | CNPJ/CPF do sacado |
| `cedent_name` | text | YES | — | Nome do cedente |
| `drawee_name` | text | YES | — | Nome do sacado |
| `asset_type` | text | YES | — | Tipo de ativo |
| `asset_subtype` | text | YES | — | Subtipo do ativo |
| `document_number` | text | YES | — | Numero do titulo/duplicata |
| `title_id_external` | text | YES | — | ID externo do titulo |
| `emission_date` | date | YES | — | Data de emissao |
| `acquisition_date` | date | YES | — | Data de aquisicao |
| `original_maturity` | date | YES | — | Vencimento original |
| `adjusted_maturity` | date | YES | — | Vencimento ajustado |
| `extension_date` | date | YES | — | Data de prorrogacao |
| `nominal_value` | numeric(18,4) | NO | — | Valor nominal |
| `acquisition_value` | numeric(18,4) | YES | — | Valor de aquisicao |
| `current_nominal` | numeric(18,4) | YES | — | Nominal atual |
| `present_value` | numeric(18,4) | YES | — | Valor presente |
| `mtm_value` | numeric(18,4) | YES | — | Valor mark-to-market |
| `pdd_note` | text | YES | — | Nota PDD |
| `pdd_rating_value` | numeric(18,4) | YES | — | Valor PDD por rating |
| `pdd_overdue_value` | numeric(18,4) | YES | — | Valor PDD por atraso |
| `status` | text | YES | — | Status do titulo |
| `has_coobligation` | boolean | NO | false | Possui co-obrigacao |
| `originador_doc` | text | YES | — | CNPJ/CPF do originador |
| `cnae` | text | YES | — | CNAE do sacado |
| `source_file` | text | YES | — | Arquivo de origem da importacao |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(client_id, drawee_id)

---

### 59. market_rates

Taxas de mercado diarias (CDI, SELIC, IPCA, IGPM, etc.).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `rate_type` | text | NO | — | Tipo (CDI, SELIC, IPCA, IGPM, TR, etc.) |
| `rate_date` | date | NO | — | Data da taxa |
| `value` | numeric(18,6) | NO | — | Valor da taxa |
| `source` | text | NO | 'B3' | Fonte (B3, IBGE, BCB) |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** UNIQUE(rate_type, rate_date)

---

## Modulo Debentures

### 60. debenture_issuers

Emissores de debentures (empresas que captam via este instrumento).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `cnpj` | text | NO | — | CNPJ (UNIQUE) |
| `legal_name` | text | NO | — | Razao social |
| `address_street` | text | YES | — | Logradouro |
| `address_number` | text | YES | — | Numero |
| `address_complement` | text | YES | — | Complemento |
| `address_neighborhood` | text | YES | — | Bairro |
| `address_city` | text | YES | — | Cidade |
| `address_state` | text | YES | — | UF |
| `address_zip` | text | YES | — | CEP |
| `bank_code` | text | YES | — | Banco para pagamento |
| `bank_branch` | text | YES | — | Agencia |
| `bank_account` | text | YES | — | Conta |
| `status` | text | NO | 'active' | Status |
| `legacy_sgs_id` | integer | YES | — | ID legado SGS |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** UNIQUE(cnpj)

---

### 61. debenture_issuances

Emissoes de debentures (uma emissora pode ter N emissoes).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `issuer_id` | uuid | NO | — | FK -> debenture_issuers.id |
| `issuance_number` | integer | NO | — | Numero da emissao |
| `name` | text | NO | — | Nome da emissao |
| `yield_type` | text | NO | — | Tipo de rendimento (CDI+, IPCA+, pre-fixado) |
| `issuance_type` | text | NO | 'private' | Tipo (public, private) |
| `species` | text | NO | 'subordinated' | Especie |
| `issuance_form` | text | YES | — | Forma de emissao |
| `issuance_date` | date | NO | — | Data de emissao |
| `maturity_date` | date | NO | — | Data de vencimento |
| `integration_deadline` | date | YES | — | Prazo de integralizacao |
| `series_count` | integer | YES | — | Quantidade de series |
| `total_quantity` | integer | NO | — | Quantidade total de debentures |
| `total_value` | numeric(15,2) | NO | — | Valor total da emissao |
| `unit_price` | numeric(15,2) | NO | — | Preco unitario |
| `penalty_rate` | numeric(5,2) | YES | — | Taxa de multa |
| `mora_rate` | numeric(5,2) | YES | — | Taxa de mora |
| `balance` | numeric(15,2) | YES | — | Saldo em aberto |
| `status` | text | NO | 'open' | Status (open, closed, cancelled) |
| `prospectus_file_path` | text | YES | — | Path do prospecto no Storage |
| `age_document_path` | text | YES | — | Path do AGE no Storage |
| `legacy_sgs_id` | integer | YES | — | ID legado SGS |
| `legacy_nf_id` | integer | YES | — | ID legado NF |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(issuer_id)

---

### 62. debenture_series

Series de uma emissao de debentures.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `issuance_id` | uuid | NO | — | FK -> debenture_issuances.id |
| `series_number` | integer | NO | — | Numero da serie |
| `index_type` | text | NO | — | Indexador (CDI, IPCA, pre) |
| `index_percentage` | numeric(15,4) | YES | — | Percentual do indexador |
| `issuance_rate` | numeric(15,4) | YES | — | Taxa de emissao |
| `std_deviation` | numeric(15,4) | YES | — | Desvio padrao |
| `quantity` | integer | NO | — | Quantidade inicial |
| `balance_quantity` | integer | NO | — | Quantidade em saldo |
| `maturity_date` | date | NO | — | Vencimento da serie |
| `target_audience` | text | YES | — | Publico-alvo |
| `allow_web_redemption` | boolean | NO | false | Permite resgate pelo portal |
| `publish_on_portal` | boolean | NO | false | Publicado no portal do cliente |
| `status` | text | NO | 'open' | Status |
| `legacy_sgs_id` | integer | YES | — | ID legado SGS |
| `legacy_nf_id` | integer | YES | — | ID legado NF |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(issuance_id)

---

### 63. debenture_subscriptions

Subscricoes de clientes em series de debentures.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `series_id` | uuid | NO | — | FK -> debenture_series.id |
| `debenturist_id` | uuid | NO | — | FK -> clients.id (debentista) |
| `subscription_date` | date | NO | — | Data de subscricao |
| `unit_price_at_sub` | numeric(16,7) | NO | — | PU na data de subscricao |
| `quantity` | integer | NO | — | Quantidade subscrita |
| `total_value` | numeric(15,2) | NO | — | Valor total subscrito |
| `redeemed_quantity` | integer | NO | 0 | Quantidade ja resgatada |
| `balance_quantity` | integer | NO | — | Saldo em debentures |
| `status` | text | NO | 'active' | Status (active, redeemed, cancelled) |
| `legacy_sgs_id` | integer | YES | — | ID legado SGS |
| `legacy_nf_id` | integer | YES | — | ID legado NF |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(series_id, debenturist_id)

---

### 64. debenture_valuations

Calculos diarios de rendimento de subscricoes.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `subscription_id` | uuid | NO | — | FK -> debenture_subscriptions.id |
| `valuation_date` | date | NO | — | Data do calculo |
| `subscription_date` | date | NO | — | Data de referencia da subscricao |
| `index_type` | text | YES | — | Indexador |
| `issuance_rate` | numeric(15,4) | YES | — | Taxa de emissao |
| `capitalized_rate` | numeric(15,4) | YES | — | Taxa capitalizada |
| `index_daily_factor` | numeric(18,16) | YES | — | Fator diario do indexador |
| `prev_day_gross_value` | numeric(15,2) | YES | — | Bruto do dia anterior |
| `daily_yield` | numeric(15,4) | YES | — | Rendimento diario |
| `monthly_yield` | numeric(15,4) | YES | — | Rendimento mensal |
| `cumulative_yield` | numeric(15,4) | YES | — | Rendimento acumulado |
| `current_quantity` | integer | YES | — | Quantidade atual |
| `current_unit_price` | numeric(15,2) | YES | — | PU atual |
| `current_value` | numeric(15,2) | YES | — | Valor atual |
| `gross_value` | numeric(15,2) | YES | — | Valor bruto |
| `iof_rate` | numeric(5,2) | YES | — | Aliquota IOF |
| `calculated_iof` | numeric(15,2) | YES | — | IOF calculado |
| `ir_rate` | numeric(5,2) | YES | — | Aliquota IR |
| `calculated_ir` | numeric(15,2) | YES | — | IR calculado |
| `net_yield` | numeric(15,2) | YES | — | Rendimento liquido |
| `net_value` | numeric(15,2) | YES | — | Valor liquido |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(subscription_id)

---

### 65. debenture_redemptions

Resgates (parciais ou totais) de subscricoes.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `subscription_id` | uuid | NO | — | FK -> debenture_subscriptions.id |
| `requested_at` | timestamptz | NO | — | Data/hora do pedido |
| `processed_at` | timestamptz | YES | — | Data/hora de processamento |
| `settled_at` | timestamptz | YES | — | Data/hora de liquidacao |
| `quantity` | integer | NO | — | Quantidade resgatada |
| `unit_price_at_sub` | numeric(15,2) | YES | — | PU na data de subscricao |
| `unit_price_at_red` | numeric(15,2) | YES | — | PU na data de resgate |
| `invested_value` | numeric(15,2) | YES | — | Valor investido |
| `gross_redemption` | numeric(15,2) | YES | — | Resgate bruto |
| `gross_yield` | numeric(15,2) | YES | — | Rendimento bruto |
| `ir_withheld` | numeric(15,2) | YES | — | IR retido |
| `iof_withheld` | numeric(15,2) | YES | — | IOF retido |
| `net_redemption` | numeric(15,2) | YES | — | Resgate liquido |
| `net_yield` | numeric(15,2) | YES | — | Rendimento liquido |
| `ir_rate` | numeric(5,2) | YES | — | Aliquota IR |
| `iof_rate` | numeric(5,2) | YES | — | Aliquota IOF |
| `elapsed_days` | integer | YES | — | Dias decorridos |
| `iof_days` | integer | YES | — | Dias para calculo IOF |
| `yield_rate` | numeric(7,4) | YES | — | Taxa de rendimento |
| `status` | integer | NO | 0 | Status (0=pendente, 1=processado, 2=liquidado) |
| `legacy_sgs_id` | integer | YES | — | ID legado SGS |
| `legacy_nf_id` | integer | YES | — | ID legado NF |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(subscription_id)

---

## Modulo Fornecedores

### 66. suppliers

Fornecedores de servicos da Sarfaty (PJ ou PF).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `person_type` | text | NO | 'company' | Tipo (company, individual) |
| `cpf` | text | YES | — | CPF (PF) |
| `cnpj` | text | YES | — | CNPJ (PJ, UNIQUE) |
| `trade_name` | text | YES | — | Nome fantasia |
| `company_name` | text | NO | — | Razao social / nome |
| `service_category` | text | YES | — | Categoria de servico |
| `rg_document_id` | uuid | YES | — | FK -> supplier_documents |
| `cnh_document_id` | uuid | YES | — | FK -> supplier_documents |
| `onboarded_at` | date | YES | — | Data de cadastro ativo |
| `offboarded_at` | date | YES | — | Data de desligamento |
| `offboarding_reason` | text | YES | — | Motivo do desligamento |
| `status` | text | NO | 'active' | Status |
| `legacy_sgs_id` | integer | YES | — | ID legado SGS |
| `legacy_nf_id` | integer | YES | — | ID legado NF |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** UNIQUE(cnpj)

---

### 67. supplier_contacts

Contatos do fornecedor.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `supplier_id` | uuid | NO | — | FK -> suppliers.id |
| `contact_name` | text | YES | — | Nome do contato |
| `use_type` | text | YES | — | Tipo de uso |
| `email` | text | YES | — | Email |
| `email_secondary` | text | YES | — | Email secundario |
| `phone` | text | YES | — | Telefone |
| `phone_mobile` | text | YES | — | Celular |
| `phone_sms` | text | YES | — | SMS |
| `whatsapp` | boolean | NO | false | Aceita WhatsApp |
| `homepage` | text | YES | — | Site |
| `notes` | text | YES | — | Observacoes |
| `is_primary` | boolean | NO | false | Contato principal |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(supplier_id)

---

### 68. supplier_addresses

Enderecos do fornecedor.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `supplier_id` | uuid | NO | — | FK -> suppliers.id |
| `use_type` | text | YES | — | Tipo (commercial, fiscal, correspondence, billing) |
| `street` | text | YES | — | Logradouro |
| `number` | text | YES | — | Numero |
| `without_number` | boolean | NO | false | Sem numero |
| `complement` | text | YES | — | Complemento |
| `neighborhood` | text | YES | — | Bairro |
| `zip_code` | text | YES | — | CEP |
| `city` | text | YES | — | Cidade |
| `state` | char(2) | YES | — | UF |
| `is_primary` | boolean | NO | false | Endereco principal |
| `is_active` | boolean | NO | true | Ativo |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(supplier_id)

---

### 69. supplier_bank_accounts

Contas bancarias do fornecedor.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `supplier_id` | uuid | NO | — | FK -> suppliers.id |
| `bank_code` | text | YES | — | Codigo do banco |
| `bank_name` | text | YES | — | Nome do banco |
| `branch` | text | YES | — | Agencia |
| `account_number` | text | YES | — | Numero da conta |
| `account_type` | text | YES | — | Tipo |
| `pix_key` | text | YES | — | Chave PIX |
| `nickname` | text | YES | — | Apelido |
| `opened_at` | date | YES | — | Data de abertura |
| `closed_at` | date | YES | — | Data de encerramento |
| `status` | text | NO | 'active' | Status |
| `is_primary` | boolean | NO | false | Conta principal |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** FK(supplier_id)

---

### 70. supplier_documents

Documentos do fornecedor.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `supplier_id` | uuid | NO | — | FK -> suppliers.id |
| `document_type` | text | NO | — | Tipo do documento |
| `document_category` | text | NO | 'base' | Categoria |
| `document_label` | text | YES | — | Label amigavel |
| `storage_path` | text | NO | — | Path no Storage |
| `file_name` | text | NO | — | Nome original |
| `file_size` | integer | YES | — | Tamanho em bytes |
| `mime_type` | text | YES | — | Tipo MIME |
| `validation_status` | text | YES | 'pending' | Status de validacao |
| `validation_result` | jsonb | YES | — | Resultado |
| `validated_at` | timestamptz | YES | — | Quando validado |
| `extracted_data` | jsonb | YES | — | Dados extraidos |
| `uploaded_by` | uuid | NO | — | FK -> profiles.id |
| `created_at` | timestamptz | NO | now() | |

**Constraints:** FK(supplier_id, uploaded_by)

---

## Modulo Integracoes

### 71. vadu_company_results

Resultados de consultas de CNPJ via Vadu (bureau de credito).

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `cnpj` | text | YES | — | CNPJ consultado |
| `company_name` | text | YES | — | Razao social retornada |
| `trade_name` | text | YES | — | Nome fantasia retornado |
| `revenue_status` | text | YES | — | Situacao de faturamento |
| `revenue_status_date` | timestamptz | YES | — | Data da situacao |
| `special_status` | text | YES | — | Status especial (se houver) |
| `capital_social` | numeric(15,2) | YES | — | Capital social |
| `legal_nature` | text | YES | — | Natureza juridica |
| `is_simples_nacional` | boolean | YES | — | Optante Simples Nacional |
| `company_size` | text | YES | — | Porte da empresa |
| `environmental_score` | numeric(10,2) | YES | — | Score ambiental |
| `environmental_level` | text | YES | — | Nivel ambiental |
| `raw_data` | jsonb | YES | — | Resposta bruta da API |
| `queried_at` | timestamptz | NO | now() | Data/hora da consulta |

**Constraints:** FK(client_id)

---

### 72. vadu_person_results

Resultados de consultas de CPF via Vadu.

| Coluna | Tipo | Null | Default | Descricao |
|--------|------|------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `client_id` | uuid | NO | — | FK -> clients.id |
| `authorized_person_id` | uuid | YES | — | FK -> client_authorized_persons.id (se consulta de socio) |
| `cpf` | text | YES | — | CPF consultado |
| `name` | text | YES | — | Nome retornado |
| `birth_date` | timestamptz | YES | — | Data de nascimento |
| `mother_name` | text | YES | — | Nome da mae |
| `raw_data` | jsonb | YES | — | Resposta bruta da API |
| `queried_at` | timestamptz | NO | now() | Data/hora da consulta |

**Constraints:** FK(client_id, authorized_person_id)

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
  |     +-- client_contacts (client_id)
  |     +-- client_addresses (client_id)
  |     +-- client_bank_accounts (client_id)
  |     +-- client_authorized_persons (client_id)
  |           +-- vadu_person_results (authorized_person_id)
  |     +-- vadu_company_results (client_id)
  |     +-- financial_accounts (client_id)
  |           +-- financial_transactions (financial_account_id)
  |           +-- financial_pendencies (financial_account_id)
  |                 +-- financial_settlements (pendency_id)
  |     +-- debenture_subscriptions.debenturist_id
  |     +-- portfolio_positions (client_id)
  |     +-- economic_group_members (client_id)
  |
  +-- drawees (assigned_to)
  |     +-- drawee_contacts (drawee_id)
  |     +-- drawee_addresses (drawee_id)
  |     +-- drawee_bank_accounts (drawee_id)
  |     +-- drawee_documents (drawee_id)
  |     +-- drawee_groups (drawee_id)
  |     +-- drawee_enabled_products (drawee_id)
  |     +-- financial_pendencies (drawee_id)
  |     +-- portfolio_positions (drawee_id)
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
  +-- sales_goals (region_id)

teams
  +-- sales_goals (team_id)

profiles
  +-- sales_goals (profile_id)

segments
  +-- segment_document_templates (1:N)
  +-- cnae_segment_mapping (1:N)

credit_products
  +-- product_document_templates (1:N)
  +-- drawee_enabled_products (credit_product_id)

guarantee_types
  +-- guarantee_document_templates (1:N)

economic_groups
  +-- economic_group_members (1:N)
  +-- economic_group_persons (1:N)
  +-- economic_group_bank_accounts (1:N)
  +-- drawee_groups (economic_group_id)

debenture_issuers
  +-- debenture_issuances (issuer_id)
        +-- debenture_series (issuance_id)
              +-- debenture_subscriptions (series_id)
                    +-- debenture_valuations (subscription_id)
                    +-- debenture_redemptions (subscription_id)

suppliers
  +-- supplier_contacts (supplier_id)
  +-- supplier_addresses (supplier_id)
  +-- supplier_bank_accounts (supplier_id)
  +-- supplier_documents (supplier_id)

learning_courses
  +-- learning_modules (1:N)
        +-- learning_lessons (1:N)

performance_review_cycles
  +-- performance_reviews (1:N)

onboarding_templates
  +-- onboarding_tasks (1:N)

market_rates (independente — lookup de taxas por data)
```

---

## Estatisticas

| Metrica | Valor |
|---------|-------|
| Total de tabelas | 72 |
| Total de colunas | ~760 |
| Tabelas com RLS | 72/72 (100%) |
| Policies ativas | 70+ (People + Comercial); restantes pendentes |
| Foreign keys | 120+ |
| Unique constraints | 25+ |
