import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  VADU_API_KEY: z.string().min(1).default('dummy'),
  SERASA_CLIENT_ID: z.string().optional().default(''),
  SERASA_CLIENT_SECRET: z.string().optional().default(''),
  SERASA_ENV: z.enum(['uat', 'prod']).optional().default('uat'),
  CGU_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  ALLCHECK_USER_ID: z.string().min(1).default('dummy'),
  ALLCHECK_USER_TOKEN: z.string().min(1).default('dummy'),
  UPMINER_CLIENT_ID: z.string().optional().default(''),
  UPMINER_CLIENT_SECRET: z.string().optional().default(''),
  UPMINER_BASE_URL: z.string().url().optional().default('https://upapi-orchestrator.uplexis.com'),
  CERC_CLIENT_ID: z.string().optional().default(''),
  CERC_CLIENT_SECRET: z.string().optional().default(''),
  CERC_SUSTAINABILITY_TOKEN: z.string().optional().default(''),
  CERC_BASE_URL: z.string().url().optional().default('https://api.int.cerc.com'),
  CERC_VEICULO_ID: z.string().optional().default(''),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
