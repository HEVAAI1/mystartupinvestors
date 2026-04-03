import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

async function isAdmin(userId: string, admin: ReturnType<typeof createSupabaseAdminClient>) {
    const { data } = await admin.from('users').select('role').eq('id', userId).maybeSingle();
    return data?.role === 'admin';
}

export async function GET(_req: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createSupabaseAdminClient();
    if (!(await isAdmin(user.id, admin))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: withdrawals, error } = await admin
        .from('withdrawal_requests')
        .select(`
            *,
            affiliates (
                referral_code,
                total_earned,
                total_paid,
                user_id
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ withdrawals: withdrawals ?? [] });
}
