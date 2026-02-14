'use client';

import { type Role } from '@nexus/types';
import { SidebarContent } from './sidebar-content';

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen bg-muted/30 border-r border-border">
      <SidebarContent role={role} />
    </aside>
  );
}
