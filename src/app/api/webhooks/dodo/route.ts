import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { createSupabaseAdminClient } from '@/lib/supabaseServer';
import { DODO_PRODUCT_MAP } from '@/lib/dodo-config';
import { calculateCommission } from '@/lib/affiliate-constants';

const supabaseAdmin = createSupabaseAdminClient();

// ✅ Dodo Client — lazily instantiated so a missing env var only breaks
// requests to this route, not Next.js's build-time page-data collection
// for every route in the app.
let client: DodoPayments | undefined;
function getDodoClient(): DodoPayments {
  if (!client) {
    client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment:
        process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode'
          ? 'test_mode'
          : 'live_mode',
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
    });
  }
  return client;
}

/** Narrow shape of Dodo `payment.succeeded` / `payment.failed` webhook payloads */
type DodoPaymentWebhookData = {
  payment_id?: string;
  metadata?: { user_id?: string };
  product_cart?: Array<{ product_id?: string }>;
  billing?: { country?: string | null };
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();

    const headers = {
      'webhook-id': request.headers.get('webhook-id') ?? '',
      'webhook-signature': request.headers.get('webhook-signature') ?? '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
    };

    // ✅ Verify webhook
    const event = getDodoClient().webhooks.unwrap(payload, { headers });

    console.log('✅ Webhook verified:', event.type);

    // ============================================================
    // 💰 PAYMENT SUCCESS
    // ============================================================
    if (event.type === 'payment.succeeded') {
      const paymentData = event.data as DodoPaymentWebhookData;

      const transactionId = paymentData.payment_id;
      const userId = paymentData.metadata?.user_id;
      const productId = paymentData.product_cart?.[0]?.product_id ?? null;
      const location = paymentData.billing?.country || null;

      if (!userId || !productId || !transactionId) {
        console.error('❌ Missing required data');
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
      }

      // ✅ Get plan safely (SOURCE OF TRUTH)
      const planDetails =
        DODO_PRODUCT_MAP[productId as keyof typeof DODO_PRODUCT_MAP];

      if (!planDetails) {
        console.error('❌ Unknown product:', productId);
        return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
      }

      const amount = planDetails.price; // ✅ FIXED: Always USD, no currency bugs

      console.log('✅ Transaction:', transactionId);
      console.log('✅ User:', userId);
      console.log('✅ Product:', productId);
      console.log('✅ Amount (USD):', amount);

      // ============================================================
      // 💾 STORE TRANSACTION (idempotency via UNIQUE constraint, not
      // a racy select-then-insert: a duplicate delivery hits 23505)
      // ============================================================
      const { error: txnError } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_id: transactionId,
          amount,
          plan_type: planDetails.plan,
          status: 'succeeded',
          location,
        });

      if (txnError) {
        if (txnError.code === '23505') {
          console.log('⚠️ Duplicate webhook ignored:', transactionId);
          return NextResponse.json({ received: true });
        }
        console.error('❌ Transaction insert failed:', txnError);
        return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
      }

      // ============================================================
      // 🎯 CREDIT UPDATE (atomic RPC — no read-modify-write race)
      // ============================================================
      const { error: creditError } = await supabaseAdmin.rpc(
        'add_purchase_credits',
        {
          p_user_id: userId,
          p_credits: planDetails.credits,
          p_plan: planDetails.plan,
        }
      );

      if (creditError) {
        console.error('❌ Credit update failed:', creditError);
        return NextResponse.json({ error: 'Credit update failed' }, { status: 500 });
      }

      console.log(`✅ Credits added: +${planDetails.credits} (credits_allocated + calculation_credits)`);

      // ============================================================
      // 💸 AFFILIATE COMMISSION (SAFE)
      // ============================================================
      try {
        const { data: referral } = await supabaseAdmin
          .from('referrals')
          .select('affiliate_id')
          .eq('referred_user_id', userId)
          .maybeSingle();

        // ❌ Prevent self-referral abuse
        if (referral?.affiliate_id && referral.affiliate_id !== userId) {
          const commissionAmount = calculateCommission(amount);

          // 🚨 SAFETY CHECK
          if (commissionAmount > amount) {
            console.error('🚨 Invalid commission detected');
            return NextResponse.json({ received: true });
          }

          const { error: commissionInsertError } = await supabaseAdmin
            .from('commissions')
            .insert({
              affiliate_id: referral.affiliate_id,
              user_id: userId,
              payment_id: transactionId,
              amount,
              commission_amount: commissionAmount,
              status: 'pending',
            });

          if (commissionInsertError) {
            if (commissionInsertError.code === '23505') {
              console.log('⚠️ Duplicate commission ignored:', transactionId);
            } else {
              throw commissionInsertError;
            }
          } else {
            const { error: commissionUpdateError } = await supabaseAdmin.rpc(
              'add_commission',
              {
                p_affiliate_id: referral.affiliate_id,
                p_amount: commissionAmount,
              }
            );

            if (commissionUpdateError) {
              throw commissionUpdateError;
            }

            console.log(`💰 Commission: $${commissionAmount}`);
          }
        }
      } catch (err) {
        console.error('⚠️ Commission error:', err);
      }

      return NextResponse.json({ received: true });
    }

    // ============================================================
    // ❌ PAYMENT FAILED
    // ============================================================
    if (event.type === 'payment.failed') {
      const paymentData = event.data as DodoPaymentWebhookData;

      const transactionId = paymentData.payment_id;
      const userId = paymentData.metadata?.user_id;
      const productId = paymentData.product_cart?.[0]?.product_id ?? null;
      const location = paymentData.billing?.country || null;

      if (!userId || !productId || !transactionId) {
        return NextResponse.json({ received: true });
      }

      const planDetails =
        DODO_PRODUCT_MAP[productId as keyof typeof DODO_PRODUCT_MAP];

      if (!planDetails) {
        return NextResponse.json({ received: true });
      }

      const amount = planDetails.price; // ✅ FIXED

      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        transaction_id: transactionId,
        amount,
        plan_type: planDetails.plan,
        status: 'failed',
        location,
      });

      console.log('❌ Payment failed logged');

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}