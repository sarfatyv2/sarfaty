import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@nexus/ui';
import { Plus } from 'lucide-react';
import { serverFetch } from '@/lib/api-server';
import { UsersTable } from './_components/users-table';

export const metadata: Metadata = {
  title: 'Usuários | Sarfaty',
  description: 'Gerenciamento de usuários da plataforma',
};

interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean | null;
  createdAt: string | null;
}

export default async function AdminUsersPage() {
  let users: UserListItem[] = [];
  let error: string | null = null;

  try {
    const result = await serverFetch<UserListItem[]>('/users', {
      page: 1,
      pageSize: 100,
      sortBy: 'fullName',
      sortOrder: 'asc',
    });
    const raw = result.data as unknown;
    if (Array.isArray(raw)) {
      users = raw.map((u) => {
        const row = u as Record<string, unknown>;
        return {
          id: String(row.id),
          fullName: String(row.fullName ?? ''),
          email: String(row.email ?? ''),
          role: String(row.role ?? ''),
          isActive: (row.isActive as boolean | null) ?? null,
          createdAt:
            row.createdAt != null
              ? typeof row.createdAt === 'string'
                ? row.createdAt
                : new Date(row.createdAt as Date).toISOString()
              : null,
        };
      });
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Falha ao carregar usuários';
  }

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
          {error}
        </div>
      ) : (
        <UsersTable users={users} />
      )}
    </div>
  );
}
