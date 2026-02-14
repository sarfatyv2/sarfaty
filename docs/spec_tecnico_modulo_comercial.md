# Especificação Técnica — Módulo Comercial

**Versão:** 1.2  
**Data:** Fevereiro 2026  
**Status:** Draft  

---

## 1. Visão Geral

Este documento detalha a especificação técnica do módulo comercial da plataforma de crédito, incluindo modelagem de dados no Supabase (PostgreSQL), políticas de Row Level Security (RLS), hierarquia de usuários, **checklist dinâmico de documentos por segmento, produto de crédito e garantias**, fluxo completo do comercial e funcionalidades de pipeline/metas.

**Stack:** Supabase (PostgreSQL + Auth + Storage + RLS) · Next.js · NestJS · TypeScript

---

## 2. Hierarquia de Usuários

### 2.1 Papéis (Roles)

| Role | Código | Escopo de Visão | Pode Criar Cliente? | Pode Reatribuir? |
|------|--------|----------------|---------------------|-----------------|
| Comercial | `sales_rep` | Apenas seus próprios clientes | ✅ Sim | ❌ Não |
| Supervisor | `sales_supervisor` | Clientes da sua equipe (sub-região) | ✅ Sim (atribui a um comercial) | ✅ Dentro da equipe |
| Gerente Regional | `sales_manager` | Todos os clientes da sua região | ✅ Sim (atribui a um comercial) | ✅ Dentro da região |
| Diretor Comercial | `sales_director` | Todos os clientes (nacional) | ✅ Sim (atribui a qualquer comercial) | ✅ Entre regiões |
| Admin | `admin` | Tudo | ✅ Sim | ✅ Tudo |

### 2.2 Estrutura Organizacional

```
Diretor Comercial (nacional)
├── Gerente Regional Sul
│   ├── Supervisor Equipe PR/SC
│   │   ├── Comercial A (seus clientes)
│   │   └── Comercial B (seus clientes)
│   └── Supervisor Equipe RS
│       ├── Comercial C
│       └── Comercial D
├── Gerente Regional Sudeste
│   ├── Supervisor Equipe SP Capital
│   │   ├── Comercial E
│   │   └── Comercial F
│   └── Supervisor Equipe SP Interior / MG / RJ
│       └── ...
└── Gerente Regional Nordeste
    └── ...
```

### 2.3 Regra de Ouro

> **Cada nível hierárquico enxerga tudo abaixo de si, nunca ao lado.**  
> O Comercial A não vê clientes do Comercial B. O Supervisor PR/SC não vê clientes da equipe RS. O Gerente Sul não vê clientes do Sudeste.

---

## 3. Modelagem de Dados (Supabase / PostgreSQL)

### 3.1 Tabela: `regions`

Regiões geográficas de atuação comercial.

```sql
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 'Sul', 'Sudeste', 'Nordeste'
  code TEXT NOT NULL UNIQUE,             -- 'south', 'southeast', 'northeast'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Tabela: `teams`

Equipes dentro de uma região (sub-divisão do gerente).

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 'Equipe PR/SC', 'Equipe SP Capital'
  region_id UUID NOT NULL REFERENCES regions(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 Tabela: `profiles`

Extensão do `auth.users` do Supabase com dados de negócio.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN (
    'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director',
    'credit_analyst', 'compliance_officer', 'approver', 'backoffice',
    'legal', 'risk_manager', 'recovery', 'litigation', 'admin'
  )),
  team_id UUID REFERENCES teams(id),        -- comerciais e supervisores
  region_id UUID REFERENCES regions(id),     -- gerentes regionais
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_team ON profiles(team_id);
CREATE INDEX idx_profiles_region ON profiles(region_id);
```

**Regras de vínculo:**
- `sales_rep` e `sales_supervisor` → obrigatório `team_id` (que já carrega `region_id` via join)
- `sales_manager` → obrigatório `region_id`, `team_id` é NULL
- `sales_director` e `admin` → ambos NULL (acesso global)

### 3.4 Tabela: `segments`

Segmentos de mercado que determinam quais documentos adicionais são exigidos.

```sql
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO segments (name, code, description) VALUES
  ('Agronegócio (Grãos)',    'agro_graos',     'Produtores de grãos, soja, milho, café'),
  ('Agronegócio (Outros)',   'agro_outros',    'Pecuária, avicultura, outros produtos agrícolas'),
  ('Transportadora',         'transport',      'Transportadoras de carga e logística'),
  ('Incorporadora',          'developer',      'Incorporadoras imobiliárias'),
  ('Empreiteira',            'contractor',     'Empreiteiras e prestadores de serviços de obra'),
  ('Lojas / Franquias',      'retail_franchise','Redes de lojas e franquias'),
  ('Comércio',               'commerce',       'Varejo, atacado, e-commerce (sem franquias)'),
  ('Indústria',              'industry',       'Manufatura, transformação, metalurgia'),
  ('Serviços',               'services',       'Consultorias, tecnologia, serviços profissionais'),
  ('Saúde',                  'health',         'Clínicas, hospitais, operadoras de saúde'),
  ('Educação',               'education',      'Escolas, universidades, EdTechs'),
  ('Energia',                'energy',         'Geração, distribuição, renováveis'),
  ('Outros',                 'other',          'Segmentos não classificados acima');
```

### 3.5 Tabela: `credit_products`

Produtos/modalidades de crédito que podem exigir documentação adicional específica.

```sql
CREATE TABLE credit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO credit_products (name, code, description) VALUES
  ('Crédito Padrão',   'standard',  'Operação de crédito estruturado padrão'),
  ('Progredir',        'progredir', 'Antecipação de recebíveis de contratos com grandes tomadores');
```

### 3.6 Tabela: `product_document_templates`

Documentos extras exigidos por produto de crédito.

```sql
CREATE TABLE product_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES credit_products(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL,
  document_label TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  accepted_mime_types TEXT[] DEFAULT ARRAY['application/pdf'],
  max_file_size_mb INTEGER DEFAULT 25,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, document_type)
);

CREATE INDEX idx_prod_doc_templates_product ON product_document_templates(product_id);

-- ============================================
-- PROGREDIR — documentos extras
-- ============================================
INSERT INTO product_document_templates (product_id, document_type, document_label, description, is_required, sort_order)
SELECT p.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM credit_products p
CROSS JOIN (VALUES
  ('progredir_contract',    'Cópia do Contrato Vinculado',                       'Contrato que será vinculado como garantia da operação',           true,  1),
  ('progredir_idf',         'Histórico IDF (3 períodos, últimos 12 meses)',      'Índice de Desempenho Financeiro dos últimos 3 períodos',          true,  2),
  ('progredir_payment_hist','Histórico de Recebimento do Contrato',              'Comprovantes de recebimento das parcelas do contrato',            true,  3),
  ('progredir_sap_ariba',   'Tela SAP Ariba — Relatório de Medição',            'Print/export da tela SAP Ariba com RM e NF para contratos com performance em andamento', true, 4),
  ('progredir_nf',          'Nota Fiscal (contratos com performance)',           'NF vinculada ao relatório de medição',                            true,  5),
  ('progredir_glosa_rate',  'Informação de Taxa de Glosa',                       'Documento ou declaração com a taxa de glosa do contrato',          true,  6),
  ('progredir_adhesion',    'Data de Adesão no Progredir',                       'Comprovante ou declaração da data de adesão ao programa',          true,  7),
  ('progredir_history',     'Histórico de Operações Progredir',                  'Quantidade de operações Progredir que a empresa/grupo já realizou', true, 8)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE p.code = 'progredir';
```

### 3.7 Tabela: `guarantee_types` e `guarantee_document_templates`

Quando a operação envolve garantias, documentos adicionais são exigidos conforme o tipo de garantia.

```sql
CREATE TABLE guarantee_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO guarantee_types (name, code, description) VALUES
  ('Imóvel',             'real_estate', 'Imóvel urbano ou rural como garantia'),
  ('Contrato',           'contract',   'Contrato de prestação de serviço ou fornecimento'),
  ('Veículos',           'vehicle',    'Veículos (caminhões, máquinas, equipamentos)'),
  ('Recebíveis',         'receivables','Duplicatas, notas promissórias, recebíveis de cartão'),
  ('Aval / Fiança',      'surety',     'Aval dos sócios ou fiança bancária'),
  ('Estoque',            'inventory',  'Estoque de produtos como garantia'),
  ('Outros',             'other',      'Outras garantias não classificadas');

CREATE TABLE guarantee_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guarantee_type_id UUID NOT NULL REFERENCES guarantee_types(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL,
  document_label TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  accepted_mime_types TEXT[] DEFAULT ARRAY['application/pdf'],
  max_file_size_mb INTEGER DEFAULT 25,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guarantee_type_id, document_type)
);

CREATE INDEX idx_guar_doc_templates ON guarantee_document_templates(guarantee_type_id);

-- Docs por tipo de garantia
INSERT INTO guarantee_document_templates (guarantee_type_id, document_type, document_label, description, is_required, sort_order)
SELECT g.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM guarantee_types g
CROSS JOIN (VALUES
  ('guarantee_property_title',   'Matrícula Atualizada do Imóvel',     'Certidão de matrícula atualizada (máx. 30 dias)',  true,  1),
  ('guarantee_property_appraisal','Laudo de Avaliação do Imóvel',      'Laudo de avaliação por perito credenciado',         true,  2),
  ('guarantee_property_iptu',    'IPTU / ITR',                         'Comprovante de quitação de IPTU ou ITR',            true,  3)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE g.code = 'real_estate';

INSERT INTO guarantee_document_templates (guarantee_type_id, document_type, document_label, description, is_required, sort_order)
SELECT g.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM guarantee_types g
CROSS JOIN (VALUES
  ('guarantee_contract_copy',    'Cópia do Contrato',                  'Cópia integral do contrato dado em garantia',       true,  1),
  ('guarantee_contract_status',  'Posição de Saldo do Contrato',       'Demonstrativo de saldo atual do contrato',           true,  2)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE g.code = 'contract';

INSERT INTO guarantee_document_templates (guarantee_type_id, document_type, document_label, description, is_required, sort_order)
SELECT g.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM guarantee_types g
CROSS JOIN (VALUES
  ('guarantee_vehicle_doc',      'CRV / CRLV dos Veículos',           'Documento dos veículos dados em garantia',           true,  1),
  ('guarantee_vehicle_appraisal','Avaliação FIPE / Mercado',           'Referência de valor de mercado dos veículos',         true,  2)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE g.code = 'vehicle';
```

### 3.8 Tabela: `segment_document_templates`

Documentos extras por segmento da empresa. Os documentos base (seção 6.1) são exigidos para TODOS. Esta tabela adiciona os EXTRAS.

```sql
CREATE TABLE segment_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL,
  document_label TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  accepted_mime_types TEXT[] DEFAULT ARRAY['application/pdf'],
  max_file_size_mb INTEGER DEFAULT 25,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(segment_id, document_type)
);

CREATE INDEX idx_seg_doc_templates_segment ON segment_document_templates(segment_id);

-- ============================================
-- AGRONEGÓCIO (GRÃOS) — doc extra
-- ============================================
INSERT INTO segment_document_templates (segment_id, document_type, document_label, description, is_required, sort_order)
SELECT s.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM segments s
CROSS JOIN (VALUES
  ('crop_schedule', 'Quadro de Safras (últimos 2 anos + atual)', 'Detalhamento de safras com área, produtividade, preço médio e resultado', true, 1)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE s.code = 'agro_graos';

-- ============================================
-- TRANSPORTADORA — doc extra
-- ============================================
INSERT INTO segment_document_templates (segment_id, document_type, document_label, description, is_required, sort_order)
SELECT s.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM segments s
CROSS JOIN (VALUES
  ('fleet_list', 'Relação de Frota', 'Lista completa de veículos com placa, RENAVAM, ano, tipo e situação', true, 1)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE s.code = 'transport';

-- ============================================
-- LOJAS / FRANQUIAS — doc extra
-- ============================================
INSERT INTO segment_document_templates (segment_id, document_type, document_label, description, is_required, sort_order)
SELECT s.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM segments s
CROSS JOIN (VALUES
  ('franchise_list', 'Relação de Franquias / Lojas', 'Lista de unidades com endereço, faturamento e contratos de franquia', true, 1)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE s.code = 'retail_franchise';

-- ============================================
-- INCORPORADORA — doc extra
-- ============================================
INSERT INTO segment_document_templates (segment_id, document_type, document_label, description, is_required, sort_order)
SELECT s.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM segments s
CROSS JOIN (VALUES
  ('project_board', 'Quadro de Obras Atualizado', 'Detalhamento de obras em andamento: estágio, VGV, custo incorrido, % conclusão, distratos', true, 1)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE s.code = 'developer';

-- ============================================
-- EMPREITEIRA / PRESTADOR DE SERVIÇOS — doc extra
-- ============================================
INSERT INTO segment_document_templates (segment_id, document_type, document_label, description, is_required, sort_order)
SELECT s.id, dt.document_type, dt.document_label, dt.description, dt.is_required, dt.sort_order
FROM segments s
CROSS JOIN (VALUES
  ('backlog', 'Backlog de Contratos', 'Carteira de contratos com valores, prazos, % execução e projeção de receita', true, 1)
) AS dt(document_type, document_label, description, is_required, sort_order)
WHERE s.code = 'contractor';
```

> **Nota:** Segmentos como Comércio, Indústria, Serviços, Saúde, Educação, Energia e Outros podem não ter docs extras na v1 mas a estrutura suporta adição futura via INSERT — zero deploy.

### 3.7 Tabela: `clients`

O cliente (empresa) que está solicitando crédito.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados básicos
  company_name TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  trade_name TEXT,                        -- nome fantasia
  segment_id UUID NOT NULL REFERENCES segments(id),  -- SEGMENTO (define docs extras)
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  
  -- Crédito
  credit_product_id UUID NOT NULL REFERENCES credit_products(id), -- Produto (Padrão, Progredir, etc.)
  requested_amount NUMERIC(15,2),         -- valor pretendido
  approved_amount NUMERIC(15,2),          -- valor aprovado pela mesa
  
  -- Condicionais que ativam docs extras
  has_guarantees BOOLEAN DEFAULT false,    -- operação tem garantias?
  is_judicial_recovery BOOLEAN DEFAULT false, -- empresa em recuperação judicial?
  
  -- Meios circulantes (preenchido na proposta/relatório de visita)
  working_capital_notes JSONB,            -- observações sobre meios circulantes atuais
  
  -- Status da operação
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',                  -- comercial ainda preenchendo
    'pending_documents',      -- aguardando upload de documentos
    'document_validation',    -- agente IA validando documentos
    'document_issues',        -- problemas nos documentos (devolve ao comercial)
    'credit_analysis',        -- em análise de crédito (bureaus + compliance)
    'auto_rejected',          -- indeferido automaticamente (bureau/compliance)
    'pending_report',         -- agente gerando relatório
    'pending_approval',       -- na fila da mesa aprovadora
    'approved',               -- aprovado pela mesa
    'rejected',               -- rejeitado pela mesa
    'pending_partner_docs',   -- aguardando docs dos sócios
    'partner_doc_validation', -- validando docs dos sócios
    'pending_homologation',   -- aguardando homologação no fundo
    'homologated',            -- homologado no fundo
    'homologation_issues',    -- problemas na homologação
    'active',                 -- crédito liberado e ativo
    'risk_management',        -- gestão de risco (atraso 1-30d)
    'recovery',               -- recuperação de ativos (31-90d)
    'litigation',             -- contencioso (90d+)
    'settled',                -- quitado
    'cancelled'               -- cancelado
  )),
  
  -- Ownership
  assigned_to UUID NOT NULL REFERENCES profiles(id),  -- comercial responsável
  team_id UUID NOT NULL REFERENCES teams(id),          -- equipe (denormalizado p/ RLS)
  region_id UUID NOT NULL REFERENCES regions(id),      -- região (denormalizado p/ RLS)
  
  -- CNPJ validation cache
  cnpj_status TEXT,                       -- 'ativa', 'inapta', 'baixada', 'suspensa'
  cnpj_validated_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,              -- quando foi encaminhado pra crédito
  approved_at TIMESTAMPTZ,
  homologated_at TIMESTAMPTZ
);

-- Índices críticos para RLS e queries
CREATE INDEX idx_clients_assigned ON clients(assigned_to);
CREATE INDEX idx_clients_team ON clients(team_id);
CREATE INDEX idx_clients_region ON clients(region_id);
CREATE INDEX idx_clients_segment ON clients(segment_id);
CREATE INDEX idx_clients_product ON clients(credit_product_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_cnpj ON clients(cnpj);
CREATE INDEX idx_clients_created ON clients(created_at DESC);
```

### 3.10 Tabela: `client_guarantees`

Garantias vinculadas à operação do cliente.

```sql
CREATE TABLE client_guarantees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  guarantee_type_id UUID NOT NULL REFERENCES guarantee_types(id),
  
  description TEXT,                       -- "Imóvel na Rua X", "Contrato com Empresa Y"
  estimated_value NUMERIC(15,2),          -- valor estimado da garantia
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_client_guarantees_client ON client_guarantees(client_id);
```

### 3.8 Tabela: `client_documents`

Documentos enviados pelo comercial ou pelo cliente.

```sql
CREATE TABLE client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Documento (tipo base, segmento, produto, garantia ou sócio)
  document_type TEXT NOT NULL,             -- código do tipo 
  document_category TEXT NOT NULL DEFAULT 'base' CHECK (document_category IN (
    'base',            -- documento base exigido para todos (itens 1-9, 15-16)
    'segment',         -- documento extra do segmento (itens 10-14)
    'product',         -- documento extra do produto de crédito (item 17 - Progredir)
    'guarantee',       -- documento da garantia (item 12)
    'conditional',     -- documento condicional (item 9 - recuperação judicial)
    'partner'          -- documento dos sócios (fase 2)
  )),
  segment_template_id UUID REFERENCES segment_document_templates(id),
  product_template_id UUID REFERENCES product_document_templates(id),
  guarantee_template_id UUID REFERENCES guarantee_document_templates(id),
  client_guarantee_id UUID REFERENCES client_guarantees(id),  -- qual garantia específica

  document_label TEXT,                    -- descrição livre ("Balanço 2024")
  reference_year INTEGER,                 -- 2023, 2024, 2025
  reference_month INTEGER,                -- 1-12 (para balancetes e faturamento)
  partner_name TEXT,                      -- nome do sócio (para docs de sócios)
  
  -- Arquivo
  storage_path TEXT NOT NULL,             -- path no Supabase Storage
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Validação IA
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN (
    'pending',        -- aguardando validação
    'processing',     -- agente validando
    'valid',          -- documento válido
    'invalid',        -- documento inválido
    'needs_review'    -- precisa de revisão humana
  )),
  validation_result JSONB,                -- resultado da validação do agente
  validated_at TIMESTAMPTZ,
  
  -- Extração de dados
  extracted_data JSONB,                   -- dados extraídos pelo agente
  
  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_client_docs_client ON client_documents(client_id);
CREATE INDEX idx_client_docs_type ON client_documents(document_type);
CREATE INDEX idx_client_docs_category ON client_documents(document_category);
CREATE INDEX idx_client_docs_validation ON client_documents(validation_status);
```

### 3.6 Tabela: `client_status_history`

Histórico completo de mudanças de status (audit trail).

```sql
CREATE TABLE client_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),  -- NULL se automático
  change_reason TEXT,                        -- motivo da mudança
  metadata JSONB,                            -- dados extras (ex: resultado do bureau)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_status_history_client ON client_status_history(client_id);
CREATE INDEX idx_status_history_created ON client_status_history(created_at DESC);
```

### 3.7 Tabela: `client_assignments`

Histórico de reatribuições (qual comercial cuidou do cliente e quando).

```sql
CREATE TABLE client_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_from UUID REFERENCES profiles(id),  -- de quem
  assigned_to UUID NOT NULL REFERENCES profiles(id),  -- pra quem
  assigned_by UUID NOT NULL REFERENCES profiles(id),  -- quem fez a reatribuição
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_assignments_client ON client_assignments(client_id);
```

### 3.8 Tabela: `sales_goals`

Metas comerciais por período.

```sql
CREATE TABLE sales_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- A quem pertence a meta
  profile_id UUID REFERENCES profiles(id),   -- meta individual
  team_id UUID REFERENCES teams(id),          -- meta da equipe
  region_id UUID REFERENCES regions(id),      -- meta da região
  -- Apenas um dos três deve ser preenchido
  
  -- Período
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,              -- 1-12
  
  -- Metas
  goal_amount NUMERIC(15,2) NOT NULL,         -- meta em R$ (volume de crédito)
  goal_count INTEGER,                          -- meta em quantidade de operações
  
  -- Realizado (atualizado por trigger ou cron)
  achieved_amount NUMERIC(15,2) DEFAULT 0,
  achieved_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT goal_target_check CHECK (
    (profile_id IS NOT NULL)::int +
    (team_id IS NOT NULL)::int +
    (region_id IS NOT NULL)::int = 1
  )
);

CREATE UNIQUE INDEX idx_goals_profile_period 
  ON sales_goals(profile_id, period_year, period_month) 
  WHERE profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_goals_team_period 
  ON sales_goals(team_id, period_year, period_month) 
  WHERE team_id IS NOT NULL;
CREATE UNIQUE INDEX idx_goals_region_period 
  ON sales_goals(region_id, period_year, period_month) 
  WHERE region_id IS NOT NULL;
```

### 3.9 Tabela: `commercial_activities`

Registro de atividades comerciais (visitas, ligações, reuniões).

```sql
CREATE TABLE commercial_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),     -- pode ser NULL (atividade de prospecção)
  profile_id UUID NOT NULL REFERENCES profiles(id),
  
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'visit', 'call', 'meeting', 'email', 'whatsapp', 'proposal', 'follow_up', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Agendamento
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Resultado
  outcome TEXT,                            -- 'positive', 'neutral', 'negative', 'no_show'
  next_action TEXT,                        -- próximo passo combinado
  next_action_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_client ON commercial_activities(client_id);
CREATE INDEX idx_activities_profile ON commercial_activities(profile_id);
CREATE INDEX idx_activities_scheduled ON commercial_activities(scheduled_at);
```

---

## 4. Row Level Security (RLS)

O RLS é a camada que garante que cada usuário veja apenas o que lhe é permitido, diretamente no banco de dados. Isso significa que mesmo que o frontend tenha um bug, o dado nunca vaza.

### 4.1 Função auxiliar: identificar o usuário

```sql
-- Retorna o profile do usuário autenticado
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retorna o role do usuário autenticado
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retorna o team_id do usuário autenticado
CREATE OR REPLACE FUNCTION get_my_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retorna o region_id do usuário (direto ou via team)
CREATE OR REPLACE FUNCTION get_my_region_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    p.region_id,
    t.region_id
  )
  FROM profiles p
  LEFT JOIN teams t ON t.id = p.team_id
  WHERE p.id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 4.2 RLS na tabela `clients`

```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Comercial: vê apenas seus clientes
CREATE POLICY "sales_rep_select" ON clients
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'sales_rep' 
    AND assigned_to = auth.uid()
  );

-- Supervisor: vê clientes da sua equipe
CREATE POLICY "supervisor_select" ON clients
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'sales_supervisor' 
    AND team_id = get_my_team_id()
  );

-- Gerente regional: vê clientes da sua região
CREATE POLICY "manager_select" ON clients
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'sales_manager' 
    AND region_id = get_my_region_id()
  );

-- Diretor / Admin: vê tudo
CREATE POLICY "director_admin_select" ON clients
  FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('sales_director', 'admin')
  );

-- Áreas operacionais (crédito, compliance, etc): veem clientes em análise
CREATE POLICY "operational_select" ON clients
  FOR SELECT TO authenticated
  USING (
    get_my_role() IN (
      'credit_analyst', 'compliance_officer', 'approver', 
      'backoffice', 'legal', 'risk_manager', 'recovery', 'litigation'
    )
  );

-- INSERT: comerciais, supervisores, gerentes e diretores podem criar
CREATE POLICY "sales_insert" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (
    get_my_role() IN (
      'sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin'
    )
  );

-- UPDATE: comercial só atualiza seus clientes em status editável
CREATE POLICY "sales_rep_update" ON clients
  FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'sales_rep' 
    AND assigned_to = auth.uid()
    AND status IN ('draft', 'pending_documents', 'document_issues')
  );

-- UPDATE: supervisor pode atualizar clientes da equipe
CREATE POLICY "supervisor_update" ON clients
  FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'sales_supervisor' 
    AND team_id = get_my_team_id()
  );

-- UPDATE: gerente pode atualizar clientes da região
CREATE POLICY "manager_update" ON clients
  FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'sales_manager' 
    AND region_id = get_my_region_id()
  );
```

### 4.3 RLS na tabela `client_documents`

```sql
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;

-- Segue a mesma lógica do client: se pode ver o client, pode ver seus docs
CREATE POLICY "docs_select" ON client_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_documents.client_id
      -- O RLS do clients já filtra automaticamente
    )
  );

-- INSERT: quem tem acesso ao client pode subir docs
CREATE POLICY "docs_insert" ON client_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_documents.client_id
    )
  );
```

### 4.4 RLS na tabela `sales_goals`

```sql
ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;

-- Comercial: vê apenas sua meta individual
CREATE POLICY "goals_rep" ON sales_goals
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'sales_rep' AND profile_id = auth.uid()
  );

-- Supervisor: vê metas da equipe e dos membros
CREATE POLICY "goals_supervisor" ON sales_goals
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'sales_supervisor' AND (
      team_id = get_my_team_id()
      OR profile_id IN (
        SELECT id FROM profiles WHERE team_id = get_my_team_id()
      )
    )
  );

-- Gerente: vê metas da região, equipes e membros
CREATE POLICY "goals_manager" ON sales_goals
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'sales_manager' AND (
      region_id = get_my_region_id()
      OR team_id IN (
        SELECT id FROM teams WHERE region_id = get_my_region_id()
      )
      OR profile_id IN (
        SELECT p.id FROM profiles p
        JOIN teams t ON t.id = p.team_id
        WHERE t.region_id = get_my_region_id()
      )
    )
  );

-- Diretor / Admin: vê tudo
CREATE POLICY "goals_director" ON sales_goals
  FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('sales_director', 'admin')
  );
```

---

## 5. Supabase Storage — Buckets

```sql
-- Bucket para documentos de clientes (privado)
-- Path convention: {client_id}/{document_type}/{filename}

INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-documents', 'client-documents', false);

-- RLS: usuário só acessa docs de clientes que pode ver
CREATE POLICY "storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-documents'
    AND EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = (storage.foldername(name))[1]::uuid
    )
  );

CREATE POLICY "storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'client-documents'
    AND EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = (storage.foldername(name))[1]::uuid
    )
  );
```

---

## 6. Fluxo do Comercial — Passo a Passo

### 6.1 Documentos Base (obrigatórios para TODOS)

Estes documentos são exigidos independente do segmento, produto ou garantia:

| # | ID | Documento | Instrução |
|---|-----|-----------|-----------|
| 1 | `revenue` | Faturamento 2022, 2023, 2024 e 2025 | Faturamento mês a mês, por ano |
| 2 | `debt_position` | Endividamento Atual (assinado) | Aberto por instituição, saldo, modalidade, garantia, % e vencimento |
| 3 | `balance_sheet_dre` | Balanços e DRE 2023, 2024 e 2025 | Balanço patrimonial + DRE de cada exercício |
| 4 | `balance_trial_comparative` | Balancete Comparativo | Mesmo período, ano atual vs anterior (ex: set/25 x set/24) |
| 5 | `irpf` | IRPF dos Sócios (declaração + recibo) 2024, 2025 | Declaração completa e recibo de entrega |
| 6 | `corporate_docs` | Documentação Societária | Ata, organograma, contrato social e alterações |
| 7 | `partner_id` | CNH ou RG dos Sócios | Documento de identificação com foto |
| 8 | `partner_address_proof` | Comprovante de Endereço dos Sócios | Comprovante recente (máx. 90 dias) |
| 9 | `abc_curve` | Curva ABC — Maiores Clientes e Fornecedores | Ranking por volume dos principais clientes e fornecedores |
| 10 | `visit_report` | Proposta / Relatório de Visita | Incluindo meios circulantes atuais |
| 11 | `superintendent_opinion` | Parecer do Superintendente | Parecer assinado sobre a operação |

### 6.2 Documentos Condicionais

Ativados por flags na operação:

| Condição | Flag no `clients` | Documentos Extras |
|----------|-------------------|-------------------|
| Empresa em Recuperação Judicial | `is_judicial_recovery = true` | Plano de RJ atual, lista de credores, saldo atual da RJ |
| Operação com Garantias | `has_guarantees = true` | Depende do tipo de garantia cadastrada (ver `guarantee_document_templates`) |

```sql
-- Documentos condicionais de Recuperação Judicial
-- Não ficam em tabela separada — são docs base condicionais
-- O checklist os inclui quando is_judicial_recovery = true
```

### 6.3 Documentos por Segmento (extras)

| Segmento | Documento Extra |
|----------|----------------|
| Agronegócio (Grãos) | Quadro de Safras (últimos 2 anos + atual) |
| Transportadora | Relação de Frota |
| Lojas / Franquias | Relação de Franquias / Lojas |
| Incorporadora | Quadro de Obras Atualizado |
| Empreiteira / Prestador | Backlog de Contratos |

### 6.4 Documentos por Produto (extras)

| Produto | Documentos Extras |
|---------|-------------------|
| Crédito Padrão | Nenhum extra |
| Progredir | Cópia contrato vinculado, Histórico IDF, Histórico recebimento, SAP Ariba (RM + NF), taxa de glosa, data de adesão, histórico de operações |

### 6.5 Documentos por Garantia (extras)

| Tipo de Garantia | Documentos Extras |
|-----------------|-------------------|
| Imóvel | Matrícula atualizada, laudo de avaliação, IPTU/ITR |
| Contrato | Cópia do contrato, posição de saldo |
| Veículos | CRV/CRLV, avaliação FIPE/mercado |
| Recebíveis | (a definir com a área) |

### 6.6 Criar Novo Cliente — Fluxo Completo

```
[Comercial clica "Novo Cliente"]
         │
         ▼
[STEP 1: Dados Básicos]
  Nome, CNPJ, Telefone, Email, Endereço, Valor Pretendido
         │
         ▼
[Sistema valida CNPJ na Receita Federal em tempo real]
         │
    ┌────┴────┐
    │         │
  Válido   Inválido/Inapto/Baixado
    │         │
    ▼         ▼
 [Continua  [Erro: "CNPJ inativo/inválido.
  cadastro]  Verifique com o cliente."]
    │
    ▼
[STEP 2: Configuração da Operação]
  ┌─────────────────────────────────────────────┐
  │ Segmento:  [▼ Agronegócio (Grãos)]         │  ← sugerido pelo CNAE
  │ Produto:   [▼ Progredir]                    │  ← tipo de operação
  │                                             │
  │ ☑ Empresa em Recuperação Judicial?          │  ← ativa docs RJ
  │ ☑ Operação com Garantias?                   │  ← ativa seção garantias
  │   → Garantia 1: [▼ Imóvel] "Galpão Av..."  │
  │   → [+ Adicionar garantia]                  │
  └─────────────────────────────────────────────┘
         │
         ▼
[Salva client com status='draft' + segment_id + credit_product_id + flags]
         │
         ▼
[STEP 3: Upload de Documentos — CHECKLIST DINÂMICO]
         │
  O checklist é montado combinando 4 fontes:
         │
  ┌──────┴──────────────────────────────────────────────────────────┐
  │                                                                  │
  │  📋 DOCS BASE (11 itens — todos obrigatórios)                   │
  │  ├─ □ Faturamento 2022, 2023, 2024, 2025                       │
  │  ├─ □ Endividamento atual (assinado)                            │
  │  ├─ □ Balanços e DRE 2023, 2024, 2025                          │
  │  ├─ □ Balancete comparativo (período atual x anterior)          │
  │  ├─ □ IRPF dos sócios (declaração + recibo) 2024, 2025         │
  │  ├─ □ Documentação societária (Ata, organograma, etc.)          │
  │  ├─ □ CNH ou RG dos sócios                                     │
  │  ├─ □ Comprovante de endereço dos sócios                       │
  │  ├─ □ Curva ABC — maiores clientes e fornecedores              │
  │  ├─ □ Proposta / Relatório de visita (com meios circulantes)   │
  │  └─ □ Parecer do Superintendente                               │
  │                                                                  │
  │  🌾 DOCS DO SEGMENTO (Agro Grãos)                               │
  │  └─ □ Quadro de Safras (últimos 2 anos + atual)                │
  │                                                                  │
  │  📦 DOCS DO PRODUTO (Progredir)                                  │
  │  ├─ □ Cópia do contrato vinculado como garantia                │
  │  ├─ □ Histórico IDF (3 períodos, últimos 12 meses)             │
  │  ├─ □ Histórico de recebimento do contrato                     │
  │  ├─ □ Tela SAP Ariba — RM e NF (se performance em andamento)  │
  │  ├─ □ Informar taxa de glosa do contrato                       │
  │  ├─ □ Data de adesão no Progredir                              │
  │  └─ □ Qtd de operações Progredir da empresa/grupo              │
  │                                                                  │
  │  ⚠️  DOCS CONDICIONAIS (Recuperação Judicial = SIM)             │
  │  ├─ □ Plano de Recuperação Judicial atual                      │
  │  ├─ □ Lista de credores                                        │
  │  └─ □ Saldo atual da Recuperação Judicial                      │
  │                                                                  │
  │  🔒 DOCS DAS GARANTIAS (Imóvel)                                 │
  │  ├─ □ Matrícula atualizada do imóvel                           │
  │  ├─ □ Laudo de avaliação                                       │
  │  └─ □ IPTU / ITR                                               │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘
         │
         ▼
[Upload com validação instantânea por arquivo]
[Barra de progresso: "14 de 22 documentos obrigatórios enviados"]
         │
         ▼
[Todos os obrigatórios enviados → "Enviar para Análise" libera]
         │
         ▼
[Status → 'document_validation' → Agente IA valida]
         │
    ┌────┴────┐
    │         │
  Válidos  Problemas → 'document_issues' → Comercial corrige
    │
    ▼
['credit_analysis'] → Segue para bureaus
```

### 6.7 API — Checklist Dinâmico de Documentos

O frontend monta o checklist combinando **4 fontes**: base + segmento + produto + garantias + condicionais:

```typescript
// GET /api/clients/:id/document-checklist

interface DocumentChecklistItem {
  document_type: string;
  document_label: string;
  description: string | null;
  category: 'base' | 'segment' | 'product' | 'guarantee' | 'conditional';
  is_required: boolean;
  guarantee_id?: string;          // se for doc de garantia, qual garantia
  guarantee_label?: string;       // "Imóvel — Galpão Av. Paulista"
  
  // Status atual
  status: 'missing' | 'uploaded' | 'validating' | 'valid' | 'invalid';
  uploaded_file?: {
    id: string;
    file_name: string;
    uploaded_at: string;
    validation_result?: any;
  };
}
```

```sql
-- Função que monta o checklist completo combinando as 4 fontes
CREATE OR REPLACE FUNCTION get_document_checklist(p_client_id UUID)
RETURNS TABLE (
  document_type TEXT,
  document_label TEXT,
  description TEXT,
  category TEXT,
  is_required BOOLEAN,
  guarantee_id UUID,
  status TEXT,
  document_id UUID,
  file_name TEXT,
  validation_status TEXT
) AS $$
DECLARE
  v_client clients%ROWTYPE;
BEGIN
  SELECT * INTO v_client FROM clients WHERE id = p_client_id;

  RETURN QUERY

  -- ========================================
  -- 1. DOCUMENTOS BASE (todos — 11 itens)
  -- ========================================
  SELECT 
    base.doc_type, base.doc_label, base.doc_desc,
    'base'::TEXT, true, NULL::UUID,
    COALESCE(
      CASE WHEN cd.validation_status = 'pending' THEN 'uploaded'
           WHEN cd.validation_status = 'processing' THEN 'validating'
           ELSE cd.validation_status END,
      'missing'
    ),
    cd.id, cd.file_name, cd.validation_status
  FROM (VALUES
    ('revenue',                    'Faturamento 2022, 2023, 2024 e 2025',                    'Faturamento mês a mês por ano'),
    ('debt_position',              'Endividamento Atual (assinado)',                           'Aberto por instituição, saldo, modalidade, garantia, % e vencimento'),
    ('balance_sheet_dre',          'Balanços e DRE 2023, 2024 e 2025',                       'Balanço patrimonial + DRE de cada exercício'),
    ('balance_trial_comparative',  'Balancete Comparativo',                                   'Mesmo período, ano atual vs anterior'),
    ('irpf',                       'IRPF dos Sócios (declaração + recibo) 2024, 2025',       'Declaração completa e recibo de entrega'),
    ('corporate_docs',             'Documentação Societária',                                  'Ata, organograma, contrato social e alterações'),
    ('partner_id',                 'CNH ou RG dos Sócios',                                    'Documento de identificação com foto'),
    ('partner_address_proof',      'Comprovante de Endereço dos Sócios',                      'Comprovante recente (máx. 90 dias)'),
    ('abc_curve',                  'Curva ABC — Maiores Clientes e Fornecedores',             'Ranking por volume'),
    ('visit_report',               'Proposta / Relatório de Visita',                           'Incluindo meios circulantes atuais'),
    ('superintendent_opinion',     'Parecer do Superintendente',                               'Parecer assinado sobre a operação')
  ) AS base(doc_type, doc_label, doc_desc)
  LEFT JOIN client_documents cd 
    ON cd.client_id = p_client_id AND cd.document_type = base.doc_type AND cd.document_category = 'base'

  UNION ALL

  -- ========================================
  -- 2. DOCUMENTOS DO SEGMENTO
  -- ========================================
  SELECT 
    sdt.document_type, sdt.document_label, sdt.description,
    'segment'::TEXT, sdt.is_required, NULL::UUID,
    COALESCE(
      CASE WHEN cd.validation_status = 'pending' THEN 'uploaded'
           WHEN cd.validation_status = 'processing' THEN 'validating'
           ELSE cd.validation_status END,
      'missing'
    ),
    cd.id, cd.file_name, cd.validation_status
  FROM segment_document_templates sdt
  LEFT JOIN client_documents cd 
    ON cd.client_id = p_client_id AND cd.document_type = sdt.document_type AND cd.document_category = 'segment'
  WHERE sdt.segment_id = v_client.segment_id

  UNION ALL

  -- ========================================
  -- 3. DOCUMENTOS DO PRODUTO DE CRÉDITO
  -- ========================================
  SELECT 
    pdt.document_type, pdt.document_label, pdt.description,
    'product'::TEXT, pdt.is_required, NULL::UUID,
    COALESCE(
      CASE WHEN cd.validation_status = 'pending' THEN 'uploaded'
           WHEN cd.validation_status = 'processing' THEN 'validating'
           ELSE cd.validation_status END,
      'missing'
    ),
    cd.id, cd.file_name, cd.validation_status
  FROM product_document_templates pdt
  LEFT JOIN client_documents cd 
    ON cd.client_id = p_client_id AND cd.document_type = pdt.document_type AND cd.document_category = 'product'
  WHERE pdt.product_id = v_client.credit_product_id

  UNION ALL

  -- ========================================
  -- 4. DOCUMENTOS CONDICIONAIS (Recuperação Judicial)
  -- ========================================
  SELECT 
    cond.doc_type, cond.doc_label, cond.doc_desc,
    'conditional'::TEXT, true, NULL::UUID,
    COALESCE(
      CASE WHEN cd.validation_status = 'pending' THEN 'uploaded'
           WHEN cd.validation_status = 'processing' THEN 'validating'
           ELSE cd.validation_status END,
      'missing'
    ),
    cd.id, cd.file_name, cd.validation_status
  FROM (VALUES
    ('rj_plan',          'Plano de Recuperação Judicial Atual',   'Plano vigente aprovado pelo juízo'),
    ('rj_creditors',     'Lista de Credores',                     'Lista atualizada de credores da RJ'),
    ('rj_balance',       'Saldo Atual da Recuperação Judicial',   'Posição atualizada dos pagamentos da RJ')
  ) AS cond(doc_type, doc_label, doc_desc)
  LEFT JOIN client_documents cd 
    ON cd.client_id = p_client_id AND cd.document_type = cond.doc_type AND cd.document_category = 'conditional'
  WHERE v_client.is_judicial_recovery = true

  UNION ALL

  -- ========================================
  -- 5. DOCUMENTOS DAS GARANTIAS (por garantia cadastrada)
  -- ========================================
  SELECT 
    gdt.document_type, 
    gdt.document_label || ' — ' || COALESCE(cg.description, gt.name),
    gdt.description,
    'guarantee'::TEXT, gdt.is_required, cg.id,
    COALESCE(
      CASE WHEN cd.validation_status = 'pending' THEN 'uploaded'
           WHEN cd.validation_status = 'processing' THEN 'validating'
           ELSE cd.validation_status END,
      'missing'
    ),
    cd.id, cd.file_name, cd.validation_status
  FROM client_guarantees cg
  JOIN guarantee_types gt ON gt.id = cg.guarantee_type_id
  JOIN guarantee_document_templates gdt ON gdt.guarantee_type_id = gt.id
  LEFT JOIN client_documents cd 
    ON cd.client_id = p_client_id 
    AND cd.document_type = gdt.document_type 
    AND cd.document_category = 'guarantee'
    AND cd.client_guarantee_id = cg.id
  WHERE cg.client_id = p_client_id AND v_client.has_guarantees = true

  ORDER BY category, is_required DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6.8 Validação: pode enviar para análise?

```sql
CREATE OR REPLACE FUNCTION can_submit_for_analysis(p_client_id UUID)
RETURNS TABLE (
  can_submit BOOLEAN,
  total_required INTEGER,
  total_uploaded INTEGER,
  missing_documents TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH checklist AS (
    SELECT * FROM get_document_checklist(p_client_id)
    WHERE is_required = true
  )
  SELECT
    NOT EXISTS (SELECT 1 FROM checklist WHERE status = 'missing') AS can_submit,
    COUNT(*)::INTEGER AS total_required,
    COUNT(*) FILTER (WHERE status != 'missing')::INTEGER AS total_uploaded,
    ARRAY_AGG(document_label) FILTER (WHERE status = 'missing') AS missing_documents
  FROM checklist;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6.9 Regras de Status que o Comercial pode ver

| Status | O que o comercial vê | Pode editar? |
|--------|---------------------|-------------|
| `draft` | "Rascunho — Complete os dados" | ✅ Tudo |
| `pending_documents` | "Envie os documentos pendentes" | ✅ Upload de docs |
| `document_issues` | "Corrija os documentos sinalizados" | ✅ Reenvio de docs |
| `document_validation` | "Documentos em análise" | ❌ Aguardando |
| `credit_analysis` | "Em análise de crédito" | ❌ Aguardando |
| `auto_rejected` | "Operação não aprovada" | ❌ Apenas visualiza |
| `pending_approval` | "Aguardando aprovação" | ❌ Aguardando |
| `approved` | "Crédito aprovado! 🎉" | ❌ Apenas visualiza |
| `rejected` | "Operação não aprovada" | ❌ Apenas visualiza |
| `pending_partner_docs` | "Aguardando docs dos sócios" | ❌ (cliente faz) |
| `active` | "Crédito ativo" | ❌ Apenas visualiza |

**Regra importante:** o comercial NUNCA vê detalhes de bureaus, compliance, score interno ou parecer do agente de IA. Ele vê apenas o status resumido e mensagens de ação quando precisa intervir.

---

## 7. Dashboard do Comercial

### 7.1 Visão principal

O dashboard do comercial é focado em ação — "o que eu preciso fazer agora":

**Cards de resumo (topo):**
- Clientes ativos (quantidade)
- Operações em andamento
- Meta do mês: R$ X / R$ Y (barra de progresso)
- Conversão do funil (% de aprovados)

**Lista de pendências (destaque):**
- "3 clientes com documentos pendentes"
- "1 cliente com documento rejeitado — ação necessária"
- "2 propostas aguardando aprovação"

**Pipeline visual (kanban ou funil):**

```
Rascunho → Documentos → Em Análise → Aprovação → Aprovado → Ativo
   (3)        (5)          (2)          (1)         (4)      (12)
```

### 7.2 Visão do Supervisor

Tudo que o comercial vê, MAIS:
- Pipeline consolidado da equipe
- Ranking dos comerciais (por volume, conversão, tempo médio)
- Clientes sem atividade há X dias (alerta)
- Botão de reatribuir cliente entre comerciais da equipe

### 7.3 Visão do Gerente Regional

Tudo que o supervisor vê, MAIS:
- Pipeline consolidado da região
- Comparação entre equipes (qual equipe performa melhor)
- Meta da região vs realizado
- Reatribuição entre equipes
- Mapa de calor por cidade/estado (onde estão os clientes)

### 7.4 Visão do Diretor Comercial

Tudo que o gerente vê, MAIS:
- Pipeline nacional
- Comparação entre regiões
- Meta global vs realizado
- Tendências (mês a mês, ano a ano)
- Reatribuição entre regiões

---

## 8. Pipeline de Vendas — Funil

### 8.1 Estágios do Funil

O funil do comercial mapeia diretamente para os status do cliente, mas com nomes amigáveis:

| Estágio do Funil | Status técnico | Contagem |
|-------------------|---------------|----------|
| Prospecção | `draft` | Rascunhos não enviados |
| Documentação | `pending_documents`, `document_issues` | Aguardando docs completos |
| Análise | `document_validation`, `credit_analysis` | Sistema processando |
| Aprovação | `pending_report`, `pending_approval` | Na mesa aprovadora |
| Aprovado | `approved`, `pending_partner_docs`, `partner_doc_validation` | Crédito aprovado, finalizando |
| Ativo | `pending_homologation`, `homologated`, `active` | Operação concluída |
| Perdido | `auto_rejected`, `rejected`, `cancelled` | Não converteu |

### 8.2 Métricas do Funil

```sql
-- View materializada para performance do funil (atualiza a cada 5 min)
CREATE MATERIALIZED VIEW mv_pipeline_metrics AS
SELECT
  c.assigned_to,
  c.team_id,
  c.region_id,
  c.segment_id,
  DATE_TRUNC('month', c.created_at) AS month,
  
  -- Contagens por estágio
  COUNT(*) FILTER (WHERE c.status = 'draft') AS count_draft,
  COUNT(*) FILTER (WHERE c.status IN ('pending_documents','document_issues')) AS count_docs,
  COUNT(*) FILTER (WHERE c.status IN ('document_validation','credit_analysis')) AS count_analysis,
  COUNT(*) FILTER (WHERE c.status IN ('pending_report','pending_approval')) AS count_approval,
  COUNT(*) FILTER (WHERE c.status IN ('approved','pending_partner_docs','partner_doc_validation')) AS count_approved,
  COUNT(*) FILTER (WHERE c.status IN ('pending_homologation','homologated','active')) AS count_active,
  COUNT(*) FILTER (WHERE c.status IN ('auto_rejected','rejected','cancelled')) AS count_lost,
  
  -- Valores por estágio
  SUM(c.requested_amount) FILTER (WHERE c.status NOT IN ('auto_rejected','rejected','cancelled')) AS total_pipeline_amount,
  SUM(c.approved_amount) FILTER (WHERE c.approved_amount IS NOT NULL) AS total_approved_amount,
  
  -- Tempos médios
  AVG(EXTRACT(EPOCH FROM (c.submitted_at - c.created_at))/3600) 
    FILTER (WHERE c.submitted_at IS NOT NULL) AS avg_hours_to_submit,
  AVG(EXTRACT(EPOCH FROM (c.approved_at - c.submitted_at))/3600) 
    FILTER (WHERE c.approved_at IS NOT NULL) AS avg_hours_to_approve

FROM clients c
GROUP BY c.assigned_to, c.team_id, c.region_id, c.segment_id, DATE_TRUNC('month', c.created_at);

-- Refresh a cada 5 minutos via pg_cron
SELECT cron.schedule('refresh-pipeline', '*/5 * * * *', 
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pipeline_metrics');
```

---

## 9. Metas Comerciais

### 9.1 Estrutura de Metas

Metas podem ser definidas em três níveis:
- **Individual:** meta do comercial (R$ e/ou quantidade)
- **Equipe:** meta do time (soma das metas individuais ou meta independente)
- **Regional:** meta da região

### 9.2 Cálculo do Realizado

O "realizado" conta operações que chegaram ao status `approved` ou posterior no período:

```sql
-- Trigger que atualiza o realizado quando um cliente é aprovado
CREATE OR REPLACE FUNCTION update_sales_goals_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Meta individual
    UPDATE sales_goals
    SET 
      achieved_amount = achieved_amount + COALESCE(NEW.approved_amount, 0),
      achieved_count = achieved_count + 1,
      updated_at = now()
    WHERE 
      profile_id = NEW.assigned_to
      AND period_year = EXTRACT(YEAR FROM now())
      AND period_month = EXTRACT(MONTH FROM now());
    
    -- Meta da equipe
    UPDATE sales_goals
    SET 
      achieved_amount = achieved_amount + COALESCE(NEW.approved_amount, 0),
      achieved_count = achieved_count + 1,
      updated_at = now()
    WHERE 
      team_id = NEW.team_id
      AND period_year = EXTRACT(YEAR FROM now())
      AND period_month = EXTRACT(MONTH FROM now());
    
    -- Meta da região
    UPDATE sales_goals
    SET 
      achieved_amount = achieved_amount + COALESCE(NEW.approved_amount, 0),
      achieved_count = achieved_count + 1,
      updated_at = now()
    WHERE 
      region_id = NEW.region_id
      AND period_year = EXTRACT(YEAR FROM now())
      AND period_month = EXTRACT(MONTH FROM now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_goals
  AFTER UPDATE OF status ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_goals_on_approval();
```

### 9.3 O que cada nível vê nas metas

| Nível | Vê sua meta? | Vê meta dos outros? | Vê ranking? |
|-------|-------------|---------------------|-------------|
| Comercial | ✅ Sua meta individual | ❌ | ❌ (não vê colegas) |
| Supervisor | ✅ Meta da equipe | ✅ Meta individual de cada membro | ✅ Ranking da equipe |
| Gerente | ✅ Meta da região | ✅ Metas de equipes e indivíduos | ✅ Ranking entre equipes |
| Diretor | ✅ Meta nacional | ✅ Tudo | ✅ Ranking entre regiões |

---

## 10. Reatribuição de Clientes

### 10.1 Quem pode reatribuir para quem

```sql
CREATE OR REPLACE FUNCTION reassign_client(
  p_client_id UUID,
  p_new_assignee UUID,
  p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_my_role TEXT;
  v_my_team UUID;
  v_my_region UUID;
  v_client_team UUID;
  v_client_region UUID;
  v_new_assignee_team UUID;
  v_old_assignee UUID;
BEGIN
  SELECT role, team_id INTO v_my_role, v_my_team FROM profiles WHERE id = auth.uid();
  SELECT get_my_region_id() INTO v_my_region;
  SELECT team_id, region_id, assigned_to INTO v_client_team, v_client_region, v_old_assignee 
    FROM clients WHERE id = p_client_id;
  SELECT team_id INTO v_new_assignee_team FROM profiles WHERE id = p_new_assignee;

  -- Validações
  IF v_my_role = 'sales_supervisor' THEN
    -- Só pode reatribuir dentro da sua equipe
    IF v_client_team != v_my_team OR v_new_assignee_team != v_my_team THEN
      RAISE EXCEPTION 'Supervisor só pode reatribuir dentro da própria equipe';
    END IF;
    
  ELSIF v_my_role = 'sales_manager' THEN
    -- Pode reatribuir dentro da região
    IF v_client_region != v_my_region THEN
      RAISE EXCEPTION 'Gerente só pode reatribuir dentro da própria região';
    END IF;
    
  ELSIF v_my_role NOT IN ('sales_director', 'admin') THEN
    RAISE EXCEPTION 'Sem permissão para reatribuir clientes';
  END IF;

  -- Executa reatribuição
  UPDATE clients 
  SET assigned_to = p_new_assignee, 
      team_id = v_new_assignee_team,
      updated_at = now()
  WHERE id = p_client_id;

  -- Registra no histórico
  INSERT INTO client_assignments (client_id, assigned_from, assigned_to, assigned_by, reason)
  VALUES (p_client_id, v_old_assignee, p_new_assignee, auth.uid(), p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 11. Notificações do Comercial

### 11.1 Eventos que geram notificação

| Evento | Canal | Mensagem |
|--------|-------|----------|
| Documento rejeitado pela IA | In-app + Email | "Documento X do cliente Y precisa ser reenviado: [motivo]" |
| Cliente indeferido automaticamente | In-app | "Cliente X foi indeferido: [motivo resumido]" |
| Cliente aprovado pela mesa | In-app + Email | "Cliente X foi aprovado! Valor: R$ Y" |
| Cliente rejeitado pela mesa | In-app | "Cliente X não foi aprovado" |
| Cliente sem atividade há 7 dias | In-app | "Você tem 3 clientes parados há mais de 7 dias" |
| Meta atingida | In-app | "Parabéns! Você atingiu sua meta do mês 🎉" |
| Cliente reatribuído para você | In-app + Email | "O cliente X foi transferido para sua carteira" |
| Cliente reatribuído de você | In-app | "O cliente X foi transferido para [nome]" |

### 11.2 Tabela de notificações

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  
  type TEXT NOT NULL,           -- 'document_rejected', 'client_approved', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Referências
  client_id UUID REFERENCES clients(id),
  metadata JSONB,
  
  -- Status
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_profile ON notifications(profile_id, read_at);
```

---

## 12. API Endpoints — Módulo Comercial

### 12.1 Clientes

```
POST   /api/clients                    → Criar cliente (draft) com segment_id
GET    /api/clients                    → Listar clientes (RLS filtra)
GET    /api/clients/:id                → Detalhe do cliente
PATCH  /api/clients/:id                → Atualizar dados básicos (inclui segment_id)
POST   /api/clients/:id/submit         → Enviar para análise (valida docs obrigatórios)
POST   /api/clients/:id/reassign       → Reatribuir cliente

GET    /api/clients/:id/document-checklist  → Checklist dinâmico (base + segmento)
GET    /api/clients/:id/can-submit          → Verifica se pode enviar para análise
GET    /api/clients/:id/documents      → Listar documentos enviados
POST   /api/clients/:id/documents      → Upload de documento
DELETE /api/clients/:id/documents/:did  → Remover documento (só em draft/pending)

GET    /api/clients/:id/history        → Histórico de status
GET    /api/clients/:id/activities     → Atividades comerciais
POST   /api/clients/:id/activities     → Registrar atividade
```

### 12.2 Segmentos

```
GET    /api/segments                   → Listar segmentos ativos
GET    /api/segments/:id/documents     → Listar templates de docs do segmento
```

### 12.3 Pipeline e Metas

```
GET    /api/pipeline                   → Funil do usuário (RLS filtra)
GET    /api/pipeline/metrics           → Métricas do funil
GET    /api/pipeline/by-segment        → Funil quebrado por segmento
GET    /api/goals                      → Metas do período atual
GET    /api/goals/history              → Histórico de metas

GET    /api/team/members               → Membros da equipe (supervisor+)
GET    /api/team/ranking               → Ranking da equipe (supervisor+)
GET    /api/region/teams               → Equipes da região (gerente+)
GET    /api/region/ranking             → Ranking entre equipes (gerente+)
```

### 12.4 Validação de CNPJ

```
GET    /api/cnpj/:cnpj/validate        → Consulta Receita Federal em tempo real
```

**Response:**
```json
{
  "cnpj": "12.345.678/0001-90",
  "status": "ativa",
  "company_name": "EMPRESA EXEMPLO LTDA",
  "trade_name": "EXEMPLO",
  "opening_date": "2015-03-10",
  "legal_nature": "Sociedade Empresária Limitada",
  "address": { ... },
  "partners": [
    { "name": "FULANO DA SILVA", "role": "Sócio-Administrador" },
    { "name": "CICLANA SANTOS", "role": "Sócio" }
  ],
  "primary_activity": { "code": "62.01-5-01", "description": "Desenvolvimento de software" },
  "suggested_segment": {
    "id": "uuid-do-segmento",
    "code": "services",
    "name": "Serviços",
    "confidence": "high"
  },
  "can_proceed": true
}
```

O campo `suggested_segment` é inferido a partir do CNAE principal retornado pela Receita Federal. O mapeamento CNAE → Segmento é configurável:

```sql
CREATE TABLE cnae_segment_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnae_code TEXT NOT NULL,                -- '01.11-3' (agricultura)
  cnae_group TEXT NOT NULL,               -- '01' (grupo)
  segment_id UUID NOT NULL REFERENCES segments(id),
  confidence TEXT DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cnae_mapping_code ON cnae_segment_mapping(cnae_code);
CREATE INDEX idx_cnae_mapping_group ON cnae_segment_mapping(cnae_group);

-- Exemplos de mapeamento
INSERT INTO cnae_segment_mapping (cnae_code, cnae_group, segment_id, confidence)
SELECT '01', '01', id, 'high' FROM segments WHERE code = 'agro'       -- Agricultura
UNION ALL
SELECT '49', '49', id, 'high' FROM segments WHERE code = 'transport'  -- Transporte terrestre
UNION ALL
SELECT '41', '41', id, 'high' FROM segments WHERE code = 'construction' -- Construção
UNION ALL
SELECT '86', '86', id, 'high' FROM segments WHERE code = 'health'     -- Saúde
UNION ALL
SELECT '35', '35', id, 'high' FROM segments WHERE code = 'energy';    -- Energia
```

O frontend sugere o segmento automaticamente, mas o comercial pode alterar (ele conhece melhor o cliente).

Se `can_proceed: false`, o frontend bloqueia o cadastro e mostra o motivo.

---

## 13. Edge Functions (Supabase)

### 13.1 Validação de CNPJ

```typescript
// supabase/functions/validate-cnpj/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { cnpj } = await req.json();
  
  // Consulta API da Receita Federal (via BrasilAPI ou ReceitaWS)
  const response = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/\D/g, '')}`
  );
  
  const data = await response.json();
  
  const canProceed = data.situacao_cadastral === 2; // 2 = Ativa
  
  return new Response(JSON.stringify({
    cnpj: data.cnpj,
    status: data.descricao_situacao_cadastral?.toLowerCase(),
    company_name: data.razao_social,
    trade_name: data.nome_fantasia,
    partners: data.qsa?.map(q => ({
      name: q.nome_socio,
      role: q.qualificacao_socio
    })),
    can_proceed: canProceed,
    reason: canProceed ? null : `CNPJ ${data.descricao_situacao_cadastral}`
  }));
});
```

### 13.2 Trigger de mudança de status

```typescript
// supabase/functions/on-status-change/index.ts
// Invocado via Database Webhook quando client.status muda

serve(async (req) => {
  const { record, old_record } = await req.json();
  
  // 1. Registra no histórico
  await supabase.from('client_status_history').insert({
    client_id: record.id,
    from_status: old_record.status,
    to_status: record.status,
    changed_by: record.updated_by
  });
  
  // 2. Notifica o comercial se necessário
  if (record.status === 'document_issues') {
    await supabase.from('notifications').insert({
      profile_id: record.assigned_to,
      type: 'document_rejected',
      title: 'Documento precisa de correção',
      message: `Cliente ${record.company_name} tem documentos pendentes`,
      client_id: record.id
    });
  }
  
  if (record.status === 'approved') {
    await supabase.from('notifications').insert({
      profile_id: record.assigned_to,
      type: 'client_approved',
      title: 'Crédito aprovado!',
      message: `Cliente ${record.company_name} — R$ ${record.approved_amount}`,
      client_id: record.id
    });
  }
  
  // 3. Se encaminhado para crédito, dispara workflow
  if (record.status === 'credit_analysis' && old_record.status === 'document_validation') {
    // Publica evento para o Temporal iniciar o workflow de análise
    await publishEvent('credit.analysis.start', { clientId: record.id });
  }
});
```

---

## 14. Considerações de Performance

### 14.1 Índices Críticos

Os índices já definidos nas tabelas cobrem os queries principais. Adicionalmente:

```sql
-- Composite index para o dashboard do comercial (query mais frequente)
CREATE INDEX idx_clients_assigned_status 
  ON clients(assigned_to, status) 
  WHERE status NOT IN ('settled', 'cancelled');

-- Composite index para o pipeline do supervisor
CREATE INDEX idx_clients_team_status 
  ON clients(team_id, status) 
  WHERE status NOT IN ('settled', 'cancelled');

-- Composite index para o pipeline do gerente
CREATE INDEX idx_clients_region_status 
  ON clients(region_id, status) 
  WHERE status NOT IN ('settled', 'cancelled');

-- Para busca de clientes com pendências
CREATE INDEX idx_clients_pending_action
  ON clients(assigned_to, updated_at)
  WHERE status IN ('draft', 'pending_documents', 'document_issues');
```

### 14.2 Realtime

```typescript
// Frontend: subscribe a mudanças nos clientes do comercial
const channel = supabase
  .channel('my-clients')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'clients',
    filter: `assigned_to=eq.${userId}`
  }, (payload) => {
    // Atualiza o status na UI em tempo real
    updateClientInPipeline(payload.new);
  })
  .subscribe();
```

---

## 15. Próximas Definições

Itens pendentes para a próxima iteração deste documento:

- ~~Segmentos e documentos extras~~ ✅ Definido com dados reais do comercial
- ~~Documentos por produto de crédito (Progredir)~~ ✅ Modelado
- ~~Documentos por tipo de garantia~~ ✅ Modelado (imóvel, contrato, veículo)
- ~~Documentos condicionais (RJ)~~ ✅ Modelado
- **Hierarquia exata:** aguardando confirmação do cliente sobre níveis organizacionais
- **Tipo de meta:** por volume (R$), por quantidade, ou ambos?
- **Mapeamento CNAE → Segmento:** completar a tabela `cnae_segment_mapping` com todos os CNAEs relevantes
- **Documentos de garantia — Recebíveis, Aval, Estoque:** definir com a área quais docs exigir
- **Novos produtos de crédito:** à medida que surgirem, adicionar via `credit_products` + `product_document_templates`
- **Regras de indeferimento automático:** thresholds específicos (score mínimo, valor máximo de protestos, etc.)
- **Telas:** wireframes do dashboard comercial, pipeline, tela de cadastro (step 1-2-3) e checklist dinâmico
- **Testes:** plano de testes para RLS policies e validação de checklist por combinação de segmento+produto+garantia
- **Admin de configurações:** tela para o backoffice criar/editar segmentos, produtos, garantias e templates de docs sem deploy
