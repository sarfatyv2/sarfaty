'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, Badge, Button } from '@nexus/ui';
import { ROLE_PERMISSIONS, type Role } from '@nexus/types';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  fullName: string;
  role: Role;
  email: string;
  onMenuClick?: () => void;
}

export function Header({ fullName, role, email, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const config = ROLE_PERMISSIONS[role];

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

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
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Badge variant="secondary" className="hidden sm:inline-flex shrink-0">
          {config.label}
        </Badge>
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">{initials || email.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate hidden sm:inline">{fullName || email}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair" className="shrink-0">
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}
