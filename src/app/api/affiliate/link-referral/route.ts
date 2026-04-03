import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { referral_code } = body;

    if (!referral_code) {
        return NextResponse.json({ error: 'Missing referral_code' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Look up affiliate by code
    const { data: affiliate } = await admin
        .from('affiliates')
        .select('id, user_id')
        .eq('referral_code', referral_code)
        .maybeSingle();

    if (!affiliate) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Prevent self-referral
    if (affiliate.user_id === user.id) {
        return NextResponse.json({ error: 'Self-referral not allowed' }, { status: 400 });
    }

    // Check if this user was already referred by anyone
    const { data: existingReferral } = await admin
        .from('referrals')
        .select('id')
        .eq('referred_user_id', user.id)
        .maybeSingle();

    if (existingReferral) {
        // Silently succeed — user already attributed
        return NextResponse.json({ success: true, already_linked: true });
    }

    // Insert referral
    const { error } = await admin
        .from('referrals')
        .insert({ affiliate_id: affiliate.id, referred_user_id: user.id });

    if (error) {
        return NextResponse.json({ error: 'Failed to link referral' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
