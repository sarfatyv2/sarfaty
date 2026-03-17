import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { RoleConfig } from '@nexus/types';
import { ROLE_PERMISSIONS } from '@nexus/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function fetchRoleConfig(roleKey: string): Promise<RoleConfig> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.warn('[fetchRoleConfig] No session, using fallback for role:', roleKey);
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
      const text = await response.text().catch(() => '');
      console.warn('[fetchRoleConfig] API error', response.status, text, '— using fallback for role:', roleKey);
      return getFallbackConfig(roleKey);
    }

    const json = (await response.json()) as { data: RoleConfig };
    console.log('[fetchRoleConfig] API success for role:', roleKey, '— sidebar sections:', json.data?.sidebar?.length);
    return json.data;
  } catch (err) {
    console.warn('[fetchRoleConfig] Exception, using fallback for role:', roleKey, err);
    return getFallbackConfig(roleKey);
  }
}

function getFallbackConfig(roleKey: string): RoleConfig {
  const key = roleKey as keyof typeof ROLE_PERMISSIONS;
  return ROLE_PERMISSIONS[key] ?? ROLE_PERMISSIONS.employee;
}
