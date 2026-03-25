'use client';

import { PageWrapper } from '../../../_components/page-wrapper';
import { ModulePageLayout } from '../../../_components/module-page-layout';
import { KeyRound } from 'lucide-react';
import { ROLES } from '@nexus/types';

export default function RolesModulePage() {
  return (
    <PageWrapper>
      <ModulePageLayout
        icon={KeyRound}
        name="Módulo de Roles e RBAC"
        domain="Segurança"
        description="Definição dinâmica de permissões por role no PostgreSQL (roles, role_permissions). O RbacGuard da API carrega a configuração com cache; o backoffice usa GET /my/permissions para montar menus e ações. Catálogos de módulos e features vêm de @nexus/types (MODULE_CATALOG, FEATURE_CATALOG)."
        color="indigo"
        gradient="bg-gradient-to-br from-[hsl(250,50%,22%)] to-[hsl(250,35%,35%)]"
        roles={[...ROLES]}
        flowSteps={[
          { label: 'Persistência', desc: 'Tabelas roles (key, nome) e role_permissions (módulo, feature, allowed).' },
          { label: 'API', desc: 'RbacGuard compara feature requerida com o conjunto permitido para o role do JWT.' },
          { label: 'UI', desc: 'GET /my/permissions retorna módulos e features habilitados para o usuário logado.' },
          { label: 'Admin', desc: 'CRUD de roles e toggles de permissões restringidos a admin (endpoints em RolesController).' },
        ]}
        features={[
          'Híbrido: tipos estáticos para catálogo e fallback; banco como fonte de verdade para autorização na API',
          'GET /my/permissions e GET /catalog/modules para configurar experiência do backoffice',
          'Cache de configuração por role (role-config) para reduzir leituras ao banco',
        ]}
        tables={[
          {
            name: 'roles',
            description: 'Registro de papéis (key única, nome legível).',
            keyColumns: ['id', 'key', 'name', 'description'],
          },
          {
            name: 'role_permissions',
            description: 'Permissões granulares: qual módulo/feature cada role pode acessar.',
            keyColumns: ['role_id', 'module', 'feature', 'allowed'],
          },
        ]}
      >
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-[hsl(150,50%,20%)] uppercase tracking-wider">Endpoints relevantes</span>
          </div>
          <div className="flex flex-col gap-2 text-[11px] text-[hsl(150,15%,48%)]">
            <div className="p-3 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
              <code className="font-mono text-[hsl(150,40%,20%)]">GET /my/permissions</code>
              <p className="mt-1 leading-relaxed">Config efetiva do usuário autenticado (derivada do role no JWT).</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[hsl(30,20%,88%)] shadow-sm">
              <code className="font-mono text-[hsl(150,40%,20%)]">GET /catalog/modules</code> e{' '}
              <code className="font-mono">GET /catalog/features</code>
              <p className="mt-1 leading-relaxed">Catálogos para tela de administração (protegidos para admin).</p>
            </div>
          </div>
        </div>
      </ModulePageLayout>
    </PageWrapper>
  );
}
