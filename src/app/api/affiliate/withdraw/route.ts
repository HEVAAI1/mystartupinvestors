import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const amount = parseFloat(body.amount);

    if (!amount || amount <= 0 || isNaN(amount)) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Get affiliate record
    const { data: affiliate } = await admin
        .from('affiliates')
        .select('id, total_earned, total_paid')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!affiliate) {
        return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 });
    }

    const pending = Number(affiliate.total_earned) - Number(affiliate.total_paid);

    if (amount > pending) {
        return NextResponse.json(
            { error: `Withdrawal amount exceeds pending balance of $${pending.toFixed(2)}` },
            { status: 400 }
        );
    }

    const { data: withdrawal, error } = await admin
        .from('withdrawal_requests')
        .insert({ affiliate_id: affiliate.id, amount })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 });
    }

    return NextResponse.json({ withdrawal }, { status: 201 });
}

export async function GET(_req: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    const { data: affiliate } = await admin
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!affiliate) {
        return NextResponse.json({ withdrawals: [] });
    }

    const { data: withdrawals, error } = await admin
        .from('withdrawal_requests')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ withdrawals: withdrawals ?? [] });
}
