# Especificação Técnica — Módulo People (RH + DP)

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Status:** Draft  
**Plataforma:** Sarfaty (módulo integrado)  

---

## 1. Visão Geral

Módulo de gestão de pessoas integrado à plataforma Sarfaty. Cobre o ciclo completo do colaborador: admissão, onboarding, gestão do dia a dia (reembolsos, NFs, benefícios), avaliação de desempenho, movimentações e desligamento. Atende 134 colaboradores (77% PJ, 23% CLT).

**Princípio de design:** Mesma plataforma, mesmo login. O módulo People aparece na sidebar de todos os colaboradores (seção "Meu Espaço") e ganha seções adicionais para gestores, RH e DP conforme o papel do usuário.

**Stack:** Mesmo da plataforma — Supabase (PostgreSQL + Auth + Storage + RLS), Next.js, NestJS, TypeScript.

### 1.1 Criação de Usuários e Acesso à Plataforma

**Não existe signup público.** Todo acesso é criado por admin ou RH. O signup do Supabase Auth é desabilitado.

**Fluxo de admissão com acesso:**

```
1. RH cadastra o colaborador no sistema (tabela collaborators)
   → Preenche dados pessoais, cargo, departamento, tipo (CLT/PJ)
2. Na mesma operação, marca "criar acesso à plataforma"
3. Backend NestJS chama supabase.auth.admin.createUser()
   → Usa o email corporativo do colaborador
   → Passa full_name e role via raw_user_meta_data
4. Trigger on_auth_user_created cria o profile automaticamente
5. Backend vincula profile_id ao registro do collaborator
6. Colaborador recebe email com convite para definir senha
7. Tarefas de onboarding são criadas automaticamente (onboarding_tasks)
```

**Quem pode criar usuários:**

| Role | Pode criar | Via |
|------|-----------|-----|
| `admin` | Qualquer tipo de usuário | `POST /api/users` |
| `hr` / `hr_admin` | Colaboradores + usuários internos | `POST /api/users` |

**Cadeia de dados:**

```
auth.users → profiles (via trigger automático) → collaborators (vínculo pelo backend)
```

> **Nota:** Nem todo profile tem um collaborator. Usuários externos (auditores, consultores) podem ter acesso à plataforma sem ser colaboradores. O vínculo `profile_id` em `collaborators` é nullable e controlado pelo backend.

---

## 2. Roles do Módulo People

Estes roles são **adicionais** aos roles do módulo de crédito. Um usuário pode ter roles de ambos os módulos (ex: `sales_rep` + `employee`).

| Role | Código | Quem é | O que vê |
|------|--------|--------|----------|
| Colaborador | `employee` | Todo mundo na empresa | Seu próprio perfil, reembolsos, NFs, benefícios, avaliações |
| Gestor | `people_manager` | Heads, coordenadores, diretores | Tudo do employee + time dele (perfil resumido, avaliações, aprovações) |
| RH (Business Partner) | `hr` | Equipe de RH estratégico | Tudo + cadastro completo, remuneração, avaliações de todos, relatórios |
| DP (Departamento Pessoal) | `dp` | Equipe de DP operacional | Tudo + remuneração, folha, benefícios, onboarding/offboarding, NFs, reembolsos |
| Admin RH | `hr_admin` | Responsável máximo de RH | Tudo de RH + DP + configurações |

### Regra de visibilidade

| Dado | Employee | Gestor | RH | DP |
|------|----------|--------|-----|-----|
| Dados pessoais (próprios) | ✅ Ver + Editar | — | ✅ Ver + Editar | ✅ Ver + Editar |
| Dados pessoais (do time) | ❌ | ✅ Ver (resumido) | ✅ Ver + Editar | ✅ Ver + Editar |
| Documentos (próprios) | ✅ Ver + Editar | — | ✅ Ver | ✅ Ver |
| Dados bancários (próprios) | ✅ Ver + Editar | — | ❌ | ✅ Ver |
| Dependentes (próprios) | ✅ Ver + Editar | — | ✅ Ver | ✅ Ver |
| Remuneração (própria) | ❌ | ❌ | ✅ Ver + Editar | ✅ Ver + Editar |
| Remuneração (do time) | ❌ | ❌ | ✅ Ver + Editar | ✅ Ver + Editar |
| Estrutura organizacional | ✅ Ver (organograma) | ✅ Ver | ✅ Ver + Editar | ✅ Ver |
| Avaliação de desempenho (própria) | ✅ Ver | ✅ Ver + Avaliar | ✅ Ver + Editar | ❌ |
| Avaliação de desempenho (do time) | ❌ | ✅ Ver + Avaliar | ✅ Ver + Editar | ❌ |
| Reembolsos (próprios) | ✅ Criar + Ver | ✅ Aprovar | ❌ | ✅ Ver + Pagar |
| Notas Fiscais PJ (próprias) | ✅ Enviar + Ver | — | ❌ | ✅ Ver + Aprovar + Pagar |
| Benefícios (próprios) | ✅ Ver | — | ✅ Configurar | ✅ Gerir |
| Onboarding/Offboarding | ❌ | ✅ Ver (do time) | ✅ Orquestrar | ✅ Orquestrar |

---

## 3. Modelagem de Dados

### 3.1 Tabela: `collaborators`

Cadastro principal do colaborador — campos comuns a CLT e PJ.

```sql
CREATE TABLE collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vínculo com auth
  profile_id UUID UNIQUE REFERENCES profiles(id),  -- se tiver login na plataforma
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,          -- A (ativo) ou I (inativo)
  registration_number TEXT UNIQUE,                   -- Matrícula contábil
  badge_number TEXT,                                 -- Nº do crachá
  
  -- Tipo de vínculo
  employment_type TEXT NOT NULL CHECK (employment_type IN ('clt', 'pj')),
  is_internal BOOLEAN DEFAULT true,                  -- I (interno) ou E (externo)
  
  -- Identificação pessoal
  full_name TEXT NOT NULL,
  social_name TEXT,                                  -- nome social (se diferente)
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  nationality TEXT DEFAULT 'Brasileira',
  
  -- Documentos pessoais
  cpf TEXT UNIQUE,
  rg TEXT,
  rg_issuer TEXT,                                    -- órgão emissor
  voter_registration TEXT,                           -- título de eleitor
  voter_zone TEXT,
  voter_section TEXT,
  military_cert TEXT,                                -- certificado reservista
  
  -- Endereço
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  
  -- Contato
  phone TEXT,
  personal_email TEXT,
  corporate_email TEXT,
  extension TEXT,                                     -- ramal
  
  -- Estrutura organizacional
  company TEXT DEFAULT 'Sarfaty',                     -- empresa (grupo pode ter mais de uma)
  directorate TEXT,                                   -- diretoria
  department TEXT,                                    -- departamento
  branch TEXT,                                        -- filial
  manager_id UUID REFERENCES collaborators(id),       -- gestor direto
  job_title TEXT,                                      -- cargo atual (renomeado: current_role é palavra reservada do PostgreSQL)
  role_code TEXT,                                     -- código do cargo
  role_level TEXT,                                    -- nível (Jr, Pl, Sr, Coord, Head, Dir)
  
  -- Datas importantes
  start_date_original DATE,                           -- "Início - antigos" (primeira entrada)
  start_date_current DATE,                            -- "Início Atual" (se readmitido)
  registration_date DATE,                             -- data de cadastro no sistema
  termination_date DATE,                              -- data de rescisão
  termination_reason TEXT,                            -- motivo da rescisão
  termination_year INTEGER,                           -- ano de rescisão (derivável, mas útil pra filtros)
  
  -- Benefícios
  has_medical_assistance BOOLEAN DEFAULT true,        -- assistência médica (todos têm)
  medical_plan_notes TEXT,                            -- observações sobre plano
  plr_eligible BOOLEAN DEFAULT false,                 -- PLR
  thirteenth_pj BOOLEAN DEFAULT false,                -- 13º PJ
  guaranteed_bonus NUMERIC(15,2),                     -- valor garantido
  commission_pct NUMERIC(5,2),                        -- % comissão
  
  -- Dados bancários (pagamento)
  bank_name TEXT,
  bank_branch TEXT,                                   -- agência
  bank_account TEXT,                                  -- conta corrente
  bank_account_type TEXT CHECK (bank_account_type IN ('pf', 'pj')),  -- conta PF ou PJ
  
  -- Observações
  notes TEXT,
  
  -- Nota: years_at_company e age_years foram movidos para a view
  -- collaborators_with_computed (CURRENT_DATE não é imutável no PostgreSQL,
  -- impossibilitando uso de GENERATED ALWAYS AS STORED)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_collab_active ON collaborators(is_active);
CREATE INDEX idx_collab_type ON collaborators(employment_type);
CREATE INDEX idx_collab_manager ON collaborators(manager_id);
CREATE INDEX idx_collab_department ON collaborators(department);
CREATE INDEX idx_collab_directorate ON collaborators(directorate);
CREATE INDEX idx_collab_cpf ON collaborators(cpf);
CREATE INDEX idx_collab_profile ON collaborators(profile_id);

-- View com campos calculados (years_at_company, age_years)
-- Necessária porque CURRENT_DATE não é imutável no PostgreSQL
CREATE VIEW collaborators_with_computed
WITH (security_invoker = true) AS
SELECT
  c.*,
  ROUND(
    EXTRACT(YEAR FROM age(COALESCE(c.termination_date, CURRENT_DATE), COALESCE(c.start_date_current, c.start_date_original)))
    + EXTRACT(MONTH FROM age(COALESCE(c.termination_date, CURRENT_DATE), COALESCE(c.start_date_current, c.start_date_original))) / 12.0,
    1
  ) AS years_at_company,
  EXTRACT(YEAR FROM age(CURRENT_DATE, c.date_of_birth))::INTEGER AS age_years
FROM collaborators c;
```

### 3.2 Tabela: `collaborator_clt_data`

Campos específicos de CLT — 1:1 com collaborators.

```sql
CREATE TABLE collaborator_clt_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL UNIQUE REFERENCES collaborators(id) ON DELETE CASCADE,
  
  -- Documentos trabalhistas
  ctps_number TEXT,                -- Carteira de Trabalho
  ctps_series TEXT,
  pis_pasep TEXT,                  -- PIS/PASEP
  
  -- Ponto e folha
  timesheet_system TEXT DEFAULT 'ponto_mais',  -- sistema de ponto
  timesheet_id TEXT,               -- ID no sistema de ponto
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 Tabela: `collaborator_pj_data`

Campos específicos de PJ — 1:1 com collaborators.

```sql
CREATE TABLE collaborator_pj_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL UNIQUE REFERENCES collaborators(id) ON DELETE CASCADE,
  
  -- Empresa prestadora
  company_name TEXT,               -- razão social da PJ
  company_cnpj TEXT,               -- CNPJ da PJ
  company_cnae TEXT,               -- CNAE da PJ
  
  -- Contrato
  service_contract_path TEXT,      -- path do contrato de prestação de serviço no Storage
  contract_signed_at TIMESTAMPTZ,
  
  -- NF mensal
  monthly_nf_amount NUMERIC(15,2), -- valor esperado da NF mensal
  nf_due_day INTEGER DEFAULT 25,   -- dia do mês para envio da NF
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Tabela: `collaborator_dependents`

Dependentes do colaborador (cônjuge, filhos). Normalizado — sem limite de 3.

```sql
CREATE TABLE collaborator_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  
  relationship TEXT NOT NULL CHECK (relationship IN (
    'spouse', 'child', 'parent', 'other'
  )),
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  cpf TEXT,
  is_ir_dependent BOOLEAN DEFAULT false,   -- dependente pra IR
  is_health_plan BOOLEAN DEFAULT false,    -- incluído no plano de saúde
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dependents_collab ON collaborator_dependents(collaborator_id);
```

### 3.5 Tabela: `collaborator_compensation`

Histórico de remuneração e movimentações — append-only.

```sql
CREATE TABLE collaborator_compensation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  
  -- Movimentação
  effective_date DATE NOT NULL,            -- data da movimentação
  movement_type TEXT NOT NULL CHECK (movement_type IN (
    'hiring',           -- admissão
    'promotion',        -- promoção
    'merit_increase',   -- mérito
    'adjustment',       -- reajuste/enquadramento
    'role_change',      -- mudança de cargo lateral
    'transfer',         -- transferência
    'termination'       -- desligamento
  )),
  
  -- Valores
  previous_salary NUMERIC(15,2),
  new_salary NUMERIC(15,2),
  increase_amount NUMERIC(15,2),           -- valor da movimentação
  increase_pct NUMERIC(5,2),               -- % de aumento
  
  -- Cargo
  previous_role TEXT,
  new_role TEXT,
  previous_level TEXT,
  new_level TEXT,
  
  -- Auditoria
  reason TEXT,
  approved_by UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_compensation_collab ON collaborator_compensation(collaborator_id);
CREATE INDEX idx_compensation_date ON collaborator_compensation(effective_date DESC);
```

> O campo `salary_current` do `collaborators` é atualizado via trigger quando uma nova movimentação é inserida. A tabela de compensação é o audit trail — nunca se deleta, nunca se atualiza.

```sql
-- Salary atual (view derivada da última movimentação)
ALTER TABLE collaborators ADD COLUMN current_salary NUMERIC(15,2);
ALTER TABLE collaborators ADD COLUMN last_movement_date DATE;
ALTER TABLE collaborators ADD COLUMN last_movement_type TEXT;

-- Trigger que mantém o current_salary atualizado
CREATE OR REPLACE FUNCTION update_current_salary()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaborators SET
    current_salary = NEW.new_salary,
    last_movement_date = NEW.effective_date,
    last_movement_type = NEW.movement_type,
    updated_at = now()
  WHERE id = NEW.collaborator_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_salary
  AFTER INSERT ON collaborator_compensation
  FOR EACH ROW EXECUTE FUNCTION update_current_salary();
```

### 3.6 Tabela: `collaborator_documents`

Arquivos do colaborador no Storage.

```sql
CREATE TABLE collaborator_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL CHECK (document_type IN (
    'rg', 'cpf', 'ctps', 'voter_registration', 'military_cert',
    'marriage_certificate', 'birth_certificate',
    'address_proof', 'cnpj_card', 'rni',
    'service_contract', 'contract_amendment',
    'offer_letter', 'termination_letter',
    'medical_exam_admission', 'medical_exam_periodic', 'medical_exam_termination',
    'photo', 'other'
  )),
  document_label TEXT,                     -- descrição livre
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_collab_docs ON collaborator_documents(collaborator_id);
```

### 3.7 Tabelas auxiliares (Range)

```sql
-- Faixas de tempo de empresa (lookup)
CREATE TABLE range_tenure (
  id SERIAL PRIMARY KEY,
  min_years NUMERIC(4,1) NOT NULL,
  max_years NUMERIC(4,1),                  -- NULL = sem limite
  label TEXT NOT NULL                       -- "0-1 ano", "1-3 anos", "3-5 anos", etc.
);

INSERT INTO range_tenure (min_years, max_years, label) VALUES
  (0,    1,    'Até 1 ano'),
  (1,    3,    '1 a 3 anos'),
  (3,    5,    '3 a 5 anos'),
  (5,    10,   '5 a 10 anos'),
  (10,   NULL, '10+ anos');

-- Faixas de idade (lookup)
CREATE TABLE range_age (
  id SERIAL PRIMARY KEY,
  min_age INTEGER NOT NULL,
  max_age INTEGER,                          -- NULL = sem limite
  label TEXT NOT NULL
);

INSERT INTO range_age (min_age, max_age, label) VALUES
  (18, 25, '18-25'),
  (26, 30, '26-30'),
  (31, 35, '31-35'),
  (36, 40, '36-40'),
  (41, 50, '41-50'),
  (51, NULL, '51+');
```

### 3.8 Tabela: `reimbursements`

Solicitações de reembolso dos colaboradores.

```sql
CREATE TABLE reimbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id),
  
  -- Solicitação
  title TEXT NOT NULL,                      -- "Uber para cliente X", "Almoço reunião Y"
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'transport', 'meals', 'accommodation', 'supplies',
    'training', 'health', 'other'
  )),
  amount NUMERIC(15,2) NOT NULL,
  expense_date DATE NOT NULL,               -- data da despesa
  
  -- Comprovante
  receipt_path TEXT,                         -- path no Storage
  receipt_file_name TEXT,
  receipt_uploaded_at TIMESTAMPTZ,
  receipt_file_size INTEGER,
  receipt_mime_type TEXT,
  
  -- Fluxo de aprovação
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'draft',             -- rascunho
    'pending',           -- aguardando aprovação do gestor
    'approved',          -- aprovado pelo gestor
    'rejected',          -- rejeitado pelo gestor
    'processing',        -- DP processando pagamento
    'paid',              -- pago
    'cancelled'          -- cancelado pelo colaborador
  )),
  
  -- Aprovação
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Pagamento
  paid_by UUID REFERENCES profiles(id),
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,                    -- ref do pagamento (banco, lote, etc.)
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reimb_collab ON reimbursements(collaborator_id);
CREATE INDEX idx_reimb_status ON reimbursements(status);
CREATE INDEX idx_reimb_approver ON reimbursements(approved_by);
```

### 3.9 Tabela: `pj_invoices`

Notas fiscais mensais dos colaboradores PJ.

```sql
CREATE TABLE pj_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id),
  
  -- Referência
  reference_month INTEGER NOT NULL,         -- 1-12
  reference_year INTEGER NOT NULL,
  
  -- NF
  invoice_number TEXT,
  invoice_amount NUMERIC(15,2) NOT NULL,
  invoice_path TEXT,                         -- PDF da NF no Storage
  invoice_file_name TEXT,
  uploaded_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES profiles(id),
  invoice_file_size INTEGER,
  invoice_mime_type TEXT,
  
  -- Fluxo
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending_upload',    -- NF ainda não enviada (cobrança automática)
    'pending_review',    -- enviada, aguardando conferência do DP
    'approved',          -- conferida e aprovada
    'rejected',          -- rejeitada (NF incorreta, valor errado, etc.)
    'pending_approval',  -- aguardando assinatura Marcelo/Alberto
    'payment_scheduled', -- pagamento agendado
    'paid',              -- pago
    'overdue'            -- atrasada (não enviou no prazo)
  )),
  
  -- Aprovações (Marcelo e Alberto)
  approved_by_finance_1 UUID REFERENCES profiles(id),  -- Marcelo
  approved_at_finance_1 TIMESTAMPTZ,
  approved_by_finance_2 UUID REFERENCES profiles(id),  -- Alberto
  approved_at_finance_2 TIMESTAMPTZ,
  
  -- Pagamento
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  
  -- DP
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Cobrança automática
  reminder_sent_at TIMESTAMPTZ,              -- última cobrança enviada
  reminder_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(collaborator_id, reference_month, reference_year)
);

CREATE INDEX idx_pj_inv_collab ON pj_invoices(collaborator_id);
CREATE INDEX idx_pj_inv_status ON pj_invoices(status);
CREATE INDEX idx_pj_inv_period ON pj_invoices(reference_year, reference_month);
CREATE INDEX idx_pj_inv_status_period ON pj_invoices(status, reference_year, reference_month);
```

### 3.10 Tabela: `onboarding_checklists`

Checklist de onboarding/offboarding com tarefas por área.

```sql
CREATE TABLE onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('onboarding', 'offboarding')),
  employment_type TEXT CHECK (employment_type IN ('clt', 'pj', 'all')),
  
  task_order INTEGER NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  responsible_area TEXT NOT NULL,            -- 'rh', 'dp', 'ti', 'facilities', 'manager', 'employee'
  due_days INTEGER,                          -- dias após início para completar (+ = depois, - = antes)
  is_required BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Templates de onboarding
INSERT INTO onboarding_templates (type, employment_type, task_order, task_title, task_description, responsible_area, due_days, is_required) VALUES
  -- Pré-admissão (antes do início)
  ('onboarding', 'all', 1,  'Formalizar carta proposta',              'Gerar e enviar carta proposta para assinatura digital',           'rh',         -5,  true),
  ('onboarding', 'pj',  2,  'Assinar contrato de prestação de serviço','Contrato PJ via assinatura digital (FinBlue/Clicksign)',          'rh',         -3,  true),
  ('onboarding', 'clt', 2,  'Coletar documentos admissionais',        'RG, CPF, CTPS, PIS, comprovante endereço, foto, exame admissional','dp',        -5,  true),
  ('onboarding', 'pj',  3,  'Coletar documentos PJ',                  'RG, CPF, Cartão CNPJ, Certidão casamento (se aplicável), RNI',    'dp',         -5,  true),
  ('onboarding', 'all', 4,  'Solicitar equipamento à TI',             'Notebook, monitor, periféricos, acessos de sistema',               'rh',         -3,  true),
  ('onboarding', 'all', 5,  'Definir posição de trabalho',            'Mesa, cadeira, andar, sala',                                       'facilities', -2,  true),
  ('onboarding', 'all', 6,  'Solicitar estacionamento',               'Cadastro no sistema de estacionamento',                            'facilities', -2,  false),
  ('onboarding', 'all', 7,  'Criar email corporativo',                'Criar conta no domínio + adicionar nos grupos',                    'ti',         -1,  true),
  ('onboarding', 'all', 8,  'Cadastrar no Flash',                     'Cadastrar colaborador na plataforma Flash benefícios',              'dp',         -1,  true),
  ('onboarding', 'all', 9,  'Cadastrar no plano de saúde',            'Incluir na Agrega (fatura unificada)',                              'dp',         -1,  true),
  ('onboarding', 'clt', 10, 'Cadastrar no Ponto Mais',               'Criar registro no sistema de ponto eletrônico',                     'dp',         -1,  true),
  
  -- Dia 1
  ('onboarding', 'all', 11, 'Recepção e boas-vindas',                'Receber colaborador, tour pelo escritório',                         'rh',          0,  true),
  ('onboarding', 'all', 12, 'Entregar equipamento',                  'Notebook configurado, crachá, acessos',                             'ti',          0,  true),
  ('onboarding', 'all', 13, 'Onboarding cultural',                   'Apresentação da empresa, valores, cultura',                         'rh',          0,  true),
  
  -- Primeira semana
  ('onboarding', 'all', 14, 'Reunião com cada Head',                 'Agenda de meia hora com cada head de área',                         'rh',          5,  true),
  ('onboarding', 'all', 15, 'Reunião com gestor direto',             'Alinhamento de expectativas, metas 90 dias',                        'manager',     2,  true),
  
  -- Primeiro mês
  ('onboarding', 'all', 16, 'Check-in 30 dias',                     'RH conversa com colaborador sobre adaptação',                        'rh',         30,  true);

-- Templates de offboarding
INSERT INTO onboarding_templates (type, employment_type, task_order, task_title, task_description, responsible_area, due_days) VALUES
  ('offboarding', 'all', 1,  'Comunicar desligamento ao colaborador', 'Reunião formal com RH e gestor',                                   'rh',          0),
  ('offboarding', 'all', 2,  'Revogar acessos de sistema',           'Email, VPN, Slack, GitHub, etc.',                                    'ti',          0),
  ('offboarding', 'all', 3,  'Recolher equipamento',                 'Notebook, crachá, chaves, cartão estacionamento',                    'ti',          0),
  ('offboarding', 'all', 4,  'Desativar Flash',                      'Remover do Flash benefícios',                                        'dp',          1),
  ('offboarding', 'all', 5,  'Remover do plano de saúde',            'Excluir da Agrega',                                                  'dp',          1),
  ('offboarding', 'clt', 6,  'Processar rescisão',                   'Calcular verbas rescisórias, FGTS, etc.',                             'dp',          5),
  ('offboarding', 'clt', 7,  'Agendar exame demissional',            'Exame médico demissional obrigatório',                                'dp',          2),
  ('offboarding', 'pj',  6,  'Encerrar contrato PJ',                'Distrato via assinatura digital',                                     'rh',          5),
  ('offboarding', 'all', 8,  'Entrevista de desligamento',           'Conversa final sobre experiência e feedback',                         'rh',          5),
  ('offboarding', 'all', 9,  'Cancelar estacionamento',              'Remover do sistema de estacionamento',                                'facilities',  1);

-- Instâncias de checklist por colaborador
CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES onboarding_templates(id),
  
  type TEXT NOT NULL,                       -- 'onboarding' ou 'offboarding'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'skipped', 'blocked'
  )),
  
  due_date DATE,                            -- calculada: start_date + due_days
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_onb_tasks_collab ON onboarding_tasks(collaborator_id);
CREATE INDEX idx_onb_tasks_status ON onboarding_tasks(status);
CREATE INDEX idx_onb_tasks_type ON onboarding_tasks(type);
```

### 3.11 Tabela: `performance_reviews`

Avaliações de desempenho.

```sql
CREATE TABLE performance_review_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                       -- "Avaliação 2025 H2", "Avaliação Anual 2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'self_review', 'manager_review', 'calibration', 'completed'
  )),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES performance_review_cycles(id),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id),
  reviewer_id UUID NOT NULL REFERENCES collaborators(id),  -- gestor que avalia
  
  -- Auto-avaliação
  self_review_score NUMERIC(3,1),
  self_review_text TEXT,
  self_review_submitted_at TIMESTAMPTZ,
  
  -- Avaliação do gestor
  manager_review_score NUMERIC(3,1),
  manager_review_text TEXT,
  manager_review_submitted_at TIMESTAMPTZ,
  
  -- Calibração (RH ajusta após comitê)
  calibrated_score NUMERIC(3,1),
  calibration_notes TEXT,
  calibrated_by UUID REFERENCES profiles(id),
  calibrated_at TIMESTAMPTZ,
  
  -- Score final
  final_score NUMERIC(3,1),
  final_rating TEXT CHECK (final_rating IN (
    'exceeds_expectations',   -- supera expectativas
    'meets_expectations',     -- atende expectativas
    'partially_meets',        -- atende parcialmente
    'below_expectations'      -- abaixo das expectativas
  )),
  
  -- Plano de desenvolvimento
  development_plan TEXT,
  goals_next_cycle TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',           -- aguardando abertura
    'self_review',       -- colaborador fazendo auto-avaliação
    'manager_review',    -- gestor avaliando
    'calibration',       -- RH calibrando
    'feedback',          -- gestor dando devolutiva
    'completed',         -- concluída
    'skipped'            -- pulada (colaborador novo, licença, etc.)
  )),
  
  feedback_given_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(cycle_id, collaborator_id)
);

CREATE INDEX idx_perf_review_cycle ON performance_reviews(cycle_id);
CREATE INDEX idx_perf_review_collab ON performance_reviews(collaborator_id);
CREATE INDEX idx_perf_review_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_perf_review_status ON performance_reviews(status);
```

### 3.12 Tabela: `medical_plans`

Controle da assistência médica (Agrega — fatura unificada).

```sql
CREATE TABLE medical_plan_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL REFERENCES collaborators(id),
  
  plan_type TEXT,                            -- tipo do plano (enfermaria, apartamento, etc.)
  provider TEXT DEFAULT 'Agrega',
  
  -- Titulares e dependentes
  beneficiary_name TEXT NOT NULL,
  beneficiary_relationship TEXT NOT NULL,    -- 'titular', 'spouse', 'child'
  beneficiary_cpf TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  enrollment_date DATE,
  cancellation_date DATE,
  
  -- Custo
  monthly_cost NUMERIC(15,2),
  company_subsidy_pct NUMERIC(5,2),         -- % que a empresa paga
  employee_cost NUMERIC(15,2),              -- valor descontado do colaborador
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_medical_collab ON medical_plan_entries(collaborator_id);
```

---

## 4. Row Level Security (RLS)

### 4.1 Funções auxiliares

```sql
-- Busca o collaborator_id do usuário logado
CREATE OR REPLACE FUNCTION get_my_collaborator_id()
RETURNS UUID AS $$
  SELECT id FROM collaborators WHERE profile_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Verifica se o usuário é gestor de um colaborador
CREATE OR REPLACE FUNCTION is_manager_of(p_collaborator_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM collaborators
    WHERE id = p_collaborator_id
    AND manager_id = get_my_collaborator_id()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Busca todos os subordinados diretos e indiretos (recursivo)
CREATE OR REPLACE FUNCTION get_my_team_members()
RETURNS SETOF UUID AS $$
  WITH RECURSIVE team AS (
    SELECT id FROM collaborators WHERE manager_id = get_my_collaborator_id()
    UNION ALL
    SELECT c.id FROM collaborators c JOIN team t ON c.manager_id = t.id
  )
  SELECT id FROM team
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 4.2 RLS — `collaborators`

```sql
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Employee: vê apenas o próprio registro
CREATE POLICY "collab_self" ON collaborators
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
  );

-- Manager: vê o time dele (diretos e indiretos)
CREATE POLICY "collab_manager" ON collaborators
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'people_manager'
    AND id IN (SELECT get_my_team_members())
  );

-- RH e DP: veem todos
CREATE POLICY "collab_hr_dp" ON collaborators
  FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('hr', 'dp', 'hr_admin', 'admin')
  );

-- Employee: pode atualizar APENAS campos pessoais do próprio registro
CREATE POLICY "collab_self_update" ON collaborators
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (
    profile_id = auth.uid()
    -- Nota: a restrição de quais colunas pode editar é feita no backend
    -- O RLS garante que só altera o próprio registro
  );

-- RH/DP: pode atualizar qualquer registro
CREATE POLICY "collab_hr_dp_update" ON collaborators
  FOR UPDATE TO authenticated
  USING (get_my_role() IN ('hr', 'dp', 'hr_admin', 'admin'));

-- Apenas RH/DP pode inserir
CREATE POLICY "collab_insert" ON collaborators
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('hr', 'dp', 'hr_admin', 'admin'));
```

### 4.3 RLS — `collaborator_compensation` (RESTRITÍSSIMO)

```sql
ALTER TABLE collaborator_compensation ENABLE ROW LEVEL SECURITY;

-- SOMENTE RH e DP veem remuneração. Nem o gestor. Nem o próprio colaborador.
CREATE POLICY "compensation_hr_dp_only" ON collaborator_compensation
  FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('hr', 'dp', 'hr_admin', 'admin')
  );

-- Somente RH/DP insere
CREATE POLICY "compensation_insert" ON collaborator_compensation
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('hr', 'dp', 'hr_admin', 'admin'));

-- NUNCA update ou delete — é append-only
```

### 4.4 RLS — `reimbursements`

```sql
ALTER TABLE reimbursements ENABLE ROW LEVEL SECURITY;

-- Colaborador: vê os próprios reembolsos
CREATE POLICY "reimb_self" ON reimbursements
  FOR SELECT TO authenticated
  USING (
    collaborator_id = get_my_collaborator_id()
  );

-- Gestor: vê reembolsos do time (pra aprovar)
CREATE POLICY "reimb_manager" ON reimbursements
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'people_manager'
    AND collaborator_id IN (SELECT get_my_team_members())
  );

-- DP: vê todos (pra pagar)
CREATE POLICY "reimb_dp" ON reimbursements
  FOR SELECT TO authenticated
  USING (get_my_role() IN ('dp', 'hr_admin', 'admin'));

-- Colaborador cria seus próprios reembolsos
CREATE POLICY "reimb_self_insert" ON reimbursements
  FOR INSERT TO authenticated
  WITH CHECK (collaborator_id = get_my_collaborator_id());

-- Gestor aprova/rejeita reembolsos do time
CREATE POLICY "reimb_manager_update" ON reimbursements
  FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'people_manager'
    AND collaborator_id IN (SELECT get_my_team_members())
  );

-- DP marca como pago
CREATE POLICY "reimb_dp_update" ON reimbursements
  FOR UPDATE TO authenticated
  USING (get_my_role() IN ('dp', 'hr_admin', 'admin'));

-- Colaborador atualiza próprio reembolso (apenas draft)
CREATE POLICY "reimb_self_update" ON reimbursements
  FOR UPDATE TO authenticated
  USING (
    collaborator_id = get_my_collaborator_id()
    AND status = 'draft'
  )
  WITH CHECK (collaborator_id = get_my_collaborator_id());
```

### 4.5 RLS — `pj_invoices`

```sql
ALTER TABLE pj_invoices ENABLE ROW LEVEL SECURITY;

-- PJ: vê as próprias NFs
CREATE POLICY "pj_inv_self" ON pj_invoices
  FOR SELECT TO authenticated
  USING (collaborator_id = get_my_collaborator_id());

-- DP: vê todas
CREATE POLICY "pj_inv_dp" ON pj_invoices
  FOR SELECT TO authenticated
  USING (get_my_role() IN ('dp', 'hr_admin', 'admin'));

-- PJ atualiza (envia NF) — registro já existe como pending_upload (criado pelo CRON)
CREATE POLICY "pj_inv_self_update" ON pj_invoices
  FOR UPDATE TO authenticated
  USING (
    collaborator_id = get_my_collaborator_id()
    AND status = 'pending_upload'
  )
  WITH CHECK (collaborator_id = get_my_collaborator_id());

-- DP atualiza (aprovar, rejeitar, pagar)
CREATE POLICY "pj_inv_dp_update" ON pj_invoices
  FOR UPDATE TO authenticated
  USING (get_my_role() IN ('dp', 'hr_admin', 'admin'));
```

---

## 5. Supabase Storage — Bucket collaborator-documents

Arquivos de colaboradores: NFs mensais PJ e comprovantes de reembolso.

**Path convention:**
- NFs: `invoices/{collaborator_id}/{year}-{month}/{filename}`
- Comprovantes: `reimbursements/{collaborator_id}/{reimbursement_id}/{filename}`

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('collaborator-documents', 'collaborator-documents', false);

-- Colaborador: SELECT nos próprios paths (invoices ou reimbursements)
CREATE POLICY "collab_docs_self_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'collaborator-documents'
    AND (
      ((storage.foldername(name))[1] = 'invoices' AND (storage.foldername(name))[2]::uuid = get_my_collaborator_id())
      OR ((storage.foldername(name))[1] = 'reimbursements' AND (storage.foldername(name))[2]::uuid = get_my_collaborator_id())
    )
  );

CREATE POLICY "collab_docs_self_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'collaborator-documents'
    AND (
      ((storage.foldername(name))[1] = 'invoices' AND (storage.foldername(name))[2]::uuid = get_my_collaborator_id())
      OR ((storage.foldername(name))[1] = 'reimbursements' AND (storage.foldername(name))[2]::uuid = get_my_collaborator_id())
    )
  );

-- DP/HR/Admin: SELECT em tudo
CREATE POLICY "collab_docs_dp_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'collaborator-documents'
    AND get_my_role() IN ('dp', 'hr_admin', 'admin')
  );
```

**Nota:** O upload via API usa `supabaseAdmin` (service role), que bypassa RLS. A autorização é feita no NestJS antes do upload.

---

## 6. Sidebar Integrada — Expansão do ROLE_PERMISSIONS

```typescript
// Seções adicionais no ROLE_PERMISSIONS para o módulo People

// === EMPLOYEE (todo colaborador) ===
// Adicionar à sidebar de QUALQUER role:
{
  section: 'Meu Espaço',
  items: [
    { label: 'Meu Perfil',      icon: 'User',         route: '/me/profile' },
    { label: 'Reembolsos',      icon: 'Receipt',      route: '/me/reimbursements' },
    { label: 'Notas Fiscais',   icon: 'FileText',     route: '/me/invoices',    condition: 'is_pj' },
    { label: 'Benefícios',      icon: 'Heart',        route: '/me/benefits' },
    { label: 'Documentos',      icon: 'FolderOpen',   route: '/me/documents' },
    { label: 'Avaliações',      icon: 'Star',         route: '/me/reviews' },
  ],
},

// === PEOPLE_MANAGER (gestores) ===
{
  section: 'Meu Time',
  items: [
    { label: 'Colaboradores',   icon: 'Users',        route: '/team/members' },
    { label: 'Avaliações',      icon: 'Star',         route: '/team/reviews' },
    { label: 'Reembolsos',      icon: 'Receipt',      route: '/team/reimbursements' },
    { label: 'Onboarding',      icon: 'UserPlus',     route: '/team/onboarding' },
  ],
},

// === HR (Business Partners) ===
{
  section: 'Gestão de Pessoas',
  items: [
    { label: 'Colaboradores',     icon: 'Users',        route: '/hr/collaborators' },
    { label: 'Organograma',       icon: 'Network',      route: '/hr/org-chart' },
    { label: 'Avaliações',        icon: 'Star',         route: '/hr/reviews' },
    { label: 'Onboarding',        icon: 'UserPlus',     route: '/hr/onboarding' },
    { label: 'Offboarding',       icon: 'UserMinus',    route: '/hr/offboarding' },
    { label: 'Relatórios People', icon: 'BarChart3',    route: '/hr/reports' },
  ],
},

// === DP (Departamento Pessoal) ===
{
  section: 'Departamento Pessoal',
  items: [
    { label: 'Colaboradores',    icon: 'Users',        route: '/dp/collaborators' },
    { label: 'Folha CLT',        icon: 'Calculator',   route: '/dp/payroll' },
    { label: 'Notas Fiscais PJ', icon: 'FileText',     route: '/dp/invoices' },
    { label: 'Reembolsos',       icon: 'Receipt',      route: '/dp/reimbursements' },
    { label: 'Benefícios',       icon: 'Heart',        route: '/dp/benefits' },
    { label: 'Plano de Saúde',   icon: 'Stethoscope',  route: '/dp/medical' },
    { label: 'Onboarding',       icon: 'UserPlus',     route: '/dp/onboarding' },
    { label: 'Offboarding',      icon: 'UserMinus',    route: '/dp/offboarding' },
  ],
},
```

---

## 7. Fluxos Operacionais

### 6.1 Reembolso

```
[Colaborador]                    [Gestor]                    [DP]
     │                               │                          │
     ▼                               │                          │
 Cria reembolso                      │                          │
 (valor, categoria,                  │                          │
  data, comprovante)                 │                          │
     │                               │                          │
     ▼                               │                          │
 Status: 'pending'                   │                          │
 → Notificação ao gestor ──────────▶│                          │
                                     ▼                          │
                                Revisa na fila                  │
                                     │                          │
                              ┌──────┴──────┐                   │
                              │             │                   │
                           Aprova      Rejeita                  │
                              │        (motivo)                 │
                              │             │                   │
                              │             ▼                   │
                              │        Notifica                 │
                              │        colaborador              │
                              ▼                                 │
                         Status: 'approved'                     │
                         → Notificação ao DP ──────────────────▶│
                                                                ▼
                                                          Revisa + paga
                                                                │
                                                                ▼
                                                          Status: 'paid'
                                                          → Notifica
                                                            colaborador
```

**Hoje:** Colaborador imprime comprovante → entrega ao DP → DP confere → paga manualmente. **2 dias perdidos.**

**Novo:** Upload digital do comprovante → aprovação com 1 clique do gestor → DP vê na fila e paga. Processo rastreável de ponta a ponta.

### 6.2 Nota Fiscal PJ (Mensal)

```
[Sistema - CRON]                 [Colaborador PJ]              [DP]
     │                                │                          │
     ▼                                │                          │
 Dia 20 de cada mês:                  │                          │
 Cria pj_invoices com                 │                          │
 status='pending_upload'              │                          │
 pra todos os PJs ativos              │                          │
     │                                │                          │
     ▼                                │                          │
 Email + notificação ────────────────▶│                          │
 "Envie sua NF de janeiro"            │                          │
                                      ▼                          │
                                 Acessa "Notas Fiscais"          │
                                 no Meu Espaço                   │
                                      │                          │
                                      ▼                          │
                                 Upload da NF                    │
                                 (PDF + número + valor)          │
                                      │                          │
                                      ▼                          │
                                 Status: 'pending_review'        │
                                 → Notifica DP ─────────────────▶│
                                                                 ▼
                                                           Confere NF
                                                                 │
                                                          ┌──────┴──────┐
                                                          │             │
                                                       Aprova      Rejeita
                                                          │        (motivo)
                                                          ▼             │
                                                   'pending_approval'   ▼
                                                          │        Notifica PJ
                                                          │        pra corrigir
                                                          ▼
                                                   Marcelo + Alberto
                                                   aprovam (assinatura)
                                                          │
                                                          ▼
                                                   'payment_scheduled'
                                                          │
                                                          ▼
                                                   Pagamento executado
                                                          │
                                                          ▼
                                                   Status: 'paid'
                                                   → Notifica PJ

[Se PJ não enviou até dia 5:]
     │
     ▼
 Lembrete automático
 "Sua NF está atrasada"
 (repete dia 5, 10, 15)
```

**Hoje:** DP envia email manual pra ~103 PJs todo mês cobrando NF. Confere cada NF individualmente. Pagamento manual.

**Novo:** Sistema cria automaticamente as entradas mensais, envia cobrança automática, PJ faz upload pelo portal, DP tem fila organizada pra conferir, aprovação digital do Marcelo/Alberto.

### 6.3 Onboarding

```
[RH cria novo colaborador no sistema]
     │
     ▼
[Preenche dados básicos + tipo (CLT/PJ)]
     │
     ▼
[Sistema gera checklist automaticamente]
  → Baseado no tipo (CLT/PJ)
  → Calcula due_dates a partir da data de início
  → Atribui cada tarefa à área responsável
     │
     ▼
[Dashboard de onboarding mostra:]
     │
     ├── TI: "Preparar equipamento — vence em 3 dias"
     ├── DP: "Cadastrar no Flash — vence amanhã"
     ├── DP: "Cadastrar no plano de saúde — vence amanhã"
     ├── Facilities: "Reservar estação de trabalho — vence em 2 dias"
     ├── RH: "Enviar carta proposta — vence em 5 dias"
     └── Manager: "Agendar reunião de alinhamento — vence na 1ª semana"
     │
     ▼
[Cada área marca suas tarefas como concluídas]
[Barra de progresso: "8 de 16 tarefas concluídas"]
[Alertas automáticos para tarefas atrasadas]
```

**Hoje:** RH envia email pra TI pedindo equipamento, email pro facilities pedindo mesa, email pro DP pedindo cadastro no Flash. Tudo manual, sem tracking.

**Novo:** Checklist automático, cada área vê suas pendências, tracking completo, alertas de atraso.

### 6.4 Offboarding

Mesmo mecanismo, mas com checklist de offboarding: revogar acessos, recolher equipamento, remover do Flash, remover do plano de saúde, processar rescisão (CLT) ou distrato (PJ), entrevista de desligamento.

### 6.5 Avaliação de Desempenho

```
[RH cria ciclo de avaliação]
  Ex: "Avaliação Anual 2025"
     │
     ▼
[Sistema gera reviews pra todos os colaboradores ativos]
  → Cada um com seu gestor como reviewer
     │
     ▼
[Fase 1: Auto-avaliação]
  Colaborador preenche score + texto
  Prazo: 2 semanas
     │
     ▼
[Fase 2: Avaliação do Gestor]
  Gestor vê auto-avaliação + preenche a dele
  Prazo: 2 semanas
     │
     ▼
[Fase 3: Calibração]
  RH revisa em comitê, ajusta scores
  Garante consistência entre áreas
     │
     ▼
[Fase 4: Devolutiva]
  Gestor agenda conversa com colaborador
  Compartilha resultado + plano de desenvolvimento
     │
     ▼
[Status: 'completed']
```

---

## 8. Automações e Integrações

### 7.1 Jobs Automáticos (CRON)

| Job | Frequência | Ação |
|-----|-----------|------|
| Gerar NFs mensais PJ | Dia 20 de cada mês | Cria `pj_invoices` com status `pending_upload` pra todos PJs ativos |
| Cobrar NF atrasada | Dias 5, 10, 15 | Email + notificação pra PJs que não enviaram |
| Alerta onboarding | Diário | Notifica tarefas com due_date = hoje ou atrasadas |
| Aniversário empresa | Diário | Notifica RH quando colaborador completa anos de casa |
| Recalcular campos | Diário | Atualiza `years_at_company` e `age_years` (GENERATED ALWAYS) |

### 7.2 Integrações Existentes

| Sistema | O que faz hoje | Integração possível |
|---------|---------------|-------------------|
| **Ponto Mais** | Ponto eletrônico CLT | API pra puxar horas trabalhadas/faltas |
| **Flash** | Benefícios flexíveis | API pra cadastro/remoção automática |
| **Agrega** | Plano de saúde (fatura unificada) | Verificar se tem API ou se fica manual |
| **FinBlue** | Assinatura digital | API pra assinar contratos/carta proposta |

### 7.3 Notificações

| Evento | Quem recebe | Canal |
|--------|------------|-------|
| Reembolso pendente de aprovação | Gestor | In-app + email |
| Reembolso aprovado | Colaborador | In-app |
| Reembolso pago | Colaborador | In-app + email |
| NF mensal pendente | PJ | In-app + email |
| NF aprovada/rejeitada | PJ | In-app |
| Tarefa de onboarding vencendo | Área responsável | In-app |
| Tarefa de onboarding atrasada | Área + RH | In-app + email |
| Ciclo de avaliação aberto | Todos | In-app + email |
| Avaliação pendente de preenchimento | Colaborador/Gestor | In-app |
| Aniversário de empresa | RH | In-app |

---

## 9. Dashboard por Role

### 8.1 Colaborador (Meu Espaço)

```
┌──────────────────────────────────────────────────────────┐
│ Meu Espaço                                               │
│                                                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│ │ 🧾 2 reembolsos │ │ 📄 NF Janeiro   │ │ ⭐ Avaliação│ │
│ │ pendentes       │ │ não enviada     │ │ aberta     │ │
│ │ R$ 340,00       │ │ vence dia 25    │ │ até 15/mar │ │
│ └─────────────────┘ └─────────────────┘ └────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Meus Benefícios                                      │ │
│ │ 💳 Flash: R$ 1.200/mês   🏥 Plano: Amil Apt.        │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 8.2 Gestor (Meu Time)

```
┌──────────────────────────────────────────────────────────┐
│ Meu Time (8 pessoas)                                     │
│                                                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│ │ 🧾 3 reembolsos │ │ 👤 1 onboarding │ │ ⭐ 5 avalia-│ │
│ │ pra aprovar     │ │ em andamento    │ │ ções pra   │ │
│ │                 │ │ 12/16 tarefas   │ │ preencher  │ │
│ └─────────────────┘ └─────────────────┘ └────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Próximos eventos                                     │ │
│ │ • Maria Silva — 3 anos na empresa (amanhã)          │ │
│ │ • João Santos — período de experiência vence (5 dias)│ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 8.3 DP

```
┌──────────────────────────────────────────────────────────┐
│ Departamento Pessoal                                     │
│                                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ ┌──────┐ │
│ │ 📄 47 NFs   │ │ 🧾 12       │ │ 🏥 Fatura │ │ 👤 2 │ │
│ │ PJ pra      │ │ reembolsos  │ │ Agrega    │ │ onb. │ │
│ │ conferir    │ │ pra pagar   │ │ pendente  │ │ ativ.│ │
│ └─────────────┘ └─────────────┘ └───────────┘ └──────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ NFs Atrasadas                                        │ │
│ │ ⚠ 8 PJs não enviaram a NF de janeiro                │ │
│ │ Último lembrete: 10/jan — [Reenviar cobrança]       │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Folha CLT (via Ponto Mais)                           │ │
│ │ 31 colaboradores · Média: R$ 5.000                   │ │
│ │ Fechamento: 25/jan — [Ver detalhes]                  │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 8.4 RH (Business Partner)

```
┌──────────────────────────────────────────────────────────┐
│ Gestão de Pessoas                                        │
│                                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ ┌──────┐ │
│ │ 👥 134      │ │ ⭐ Avaliação │ │ 📊 Turnover│ │ 🎯   │ │
│ │ colaborad.  │ │ 2025: 67%   │ │ 12 meses: │ │ 3    │ │
│ │ 103PJ/31CLT │ │ preenchido  │ │ 8.2%      │ │ suces│ │
│ └─────────────┘ └─────────────┘ └───────────┘ └──────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Retenção e Clima                                     │ │
│ │ • 5 colaboradores com 10+ anos (reconhecimento?)    │ │
│ │ • 3 cargos com disparidade salarial > 20%           │ │
│ │ • 2 áreas sem avaliação de desempenho no último ciclo│ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Headcount por Diretoria                              │ │
│ │ Tecnologia: 42 │ Comercial: 35 │ Operações: 28      │ │
│ │ Financeiro: 15 │ RH: 4         │ Jurídico: 10       │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 10. Relatórios do RH (dados do Marcelo)

O Marcelo gosta de olhar dados históricos (desde 2023). O sistema deve gerar:

| Relatório | Descrição | Atualização |
|-----------|-----------|-------------|
| Headcount | Total, por tipo (CLT/PJ), por diretoria, por departamento | Tempo real |
| Turnover | Entradas vs saídas por mês, motivos de saída | Mensal |
| Aging Workforce | Distribuição por faixa etária e tempo de casa | Mensal |
| Disparidade Salarial | Mesmo cargo com salários diferentes (range, mediana, outliers) | Mensal |
| Custo de Pessoal | Folha CLT + PJs + benefícios + reembolsos por mês | Mensal |
| Avaliação de Desempenho | Distribuição de ratings, por área, evolução ciclo a ciclo | Por ciclo |
| Onboarding Effectiveness | Tempo médio de onboarding, tarefas atrasadas | Mensal |
| Absenteísmo | Faltas, atrasos (via Ponto Mais) | Mensal |

Todos com filtro por período (mensal, trimestral, anual) e comparativo com períodos anteriores.

---

## 11. Migração de Dados

### 10.1 Plano de Migração da Planilha Excel

```
Excel (90 colunas, ~134 linhas)
     │
     ▼
[Script Python de ETL]
     │
     ├── Lê Excel com openpyxl/pandas
     ├── Mapeia 90 colunas → schema normalizado
     ├── Separa campos CLT → collaborator_clt_data
     ├── Separa campos PJ → collaborator_pj_data
     ├── Normaliza dependentes (cônjuge + 3 filhos fixos → N linhas)
     ├── Cria registro de compensação inicial (salário atual)
     ├── Aplica tabelas de range (idade, tempo empresa)
     └── Insere no Supabase via API ou SQL direto
     │
     ▼
[Validação]
     ├── COUNT de registros bate?
     ├── Campos calculados (idade, tempo empresa) conferem?
     ├── Nenhum CPF duplicado?
     └── Todos os gestores existem como collaborators?
```

### 10.2 Mapeamento de Campos (Resumo)

| Coluna Excel | Tabela | Campo |
|-------------|--------|-------|
| A/I | collaborators | is_active |
| Matrícula Cont. | collaborators | registration_number |
| Colaborador | collaborators | full_name |
| I/E | collaborators | is_internal |
| Tipo | collaborators | employment_type |
| Empresa_Prestador | collaborator_pj_data | company_name |
| CNPJ | collaborator_pj_data | company_cnpj |
| CNAE Prestador | collaborator_pj_data | company_cnae |
| Início - antigos | collaborators | start_date_original |
| Início Atual | collaborators | start_date_current |
| Dt. Nasc. | collaborators | date_of_birth |
| Salário Atual | collaborators | current_salary |
| Data da última Movimentação | collaborators | last_movement_date |
| Tipo de Movimentação | collaborators | last_movement_type |
| Salário Anterior | collaborator_compensation | previous_salary |
| Valor da Movimentação | collaborator_compensation | increase_amount |
| % de aumento | collaborator_compensation | increase_pct |
| CTPS | collaborator_clt_data | ctps_number |
| PIS/PASEP | collaborator_clt_data | pis_pasep |
| Cônjuge | collaborator_dependents | full_name (relationship='spouse') |
| Filho 1 | collaborator_dependents | full_name (relationship='child') |
| Filho 2 | collaborator_dependents | full_name (relationship='child') |
| Filho 3 | collaborator_dependents | full_name (relationship='child') |
| Anos na empresa | — | Calculado (GENERATED ALWAYS) |
| Faixa | — | JOIN com range_tenure |
| Idade | — | Calculado (GENERATED ALWAYS) |
| Range Idade | — | JOIN com range_age |

---

## 12. API Endpoints — Módulo People

### Colaboradores

```
GET    /api/people/me                        → Meu perfil completo
PATCH  /api/people/me                        → Atualizar meu perfil (campos permitidos)
GET    /api/people/me/documents              → Meus documentos
POST   /api/people/me/documents              → Upload de documento pessoal

GET    /api/people/collaborators             → Listar colaboradores (RLS filtra)
GET    /api/people/collaborators/:id         → Detalhe (campos variam por role)
POST   /api/people/collaborators             → Cadastrar novo (RH/DP)
PATCH  /api/people/collaborators/:id         → Atualizar (RH/DP)

GET    /api/people/collaborators/:id/dependents     → Listar dependentes
POST   /api/people/collaborators/:id/dependents     → Adicionar dependente
PATCH  /api/people/collaborators/:id/dependents/:did → Atualizar dependente
DELETE /api/people/collaborators/:id/dependents/:did → Remover dependente

GET    /api/people/collaborators/:id/compensation   → Histórico remuneração (RH/DP only)
POST   /api/people/collaborators/:id/compensation   → Registrar movimentação (RH/DP only)
```

### Reembolsos

```
GET    /api/people/reimbursements            → Meus reembolsos (ou do time, ou todos)
POST   /api/people/reimbursements            → Criar reembolso
PATCH  /api/people/reimbursements/:id        → Atualizar (se draft)
POST   /api/people/reimbursements/:id/approve → Gestor aprova
POST   /api/people/reimbursements/:id/reject  → Gestor rejeita
POST   /api/people/reimbursements/:id/pay     → DP marca como pago
```

### Notas Fiscais PJ

```
GET    /api/people/invoices                  → Minhas NFs (ou todas pro DP)
POST   /api/people/invoices/:id/upload       → PJ envia NF
POST   /api/people/invoices/:id/approve      → DP aprova
POST   /api/people/invoices/:id/reject       → DP rejeita
POST   /api/people/invoices/:id/pay          → DP marca como pago
GET    /api/people/invoices/overdue           → NFs atrasadas (DP)
POST   /api/people/invoices/send-reminders    → Enviar cobrança em lote (DP)
```

### Onboarding / Offboarding

```
POST   /api/people/onboarding/:collaborator_id/generate  → Gerar checklist
GET    /api/people/onboarding/:collaborator_id/tasks     → Listar tarefas
PATCH  /api/people/onboarding/tasks/:id                  → Atualizar status da tarefa
GET    /api/people/onboarding/pending                    → Tarefas pendentes (por área)
```

### Avaliação de Desempenho

```
GET    /api/people/reviews/cycles            → Listar ciclos
POST   /api/people/reviews/cycles            → Criar ciclo (RH)
GET    /api/people/reviews/me                → Minhas avaliações
GET    /api/people/reviews/team              → Avaliações do time (gestor)
PATCH  /api/people/reviews/:id/self          → Submeter auto-avaliação
PATCH  /api/people/reviews/:id/manager       → Submeter avaliação do gestor
PATCH  /api/people/reviews/:id/calibrate     → Calibrar (RH)
```

### Relatórios

```
GET    /api/people/reports/headcount         → Headcount atual e histórico
GET    /api/people/reports/turnover          → Turnover por período
GET    /api/people/reports/salary-disparity  → Disparidade salarial por cargo
GET    /api/people/reports/cost              → Custo de pessoal
GET    /api/people/reports/demographics      → Idade, tempo empresa, distribuições
```

---

## 13. Próximas Definições

- **Integração Ponto Mais:** verificar API disponível, quais dados puxar, frequência
- **Integração Flash:** verificar API pra cadastro automático no onboarding/offboarding
- **Integração Agrega:** verificar se tem API ou se a gestão do plano fica manual
- **FinBlue:** confirmar se é o sistema de assinatura digital e verificar API
- **Fluxo de aprovação de NF:** confirmar se Marcelo E Alberto precisam aprovar (ambos) ou qualquer um dos dois
- **Estrutura organizacional:** confirmar quantas diretorias, departamentos, filiais
- **Avaliação de desempenho:** definir critérios, escalas, competências avaliadas
- **PLR e 13º PJ:** regras de cálculo e pagamento
- **Relatórios específicos:** quais dashboards o Marcelo quer ver com dados desde 2023
- **Régua de comunicação:** templates de email pra cobrança de NF, boas-vindas, etc.
- **Telas:** wireframes do Meu Espaço, fila de NFs, fila de reembolsos, onboarding tracker
