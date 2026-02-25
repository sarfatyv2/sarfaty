import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Button } from '@nexus/ui';
import { Plus } from 'lucide-react';
import { UsersTable } from './_components/users-table';

export const metadata: Metadata = {
  title: 'Usuários | Sarfaty',
  description: 'Gerenciamento de usuários da plataforma',
};

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean | null;
  created_at: string | null;
}

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at')
    .order('created_at', { ascending: false });

  const profileRows: ProfileRow[] = (users ?? []) as ProfileRow[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários da plataforma
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus size={16} />
            Novo Usuário
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Erro ao carregar usuários: {error.message}
        </div>
      ) : (
        <UsersTable users={profileRows} />
      )}
    </div>
  );
}
