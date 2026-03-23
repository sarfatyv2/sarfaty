import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function isPublicRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/wiki') ||
    pathname.startsWith('/api/auth')
  );
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json({ error: 'JWT_SECRET not configured' }, { status: 500 });
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const encoder = new TextEncoder().encode(secret);

  if (accessToken) {
    try {
      await jwtVerify(accessToken, encoder, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch {
      // fall through to refresh
    }
  }

  if (refreshToken) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const userAgent = request.headers.get('user-agent');

    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'x-refresh-token': refreshToken,
        ...(userAgent ? { 'user-agent': userAgent } : {}),
        ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      },
    });

    if (refreshRes.ok) {
      const json = (await refreshRes.json()) as {
        data: { accessToken: string; refreshToken: string };
      };
      const { accessToken: newAccess, refreshToken: newRefresh } = json.data;
      const isProduction = process.env.NODE_ENV === 'production';
      const res = NextResponse.next();
      res.cookies.set(ACCESS_TOKEN_COOKIE, newAccess, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
      res.cookies.set(REFRESH_TOKEN_COOKIE, newRefresh, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  const redirectResponse = NextResponse.redirect(url);
  clearAuthCookies(redirectResponse);
  return redirectResponse;
}

// Plain string required: Next.js static analysis does not support String.raw`...` in matcher.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
