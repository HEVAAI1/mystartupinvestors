import { NextRequest, NextResponse } from 'next/server';
import { MIN_AFFILIATE_WITHDRAWAL_USD } from '@/lib/affiliate-constants';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const amount = parseFloat(body.amount);

    const name = String(body.name ?? '').trim();
    const accountNumber = String(body.account_number ?? '').trim();
    const ifscCode = String(body.ifsc_code ?? '').trim();
    const accountHolderName = String(body.account_holder_name ?? '').trim();
    const contactNumber = String(body.contact_number ?? '').trim();
    const emailId = String(body.email_id ?? '').trim();
    const country = String(body.country ?? '').trim();
    const additionalDetailsRaw = body.additional_details;
    const additionalDetails =
        typeof additionalDetailsRaw === 'string' ? additionalDetailsRaw.trim() : '';

    if (!amount || amount <= 0 || isNaN(amount)) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (amount < MIN_AFFILIATE_WITHDRAWAL_USD) {
        return NextResponse.json(
            { error: `Minimum withdrawal is $${MIN_AFFILIATE_WITHDRAWAL_USD}` },
            { status: 400 }
        );
    }

    if (
        !name ||
        !accountNumber ||
        !ifscCode ||
        !accountHolderName ||
        !contactNumber ||
        !emailId ||
        !country
    ) {
        return NextResponse.json(
            {
                error:
                    'Please fill all required withdrawal details (name, account number, IFSC, account holder name, contact number, email, country).',
            },
            { status: 400 }
        );
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

    const { data: openWithdrawals } = await admin
        .from('withdrawal_requests')
        .select('amount')
        .eq('affiliate_id', affiliate.id)
        .in('status', ['pending', 'approved']);

    const awaitingWithdrawal =
        openWithdrawals?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;
    const available = pending - awaitingWithdrawal;

    if (available < MIN_AFFILIATE_WITHDRAWAL_USD) {
        return NextResponse.json(
            {
                error: `You need at least $${MIN_AFFILIATE_WITHDRAWAL_USD} available to withdraw (after open requests). Available: $${available.toFixed(2)}`,
            },
            { status: 400 }
        );
    }

    if (amount > available) {
        return NextResponse.json(
            {
                error: `Withdrawal amount exceeds available balance of $${available.toFixed(2)} (pending $${pending.toFixed(2)} minus $${awaitingWithdrawal.toFixed(2)} in open requests)`,
            },
            { status: 400 }
        );
    }

    const { data: withdrawal, error } = await admin
        .from('withdrawal_requests')
        .insert({
            affiliate_id: affiliate.id,
            amount,
            name,
            account_number: accountNumber,
            ifsc_code: ifscCode,
            account_holder_name: accountHolderName,
            contact_number: contactNumber,
            email_id: emailId,
            country,
            additional_details: additionalDetails || null,
        })
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
