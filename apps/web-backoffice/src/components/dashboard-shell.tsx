'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@nexus/ui';
import { Sidebar } from './sidebar';
import { SidebarContent } from './sidebar-content';
import { Header } from './header';
import type { Role } from '@nexus/types';

interface DashboardShellProps {
  role: Role;
  fullName: string;
  email: string;
  children: React.ReactNode;
}

export function DashboardShell({ role, fullName, email, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col gap-0 border-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex flex-col h-full bg-muted/30 pt-14">
            <SidebarContent role={role} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Header
          fullName={fullName}
          role={role}
          email={email}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:px-10 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
