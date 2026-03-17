'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Role, RoleConfig } from '@nexus/types';

interface RoleContextValue {
  role: Role;
  config: RoleConfig;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({
  role,
  config,
  children,
}: Readonly<{
  role: Role;
  config: RoleConfig;
  children: React.ReactNode;
}>) {
  const value = useMemo(() => ({ role, config }), [role, config]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): Role {
  const ctx = useContext(RoleContext);
  return ctx?.role ?? 'employee';
}

export function useRoleConfig(): RoleConfig {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRoleConfig must be used within a RoleProvider');
  }
  return ctx.config;
}
