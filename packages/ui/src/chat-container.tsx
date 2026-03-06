import * as React from 'react';
import { ScrollArea } from './scroll-area';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { cn } from './lib/utils';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContainerProps {
  messages: ChatMessageData[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  quickPrompts?: string[];
  emptyMessage?: string;
  className?: string;
}

const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  (
    {
      messages,
      onSend,
      isLoading = false,
      quickPrompts,
      emptyMessage = 'Faça uma pergunta sobre o cliente.',
      className,
    },
    ref,
  ) => {
    const bottomRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
      <div
        ref={ref}
        className={cn('flex h-full flex-col overflow-hidden', className)}
      >
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-3 pb-4">
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                {quickPrompts && quickPrompts.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => onSend(prompt)}
                        disabled={isLoading}
                        className="rounded-full border border-input bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                />
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  Pensando...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
        <div className="border-t p-3">
          <ChatInput
            onSubmit={onSend}
            disabled={isLoading}
            submitLabel="Enviar"
          />
        </div>
      </div>
    );
  },
);
ChatContainer.displayName = 'ChatContainer';

export { ChatContainer };
