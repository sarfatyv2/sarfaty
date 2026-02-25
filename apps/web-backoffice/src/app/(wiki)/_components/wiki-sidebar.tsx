'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Home,
  Layers,
  Database,
  Briefcase,
  CreditCard,
  Users,
  BarChart2,
  DollarSign,
  TrendingUp,
  BookOpen,
  Bell,
  ChevronDown,
  ChevronLeft,
  Building2,
  Menu,
  ArrowRightLeft,
  Landmark,
  MessageSquare,
  FileSearch,
} from 'lucide-react';
import { Sheet, SheetContent } from '@nexus/ui';

const navGroups = [
  {
    label: null,
    items: [
      { href: '/wiki', label: 'Visão Geral', icon: Home },
      { href: '/wiki/architecture', label: 'Arquitetura', icon: Layers },
      { href: '/wiki/database', label: 'Banco de Dados', icon: Database },
      { href: '/wiki/migration', label: 'Migração Legado → Novo', icon: ArrowRightLeft },
    ],
  },
  {
    label: 'Módulos',
    items: [
      { href: '/wiki/modules/commercial', label: 'Comercial', icon: Briefcase },
      { href: '/wiki/modules/credit', label: 'Crédito', icon: CreditCard },
      { href: '/wiki/modules/drawees', label: 'Sacados', icon: Building2 },
      { href: '/wiki/modules/pipeline', label: 'Pipeline', icon: BarChart2 },
      { href: '/wiki/modules/financial', label: 'Financeiro', icon: DollarSign },
      { href: '/wiki/modules/debentures', label: 'Debêntures', icon: TrendingUp },
      { href: '/wiki/modules/people', label: 'Pessoas', icon: Users },
      { href: '/wiki/modules/learning', label: 'Aprendizagem', icon: BookOpen },
      { href: '/wiki/modules/notifications', label: 'Notificações', icon: Bell },
      { href: '/wiki/modules/governance', label: 'Governança', icon: Landmark },
      { href: '/wiki/modules/communication', label: 'Communication', icon: MessageSquare },
      { href: '/wiki/modules/irpf', label: 'IRPF (Agente IA)', icon: FileSearch },
    ],
  },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="relative block">
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-[hsl(45,50%,88%)] rounded-r-full"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      <motion.div
        className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.15 }}
      >
        <Icon size={15} className={isActive ? 'text-[hsl(45,50%,88%)]' : ''} />
        <span className="font-light">{label}</span>
      </motion.div>
    </Link>
  );
}

function SidebarContent() {
  const [modulesOpen, setModulesOpen] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[hsl(150,50%,10%)] text-white overflow-y-auto">
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/wiki" className="flex justify-center">
          <Image src="/logo.svg" alt="Sarfaty" width={120} height={34} className="brightness-0 invert" />
        </Link>
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Documentação</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[hsl(45,50%,88%)]/20 text-[hsl(45,50%,88%)]">v1.0</span>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {navGroups.map((group) => (
          <div key={group.label ?? 'main'} className="mb-4">
            {group.label && (
              <button
                onClick={() => setModulesOpen(!modulesOpen)}
                className="flex items-center justify-between w-full px-5 py-1.5 mb-1"
              >
                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                  {group.label}
                </span>
                <motion.div
                  animate={{ rotate: modulesOpen ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={12} className="text-white/30" />
                </motion.div>
              </button>
            )}
            <AnimatePresence initial={false}>
              {(group.label === null || modulesOpen) && (
                <motion.div
                  initial={group.label ? { height: 0, opacity: 0 } : false}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {group.items.map((item) => (
                    <NavItem key={item.href} {...item} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-white/10">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm font-light text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Voltar ao Login</span>
        </Link>
      </div>
    </div>
  );
}

export function WikiSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 h-full bg-[hsl(150,50%,10%)]">
        <SidebarContent />
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(150,50%,10%)] text-white shadow-md"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[260px] bg-transparent border-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
