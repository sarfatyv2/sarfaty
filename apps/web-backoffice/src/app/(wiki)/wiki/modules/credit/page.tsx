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
        description="Integrações com bureaus de crédito externos para análise de perfil de clientes e sacados. Centraliza os resultados de consultas CNPJ/CPF (Vadu) e relatórios de crédito completos (Creditbox) com cacheamento inteligente."
        color="blue"
        gradient="bg-gradient-to-br from-[hsl(220,55%,18%)] to-[hsl(220,45%,26%)]"
        roles={['credit_analyst', 'compliance_officer', 'approver', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin']}
        flowSteps={[
          { label: 'Trigger', desc: 'Analista solicita consulta de CNPJ/CPF a partir do cadastro do cliente.' },
          { label: 'Cache Check', desc: 'Sistema verifica se já existe resultado recente (< 30 dias). Se sim, retorna cache.' },
          { label: 'API Call', desc: 'Se sem cache válido, chamada à API Vadu ou Creditbox com credenciais do ambiente.' },
          { label: 'Parse & Store', desc: 'Resultado bruto (JSON) armazenado na tabela. Dados estruturados extraídos para display.' },
          { label: 'Notificação', desc: 'Analista notificado via in-app notification. Resultado disponível no cadastro do cliente.' },
        ]}
        features={[
          'Consulta CNPJ via Vadu (dados cadastrais, sócios, situação Receita Federal)',
          'Consulta CPF via Vadu (dados pessoais, situação fiscal)',
          'Relatório de crédito completo via Creditbox',
          'Cache inteligente de resultados (evita reconsultas desnecessárias)',
          'Armazenamento do JSON bruto completo para auditoria',
          'Status da consulta: pending, processing, completed, error',
          'Histórico de todas as consultas por cliente',
          'Integração transparente no fluxo de análise do módulo comercial',
        ]}
        tables={[
          {
            name: 'vadu_company_results',
            description: 'Resultados de consultas CNPJ via API Vadu. Armazena o JSON bruto completo.',
            keyColumns: ['id', 'client_id', 'cnpj', 'result_json', 'queried_at', 'status'],
          },
          {
            name: 'vadu_person_results',
            description: 'Resultados de consultas CPF via API Vadu. Para sócios e pessoas físicas.',
            keyColumns: ['id', 'client_id', 'cpf', 'result_json', 'queried_at', 'status'],
          },
          {
            name: 'creditbox_reports',
            description: 'Relatórios completos de crédito via Creditbox. Análise de score e histórico.',
            keyColumns: ['id', 'client_id', 'report_json', 'score', 'queried_at'],
          },
        ]}
      />
    </PageWrapper>
  );
}
