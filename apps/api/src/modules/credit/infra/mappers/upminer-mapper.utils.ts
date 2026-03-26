/** Shared primitive helpers for all upMiner payload mappers. */

export function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value || null;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

export function strArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const arr = value.filter((x): x is string => typeof x === 'string');
  return arr.length > 0 ? arr : null;
}

export function toObj(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function isEmpty(payload: unknown): boolean {
  if (payload === null || payload === undefined) return true;
  if (typeof payload === 'object' && !Array.isArray(payload)) {
    return Object.keys(payload).length === 0;
  }
  if (Array.isArray(payload)) return payload.length === 0;
  return false;
}
