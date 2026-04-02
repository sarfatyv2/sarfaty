# ─── Stage 1: base ───────────────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# ─── Stage 2: deps ───────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web-backoffice/package.json ./apps/web-backoffice/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/
COPY packages/utils/package.json ./packages/utils/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile

# ─── Stage 3: builder ────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY . .

# Variáveis de build-time necessárias para o Next.js (NEXT_PUBLIC_*)
# Passe via --build-arg ou defina aqui sem valores sensíveis
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN pnpm turbo build --filter=web-backoffice

# ─── Stage 4: runner ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# O output standalone já inclui os node_modules necessários
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-backoffice/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-backoffice/.next/static ./apps/web-backoffice/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-backoffice/public ./apps/web-backoffice/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web-backoffice/server.js"]
