import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { createClient } from '@supabase/supabase-js';
import { DODO_PRODUCT_MAP } from '@/lib/dodo-config';

// ✅ Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Dodo Client
const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment:
    process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode'
      ? 'test_mode'
      : 'live_mode',
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
});

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
    const event = client.webhooks.unwrap(payload, { headers });

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
      // 🔒 IDEMPOTENCY CHECK
      // ============================================================
      const { data: existingTx } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('transaction_id', transactionId)
        .maybeSingle();

      if (existingTx) {
        console.log('⚠️ Duplicate webhook ignored:', transactionId);
        return NextResponse.json({ received: true });
      }

      // ============================================================
      // 💾 STORE TRANSACTION
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
        console.error('❌ Transaction insert failed:', txnError);
        return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
      }

      // ============================================================
      // 🎯 CREDIT UPDATE
      // ============================================================
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('credits_allocated, plan, calculation_credits, weekly_calculation_credits, last_calculation_reset_at')
        .eq('id', userId)
        .single();

      const newCredits =
        (userData?.credits_allocated || 0) + planDetails.credits;

      await supabaseAdmin
        .from('users')
        .update({
          // Investor/metadata credits shown in your app
          credits_allocated: newCredits,

          // Make sure check-credits uses the paid flow.
          plan: planDetails.plan,

          // Tool credits (used by tools-for-founders calculators).
          // Migration uses NULL for enterprise=unlimited, but requirement here is
          // to credit the equal number of Calculation Credits on success.
          calculation_credits:
            // If calculation_credits is NULL, treat as 0 and convert to finite credits.
            Number(userData?.calculation_credits ?? 0) + planDetails.credits,
        })
        .eq('id', userId);

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
          const commissionAmount = Math.round(amount * 0.25 * 100) / 100;

          // 🚨 SAFETY CHECK
          if (commissionAmount > amount) {
            console.error('🚨 Invalid commission detected');
            return NextResponse.json({ received: true });
          }

          await supabaseAdmin.from('commissions').insert({
            affiliate_id: referral.affiliate_id,
            user_id: userId,
            payment_id: transactionId,
            amount,
            commission_amount: commissionAmount,
            status: 'pending',
          });

          const { data: aff } = await supabaseAdmin
            .from('affiliates')
            .select('total_earned')
            .eq('id', referral.affiliate_id)
            .single();

          if (aff) {
            await supabaseAdmin
              .from('affiliates')
              .update({
                total_earned:
                  Number(aff.total_earned) + commissionAmount,
              })
              .eq('id', referral.affiliate_id);
          }

          console.log(`💰 Commission: $${commissionAmount}`);
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