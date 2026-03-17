import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { RoleConfig } from '@nexus/types';
import { ROLE_PERMISSIONS } from '@nexus/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function fetchRoleConfig(roleKey: string): Promise<RoleConfig> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return getFallbackConfig(roleKey);
    }

    const response = await fetch(`${API_BASE_URL}/my/permissions`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return getFallbackConfig(roleKey);
    }

    const json = (await response.json()) as { data: RoleConfig };
    return json.data;
  } catch {
    return getFallbackConfig(roleKey);
  }
}

function getFallbackConfig(roleKey: string): RoleConfig {
  const key = roleKey as keyof typeof ROLE_PERMISSIONS;
  return ROLE_PERMISSIONS[key] ?? ROLE_PERMISSIONS.employee;
}
