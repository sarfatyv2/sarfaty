import { cookies } from 'next/headers';
import type { RoleConfig } from '@nexus/types';
import { ROLE_PERMISSIONS } from '@nexus/types';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function fetchRoleConfig(roleKey: string): Promise<RoleConfig> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return getFallbackConfig(roleKey);
    }

    const response = await fetch(`${API_BASE_URL}/my/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
