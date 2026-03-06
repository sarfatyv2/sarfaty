import * as React from 'react';
import { cn } from './lib/utils';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  className?: string;
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ role, content, className }, ref) => {
    const isUser = role === 'user';
    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full',
          isUser ? 'justify-end' : 'justify-start',
          className,
        )}
      >
        <div
          className={cn(
            'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground',
          )}
        >
          {content}
        </div>
      </div>
    );
  },
);
ChatMessage.displayName = 'ChatMessage';

export { ChatMessage };
