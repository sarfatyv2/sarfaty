import { type Role, ROLE_PERMISSIONS } from '@nexus/types';

export function canPerformAction(role: Role, action: string): boolean {
  const config = ROLE_PERMISSIONS[role];
  if (config.clientActions.includes('*')) return true;
  return config.clientActions.includes(action);
}

export function canAccessTab(role: Role, tab: string): boolean {
  const config = ROLE_PERMISSIONS[role];
  if (config.clientTabs.includes('*')) return true;
  return config.clientTabs.includes(tab);
}

export function canPerformGlobalAction(role: Role, action: string): boolean {
  const config = ROLE_PERMISSIONS[role];
  if (config.globalActions.includes('*')) return true;
  return config.globalActions.includes(action);
}
