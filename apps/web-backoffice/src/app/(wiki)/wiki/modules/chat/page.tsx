'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { Bot } from 'lucide-react';

const CHAT_ROLES = ['sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin'] as const;

export default function ChatModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={Bot}
        name="Chat assistente (IA)"
        domain="Clientes"
        description="Endpoint conversacional por cliente: o use case BuildClientChatContext monta um contexto com dados do cadastro e documentos relevantes; SendClientChatMessageUseCase envia histórico + mensagem ao Google Gemini e devolve a resposta. Não há tabela dedicada de mensagens — histórico é enviado pelo cliente (stateless no servidor)."
        color="purple"
        gradient="bg-gradient-to-br from-[hsl(280,45%,20%)] to-[hsl(280,35%,32%)]"
        roles={[...CHAT_ROLES]}
        flowSteps={[
          { label: 'Contexto', desc: 'BuildClientChatContext agrega dados permitidos do cliente para o prompt de sistema.' },
          { label: 'Mensagem', desc: 'POST /clients/:clientId/chat com mensagem e histórico recente (DTO validado por Zod).' },
          { label: 'LLM', desc: 'GeminiChatService chama o modelo configurado e retorna texto ao backoffice.' },
        ]}
        features={[
          'Guard de roles alinhado ao controller (commercial hierarchy + admin)',
          'Sem persistência obrigatória de threads — adequado a assistente pontual na ficha do cliente',
        ]}
        tables={[
          {
            name: '—',
            description:
              'Persistência de conversas não faz parte do schema atual; eventual auditoria pode usar logs da API ou evolução futura de tabelas.',
            keyColumns: [],
          },
        ]}
      />
    </PageWrapper>
  );
}
