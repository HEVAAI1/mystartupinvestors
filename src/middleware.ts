import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Cookie-based Supabase auth (via @supabase/ssr) means the browser attaches
// session cookies to any cross-origin request automatically — Route Handlers
// don't get the CSRF protection Server Actions get for free. Reject
// state-changing /api requests whose Origin/Sec-Fetch-Site doesn't match
// this host. Non-browser callers (webhooks, curl) send neither header and
// are allowed through — they never carry the session cookie anyway.
function isSameOriginRequest(request: NextRequest): boolean {
    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite) {
        return secFetchSite === 'same-origin' || secFetchSite === 'none';
    }
    const origin = request.headers.get('origin');
    if (!origin) return true;
    try {
        return new URL(origin).host === request.headers.get('host');
    } catch {
        return false;
    }
}

function buildCsp(nonce: string): string {
    return [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://cdn.sanity.io https://lh3.googleusercontent.com https://*.supabase.co https://www.googletagmanager.com",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "frame-src 'none'",
        "upgrade-insecure-requests",
    ].join('; ');
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // CSRF: block cross-origin state-changing requests to API routes before
    // anything else runs. API route handlers do their own auth (requireAdmin,
    // getUser, etc.) — middleware only adds the origin check here.
    if (pathname.startsWith('/api/') && !CSRF_SAFE_METHODS.has(request.method) && !isSameOriginRequest(request)) {
        return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 });
    }

    // Nonce + CSP header, threaded to Server Components via the request
    // headers so inline <script> tags (JSON-LD, GA) can use nonce={nonce}.
    const nonce = crypto.randomUUID();
    const csp = buildCsp(nonce);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    // Create a response object
    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
    response.headers.set('Content-Security-Policy', csp);

    // API routes handle their own auth/authorization; the page-protection
    // rules below only apply to page routes.
    if (pathname.startsWith('/api/')) {
        return response;
    }

    // Create Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    });
                    response.headers.set('Content-Security-Policy', csp);
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    });
                    response.headers.set('Content-Security-Policy', csp);
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // Get user session
    const { data: { user } } = await supabase.auth.getUser();

    // Define protected routes
    const userProtectedRoutes = ['/dashboard', '/add-startup', '/view-startup', '/pricing', '/payment-success', '/startup-details', '/affiliate/dashboard'];
    const adminRoutes = [
        '/admin/dashboard',
        '/admin/user-list',
        '/admin/startup-list',
        '/admin/investor-list',
        '/admin/withdrawals',
        '/admin/affiliates',
    ];
    const adminLoginRoute = '/admin';

    // Check if current path is a user protected route
    const isUserProtectedRoute = userProtectedRoutes.some(route => pathname.startsWith(route));

    // Check if current path is an admin route (but not the login page)
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Check if current path is admin login
    const isAdminLoginPage = pathname === adminLoginRoute;

    // RULE 1: User protected routes require authentication
    if (isUserProtectedRoute) {
        if (!user) {
            // Not authenticated - redirect to home
            console.log(`[Middleware] Unauthenticated user trying to access ${pathname}, redirecting to /`);
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Check if user is actually an admin trying to access user routes
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userData?.role === 'admin') {
            // Admin trying to access user dashboard - redirect to admin dashboard
            console.log(`[Middleware] Admin trying to access user route ${pathname}, redirecting to /admin/dashboard`);
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }

        console.log(`[Middleware] Authenticated user accessing ${pathname}`);
    }

    // RULE 2: Admin routes require admin authentication
    if (isAdminRoute) {
        if (!user) {
            console.log(`[Middleware] Unauthenticated user trying to access admin route ${pathname}, redirecting to /admin`);
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userData?.role !== 'admin') {
            // Regular user trying to access admin - redirect to user dashboard
            console.log(`[Middleware] Regular user trying to access admin route ${pathname}, redirecting to /dashboard`);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // RULE 3: Admin login page - if already authenticated as admin, redirect to admin dashboard
    if (isAdminLoginPage && user) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userData?.role === 'admin') {
            console.log(`[Middleware] Admin already logged in, redirecting to /admin/dashboard`);
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    // RULE 4: Landing page - redirect authenticated users to their dashboard
    if (pathname === '/' && user) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userData?.role === 'admin') {
            console.log(`[Middleware] Admin accessing landing page, redirecting to /admin/dashboard`);
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else {
            console.log(`[Middleware] Authenticated user accessing landing page, redirecting to /dashboard`);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return response;
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * API routes ARE included now — they need the CSRF origin check;
         * they otherwise still do their own auth (requireAdmin, getUser).
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
