'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { TrendingUp } from 'lucide-react';

export default function DebenturesModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={TrendingUp}
        name="Módulo de Debêntures"
        domain="Módulo"
        description="Gestão completa de debêntures emitidas: emissores, emissões com múltiplas séries, subscrições de clientes, valorização diária e resgates. Estrutura hierárquica: Emissor → Emissão → Série → Subscrição."
        color="indigo"
        gradient="bg-gradient-to-br from-[hsl(240,50%,18%)] to-[hsl(240,40%,26%)]"
        roles={['backoffice', 'credit_analyst', 'approver', 'risk_manager', 'admin']}
        flowSteps={[
          { label: 'Emissor', desc: 'Empresa emissora cadastrada com CNPJ e dados de registro.' },
          { label: 'Emissão', desc: 'Emissão criada com volume total, taxa e condições. Pode ter múltiplas séries.' },
          { label: 'Série', desc: 'Cada série define vencimento, taxa e quantidade de cotas disponíveis.' },
          { label: 'Subscrição', desc: 'Cliente adquire cotas de uma série. Valor subscrito e data de entrada registrados.' },
          { label: 'Valorização', desc: 'Rotina diária calcula valor atualizado de cada cota com base na taxa da série.' },
          { label: 'Resgate', desc: 'Cliente solicita resgate parcial ou total. Sistema calcula IR e IOF aplicáveis.' },
        ]}
        features={[
          'Hierarquia completa: Emissor → Emissão → Série → Subscrição',
          'Múltiplas séries por emissão com condições diferentes',
          'Subscrições de clientes com registro de valor e data',
          'Valorização diária automática por série',
          'Resgates parciais e totais com cálculo de impostos',
          'Histórico completo de cotas e eventos',
          'Integração com taxas de mercado (CDI, IPCA) para séries indexadas',
          'Relatório consolidado de posição por cliente',
        ]}
        tables={[
          { name: 'debenture_issuers', description: 'Empresas emissoras de debêntures.', keyColumns: ['id', 'name', 'cnpj', 'cvm_code'] },
          { name: 'debenture_issuances', description: 'Emissões de debêntures por emissor.', keyColumns: ['id', 'issuer_id', 'code', 'total_amount', 'issue_date'] },
          { name: 'debenture_series', description: 'Séries dentro de uma emissão com condições específicas.', keyColumns: ['id', 'issuance_id', 'series_number', 'rate_type', 'maturity_date'] },
          { name: 'debenture_subscriptions', description: 'Subscrições de clientes em séries.', keyColumns: ['id', 'series_id', 'client_id', 'amount', 'subscribed_at'] },
          { name: 'debenture_valuations', description: 'Valorização diária de cada cota por série.', keyColumns: ['series_id', 'date', 'quota_value', 'yield_rate'] },
          { name: 'debenture_redemptions', description: 'Resgates de subscrições (parcial ou total).', keyColumns: ['id', 'subscription_id', 'amount', 'ir_amount', 'iof_amount', 'redeemed_at'] },
        ]}
      />
    </PageWrapper>
  );
}
