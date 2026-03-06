'use client';

import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, ChatContainer } from '@nexus/ui';
import { MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useChat } from '@/hooks/use-chat';

const QUICK_PROMPTS = [
  'Quais documentos faltam?',
  'Resumo do bureau',
  'Contatos principais',
  'O que falta para aprovar?',
];

interface ClientChatTabProps {
  clientId: string;
}

export function ClientChatTab({ clientId }: Readonly<ClientChatTabProps>) {
  const apiSendMessage = useCallback(
    async (message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>) => {
      const res = await api.post<{ content: string }>(
        `/clients/${clientId}/chat`,
        { message, history },
      );
      return res.data.content;
    },
    [clientId],
  );

  const { messages, isLoading, send } = useChat({
    sendMessage: async (message, history) => {
      const historyForApi = history.map((m) => ({ role: m.role, content: m.content }));
      return apiSendMessage(message, historyForApi);
    },
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle size={15} className="text-primary" />
          Chat — Dúvidas sobre o cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px]">
          <ChatContainer
            messages={messages}
            onSend={send}
            isLoading={isLoading}
            quickPrompts={QUICK_PROMPTS}
            emptyMessage="Faça uma pergunta sobre documentos, bureau, contatos ou o status do cliente."
          />
        </div>
      </CardContent>
    </Card>
  );
}
