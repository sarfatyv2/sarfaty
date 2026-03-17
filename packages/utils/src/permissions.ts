import { type Role, ROLE_PERMISSIONS, type RoleConfig } from '@nexus/types';

// ── Legacy helpers (use static ROLE_PERMISSIONS) ─────────────────────────────
// Kept for backward compatibility; prefer the dynamic variants below.

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

// ── Dynamic helpers (use RoleConfig resolved from API) ───────────────────────

export function canPerformActionFromConfig(config: RoleConfig, action: string): boolean {
  if (config.clientActions.includes('*')) return true;
  return config.clientActions.includes(action);
}

export function canAccessTabFromConfig(config: RoleConfig, tab: string): boolean {
  if (config.clientTabs.includes('*')) return true;
  return config.clientTabs.includes(tab);
}

export function canPerformGlobalActionFromConfig(config: RoleConfig, action: string): boolean {
  if (config.globalActions.includes('*')) return true;
  return config.globalActions.includes(action);
}
