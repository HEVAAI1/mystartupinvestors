import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type RequireAdminSuccess = {
    ok: true;
    userId: string;
    email: string | undefined;
};

type RequireAdminFailure = {
    ok: false;
    response: NextResponse;
};

export type RequireAdminResult = RequireAdminSuccess | RequireAdminFailure;

export async function requireAdmin(): Promise<RequireAdminResult> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (userData?.role !== 'admin') {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        };
    }

    return {
        ok: true,
        userId: user.id,
        email: user.email,
    };
}
