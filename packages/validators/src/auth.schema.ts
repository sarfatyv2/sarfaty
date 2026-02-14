import { z } from 'zod';
import { emailSchema } from './common';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6),
});

export type LoginDto = z.infer<typeof loginSchema>;
