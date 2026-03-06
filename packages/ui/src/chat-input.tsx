import * as React from 'react';
import { cn } from './lib/utils';

export interface ChatInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmit?: (value: string) => void;
  submitLabel?: string;
  disabled?: boolean;
  className?: string;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (
    {
      onSubmit,
      submitLabel = 'Enviar',
      disabled = false,
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState('');

    const handleSubmit = React.useCallback(() => {
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      onSubmit?.(trimmed);
      setValue('');
    }, [value, disabled, onSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      onKeyDown?.(e);
    };

    return (
      <div
        className={cn(
          'flex gap-2 rounded-lg border border-input bg-background p-2',
          className,
        )}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Digite sua mensagem..."
          rows={1}
          className={cn(
            'min-h-[40px] max-h-32 flex-1 resize-none rounded-md border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...props}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className={cn(
            'flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {submitLabel}
        </button>
      </div>
    );
  },
);
ChatInput.displayName = 'ChatInput';

export { ChatInput };
