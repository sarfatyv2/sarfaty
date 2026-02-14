import { type Role } from '@nexus/types';
import { v4 as uuidv4 } from 'uuid';

interface ProfileOverrides {
  id?: string;
  fullName?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
}

export function createProfileFactory(overrides: ProfileOverrides = {}) {
  return {
    id: overrides.id ?? uuidv4(),
    fullName: overrides.fullName ?? 'Test User',
    email: overrides.email ?? `test-${Date.now()}@sarfaty.com`,
    phone: null,
    role: overrides.role ?? 'employee',
    isActive: overrides.isActive ?? true,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
