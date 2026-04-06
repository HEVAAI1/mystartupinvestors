import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    // Get affiliate record
    const { data: affiliate } = await admin
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!affiliate) {
        return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 });
    }

    // Get commissions with user email (masked)
    const { data: commissions, error } = await admin
        .from('commissions')
        .select('id, amount, commission_amount, status, created_at, payment_id, user_id')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ commissions: commissions ?? [] });
}
