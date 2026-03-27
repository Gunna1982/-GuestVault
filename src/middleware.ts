import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected dashboard routes — redirect to login if not authenticated
  const isDashboardRoute = pathname.startsWith('/properties') ||
    pathname.startsWith('/reservations') ||
    pathname.startsWith('/upsells') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/marketing') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/providers') ||
    pathname.startsWith('/brand') ||
    pathname.startsWith('/settings') ||
    pathname === '/';

  // Don't protect portal, auth, marketing, or API routes
  const isPublicRoute = pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/');

  if (isDashboardRoute && !user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If logged in and hitting login, redirect to dashboard
  // (Don't redirect /signup — user may need to create their org)
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
