'use client';

import { SidebarContent } from './sidebar-content';

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen bg-muted/30 border-r border-border">
      <SidebarContent />
    </aside>
  );
}
