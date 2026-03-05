'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@nexus/ui';
import { ROLE_PERMISSIONS, type Role } from '@nexus/types';
import { ChevronDown, LogOut, icons } from 'lucide-react';

const USER_MENU_SECTION = 'Meu Espaço';

interface UserMenuProps {
  fullName: string;
  role: Role;
  email: string;
  avatarUrl?: string;
}

export function UserMenu({ fullName, role, email, avatarUrl }: Readonly<UserMenuProps>) {
  const router = useRouter();
  const supabase = createClient();
  const config = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.employee;

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const userMenuSection = config.sidebar.find(
    (section) => section.section === USER_MENU_SECTION,
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-0"
        >
          <Avatar className="h-10 w-10 shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback className="text-xs">
              {initials || email.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate hidden sm:inline max-w-[140px]">
            {fullName || email}
          </span>
          <ChevronDown size={14} className="shrink-0 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{fullName || email}</p>
            <p className="text-xs text-muted-foreground leading-none">{email}</p>
            <Badge variant="secondary" className="mt-1.5 w-fit text-[10px]">
              {config.label}
            </Badge>
          </div>
        </DropdownMenuLabel>
        {userMenuSection && userMenuSection.items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {userMenuSection.items.map((item) => {
                const IconComponent = icons[item.icon as keyof typeof icons];
                return (
                  <DropdownMenuItem key={item.route} asChild className="cursor-pointer">
                    <Link href={item.route} className="flex items-center gap-2">
                      {IconComponent && <IconComponent size={16} />}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut size={16} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
