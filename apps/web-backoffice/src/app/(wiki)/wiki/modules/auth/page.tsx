'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { ShieldCheck } from 'lucide-react';
import { ROLES } from '@nexus/types';

const endpoints = [
  { method: 'POST', path: '/api/auth/login', auth: false, desc: 'Autentica email + senha; retorna access token, refresh token e dados do usuário.' },
  { method: 'POST', path: '/api/auth/refresh', auth: false, desc: 'Rotaciona tokens via header x-refresh-token. Revoga o token anterior e emite novos.' },
  { method: 'GET',  path: '/api/auth/me',      auth: true,  desc: 'Retorna perfil do usuário autenticado (id, fullName, email, role, avatarUrl).' },
];

const envVars = [
  { name: 'JWT_SECRET', app: 'api + web-backoffice', desc: 'Segredo HS256 ≥ 32 chars. Deve ser idêntico nos dois apps. Gere com: openssl rand -base64 32' },
  { name: 'JWT_ACCESS_EXPIRES_IN', app: 'api', desc: 'Expiração do access token. Formato: 15m, 1h etc. Default sugerido: 15m.' },
  { name: 'JWT_REFRESH_EXPIRES_IN', app: 'api', desc: 'Expiração do refresh token. Formato: 7d, 30d etc. Default sugerido: 7d.' },
  { name: 'NEXT_PUBLIC_API_URL', app: 'web-backoffice', desc: 'URL base da API. Ex.: http://localhost:4000/api (dev) ou https://api.sarfaty.com/api (prod).' },
];

const methodColor: Record<string, string> = {
  GET:    'bg-sky-100 text-sky-700',
  POST:   'bg-emerald-100 text-emerald-700',
  PATCH:  'bg-amber-100 text-amber-700',
  DELETE: 'bg-rose-100 text-rose-700',
};

export default function AuthModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={ShieldCheck}
        name="Módulo de Autenticação"
        domain="Segurança"
        description="Identidade e sessão da plataforma: login com email e senha, tokens JWT para APIs, refresh opaco com rotação e revogação por família. Credenciais ficam na aplicação (profiles.password_hash com Argon2id); o Supabase Auth não é mais usado para login. Storage e Realtime do Supabase permanecem para arquivos e notificações em tempo real."
        color="slate"
        gradient="bg-gradient-to-br from-slate-800 to-slate-600"
        roles={[...ROLES]}
        flowSteps={[
          {
            label: 'Login',
            desc: 'POST /api/auth/login no backoffice encaminha para POST /auth/login na API; validação de senha contra hash Argon2id e emissão de access JWT + refresh opaco.',
          },
          {
            label: 'Requisições',
            desc: 'Cliente envia Authorization: Bearer com access token; AuthGuard valida assinatura e payload (sub, email, role) sem consultar o banco por requisição.',
          },
          {
            label: 'Refresh',
            desc: 'Access expirado: middleware ou cliente usa refresh (cookie httpOnly); API rotaciona tokens, revoga o refresh anterior e persiste o novo hash.',
          },
          {
            label: 'Roubo de sessão',
            desc: 'Reuso de refresh já revogado dispara revogação de toda a família de tokens (mesmo family_id).',
          },
          {
            label: 'Logout',
            desc: 'POST /api/auth/logout remove cookies de sessão no domínio do backoffice.',
          },
        ]}
        features={[
          'Hash de senha Argon2id (memoryCost 64MB, timeCost 3, parallelism 4)',
          'Access token JWT HS256 com expiração curta (ex.: 15 min) e claims sub, email, role',
          'Refresh token opaco armazenado como SHA-256 em refresh_tokens; TTL configurável (ex.: 7 dias)',
          'Rotação de refresh a cada uso; detecção de reuso para revogar a família inteira',
          'RBAC existente (RolesGuard, RbacGuard) continua usando user_metadata.role no request',
          'Supabase reservado a Storage e Realtime; não há dependência do Supabase Auth para sessão',
        ]}
        tables={[
          {
            name: 'profiles',
            description: 'Perfil do usuário interno; password_hash guarda o hash Argon2id (nullable para perfis sem login).',
            keyColumns: ['id', 'email', 'role', 'password_hash', 'full_name'],
          },
          {
            name: 'refresh_tokens',
            description: 'Sessões de refresh: hash do token, family_id para rotação e revogação em lote, expiração e revogação.',
            keyColumns: ['user_id', 'token_hash', 'family_id', 'expires_at', 'revoked_at'],
          },
        ]}
      >
        {/* Endpoints */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Endpoints da API</span>
          </div>
          <div className="flex flex-col gap-2">
            {endpoints.map((ep) => (
              <div key={ep.path} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 ${methodColor[ep.method] ?? 'bg-slate-100 text-slate-700'}`}>
                  {ep.method}
                </span>
                <code className="text-xs font-mono text-[hsl(150,40%,20%)] shrink-0 mt-0.5">{ep.path}</code>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${ep.auth ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                  {ep.auth ? 'Auth' : 'Público'}
                </span>
                <p className="text-[11px] text-[hsl(150,15%,50%)] leading-relaxed">{ep.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Env vars */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Variáveis de Ambiente</span>
          </div>
          <div className="flex flex-col gap-2">
            {envVars.map((v) => (
              <div key={v.name} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
                <code className="text-[11px] font-mono font-bold text-[hsl(150,40%,20%)] shrink-0 min-w-[200px] mt-0.5">{v.name}</code>
                <span className="text-[10px] font-medium text-slate-400 shrink-0 mt-0.5 min-w-[100px]">{v.app}</span>
                <p className="text-[11px] text-[hsl(150,15%,50%)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tests */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Testes Unitários</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { file: 'auth/domain/password.service.spec.ts', desc: 'Hash e verificação Argon2id' },
              { file: 'auth/domain/token.service.spec.ts', desc: 'Emissão e verificação JWT, geração de refresh' },
              { file: 'auth/use-cases/login.use-case.spec.ts', desc: 'Fluxo de login: credenciais válidas e inválidas' },
              { file: 'auth/use-cases/refresh-token.use-case.spec.ts', desc: 'Rotação, expiração e reuso de refresh' },
              { file: 'common/guards/auth.guard.spec.ts', desc: 'Guard de autenticação: token válido, expirado e ausente' },
            ].map((t) => (
              <div key={t.file} className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-[hsl(30,20%,88%)] shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1 shrink-0" />
                <div>
                  <code className="text-[10px] font-mono text-[hsl(150,40%,20%)] block">{t.file}</code>
                  <p className="text-[11px] text-[hsl(150,15%,50%)] mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModulePageLayout>
    </PageWrapper>
  );
}
