import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

function clearSessionAndRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  const response = NextResponse.redirect(url);
  request.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-')) {
      response.cookies.delete(name);
    }
  });
  return response;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>),
          );
        },
      },
    },
  );

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return clearSessionAndRedirect(request);
    }

    user = data.user;
  } catch {
    return clearSessionAndRedirect(request);
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/wiki')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
