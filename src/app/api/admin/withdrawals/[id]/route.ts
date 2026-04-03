import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

async function isAdmin(userId: string, admin: ReturnType<typeof createSupabaseAdminClient>) {
    const { data } = await admin.from('users').select('role').eq('id', userId).maybeSingle();
    return data?.role === 'admin';
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createSupabaseAdminClient();
    if (!(await isAdmin(user.id, admin))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body; // 'approve' | 'reject' | 'mark-paid'

    const validActions = ['approve', 'reject', 'mark-paid'];
    if (!validActions.includes(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
        'approve': 'approved',
        'reject': 'rejected',
        'mark-paid': 'paid',
    };

    const newStatus = statusMap[action];

    // Fetch current withdrawal to validate
    const { data: withdrawal } = await admin
        .from('withdrawal_requests')
        .select('id, affiliate_id, amount, status')
        .eq('id', id)
        .maybeSingle();

    if (!withdrawal) {
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    const { error: updateError } = await admin
        .from('withdrawal_requests')
        .update({ status: newStatus, processed_at: new Date().toISOString() })
        .eq('id', id);

    if (updateError) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    // If marking as paid, update affiliate total_paid
    if (action === 'mark-paid') {
        const { data: affiliate } = await admin
            .from('affiliates')
            .select('total_paid')
            .eq('id', withdrawal.affiliate_id)
            .single();

        if (affiliate) {
            const newTotalPaid = Number(affiliate.total_paid) + Number(withdrawal.amount);
            await admin
                .from('affiliates')
                .update({ total_paid: newTotalPaid })
                .eq('id', withdrawal.affiliate_id);

            // Mark related commissions as paid
            await admin
                .from('commissions')
                .update({ status: 'paid' })
                .eq('affiliate_id', withdrawal.affiliate_id)
                .eq('status', 'pending');
        }
    }

    return NextResponse.json({ success: true, status: newStatus });
}
