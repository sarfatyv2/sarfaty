# ─── Stage 1: base ───────────────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# ─── Stage 2: deps ───────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile

# ─── Stage 3: builder ────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY . .

RUN pnpm turbo build --filter=api

# Deploy produz um diretório com a app + node_modules de produção (sem dev deps)
# e resolve os workspace packages (@nexus/*) inline
RUN pnpm --filter=api --prod deploy /prod/api

# ─── Stage 4: runner ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /prod/api .

EXPOSE 4000

CMD ["node", "dist/main"]
