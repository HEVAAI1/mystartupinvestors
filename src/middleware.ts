import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Create a response object
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

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
                            headers: request.headers,
                        },
                    });
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
                            headers: request.headers,
                        },
                    });
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
    const userProtectedRoutes = ['/dashboard', '/add-startup', '/view-startup', '/pricing', '/payment-success', '/startup-details'];
    const adminRoutes = ['/admin/dashboard', '/admin/user-list', '/admin/startup-list', '/admin/investor-list'];
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
        // Check localStorage-based admin auth (this is client-side, so we'll handle it in layout)
        // For now, just ensure they're not a regular user
        if (user) {
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
         * - api routes (they have their own protection)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
    ],
};
