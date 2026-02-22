'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../../_components/page-wrapper';
import { SectionHeading } from '../../_components/section-heading';
import {
  ArrowRightLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Database,
  ArrowRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type FieldStatus = 'mapped' | 'transformed' | 'dropped' | 'new';

interface FieldMapping {
  legacy: string;
  legacyType?: string;
  newField: string | null;
  newType: string | null;
  status: FieldStatus;
  note?: string;
}

interface TableMapping {
  legacyTable: string;
  system: 'NetFactor' | 'SGS' | 'DLDB' | 'DLSA' | 'credito';
  newTable: string | null;
  status: 'full' | 'partial' | 'dropped' | 'split';
  note?: string;
  fields?: FieldMapping[];
}

interface Domain {
  id: string;
  name: string;
  color: string;
  legacyPrefix: string;
  tables: TableMapping[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const domains: Domain[] = [
  {
    id: 'clients',
    name: 'Clientes (Cedentes)',
    color: 'emerald',
    legacyPrefix: 'cadastro_clientes_*',
    tables: [
      {
        legacyTable: 'cadastro_clientes_dados_basicos',
        system: 'NetFactor',
        newTable: 'clients',
        status: 'partial',
        note: 'Campos PF/PJ, compliance e datas de ciclo adicionados na nova entidade. Campo binário `documento` migrado para Supabase Storage via client_documents.',
        fields: [
          { legacy: 'id_clientes_dados_basicos', legacyType: 'int', newField: '— (substituído por UUID)', newType: 'uuid', status: 'transformed', note: 'PK nova é UUID gerado pelo Postgres' },
          { legacy: 'id_sgs', legacyType: 'int', newField: 'legacy_sgs_id', newType: 'integer', status: 'mapped', note: 'Mantido para rastreabilidade' },
          { legacy: 'id_net_factor', legacyType: 'int', newField: 'legacy_nf_id', newType: 'integer', status: 'mapped', note: 'Mantido para rastreabilidade' },
          { legacy: 'cpf', legacyType: 'varchar(11)', newField: 'cpf', newType: 'text', status: 'mapped' },
          { legacy: 'cnpj', legacyType: 'varchar(14)', newField: 'cnpj', newType: 'text', status: 'mapped' },
          { legacy: 'cnpj_raiz', legacyType: 'varchar(8)', newField: 'cnpj_root', newType: 'text', status: 'mapped' },
          { legacy: 'tipo_pf_pj', legacyType: 'varchar(2)', newField: 'person_type', newType: "text ('individual'|'company')", status: 'transformed', note: "PF→'individual', PJ→'company'" },
          { legacy: 'nome / razao_social', legacyType: 'varchar(200)', newField: 'company_name / legal_name', newType: 'text', status: 'mapped' },
          { legacy: 'nome_fantasia', legacyType: 'varchar(200)', newField: 'trade_name', newType: 'text', status: 'mapped' },
          { legacy: 'inscr_estadual / inscr_municipal', legacyType: 'varchar(20)', newField: 'state_registration / city_registration', newType: 'text', status: 'mapped' },
          { legacy: 'rg / rg_orgao_emissor / rg_data_emissao', legacyType: 'varchar', newField: 'rg / rg_issuer / rg_issued_at', newType: 'text / date', status: 'mapped' },
          { legacy: 'cnh / cnh_data_emissao', legacyType: 'varchar', newField: 'cnh_number / cnh_issued_at', newType: 'text / date', status: 'mapped' },
          { legacy: 'passaporte', legacyType: 'varchar(20)', newField: 'passport_number', newType: 'text', status: 'mapped' },
          { legacy: 'identidade_estrangeira', legacyType: 'varchar(30)', newField: 'foreign_id', newType: 'text', status: 'mapped' },
          { legacy: 'data_nascimento', legacyType: 'date', newField: 'birth_date', newType: 'date', status: 'mapped' },
          { legacy: 'sexo', legacyType: 'char(1)', newField: 'gender', newType: "text ('M'|'F'|'other')", status: 'mapped' },
          { legacy: 'naturalidade / nacionalidade', legacyType: 'varchar', newField: 'naturality / nationality', newType: 'text', status: 'mapped' },
          { legacy: 'nome_mae / nome_pai', legacyType: 'varchar(100)', newField: 'mother_name / father_name', newType: 'text', status: 'mapped' },
          { legacy: 'data_fundacao / data_constituicao', legacyType: 'date', newField: 'founded_at / established_at', newType: 'date', status: 'mapped' },
          { legacy: 'declaracao_pep / declaracao_pep_relacionado', legacyType: 'bit', newField: 'is_pep / is_pep_related', newType: 'boolean', status: 'transformed', note: "bit→boolean" },
          { legacy: 'status_cadastro', legacyType: "varchar(10) 'ATIVO'|'INATIVO'|'EXCLUIDO'", newField: 'status (no clients)', newType: "text enum via deleted_at", status: 'transformed', note: 'EXCLUIDO vira soft delete (deleted_at)' },
          { legacy: 'documento', legacyType: 'varbinary', newField: 'client_documents.storage_path', newType: 'text (Storage)', status: 'transformed', note: 'Binário migrado para Supabase Storage' },
          { legacy: 'data_carga', legacyType: 'datetime2', newField: 'created_at', newType: 'timestamptz', status: 'transformed' },
        ],
      },
      {
        legacyTable: 'cadastro_clientes_dados_contato',
        system: 'NetFactor',
        newTable: 'client_contacts',
        status: 'full',
        note: 'Tabela 1:N mantida. email_bkp e telefone_fax descartados.',
        fields: [
          { legacy: 'nome_contato', legacyType: 'varchar(200)', newField: 'contact_name', newType: 'text', status: 'mapped' },
          { legacy: 'email / email_multiplo', legacyType: 'varchar(1000)', newField: 'email', newType: 'text', status: 'mapped', note: 'email_multiplo separado em registros distintos' },
          { legacy: 'email_bkp', legacyType: 'varchar(1000)', newField: null, newType: null, status: 'dropped', note: 'Artefato de integração sem propósito' },
          { legacy: 'telefone / telefone_cel / telefone_sms', legacyType: 'varchar(300)', newField: 'phone / phone_mobile / phone_sms', newType: 'text', status: 'mapped' },
          { legacy: 'telefone_fax / fax', legacyType: 'varchar / bit', newField: null, newType: null, status: 'dropped', note: 'Fax descontinuado' },
          { legacy: 'whatsapp', legacyType: 'bit', newField: 'whatsapp', newType: 'boolean', status: 'mapped' },
          { legacy: 'uso', legacyType: 'varchar(100)', newField: 'use_type', newType: "text ('commercial'|'financial'|'operational'|'billing')", status: 'transformed' },
          { legacy: 'email_principal / telefone_principal', legacyType: 'bit', newField: 'is_primary', newType: 'boolean', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'cadastro_clientes_dados_endereco',
        system: 'NetFactor',
        newTable: 'client_addresses',
        status: 'full',
        fields: [
          { legacy: 'logradouro', legacyType: 'varchar(250)', newField: 'street', newType: 'text', status: 'mapped' },
          { legacy: 'numero / sem_numero', legacyType: 'varchar(20) / bit', newField: 'number / without_number', newType: 'text / boolean', status: 'mapped' },
          { legacy: 'complemento', legacyType: 'varchar(100)', newField: 'complement', newType: 'text', status: 'mapped' },
          { legacy: 'cep', legacyType: 'varchar(8)', newField: 'zip_code', newType: 'text', status: 'mapped' },
          { legacy: 'bairro', legacyType: 'varchar(100)', newField: 'neighborhood', newType: 'text', status: 'mapped' },
          { legacy: 'cidade', legacyType: 'varchar(200)', newField: 'city', newType: 'text', status: 'mapped' },
          { legacy: 'estado', legacyType: 'char(2)', newField: 'state', newType: 'char(2)', status: 'mapped' },
          { legacy: 'uso', legacyType: 'varchar(100)', newField: 'use_type', newType: "text ('commercial'|'fiscal'|'correspondence'|'billing')", status: 'transformed' },
          { legacy: 'endereco_principal', legacyType: 'bit', newField: 'is_primary', newType: 'boolean', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'cadastro_clientes_dados_bancarios',
        system: 'NetFactor',
        newTable: 'client_bank_accounts',
        status: 'full',
        fields: [
          { legacy: 'cod_bacen', legacyType: 'int', newField: 'bank_code', newType: 'text', status: 'transformed', note: 'int→text para código com zeros à esquerda' },
          { legacy: 'nome_banco', legacyType: 'varchar(200)', newField: 'bank_name', newType: 'text', status: 'mapped' },
          { legacy: 'cod_agencia', legacyType: 'varchar(20)', newField: 'branch', newType: 'text', status: 'mapped' },
          { legacy: 'conta_digito', legacyType: 'varchar(40)', newField: 'account_number', newType: 'text', status: 'mapped' },
          { legacy: 'chave_pix', legacyType: 'varchar(200)', newField: 'pix_key', newType: 'text', status: 'mapped' },
          { legacy: 'apelido_conta', legacyType: 'varchar(100)', newField: 'nickname', newType: 'text', status: 'mapped' },
          { legacy: 'data_inclusao / data_exclusao', legacyType: 'date', newField: 'opened_at / closed_at', newType: 'date', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'cadastro_clientes_dados_autorizados',
        system: 'NetFactor',
        newTable: 'client_authorized_persons',
        status: 'full',
        fields: [
          { legacy: 'tipo', legacyType: 'varchar', newField: 'authorization_type', newType: "text ('partner'|'attorney'|'legal_representative'|'authorized')", status: 'transformed' },
          { legacy: 'nome / cpf / telefone / email', legacyType: 'varchar', newField: 'full_name / cpf / phone / email', newType: 'text', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'cadastro_clientes_dados_adicionais',
        system: 'NetFactor',
        newTable: 'clients (campos inline)',
        status: 'partial',
        note: 'Dados de compliance e ciclo de vida inline na tabela clients. Gerente responsável mapeado para profiles via assigned_to.',
        fields: [
          { legacy: 'cpf_gerente_responsavel / id_gerente_responsavel', legacyType: 'varchar / int', newField: 'assigned_to', newType: 'uuid FK → profiles', status: 'transformed', note: 'Gerente buscado pelo CPF no profiles' },
          { legacy: 'data_inclusao_prospect', legacyType: 'date', newField: 'prospect_at', newType: 'timestamptz', status: 'mapped' },
          { legacy: 'data_aprovacao_cadastro', legacyType: 'date', newField: 'approved_at', newType: 'timestamptz', status: 'mapped' },
          { legacy: 'data_renovacao_cadastral', legacyType: 'date', newField: 'renewed_at', newType: 'timestamptz', status: 'mapped' },
          { legacy: 'data_encerramento_cadastro', legacyType: 'date', newField: 'closed_at', newType: 'timestamptz', status: 'mapped' },
          { legacy: 'motivo_encerramento', legacyType: 'varchar(100)', newField: 'closure_reason', newType: 'text', status: 'mapped' },
          { legacy: 'pep_monitoramento / lista_ofac', legacyType: 'bit', newField: 'is_pep / is_ofac_listed', newType: 'boolean', status: 'mapped' },
          { legacy: 'profissao_risco / atividade_risco / cidade_risco', legacyType: 'bit', newField: 'has_risk_profession / has_risk_activity / has_risk_city', newType: 'boolean', status: 'mapped' },
          { legacy: 'situacao_cadastral_receita', legacyType: 'varchar(100)', newField: 'revenue_situation', newType: 'text', status: 'mapped' },
          { legacy: 'id_nf_grupo_economico / id_sgs_grupo_economico', legacyType: 'int', newField: 'economic_group_id', newType: 'uuid FK → economic_groups', status: 'transformed', note: 'Lookup por legacy IDs durante migração' },
          { legacy: 'nome_gerente_responsavel / email_gerente_responsavel / telefone_gerente_responsavel', legacyType: 'varchar', newField: null, newType: null, status: 'dropped', note: 'Redundante — dados em profiles' },
        ],
      },
      {
        legacyTable: 'cadastro_clientes_grupo_cedentes',
        system: 'NetFactor',
        newTable: 'economic_groups',
        status: 'full',
        note: 'Grupos de cedentes e sacados unificados em economic_groups com type discriminator.',
        fields: [
          { legacy: 'nome_grupo', legacyType: 'varchar(200)', newField: 'name', newType: 'text', status: 'mapped' },
          { legacy: 'id_nf_grupo / id_sgs_grupo', legacyType: 'int', newField: 'legacy_nf_id / legacy_sgs_id', newType: 'integer', status: 'mapped' },
          { legacy: 'data_inclusao / data_inativacao', legacyType: 'date', newField: 'active_since / inactive_since', newType: 'date', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'cadastro_clientes_controle',
        system: 'NetFactor',
        newTable: 'client_status_history',
        status: 'partial',
        note: 'Controle de workflow de aprovação mapeado para histórico de status.',
      },
      {
        legacyTable: 'cadastro_clientes_empresas_homologadas',
        system: 'NetFactor',
        newTable: 'drawee_enabled_products (indireto)',
        status: 'partial',
        note: 'Empresas homologadas por cedente mapeadas para produtos habilitados em sacados vinculados.',
      },
    ],
  },
  {
    id: 'drawees',
    name: 'Sacados',
    color: 'sky',
    legacyPrefix: 'cadastro_sacados_*',
    tables: [
      {
        legacyTable: 'cadastro_sacados_dados_basicos',
        system: 'NetFactor',
        newTable: 'drawees',
        status: 'full',
        note: 'Estrutura análoga a clients. id_sacado_nf → legacy_nf_id, id_sacado_sgs → legacy_sgs_id.',
        fields: [
          { legacy: 'id_sacado_nf', legacyType: 'int', newField: 'legacy_nf_id', newType: 'integer', status: 'mapped' },
          { legacy: 'id_sacado_sgs', legacyType: 'int', newField: 'legacy_sgs_id', newType: 'integer', status: 'mapped' },
          { legacy: 'tipo_pf_pj', legacyType: 'varchar(2)', newField: 'person_type', newType: "text ('individual'|'company')", status: 'transformed' },
          { legacy: 'cnpj / cpf / cnpj_raiz', legacyType: 'varchar', newField: 'cnpj / cpf / cnpj_root', newType: 'text', status: 'mapped' },
          { legacy: 'nome / razao_social / nome_fantasia', legacyType: 'varchar(200)', newField: 'company_name / legal_name / trade_name', newType: 'text', status: 'mapped' },
          { legacy: 'rg / cnh / passaporte / identidade_estrangeira', legacyType: 'varchar', newField: 'rg / — / — / —', newType: 'text', status: 'mapped' },
          { legacy: 'status_cadastro', legacyType: 'varchar(10)', newField: 'status + deleted_at', newType: 'text + timestamptz', status: 'transformed' },
        ],
      },
      {
        legacyTable: 'cadastro_sacados_dados_contato',
        system: 'NetFactor',
        newTable: 'drawee_contacts',
        status: 'full',
        note: 'Campos exclusivos de sacados: email_sacado → email_billing, email_xml → xml_email, telefone_cobranca → billing_phone.',
        fields: [
          { legacy: 'email_sacado', legacyType: 'varchar(1000)', newField: 'billing_email', newType: 'text', status: 'transformed', note: 'Campo de cobrança renomeado' },
          { legacy: 'email_xml', legacyType: 'varchar(1000)', newField: 'xml_email', newType: 'text', status: 'mapped' },
          { legacy: 'telefone_cobranca', legacyType: 'varchar(300)', newField: 'billing_phone', newType: 'text', status: 'mapped' },
          { legacy: 'email_bkp / telefone_fax / fax', legacyType: 'varchar / bit', newField: null, newType: null, status: 'dropped', note: 'Campos obsoletos descartados' },
        ],
      },
      {
        legacyTable: 'cadastro_sacados_dados_endereco',
        system: 'NetFactor',
        newTable: 'drawee_addresses (2 registros)',
        status: 'full',
        note: 'Campos duplicados de cobrança (logradouro_cobranca, cep_cobranca, etc.) viram um segundo registro com use_type = \'billing\'.',
        fields: [
          { legacy: 'logradouro / numero / complemento / cep / bairro / cidade / estado', legacyType: 'varchar', newField: 'street / number / complement / zip_code / neighborhood / city / state', newType: 'text', status: 'mapped' },
          { legacy: 'logradouro_cobranca...estado_cobranca', legacyType: 'varchar', newField: 'drawee_addresses (use_type=billing)', newType: 'registro separado', status: 'transformed', note: 'Endereço de cobrança vira registro separado' },
        ],
      },
      {
        legacyTable: 'cadastro_sacados_dados_bancarios',
        system: 'NetFactor',
        newTable: 'drawee_bank_accounts',
        status: 'full',
        note: 'Estrutura idêntica à de client_bank_accounts.',
      },
      {
        legacyTable: 'cadastro_sacados_dados_adicionais',
        system: 'NetFactor',
        newTable: 'drawees (campos inline)',
        status: 'partial',
        note: 'Compliance, bloqueio e ciclo cadastral inline na tabela drawees.',
      },
      {
        legacyTable: 'cadastro_sacados_grupo_sacados',
        system: 'NetFactor',
        newTable: 'economic_groups (type=drawee_group)',
        status: 'full',
        note: 'Unificado com economic_groups. Grupos de sacados identificados pelo campo type.',
      },
      {
        legacyTable: 'cadastro_sacados_produtos_habilitados',
        system: 'NetFactor',
        newTable: 'drawee_enabled_products',
        status: 'full',
        note: 'empCodigo (empresa multi-tenant) descartado — plataforma é single-tenant.',
        fields: [
          { legacy: 'id_net_factor + empCodigo (PK composta)', legacyType: 'int', newField: 'drawee_id + product_id (PK composta)', newType: 'uuid', status: 'transformed' },
          { legacy: 'empCodigo', legacyType: 'int', newField: null, newType: null, status: 'dropped', note: 'Multi-tenant legado — plataforma é single-tenant' },
        ],
      },
    ],
  },
  {
    id: 'suppliers',
    name: 'Fornecedores',
    color: 'orange',
    legacyPrefix: 'cadastro_fornecedores_*',
    tables: [
      {
        legacyTable: 'cadastro_fornecedores_dados_basicos',
        system: 'NetFactor',
        newTable: 'suppliers',
        status: 'full',
        note: 'Estrutura simplificada vs. clients. Campos de compliance KYC não presentes nos fornecedores.',
        fields: [
          { legacy: 'id_sgs / id_net_factor', legacyType: 'int', newField: 'legacy_sgs_id / legacy_nf_id', newType: 'integer', status: 'mapped' },
          { legacy: 'cnpj / cpf / tipo_pf_pj', legacyType: 'varchar', newField: 'cnpj / cpf / person_type', newType: 'text', status: 'mapped' },
          { legacy: 'nome / razao_social / nome_fantasia', legacyType: 'varchar(200)', newField: 'company_name / legal_name / trade_name', newType: 'text', status: 'mapped' },
        ],
      },
      { legacyTable: 'cadastro_fornecedores_dados_contato', system: 'NetFactor', newTable: 'supplier_contacts', status: 'full' },
      { legacyTable: 'cadastro_fornecedores_dados_endereco', system: 'NetFactor', newTable: 'supplier_addresses', status: 'full' },
      { legacyTable: 'cadastro_fornecedores_dados_bancarios', system: 'NetFactor', newTable: 'supplier_bank_accounts', status: 'full' },
      { legacyTable: 'cadastro_fornecedores_dados_adicionais', system: 'NetFactor', newTable: 'suppliers (campos inline)', status: 'partial' },
    ],
  },
  {
    id: 'economic-groups',
    name: 'Grupos Econômicos (Empresas do Grupo)',
    color: 'violet',
    legacyPrefix: 'cadastro_empresas_grupo_*',
    tables: [
      {
        legacyTable: 'cadastro_empresas_grupo_dados_basicos',
        system: 'NetFactor',
        newTable: 'economic_groups (type=sarfaty_group)',
        status: 'full',
        note: 'Empresas do grupo Sarfaty unificadas com os grupos econômicos de clientes/sacados. Diferenciadas pelo campo type.',
      },
      { legacyTable: 'cadastro_empresas_grupo_dados_contato', system: 'NetFactor', newTable: 'economic_group_persons', status: 'partial' },
      { legacyTable: 'cadastro_empresas_grupo_dados_bancarios', system: 'NetFactor', newTable: 'economic_group_bank_accounts', status: 'full' },
      {
        legacyTable: 'DLDB_cadastro_debenturistas',
        system: 'DLDB',
        newTable: 'clients (debenturistas são clientes)',
        status: 'partial',
        note: 'Debenturistas são clientes no novo sistema. Redundância com cadastro_clientes_dados_basicos.',
      },
    ],
  },
  {
    id: 'financial',
    name: 'Conta Corrente',
    color: 'teal',
    legacyPrefix: 'conta_corrente_*',
    tables: [
      {
        legacyTable: 'conta_corrente_extrato',
        system: 'NetFactor',
        newTable: 'financial_transactions',
        status: 'full',
        note: 'Lançamentos do extrato mapeados para transactions. Tipo de evento (D/C) via financial_event_types.',
        fields: [
          { legacy: 'codigo_evento', legacyType: 'int', newField: 'event_type_id', newType: 'uuid FK → financial_event_types', status: 'transformed', note: 'De-para de códigos em financial_event_types' },
          { legacy: 'valor', legacyType: 'numeric', newField: 'amount', newType: 'numeric(18,4)', status: 'mapped' },
          { legacy: 'debito_credito', legacyType: "char(1) 'D'|'C'", newField: 'entry_type', newType: "char(1) 'D'|'C'", status: 'mapped' },
          { legacy: 'data_lancamento', legacyType: 'date', newField: 'transaction_date', newType: 'date', status: 'mapped' },
          { legacy: 'codigo_nf / codigo_sgs', legacyType: 'int', newField: 'reference_nf_code / reference_sgs_code', newType: 'integer', status: 'mapped', note: 'Mantidos para rastreabilidade cruzada' },
        ],
      },
      {
        legacyTable: 'conta_corrente_pendencias',
        system: 'NetFactor',
        newTable: 'financial_pendencies',
        status: 'full',
        note: 'Títulos em aberto mapeados para pendencies. Sacado referenciado via drawee_id.',
      },
      {
        legacyTable: 'conta_corrente_liquidacoes',
        system: 'NetFactor',
        newTable: 'financial_settlements',
        status: 'full',
        note: 'Liquidações N:N entre pendências e settlements.',
      },
      {
        legacyTable: 'conta_corrente_contas',
        system: 'NetFactor',
        newTable: 'financial_accounts',
        status: 'full',
        fields: [
          { legacy: 'id_conta_nf / id_conta_sgs', legacyType: 'int', newField: 'legacy_nf_id / legacy_sgs_id', newType: 'integer', status: 'mapped' },
          { legacy: 'tipo_conta', legacyType: 'varchar', newField: 'account_type', newType: "text ('graphic'|'real')", status: 'mapped' },
          { legacy: 'status_bloqueio / tipo_bloqueio', legacyType: 'varchar', newField: 'block_type / block_reason', newType: 'text', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'conta_corrente_tipos_evento',
        system: 'NetFactor',
        newTable: 'financial_event_types',
        status: 'full',
        note: 'Catálogo de tipos de evento. Códigos legados preservados em legacy_nf_code e legacy_sgs_code.',
      },
    ],
  },
  {
    id: 'debentures',
    name: 'Debêntures',
    color: 'indigo',
    legacyPrefix: 'DLDB_*',
    tables: [
      {
        legacyTable: 'DLDB_debenture_emissores',
        system: 'DLDB',
        newTable: 'debenture_issuers',
        status: 'full',
        fields: [
          { legacy: 'id_sgs', legacyType: 'int', newField: 'legacy_sgs_id', newType: 'integer', status: 'mapped' },
          { legacy: 'cnpj / razao_social', legacyType: 'varchar', newField: 'cnpj / legal_name', newType: 'text', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'DLDB_debenture_emissoes',
        system: 'DLDB',
        newTable: 'debenture_issuances',
        status: 'full',
        fields: [
          { legacy: 'id_sgs / id_net_factor', legacyType: 'int', newField: 'legacy_sgs_id / legacy_nf_id', newType: 'integer', status: 'mapped' },
          { legacy: 'tipo_rendimento', legacyType: 'varchar', newField: 'yield_type', newType: "text ('CDI'|'IPCA'|'fixed'|'other')", status: 'transformed' },
          { legacy: 'valor_total / preco_unitario', legacyType: 'numeric', newField: 'total_value / unit_price', newType: 'numeric(15,2)', status: 'mapped' },
          { legacy: 'caminho_prospecto / caminho_escritura', legacyType: 'varchar', newField: 'prospectus_file_path / age_document_path', newType: 'text (Storage path)', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'DLDB_debenture_series',
        system: 'DLDB',
        newTable: 'debenture_series',
        status: 'full',
        fields: [
          { legacy: 'tipo_indice', legacyType: 'varchar', newField: 'index_type', newType: "text ('CDI'|'IPCA'|'fixed')", status: 'mapped' },
          { legacy: 'percentual_indice', legacyType: 'numeric(15,4)', newField: 'index_percentage', newType: 'numeric(15,4)', status: 'mapped' },
          { legacy: 'permite_resgate_web', legacyType: 'bit', newField: 'allow_web_redemption', newType: 'boolean', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'DLDB_debenture_subscricoes',
        system: 'DLDB',
        newTable: 'debenture_subscriptions',
        status: 'full',
        fields: [
          { legacy: 'id_debenturista → FK para cadastro_debenturistas', legacyType: 'int', newField: 'debenturist_id', newType: 'uuid FK → clients', status: 'transformed', note: 'Debenturista é cliente — lookup por legacy_nf_id' },
        ],
      },
      {
        legacyTable: 'DLDB_debenture_resgates',
        system: 'DLDB',
        newTable: 'debenture_redemptions',
        status: 'full',
        note: 'Todos os campos de cálculo (IR, IOF, rendimento bruto/líquido) preservados.',
        fields: [
          { legacy: 'status (int 0|1|2)', legacyType: 'int', newField: 'status', newType: "integer (0=pending|1=processed|2=settled)", status: 'mapped', note: 'Mantido como integer por compatibilidade' },
        ],
      },
      {
        // eslint-disable-next-line no-secrets/no-secrets
        legacyTable: 'DLDB_debenture_valorizacoes',
        system: 'DLDB',
        newTable: 'debenture_valuations',
        status: 'full',
        note: 'Série temporal diária com todos os campos de cálculo preservados.',
      },
      {
        legacyTable: 'DLDB_ativos_grupos',
        system: 'DLDB',
        newTable: 'investment_asset_groups',
        status: 'full',
        note: 'Catálogo de grupos de ativos com horários de corte e prazos de liquidação.',
      },
      {
        legacyTable: 'DLDB_ativos',
        system: 'DLDB',
        newTable: 'investment_assets',
        status: 'full',
      },
      {
        legacyTable: 'DLDB_cadastro_debenturistas',
        system: 'DLDB',
        newTable: '— (redundante com clients)',
        status: 'dropped',
        note: 'Debenturistas já existem como clientes. Dados unificados durante migração.',
      },
    ],
  },
  {
    id: 'market-rates',
    name: 'Taxas e Estoque de Carteira',
    color: 'cyan',
    legacyPrefix: 'DLSA_*',
    tables: [
      {
        legacyTable: 'DLSA_TAXAS_DI',
        system: 'DLSA',
        newTable: 'market_rates (rate_type=DI)',
        status: 'full',
        note: 'Taxas DI diárias unificadas com market_rates discriminadas por rate_type.',
        fields: [
          { legacy: 'data_taxa', legacyType: 'date', newField: 'rate_date', newType: 'date', status: 'mapped' },
          { legacy: 'valor_taxa', legacyType: 'numeric', newField: 'value', newType: 'numeric(18,6)', status: 'mapped' },
          { legacy: '(tabela separada)', legacyType: '—', newField: 'rate_type=DI', newType: 'text discriminator', status: 'new', note: 'Discriminador adicionado na nova tabela unificada' },
        ],
      },
      {
        legacyTable: 'DLSA_TAXAS_SELIC',
        system: 'DLSA',
        newTable: 'market_rates (rate_type=SELIC)',
        status: 'full',
        note: 'Mesma tabela destino com rate_type=SELIC.',
      },
      {
        legacyTable: 'DLSA_TAXAS_DI_BKP / DLSA_TAXAS_SELIC_BKP',
        system: 'DLSA',
        newTable: null,
        status: 'dropped',
        note: 'Backups redundantes — descartados. Backup nativo do PostgreSQL substitui.',
      },
      {
        legacyTable: 'DLSA_ALIQUOTA_IOF',
        system: 'DLSA',
        newTable: 'iof_rates',
        status: 'full',
        fields: [
          { legacy: 'dias_corridos', legacyType: 'int', newField: 'elapsed_days', newType: 'integer', status: 'mapped' },
          { legacy: 'aliquota', legacyType: 'numeric(5,4)', newField: 'rate_percentage', newType: 'numeric(5,4)', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'DLSA_ALIQUOTA_IR',
        system: 'DLSA',
        newTable: 'ir_rates',
        status: 'full',
        fields: [
          { legacy: 'prazo_minimo / prazo_maximo', legacyType: 'int', newField: 'min_days / max_days', newType: 'integer', status: 'mapped' },
          { legacy: 'aliquota', legacyType: 'numeric(5,2)', newField: 'rate_percentage', newType: 'numeric(5,2)', status: 'mapped' },
        ],
      },
      {
        legacyTable: 'DLSA_ESTOQUE_CARTEIRA',
        system: 'DLSA',
        newTable: 'portfolio_positions',
        status: 'full',
        note: 'Posição diária de carteira FIDC. Campos cedent_doc e drawee_doc mantidos como fallback para registros sem FK resolvida.',
        fields: [
          { legacy: 'doc_cedente', legacyType: 'varchar', newField: 'cedent_doc (fallback) + client_id (FK quando resolvida)', newType: 'text + uuid FK nullable', status: 'transformed' },
          { legacy: 'doc_sacado', legacyType: 'varchar', newField: 'drawee_doc (fallback) + drawee_id (FK quando resolvida)', newType: 'text + uuid FK nullable', status: 'transformed' },
          { legacy: 'nota_pdd', legacyType: 'varchar', newField: 'pdd_note', newType: "text ('AA'|'A'|...|'E')", status: 'mapped' },
          { legacy: 'fundo', legacyType: 'varchar', newField: 'fund_name', newType: 'text', status: 'mapped' },
        ],
      },
    ],
  },
  {
    id: 'credit-check',
    name: 'Checagem de Crédito',
    color: 'purple',
    legacyPrefix: 'credito_*',
    tables: [
      {
        legacyTable: 'credito_canhoto_checagem',
        system: 'credito',
        newTable: 'client_documents (campos extras)',
        status: 'partial',
        note: 'Dados de verificação de canhoto adicionados como campos extras na tabela client_documents existente.',
        fields: [
          { legacy: 'referencia_canhoto', legacyType: 'varchar', newField: 'canhoto_reference', newType: 'text', status: 'mapped' },
          { legacy: 'data_canhoto', legacyType: 'date', newField: 'canhoto_date', newType: 'date', status: 'mapped' },
          { legacy: 'status_canhoto', legacyType: 'varchar', newField: 'canhoto_status', newType: "text ('received'|'pending'|'lost')", status: 'mapped' },
          { legacy: 'status_verificacao', legacyType: 'varchar', newField: 'verification_status', newType: "text ('pending'|'approved'|'rejected')", status: 'mapped' },
          { legacy: 'numero_nfe / valor_nfe', legacyType: 'varchar / numeric', newField: 'nfe_number / nfe_value', newType: 'text / numeric(18,4)', status: 'mapped' },
        ],
      },
    ],
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

const colorMap: Record<string, { badge: string; header: string; dot: string; border: string }> = {
  emerald: { badge: 'bg-emerald-100 text-emerald-800', header: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  sky: { badge: 'bg-sky-100 text-sky-800', header: 'bg-sky-50 border-sky-200', dot: 'bg-sky-500', border: 'border-sky-200' },
  orange: { badge: 'bg-orange-100 text-orange-800', header: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500', border: 'border-orange-200' },
  violet: { badge: 'bg-violet-100 text-violet-800', header: 'bg-violet-50 border-violet-200', dot: 'bg-violet-500', border: 'border-violet-200' },
  teal: { badge: 'bg-teal-100 text-teal-800', header: 'bg-teal-50 border-teal-200', dot: 'bg-teal-500', border: 'border-teal-200' },
  indigo: { badge: 'bg-indigo-100 text-indigo-800', header: 'bg-indigo-50 border-indigo-200', dot: 'bg-indigo-500', border: 'border-indigo-200' },
  cyan: { badge: 'bg-cyan-100 text-cyan-800', header: 'bg-cyan-50 border-cyan-200', dot: 'bg-cyan-500', border: 'border-cyan-200' },
  purple: { badge: 'bg-purple-100 text-purple-800', header: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500', border: 'border-purple-200' },
};

const statusConfig: Record<FieldStatus, { label: string; icon: typeof CheckCircle2; classes: string }> = {
  mapped: { label: 'Mapeado', icon: CheckCircle2, classes: 'text-emerald-600' },
  transformed: { label: 'Transformado', icon: AlertCircle, classes: 'text-amber-500' },
  dropped: { label: 'Descartado', icon: XCircle, classes: 'text-rose-400' },
  new: { label: 'Novo', icon: Info, classes: 'text-blue-500' },
};

const tableStatusConfig: Record<string, { label: string; classes: string }> = {
  full: { label: '100% mapeado', classes: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Parcial', classes: 'bg-amber-100 text-amber-700' },
  dropped: { label: 'Descartado', classes: 'bg-rose-100 text-rose-700' },
  split: { label: 'Dividido', classes: 'bg-blue-100 text-blue-700' },
};

function FieldRow({ field }: { field: FieldMapping }) {
  const s = statusConfig[field.status];
  const Icon = s.icon;
  return (
    <tr className="border-b border-[hsl(30,20%,92%)] last:border-0">
      <td className="py-2 pr-3 align-top">
        <span className="font-mono text-[10px] text-[hsl(150,15%,30%)] bg-[hsl(30,20%,96%)] px-1.5 py-0.5 rounded">{field.legacy}</span>
        {field.legacyType && <div className="text-[9px] text-[hsl(150,15%,55%)] mt-0.5">{field.legacyType}</div>}
      </td>
      <td className="py-2 pr-3 align-top w-6">
        <Icon size={12} className={s.classes} />
      </td>
      <td className="py-2 pr-3 align-top">
        {field.newField ? (
          <>
            <span className="font-mono text-[10px] text-[hsl(150,50%,18%)] bg-[hsl(150,20%,94%)] px-1.5 py-0.5 rounded">{field.newField}</span>
            {field.newType && <div className="text-[9px] text-[hsl(150,15%,50%)] mt-0.5">{field.newType}</div>}
          </>
        ) : (
          <span className="text-[10px] text-rose-400 italic">—</span>
        )}
      </td>
      <td className="py-2 align-top">
        {field.note && <span className="text-[9px] text-[hsl(150,15%,50%)] leading-snug">{field.note}</span>}
      </td>
    </tr>
  );
}

function TableCard({ table, color }: { table: TableMapping; color: string }) {
  const [open, setOpen] = useState(false);
  const c = colorMap[color] ?? { badge: 'bg-emerald-100 text-emerald-800', header: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', border: 'border-emerald-200' };
  const ts = tableStatusConfig[table.status] ?? { label: 'Mapeado', classes: 'bg-emerald-100 text-emerald-700' };

  return (
    <div className={`rounded-xl border ${c.border} bg-white shadow-sm overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-start justify-between gap-3 px-4 py-3 text-left ${c.header} border-b ${c.border} hover:brightness-98 transition-all`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] font-bold text-[hsl(150,50%,12%)]">{table.legacyTable}</span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/60 text-[hsl(150,15%,45%)]">{table.system}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <ArrowRight size={11} className="text-[hsl(150,20%,55%)] shrink-0" />
            <span className="font-mono text-[10px] text-[hsl(150,50%,22%)] font-medium truncate">
              {table.newTable ?? '—'}
            </span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${ts.classes}`}>{ts.label}</span>
          </div>
          {table.note && (
            <p className="text-[10px] text-[hsl(150,15%,48%)] mt-1.5 leading-relaxed">{table.note}</p>
          )}
        </div>
        {table.fields && (
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 mt-0.5">
            <ChevronDown size={14} className="text-[hsl(150,20%,50%)]" />
          </motion.div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && table.fields && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2 overflow-x-auto">
              <div className="flex items-center gap-4 mb-2 pb-2 border-b border-[hsl(30,20%,92%)]">
                {(['mapped', 'transformed', 'dropped', 'new'] as FieldStatus[]).map((s) => {
                  const sc = statusConfig[s];
                  const Icon = sc.icon;
                  return (
                    <div key={s} className="flex items-center gap-1">
                      <Icon size={10} className={sc.classes} />
                      <span className="text-[9px] text-[hsl(150,15%,50%)]">{sc.label}</span>
                    </div>
                  );
                })}
              </div>
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left">
                    <th className="text-[9px] font-bold uppercase text-[hsl(150,15%,55%)] tracking-wider pb-1.5 w-1/3">Campo Legado</th>
                    <th className="text-[9px] font-bold uppercase text-[hsl(150,15%,55%)] tracking-wider pb-1.5 w-5" />
                    <th className="text-[9px] font-bold uppercase text-[hsl(150,15%,55%)] tracking-wider pb-1.5 w-1/3">Campo Novo</th>
                    <th className="text-[9px] font-bold uppercase text-[hsl(150,15%,55%)] tracking-wider pb-1.5">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {table.fields.map((field) => (
                    <FieldRow key={`${field.legacy}-${field.status}`} field={field} />
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DomainSection({ domain }: { domain: Domain }) {
  const [expanded, setExpanded] = useState(true);
  const c = colorMap[domain.color] ?? { badge: 'bg-emerald-100 text-emerald-800', header: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', border: 'border-emerald-200' };
  const mappedCount = domain.tables.filter((t) => t.status === 'full').length;
  const totalCount = domain.tables.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[hsl(30,20%,88%)] bg-white shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[hsl(30,20%,98%)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${c.dot} shrink-0`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[hsl(150,50%,12%)]">{domain.name}</span>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{domain.legacyPrefix}</span>
            </div>
            <div className="text-xs text-[hsl(150,15%,50%)] mt-0.5">
              {domain.tables.length} tabelas legadas → {mappedCount}/{totalCount} totalmente mapeadas
            </div>
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-[hsl(150,20%,50%)] shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-[hsl(30,20%,92%)] pt-3">
              {domain.tables.map((table) => (
                <TableCard key={table.legacyTable} table={table} color={domain.color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const typeMapping = [
  { sqlServer: 'int', postgres: 'integer', note: 'Direto' },
  { sqlServer: 'bigint', postgres: 'bigint', note: 'Direto' },
  { sqlServer: 'varchar(n) / nvarchar(n)', postgres: 'text ou varchar(n)', note: 'Prefer text para flexibilidade' },
  { sqlServer: 'char(n)', postgres: 'char(n)', note: 'Mantido para campos fixos (UF, etc.)' },
  { sqlServer: 'bit', postgres: 'boolean', note: '0→false, 1→true' },
  { sqlServer: 'date', postgres: 'date', note: 'Direto' },
  { sqlServer: 'datetime / datetime2', postgres: 'timestamp with time zone', note: 'Sempre com timezone' },
  { sqlServer: 'numeric(p,s) / decimal(p,s)', postgres: 'numeric(p,s)', note: 'Precisão preservada' },
  { sqlServer: 'varchar(MAX)', postgres: 'text', note: 'Sem limite explícito no PG' },
  { sqlServer: 'varbinary', postgres: 'bytea ou Supabase Storage', note: 'Binários → Storage externo' },
  { sqlServer: 'time', postgres: 'time', note: 'Direto' },
];

const droppedFields = [
  { field: 'DLSA_TAXAS_DI_BKP / DLSA_TAXAS_SELIC_BKP', reason: 'Backups redundantes — PostgreSQL tem backup nativo' },
  { field: 'status_cadastro varchar(10)', reason: 'Substituído por enums, timestamps e deleted_at' },
  { field: 'Campos *_bkp (email_bkp, etc.)', reason: 'Artefatos de integração legada sem propósito' },
  { field: 'data_carga datetime2', reason: 'Substituído pelo padrão created_at' },
  { field: 'empCodigo int', reason: 'Contexto multi-tenant do legado — plataforma é single-tenant' },
  { field: 'DLDB_cadastro_debenturistas', reason: 'Redundante com cadastro_clientes — dados unificados em clients' },
  { field: 'telefone_fax / fax (bit)', reason: 'Tecnologia descontinuada' },
  { field: 'nome_gerente / email_gerente (em dados_adicionais)', reason: 'Redundante — gerente existe em profiles como assigned_to' },
];

export default function MigrationPage() {
  const totalLegacy = domains.reduce((acc, d) => acc + d.tables.length, 0);
  const totalMapped = domains.reduce((acc, d) => acc + d.tables.filter(t => t.status === 'full').length, 0);
  const totalDropped = domains.reduce((acc, d) => acc + d.tables.filter(t => t.status === 'dropped').length, 0);

  return (
    <PageWrapper>
      {/* Header */}
      <section className="relative overflow-hidden bg-[hsl(45,50%,91%)] px-10 py-14">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(44,52%,89%)] via-[hsl(45,50%,91%)] to-[hsl(46,45%,94%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, hsl(40,60%,50%) 0, hsl(40,60%,50%) 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(40,50%,80%)]">
              <ArrowRightLeft size={20} className="text-[hsl(38,70%,32%)]" />
            </div>
            <span className="text-sm font-semibold text-[hsl(35,25%,45%)] uppercase tracking-widest">Migração de Dados</span>
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight text-[hsl(35,35%,15%)]">
            De-Para: Banco Legado → Nova Plataforma
          </h1>
          <p className="text-[hsl(35,20%,40%)] text-base leading-relaxed max-w-2xl">
            Mapeamento completo do schema DLSGS (SQL Server — SGS + NetFactor) para o novo schema PostgreSQL 15 da Plataforma Sarfaty. Clique em qualquer tabela para ver o mapeamento de campos.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { value: '55', label: 'Tabelas legadas documentadas', color: 'text-[hsl(35,35%,20%)]' },
              { value: String(totalMapped), label: 'Tabelas totalmente mapeadas', color: 'text-emerald-700' },
              { value: String(totalLegacy - totalMapped - totalDropped), label: 'Mapeadas parcialmente', color: 'text-amber-700' },
              { value: String(totalDropped), label: 'Descartadas', color: 'text-rose-700' },
            ].map((s) => (
              <div key={s.label} className="bg-[hsl(42,45%,84%)] rounded-xl p-4 border border-[hsl(40,40%,80%)]">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[hsl(35,20%,45%)] mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-8 py-10 max-w-5xl space-y-12">
        {/* Systems overview */}
        <div>
          <SectionHeading
            title="Sistemas de Origem"
            subtitle="O DLSGS é um Data Lake consolidado que agrega dados de dois sistemas legados que coexistiram."
            badge="Contexto"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                name: 'SGS',
                desc: 'Sistema anterior ao NetFactor. Legado histórico com dados mais antigos. Identificador: id_sgs.',
                badge: 'Legado histórico',
                badgeColor: 'bg-slate-100 text-slate-700',
                icon: '📦',
              },
              {
                name: 'NetFactor',
                desc: 'ERP de factoring/FIDC — sistema operacional principal. Fonte de verdade para dados transacionais. Identificador: id_net_factor.',
                badge: 'Fonte de verdade',
                badgeColor: 'bg-blue-100 text-blue-700',
                icon: '⚙️',
              },
              {
                name: 'DLSGS',
                desc: 'Data Lake de consolidação. Agrega SGS + NetFactor para relatórios e migração. Toda tabela carrega id_sgs e id_net_factor.',
                badge: 'Data Lake (origem)',
                badgeColor: 'bg-amber-100 text-amber-700',
                icon: '🔄',
              },
            ].map((sys) => (
              <div key={sys.name} className="p-4 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
                <div className="text-2xl mb-2">{sys.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm text-[hsl(150,50%,12%)]">{sys.name}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sys.badgeColor}`}>{sys.badge}</span>
                </div>
                <p className="text-xs text-[hsl(150,15%,45%)] leading-relaxed">{sys.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-[hsl(48,100%,42%)]/8 border border-[hsl(48,100%,42%)]/20 rounded-xl flex gap-3">
            <Info size={14} className="text-[hsl(48,60%,35%)] shrink-0 mt-0.5" />
            <div className="text-xs text-[hsl(48,50%,28%)] leading-relaxed">
              <strong>Regra de merge:</strong> quando id_sgs e id_net_factor apontam para o mesmo cedente com dados divergentes, o <strong>NetFactor é a fonte de verdade</strong>. Os campos legacy_sgs_id e legacy_nf_id são preservados em todas as tabelas migradas para rastreabilidade e possibilidade de rollback.
            </div>
          </div>
        </div>

        {/* Domain mappings */}
        <div>
          <SectionHeading
            title="Mapeamento por Domínio"
            subtitle="Clique em um domínio para expandir suas tabelas. Clique em uma tabela para ver o mapeamento de campos."
            badge="De-Para"
          />
          <div className="space-y-4">
            {domains.map((domain) => (
              <DomainSection key={domain.id} domain={domain} />
            ))}
          </div>
        </div>

        {/* Type mapping */}
        <div>
          <SectionHeading
            title="Mapeamento de Tipos SQL Server → PostgreSQL"
            subtitle="Conversões de tipo aplicadas durante a migração ETL."
            badge="Tipos"
          />
          <div className="overflow-hidden rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-[hsl(150,50%,10%)] text-white">
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-wide">SQL Server</th>
                  <th className="w-8 text-center px-2 py-3 text-xs">→</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-wide">PostgreSQL (Drizzle)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-wide">Observação</th>
                </tr>
              </thead>
              <tbody>
                {typeMapping.map((row, index) => (
                  <tr key={row.sqlServer} className={`border-b border-[hsl(30,20%,92%)] last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-[hsl(30,20%,98%)]'}`}>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{row.sqlServer}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center text-[hsl(150,20%,60%)]">→</td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{row.postgres}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[hsl(150,15%,50%)]">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dropped fields */}
        <div>
          <SectionHeading
            title="Campos e Tabelas Descartados"
            subtitle="Itens do legado que não têm equivalente na nova plataforma e foram intencionalmente removidos."
            badge="Descartados"
          />
          <div className="space-y-2">
            {droppedFields.map((item) => (
              <div key={item.field} className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-rose-100 shadow-sm">
                <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{item.field}</span>
                  <p className="text-xs text-[hsl(150,15%,45%)] mt-1 leading-relaxed">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Migration IDs */}
        <div>
          <SectionHeading
            title="Campos de Rastreabilidade Legado"
            subtitle="Presentes em todas as tabelas migradas para garantir rastreabilidade bidirecional e possibilidade de rollback."
            badge="IDs de Migração"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                field: 'legacy_sgs_id',
                type: 'integer NULLABLE',
                origin: 'id_sgs no DLSGS',
                desc: 'ID do registro no sistema SGS (legado histórico). Nulo para registros criados diretamente na nova plataforma.',
              },
              {
                field: 'legacy_nf_id',
                type: 'integer NULLABLE',
                origin: 'id_net_factor no DLSGS',
                desc: 'ID do registro no NetFactor (ERP operacional). É a referência primária para cruzamento de dados durante a migração.',
              },
            ].map((field) => (
              <div key={field.field} className="p-4 bg-white rounded-xl border border-[hsl(150,30%,82%)] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={13} className="text-[hsl(150,50%,22%)]" />
                  <span className="font-mono text-sm font-bold text-[hsl(150,50%,15%)]">{field.field}</span>
                  <span className="font-mono text-[10px] text-[hsl(150,15%,50%)]">{field.type}</span>
                </div>
                <div className="text-[10px] text-[hsl(150,15%,55%)] mb-1.5">Origem: <span className="font-mono text-[hsl(150,30%,40%)]">{field.origin}</span></div>
                <p className="text-xs text-[hsl(150,15%,40%)] leading-relaxed">{field.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
