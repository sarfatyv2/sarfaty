'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRoleConfig } from '@/contexts/role-context';
import { icons } from 'lucide-react';

interface SidebarContentProps {
  onNavigate?: () => void;
}

const USER_MENU_SECTION = 'Meu Espaço';

export function SidebarContent({ onNavigate }: Readonly<SidebarContentProps>) {
  const pathname = usePathname();
  const config = useRoleConfig();

  const sidebarSections = config.sidebar.filter(
    (section) => section.section !== USER_MENU_SECTION,
  );

  const allRoutes = sidebarSections.flatMap((s) => s.items.map((i) => i.route));
  const activeRoute = allRoutes
    .filter((route) => pathname === route || pathname.startsWith(route + '/'))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <>
      <div className="p-6 flex items-center justify-center shrink-0">
        <Image src="/logo.svg" alt="Grupo Sarfaty" width={130} height={38} priority />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {sidebarSections.map((section) => (
          <div key={section.section} className="mb-8">
            <p className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {section.section}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => {
                const IconComponent = icons[item.icon as keyof typeof icons];
                const isActive = item.route === activeRoute;
                return (
                  <Link
                    key={item.route}
                    href={item.route}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent size={18} className={isActive ? 'text-primary-foreground' : ''} />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}
