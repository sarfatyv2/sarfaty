import { z } from 'zod';

export const sendChatMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

export type SendChatMessageDto = z.infer<typeof sendChatMessageSchema>;
