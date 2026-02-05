import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const publicRoutes = ['/', '/login', '/signup', '/pricing'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  const { pathname } = req.nextUrl;
  const isPublic = publicRoutes.includes(pathname);
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/sessions') ||
    pathname.startsWith('/settings');

  if (!session && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  const onboarded = req.cookies.get('onboarded')?.value === '1';
  if (session && !onboarded && pathname !== '/onboarding' && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/onboarding';
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
