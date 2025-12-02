import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { createClient } from '@supabase/supabase-js';
import { DODO_PRODUCT_MAP } from '@/lib/dodo-config';

// ✅ Supabase Admin Client (Service Role Key)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Dodo Client with Webhook Verification
const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment:
        process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode'
            ? 'test_mode'
            : 'live_mode',
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
});

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text();

        const headers = {
            'webhook-id': request.headers.get('webhook-id') ?? '',
            'webhook-signature': request.headers.get('webhook-signature') ?? '',
            'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
        };

        // ✅ Verify + Parse webhook
        const event = client.webhooks.unwrap(payload, { headers });

        console.log('✅ Webhook verified:', event.type);
        console.log(
            '✅ FULL DODO WEBHOOK PAYLOAD:\n',
            JSON.stringify(event.data, null, 2)
        );

        // Handle payment.succeeded event
        if (event.type === 'payment.succeeded') {
            // ✅ ✅ ✅ TYPE BASED ON YOUR REAL PAYLOAD
            const paymentData = event.data as unknown as {
                payment_id: string;
                total_amount: number;
                metadata?: {
                    user_id?: string;
                };
                product_cart?: {
                    product_id: string;
                    quantity: number;
                }[];
                billing?: {
                    country?: string;
                };
            };

            const transactionId = paymentData.payment_id;
            const amount = paymentData.total_amount / 100; // ✅ correct amount field
            const userId = paymentData.metadata?.user_id;

            // ✅ ✅ ✅ CORRECT PRODUCT EXTRACTION
            const productId = paymentData.product_cart?.[0]?.product_id ?? null;

            const location = paymentData.billing?.country || null;

            console.log('✅ User:', userId);
            console.log('✅ Product:', productId);
            console.log('✅ Transaction:', transactionId);
            console.log('✅ Amount:', amount);

            if (!userId || !productId || !transactionId) {
                console.error('❌ Missing required payment data', {
                    userId,
                    productId,
                    transactionId,
                });
                return NextResponse.json(
                    { error: 'Missing required data' },
                    { status: 400 }
                );
            }

            // ✅ Map product → plan + credits
            const planDetails =
                DODO_PRODUCT_MAP[productId as keyof typeof DODO_PRODUCT_MAP];

            if (!planDetails) {
                console.error('❌ Unknown product:', productId);
                return NextResponse.json(
                    { error: 'Unknown product' },
                    { status: 400 }
                );
            }

            // ✅ ✅ ✅ DUPLICATE PROTECTION
            const { data: existingTx } = await supabaseAdmin
                .from('transactions')
                .select('id')
                .eq('transaction_id', transactionId)
                .maybeSingle();

            if (existingTx) {
                console.log('⚠️ Duplicate webhook ignored:', transactionId);
                return NextResponse.json({ received: true });
            }

            // ✅ Insert transaction
            const { error: txnError } = await supabaseAdmin.from('transactions').insert({
                user_id: userId,
                transaction_id: transactionId,
                amount,
                plan_type: planDetails.plan,
                status: 'succeeded',
                location,
            });

            if (txnError) {
                console.error('❌ Transaction insert failed:', txnError);
                return NextResponse.json(
                    { error: 'Transaction failed' },
                    { status: 500 }
                );
            }

            // ✅ Fetch current credits
            const { data: userData, error: userFetchError } = await supabaseAdmin
                .from('users')
                .select('credits_allocated')
                .eq('id', userId)
                .single();

            if (userFetchError || !userData) {
                console.error('❌ User fetch failed:', userFetchError);
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            const newCredits =
                (userData.credits_allocated || 0) + planDetails.credits;

            // ✅ Update credits
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ credits_allocated: newCredits })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Credit update failed:', updateError);
                return NextResponse.json(
                    { error: 'Credit update failed' },
                    { status: 500 }
                );
            }

            console.log(
                `✅ ✅ ✅ Credits updated for user ${userId}: +${planDetails.credits}`
            );

            return NextResponse.json({ received: true });
        }

        // Handle payment.failed event
        if (event.type === 'payment.failed') {
            const paymentData = event.data as unknown as {
                payment_id: string;
                total_amount: number;
                metadata?: {
                    user_id?: string;
                };
                product_cart?: {
                    product_id: string;
                    quantity: number;
                }[];
                billing?: {
                    country?: string;
                };
            };

            const transactionId = paymentData.payment_id;
            const amount = paymentData.total_amount / 100;
            const userId = paymentData.metadata?.user_id;
            const productId = paymentData.product_cart?.[0]?.product_id ?? null;
            const location = paymentData.billing?.country || null;

            console.log('❌ Payment failed for user:', userId);
            console.log('❌ Transaction:', transactionId);

            if (!userId || !productId || !transactionId) {
                console.error('❌ Missing required payment data for failed payment', {
                    userId,
                    productId,
                    transactionId,
                });
                return NextResponse.json({ received: true });
            }

            // Get plan details
            const planDetails =
                DODO_PRODUCT_MAP[productId as keyof typeof DODO_PRODUCT_MAP];

            if (!planDetails) {
                console.error('❌ Unknown product for failed payment:', productId);
                return NextResponse.json({ received: true });
            }

            // Log failed transaction
            const { error: txnError } = await supabaseAdmin.from('transactions').insert({
                user_id: userId,
                transaction_id: transactionId,
                amount,
                plan_type: planDetails.plan,
                status: 'failed',
                location,
            });

            if (txnError) {
                console.error('❌ Failed to log failed transaction:', txnError);
            } else {
                console.log('✅ Failed transaction logged:', transactionId);
            }

            return NextResponse.json({ received: true });
        }

        // Unknown event type
        console.log('ℹ️ Unhandled event type:', event.type);
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Webhook verification failed:', error);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
}
