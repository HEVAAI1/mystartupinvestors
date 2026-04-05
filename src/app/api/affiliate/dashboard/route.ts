import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET(_req: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    const { data: affiliate, error } = await admin
        .from('affiliates')
        .select('id, referral_code, total_earned, total_paid, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!affiliate) {
        return NextResponse.json({ affiliate: null });
    }

    // Calculate pending earnings: total_earned - total_paid
    const pending = Number(affiliate.total_earned) - Number(affiliate.total_paid);

    const { data: openWithdrawals } = await admin
        .from('withdrawal_requests')
        .select('amount')
        .eq('affiliate_id', affiliate.id)
        .in('status', ['pending', 'approved']);

    const awaitingWithdrawal =
        openWithdrawals?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;

    // Count referred users
    const { count: referralCount } = await admin
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', affiliate.id);

    return NextResponse.json({
        affiliate: {
            ...affiliate,
            pending_earnings: pending.toFixed(2),
            awaiting_withdrawal: awaitingWithdrawal.toFixed(2),
            referral_count: referralCount ?? 0,
        }
    });
}
