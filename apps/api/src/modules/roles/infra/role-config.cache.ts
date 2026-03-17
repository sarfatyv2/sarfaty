import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const TTL_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class RoleConfigCache {
  private readonly store = new Map<string, CacheEntry<string[]>>();

  get(roleKey: string): string[] | null {
    const entry = this.store.get(roleKey);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(roleKey);
      return null;
    }
    return entry.value;
  }

  set(roleKey: string, features: string[]): void {
    this.store.set(roleKey, {
      value: features,
      expiresAt: Date.now() + TTL_MS,
    });
  }

  invalidate(roleKey: string): void {
    this.store.delete(roleKey);
  }

  invalidateAll(): void {
    this.store.clear();
  }
}
