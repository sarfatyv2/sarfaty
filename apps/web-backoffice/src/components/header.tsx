'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@nexus/ui';
import { type Role } from '@nexus/types';
import { Menu } from 'lucide-react';
import { UserMenu } from './user-menu';

interface HeaderProps {
  fullName: string;
  role: Role;
  email: string;
  onMenuClick?: () => void;
}

export function Header({ fullName, role, email, onMenuClick }: Readonly<HeaderProps>) {
  return (
    <header className="h-14 border-b bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            title="Menu"
            className="lg:hidden shrink-0"
          >
            <Menu size={20} />
          </Button>
        )}
        <Link href="/" className="lg:hidden shrink-0 flex items-center">
          <Image src="/logo.svg" alt="Grupo Sarfaty" width={100} height={30} className="h-7 w-auto" />
        </Link>
      </div>
      <UserMenu fullName={fullName} role={role} email={email} />
    </header>
  );
}
