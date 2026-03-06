'use client';

import { useState, useCallback } from 'react';
import type { ChatMessageData } from '@nexus/ui';

export interface UseChatOptions {
  sendMessage: (message: string, history: ChatMessageData[]) => Promise<string>;
  initialMessages?: ChatMessageData[];
}

export function useChat({ sendMessage, initialMessages = [] }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessageData = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const content = await sendMessage(trimmed, messages);

        const assistantMessage: ChatMessageData = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
        setError(errorMessage);
        const errorMsg: ChatMessageData = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Desculpe, ocorreu um erro: ${errorMessage}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, sendMessage],
  );

  return { messages, isLoading, error, send };
}
