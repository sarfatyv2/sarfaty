'use client';

import { createContext, useContext } from 'react';
import type { Role } from '@nexus/types';

const RoleContext = createContext<Role | null>(null);

export function RoleProvider({
  role,
  children,
}: Readonly<{
  role: Role;
  children: React.ReactNode;
}>) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole(): Role {
  const role = useContext(RoleContext);
  if (!role) {
    return 'employee';
  }
  return role;
}
