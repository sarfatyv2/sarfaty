'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { FileSpreadsheet } from 'lucide-react';

const CNAB_WIKI_ROLES = [
  'sales_rep',
  'sales_supervisor',
  'sales_manager',
  'sales_director',
  'credit_analyst',
  'backoffice',
  'risk_manager',
  'recovery',
  'litigation',
  'approver',
  'admin',
] as const;

export default function CnabModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={FileSpreadsheet}
        name="Módulo CNAB"
        domain="Operações e Comercial"
        description="Fluxo de remessa CNAB 400: upload do arquivo, parse por banco (registry de parsers), geração de operações e recebíveis comerciais (trade_receivables). Permite avaliação de títulos e conciliação com cadastro de cliente; depende de vínculos cliente–sacado quando aplicável."
        color="teal"
        gradient="bg-gradient-to-br from-[hsl(175,45%,18%)] to-[hsl(175,40%,28%)]"
        roles={[...CNAB_WIKI_ROLES]}
        flowSteps={[
          { label: 'Upload', desc: 'Arquivo armazenado em cnab_remittance_files com metadados e status.' },
          { label: 'Parse', desc: 'Parser selecionado por layout/banco; linhas viram registros e operação.' },
          { label: 'Operação', desc: 'cnab_operations consolida o lote por arquivo/cliente com estados de processamento.' },
          { label: 'Recebíveis', desc: 'trade_receivables guarda títulos com referência ao arquivo CNAB e sequência.' },
          { label: 'Avaliação', desc: 'Endpoints de evaluate / batch associam decisões de risco aos recebíveis.' },
        ]}
        features={[
          'Multi-banco via CnabParserRegistry (ex.: Bradesco BMP, extensível)',
          'Listagem e filtros de arquivos, operações e recebíveis por cliente',
          'Integração com modelo de cliente e limites comerciais',
        ]}
        tables={[
          {
            name: 'cnab_remittance_files',
            description: 'Arquivo de remessa enviado e metadados (layout, data, status).',
            keyColumns: ['id', 'client_id', 'status', 'remittance_date', 'layout_version'],
          },
          {
            name: 'cnab_operations',
            description: 'Operação de liquidação/remessa derivada do arquivo.',
            keyColumns: ['id', 'cnab_file_id', 'client_id', 'status'],
          },
          {
            name: 'trade_receivables',
            description: 'Títulos/recebíveis extraídos do CNAB, com valor, vencimento e vínculo ao arquivo.',
            keyColumns: ['id', 'cnab_file_id', 'amount', 'due_date', 'cnab_record_sequence'],
          },
        ]}
      />
    </PageWrapper>
  );
}
