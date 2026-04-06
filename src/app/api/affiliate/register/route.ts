import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    // Check if already an affiliate
    const { data: existing } = await admin
        .from('affiliates')
        .select('id, referral_code, total_earned, total_paid')
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ affiliate: existing });
    }

    // Generate unique referral code
    let code = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
        const { data: conflict } = await admin
            .from('affiliates')
            .select('id')
            .eq('referral_code', code)
            .maybeSingle();
        if (!conflict) break;
        code = generateReferralCode();
        attempts++;
    }

    const { data: affiliate, error } = await admin
        .from('affiliates')
        .insert({ user_id: user.id, referral_code: code })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: 'Failed to register affiliate' }, { status: 500 });
    }

    return NextResponse.json({ affiliate }, { status: 201 });
}
