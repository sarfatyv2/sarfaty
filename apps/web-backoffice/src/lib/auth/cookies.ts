import { ACCESS_TOKEN_COOKIE } from './constants';

export function getCookieFromDocument(cookieName: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const k = trimmed.slice(0, eqIndex);
    if (k === cookieName) {
      return decodeURIComponent(trimmed.slice(eqIndex + 1));
    }
  }
  return null;
}

export function getAccessTokenFromDocument(): string | null {
  return getCookieFromDocument(ACCESS_TOKEN_COOKIE);
}
