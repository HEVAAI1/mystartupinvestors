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
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!affiliate) {
        return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 });
    }

    // Atomic RPC: locks the affiliate row and recomputes available balance
    // inside the same transaction as the insert, preventing concurrent
    // requests from double-spending the same balance (TOCTOU).
    const { data: withdrawal, error } = await admin
        .rpc('request_withdrawal', {
            p_affiliate_id: affiliate.id,
            p_amount: amount,
            p_details: {
                name,
                account_number: accountNumber,
                ifsc_code: ifscCode,
                account_holder_name: accountHolderName,
                contact_number: contactNumber,
                email_id: emailId,
                country,
                additional_details: additionalDetails || null,
            },
        })
        .single();

    if (error) {
        const message = error.message || '';
        if (message.includes('exceeds available balance')) {
            return NextResponse.json({ error: message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 });
    }

    return NextResponse.json({ withdrawal }, { status: 201 });
}

export async function GET() {
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
