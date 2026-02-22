'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { DollarSign } from 'lucide-react';

export default function FinancialModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={DollarSign}
        name="Módulo Financeiro"
        domain="Módulo"
        description="Gestão das contas financeiras dos clientes, incluindo transações, pendências (títulos em aberto) e liquidações. Integra com taxas de mercado (CDI, SELIC, IPCA) e taxas de IOF/IR para cálculos de rentabilidade."
        color="teal"
        gradient="bg-gradient-to-br from-[hsl(175,55%,15%)] to-[hsl(175,45%,22%)]"
        roles={['backoffice', 'credit_analyst', 'risk_manager', 'approver', 'sales_manager', 'admin']}
        flowSteps={[
          { label: 'Conta Criada', desc: 'Conta financeira criada no momento da ativação do cliente.' },
          { label: 'Transação', desc: 'Eventos financeiros (crédito, débito, taxa) registrados como transactions vinculadas a event_types.' },
          { label: 'Pendência', desc: 'Títulos em aberto (pendencies) gerados automaticamente com vencimento e valor.' },
          { label: 'Liquidação', desc: 'Pendências liquidadas via financial_settlements. Pode ser parcial ou total.' },
          { label: 'Posição', desc: 'Saldo atualizado em financial_accounts. Histórico completo disponível.' },
        ]}
        features={[
          'Contas financeiras vinculadas a cada cliente ativo',
          'Registro de transações tipificadas por financial_event_types',
          'Pendências com vencimento, valor e status de liquidação',
          'Liquidações parciais e totais (N:N entre pendencies e settlements)',
          'Taxas de mercado diárias: CDI, SELIC, IPCA, TJLP',
          'Taxas de IOF por prazo e faixa para cálculo automático',
          'Tabelas de IR por faixa de prazo para fundos',
          'Posições de portfólio para gestores de fundo',
        ]}
        tables={[
          { name: 'financial_accounts', description: 'Conta financeira do cliente com saldo atual.', keyColumns: ['id', 'client_id', 'balance', 'type', 'currency'] },
          { name: 'financial_event_types', description: 'Catálogo de tipos de evento (crédito, débito, taxa, etc.).', keyColumns: ['id', 'code', 'name', 'direction'] },
          { name: 'financial_transactions', description: 'Lançamentos financeiros na conta.', keyColumns: ['id', 'account_id', 'amount', 'event_type_id', 'reference_date'] },
          { name: 'financial_pendencies', description: 'Títulos em aberto aguardando liquidação.', keyColumns: ['id', 'account_id', 'amount', 'due_date', 'status'] },
          { name: 'financial_settlements', description: 'Liquidações de pendências (N:N).', keyColumns: ['id', 'pendency_id', 'amount', 'settled_at'] },
          { name: 'market_rates', description: 'Taxas de mercado diárias (CDI, SELIC, IPCA).', keyColumns: ['date', 'rate_type', 'value'] },
          { name: 'portfolio_positions', description: 'Posições de cotas de fundos.', keyColumns: ['id', 'client_id', 'fund_code', 'quota', 'value'] },
        ]}
      />
    </PageWrapper>
  );
}
