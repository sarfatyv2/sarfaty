'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { Bell } from 'lucide-react';

export default function NotificationsModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={Bell}
        name="Módulo de Notificações"
        domain="Módulo"
        description="Sistema event-driven de notificações in-app em tempo real. Todos os módulos disparam eventos que são processados por handlers específicos e entregues aos usuários relevantes com link de ação."
        color="orange"
        gradient="bg-gradient-to-br from-[hsl(25,55%,18%)] to-[hsl(25,45%,26%)]"
        roles={['todas as roles']}
        flowSteps={[
          { label: 'Evento', desc: 'Qualquer módulo emite um evento de domínio (ex: client.status.changed, invoice.pending).' },
          { label: 'Dispatcher', desc: 'NotificationDispatcherService recebe o evento e identifica o handler responsável.' },
          { label: 'Handler', desc: 'Handler específico (ClientNotificationHandler, PeopleNotificationHandler, etc.) processa o evento.' },
          { label: 'Resolver', desc: 'NotificationResolverService determina os destinatários corretos com base no role e contexto.' },
          { label: 'Entrega', desc: 'Notification criada na tabela com title, body, type e action_url. Usuário vê no sino.' },
        ]}
        features={[
          'Módulo global — disponível para toda a aplicação',
          'Padrão event-driven com handlers por domínio',
          'Tipos de notificação: client, people, learning, financial, system',
          'Resolução inteligente de destinatários por role e contexto',
          'Link de ação (action_url) para navegação direta',
          'Centro de notificações com paginação e filtros',
          'Marcação individual ou em massa como lida',
          'Badge de contador não lidas no header',
          'Notificações persistidas — histórico disponível',
          'Futuramente: push notifications e email digest',
        ]}
        tables={[
          {
            name: 'notifications',
            description: 'Todas as notificações in-app da plataforma.',
            keyColumns: ['id', 'user_id', 'type', 'title', 'body', 'action_url', 'read_at', 'created_at'],
          },
        ]}
      />
    </PageWrapper>
  );
}
