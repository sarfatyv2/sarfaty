'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { Landmark } from 'lucide-react';

export default function GovernanceModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={Landmark}
        name="Módulo de Governança"
        domain="Módulo"
        description="Gerencia a governança corporativa da Sarfaty: comitês internos, reuniões com agendamento e atas em rich text, itens de ação rastreados com responsáveis e prazos, e atualizações de progresso. CRON diário envia lembretes automáticos para prazos próximos e vencidos."
        color="indigo"
        gradient="bg-gradient-to-br from-[hsl(240,50%,18%)] to-[hsl(240,40%,26%)]"
        roles={['governance', 'admin', 'legal', 'compliance_officer', 'backoffice', 'sales_director (leitura)', 'hr_admin (leitura)', 'people_manager (leitura)']}
        flowSteps={[
          { label: 'Comitê', desc: 'Comitê criado com nome, frequência (semanal/quinzenal/mensal/trimestral/ad-hoc) e regulamento em rich text.' },
          { label: 'Membros', desc: 'Integrantes convidados com roles específicos: presidente, secretário ou membro. Unicidade garantida por constraint.' },
          { label: 'Reunião', desc: 'Reunião agendada com data, local/link e pauta. Status: scheduled → happening → completed / canceled.' },
          { label: 'Ata', desc: 'Ata criada ou atualizada em rich text (Tiptap/ProseMirror). Relação 1:1 com a reunião via upsert.' },
          { label: 'Publicação', desc: 'Ata publicada (draft → published). Após publicação, fica disponível para todos os roles com acesso de leitura.' },
          { label: 'Ação', desc: 'Itens de ação criados com título, responsável, prazo e grupo. Status: todo → in_progress → blocked / done. CRON envia lembretes diários.' },
        ]}
        features={[
          'Comitês com frequência configurável e regulamento em rich text',
          'Membros com roles: presidente, secretário ou membro',
          'Constraint de unicidade — um profile por comitê',
          'Reuniões com agendamento, local/link e gestão de status',
          'Atas em rich text (Tiptap) — upsert por reunião (1:1)',
          'Publicação de ata com timestamp automático',
          'Itens de ação rastreados com responsável, prazo e grupo',
          'Atualizações de progresso com histórico de status',
          'isOverdue() e isDueSoon() calculados na entidade de domínio',
          'CRON diário às 8h — lembretes para prazos nos próximos 3 dias',
          'CRON diário às 9h — lembretes para ações com prazo vencido',
          '12 use-cases, 4 repositories, 3 controllers, 4 mappers',
        ]}
        tables={[
          {
            name: 'gov_committees',
            description: 'Comitês corporativos com frequência e regulamento.',
            keyColumns: ['id', 'name', 'description', 'regulation', 'frequency', 'status', 'created_by'],
          },
          {
            name: 'gov_committee_members',
            description: 'Membros de cada comitê. UNIQUE(committee_id, profile_id).',
            keyColumns: ['id', 'committee_id', 'profile_id', 'role', 'invited_by'],
          },
          {
            name: 'gov_meetings',
            description: 'Reuniões agendadas por comitê com status de ciclo de vida.',
            keyColumns: ['id', 'committee_id', 'title', 'scheduled_at', 'location_or_link', 'status', 'created_by'],
          },
          {
            name: 'gov_meeting_minutes',
            description: 'Ata de reunião em rich text (JSONB). 1:1 com reunião.',
            keyColumns: ['id', 'meeting_id', 'content', 'status', 'published_at', 'published_by', 'created_by'],
          },
          {
            name: 'gov_action_items',
            description: 'Itens de ação com responsável, prazo e agrupador.',
            keyColumns: ['id', 'committee_id', 'minute_id', 'title', 'assignee_id', 'group_label', 'due_date', 'status'],
          },
          {
            name: 'gov_action_updates',
            description: 'Atualizações de progresso de itens de ação com histórico de status.',
            keyColumns: ['id', 'action_item_id', 'author_id', 'comment', 'status_change', 'created_at'],
          },
        ]}
      />
    </PageWrapper>
  );
}
