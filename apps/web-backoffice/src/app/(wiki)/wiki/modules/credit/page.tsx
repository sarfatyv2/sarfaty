'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { CreditCard } from 'lucide-react';

export default function CreditModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={CreditCard}
        name="Módulo de Crédito"
        domain="Módulo"
        description="Integrações com bureaus e validações externas para clientes e sacados: Vadu (CNPJ/CPF), Creditbox, Serasa, Allcheck, UpMiner, CERC e consultas específicas para cadastro de sacados, com persistência para auditoria e exibição no backoffice."
        color="blue"
        gradient="bg-gradient-to-br from-[hsl(220,55%,18%)] to-[hsl(220,45%,26%)]"
        roles={['credit_analyst', 'compliance_officer', 'approver', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin']}
        flowSteps={[
          { label: 'Trigger', desc: 'Analista solicita consulta de CNPJ/CPF a partir do cadastro do cliente.' },
          { label: 'Cache Check', desc: 'Sistema verifica se já existe resultado recente (< 30 dias). Se sim, retorna cache.' },
          { label: 'API Call', desc: 'Chamada ao provedor (Vadu, Creditbox, Serasa, etc.) conforme o tipo de consulta e credenciais do ambiente.' },
          { label: 'Parse & Store', desc: 'Payload armazenado nas tabelas de resultado; integrações de sacados gravam por drawee_id quando aplicável.' },
          { label: 'Notificação', desc: 'Analista notificado via in-app notification. Resultado disponível no cadastro do cliente.' },
        ]}
        features={[
          'Consulta CNPJ/CPF via Vadu para clientes e fluxo análogo para sacados (vadu_drawee_company_results / vadu_drawee_person_results)',
          'Relatórios Creditbox e Serasa (serasa_report_results, serasa_drawee_report_results quando aplicável)',
          'Allcheck e UpMiner para camadas adicionais de risco e enriquecimento',
          'Validações CERC (cerc_validations) ligadas ao cadastro de sacados',
          'Cache / reconsulta conforme regras de negócio por tipo de bureau',
          'JSON ou payload estruturado persistido para auditoria e telas de detalhe',
          'Integração com pipeline comercial e cadastro de sacados',
        ]}
        tables={[
          {
            name: 'vadu_company_results',
            description: 'Consultas CNPJ (Vadu) ligadas ao cliente.',
            keyColumns: ['id', 'client_id', 'cnpj', 'result_json', 'queried_at', 'status'],
          },
          {
            name: 'vadu_person_results',
            description: 'Consultas CPF (Vadu) ligadas ao cliente.',
            keyColumns: ['id', 'client_id', 'cpf', 'result_json', 'queried_at', 'status'],
          },
          {
            name: 'vadu_drawee_company_results',
            description: 'Consultas CNPJ (Vadu) ligadas ao sacado.',
            keyColumns: ['id', 'drawee_id', 'cnpj', 'result_json', 'queried_at'],
          },
          {
            name: 'vadu_drawee_person_results',
            description: 'Consultas CPF (Vadu) ligadas ao sacado.',
            keyColumns: ['id', 'drawee_id', 'cpf', 'result_json', 'queried_at'],
          },
          {
            name: 'creditbox_reports',
            description: 'Relatórios Creditbox por cliente.',
            keyColumns: ['id', 'client_id', 'report_json', 'queried_at'],
          },
          {
            name: 'serasa_report_results',
            description: 'Resultados Serasa (cliente).',
            keyColumns: ['id', 'client_id', 'payload', 'queried_at'],
          },
          {
            name: 'serasa_drawee_report_results',
            description: 'Resultados Serasa por sacado.',
            keyColumns: ['id', 'drawee_id', 'payload', 'queried_at'],
          },
          {
            name: 'allcheck_results',
            description: 'Resultados Allcheck por cliente.',
            keyColumns: ['id', 'client_id', 'document', 'raw_data', 'queried_at'],
          },
          {
            name: 'upminer_results',
            description: 'Resultados UpMiner por cliente.',
            keyColumns: ['id', 'client_id', 'document', 'status', 'dossiers_data'],
          },
          {
            name: 'cerc_validations',
            description: 'Validações/registros CERC associados ao sacado.',
            keyColumns: ['id', 'drawee_id', 'status', 'payload'],
          },
        ]}
      />
    </PageWrapper>
  );
}
