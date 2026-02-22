'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { BarChart2 } from 'lucide-react';

export default function PipelineModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={BarChart2}
        name="Módulo de Pipeline"
        domain="Módulo"
        description="Visualização e gestão do funil comercial com 7 estágios, do primeiro contato até a ativação ou perda. Métricas de conversão, tempo médio por etapa e visão kanban para times comerciais."
        color="amber"
        gradient="bg-gradient-to-br from-[hsl(35,55%,18%)] to-[hsl(35,50%,26%)]"
        roles={['sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin']}
        flowSteps={[
          { label: 'Prospecção', desc: 'Primeiro contato registrado. Cliente em status draft.' },
          { label: 'Documentação', desc: 'Checklist enviado. Cliente submetendo documentos.' },
          { label: 'Análise', desc: 'Documentos em revisão. Consultas de crédito em andamento.' },
          { label: 'Aprovação', desc: 'Dossier completo encaminhado ao aprovador.' },
          { label: 'Aprovado', desc: 'Crédito aprovado. Aguardando formalização.' },
          { label: 'Ativo', desc: 'Operação formalizada. Cliente ativo na carteira.' },
          { label: 'Perdido', desc: 'Processo encerrado sem ativação (reprovar, desistir, etc.).' },
        ]}
        features={[
          '7 estágios no funil: prospecting → documentation → analysis → approval → approved → active → lost',
          'Visão kanban com drag-and-drop entre estágios',
          'Métricas de conversão entre etapas em tempo real',
          'Taxa de conversão geral e por responsável',
          'Tempo médio de permanência em cada etapa',
          'Filtros por responsável, região, equipe e período',
          'Alertas para oportunidades sem movimentação (stale)',
          'Exportação de dados de funil para relatórios',
        ]}
        tables={[
          {
            name: 'clients',
            description: 'O stage do pipeline é derivado do status do cliente. Não há tabela separada.',
            keyColumns: ['id', 'status → stage derivado', 'assigned_to', 'updated_at'],
          },
          {
            name: 'client_status_history',
            description: 'Histórico de mudanças de status permite calcular tempo em cada etapa.',
            keyColumns: ['client_id', 'from_status', 'to_status', 'created_at'],
          },
        ]}
      />
    </PageWrapper>
  );
}
