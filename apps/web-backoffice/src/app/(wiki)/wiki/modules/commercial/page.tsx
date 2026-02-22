'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { Briefcase } from 'lucide-react';

export default function CommercialModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={Briefcase}
        name="Módulo Comercial"
        domain="Módulo"
        description="Gestão completa do ciclo de vida de clientes PJ e PF, com 21 status distintos, checklist dinâmico de documentos baseado em segmento, produto e garantias, e rastreabilidade total de transições de status."
        color="green"
        gradient="bg-gradient-to-br from-[hsl(150,50%,10%)] to-[hsl(150,40%,18%)]"
        roles={['sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'compliance_officer', 'approver', 'backoffice', 'admin']}
        flowSteps={[
          { label: 'Prospecção', desc: 'Cliente criado com status draft. CNPJ/CPF registrado. Segmento e produto de crédito selecionados.' },
          { label: 'Documentação', desc: 'Checklist dinâmico gerado por função SQL: documentos base + segmento + produto + garantias.' },
          { label: 'Análise de Crédito', desc: 'Consulta Vadu (CNPJ/CPF) e Creditbox. Relatório comercial registrado. Status muda para pending_analysis.' },
          { label: 'Aprovação', desc: 'Approver analisa documentos e relatório. Pode solicitar complementação ou aprovar/reprovar.' },
          { label: 'Ativação', desc: 'Cliente ativado com status active. Conta financeira criada. Pipeline e metas atualizados.' },
        ]}
        features={[
          '21 status distintos no ciclo de vida do cliente',
          'Checklist dinâmico: documentos por segmento + produto + garantias',
          'Consulta automática de CNPJ/CPF via Vadu',
          'Relatórios comerciais com registro de visitas',
          'Histórico completo de transições de status',
          'Múltiplos contatos, endereços e contas bancárias por cliente',
          'Pessoas autorizadas (sócios, procuradores)',
          'Garantias vinculadas ao cadastro',
          'Metas de vendas por nível (individual, equipe, região)',
          'Templates de documentos por segmento/produto/garantia',
        ]}
        tables={[
          { name: 'clients', description: 'Tabela principal com dados de PJ/PF, status atual e responsável.', keyColumns: ['id', 'cnpj', 'status', 'segment_id', 'assigned_to'] },
          { name: 'client_documents', description: 'Documentos do checklist com status de validação.', keyColumns: ['client_id', 'category', 'status', 'file_url'] },
          { name: 'client_guarantees', description: 'Garantias vinculadas ao processo de crédito.', keyColumns: ['client_id', 'guarantee_type_id', 'value'] },
          { name: 'client_status_history', description: 'Trilha de auditoria das transições de status.', keyColumns: ['client_id', 'from_status', 'to_status', 'actor_id'] },
          { name: 'client_contacts', description: 'Múltiplos contatos por cliente.', keyColumns: ['client_id', 'name', 'role', 'email', 'phone'] },
          { name: 'client_addresses', description: 'Endereços (comercial, entrega, cobrança).', keyColumns: ['client_id', 'type', 'cep', 'street'] },
          { name: 'client_bank_accounts', description: 'Contas bancárias do cliente.', keyColumns: ['client_id', 'bank', 'agency', 'account'] },
          { name: 'client_authorized_persons', description: 'Sócios e procuradores autorizados.', keyColumns: ['client_id', 'cpf', 'name', 'role'] },
          { name: 'client_commercial_reports', description: 'Relatórios de visita comercial.', keyColumns: ['client_id', 'author_id', 'content', 'visited_at'] },
          { name: 'sales_goals', description: 'Metas de vendas por nível (individual / equipe / região).', keyColumns: ['level', 'target_id', 'amount', 'period'] },
          { name: 'segments', description: 'Segmentos de mercado dos clientes.', keyColumns: ['id', 'name', 'code'] },
          { name: 'credit_products', description: 'Produtos de crédito disponíveis.', keyColumns: ['id', 'name', 'code', 'type'] },
          { name: 'guarantee_types', description: 'Tipos de garantia aceitos.', keyColumns: ['id', 'name', 'code'] },
          { name: 'segment_document_templates', description: 'Templates de documentos por segmento.', keyColumns: ['segment_id', 'document_key', 'required'] },
        ]}
      />
    </PageWrapper>
  );
}
