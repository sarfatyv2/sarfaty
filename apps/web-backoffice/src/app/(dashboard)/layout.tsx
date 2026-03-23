import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DashboardShell } from '@/components/dashboard-shell';
import { fetchRoleConfig } from '@/lib/fetch-role-config';
import { ROLES, type Role } from '@nexus/types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/constants';
import { serverFetch } from '@/lib/api-server';

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect('/login');
  }

  const meResponse = await serverFetch<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  }>('/auth/me').catch(() => null);

  const profile = meResponse?.data;
  if (!profile) {
    redirect('/login');
  }

  const rawRole = profile.role as string | undefined;
  const role: Role = rawRole && ROLES.includes(rawRole as Role) ? (rawRole as Role) : 'employee';
  const fullName = profile.fullName ?? '';
  const avatarUrl = profile.avatarUrl ?? undefined;

  const roleConfig = await fetchRoleConfig(role);

  return (
    <DashboardShell role={role} roleConfig={roleConfig} fullName={fullName} email={profile.email ?? ''} avatarUrl={avatarUrl}>
      {children}
    </DashboardShell>
  );
}
