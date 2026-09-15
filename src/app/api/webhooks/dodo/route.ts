import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { createSupabaseAdminClient } from '@/lib/supabaseServer';
import { DODO_PRODUCT_MAP } from '@/lib/dodo-config';
import { calculateCommission } from '@/lib/affiliate-constants';
import { enqueueEmailEvent } from '@/lib/email/outbox';
import { getAffiliateOwnerEmail } from '@/lib/email/affiliate-recipients';

const AFFILIATE_WITHDRAWAL_AVAILABLE_THRESHOLD_USD = 76;

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
      // 💾 STORE TRANSACTION + 🎯 GRANT CREDITS (one atomic RPC)
      //
      // These used to be two separate statements. If the credit RPC
      // failed after the transaction insert had already succeeded, a
      // retried webhook delivery hit the transaction's UNIQUE constraint
      // (23505) and short-circuited as "duplicate, already handled" —
      // silently never granting credits for that payment. Doing both in
      // one DB transaction means a retry after any failure redoes both.
      // ============================================================
      const { error: recordError } = await supabaseAdmin.rpc(
        'record_payment_and_grant_credits',
        {
          p_user_id: userId,
          p_transaction_id: transactionId,
          p_amount: amount,
          p_plan_type: planDetails.plan,
          p_credits: planDetails.credits,
          p_location: location,
        }
      );

      if (recordError) {
        console.error('❌ Payment recording / credit grant failed:', recordError);
        return NextResponse.json({ error: 'Credit update failed' }, { status: 500 });
      }

      console.log(`✅ Credits added: +${planDetails.credits} (credits_allocated + calculation_credits)`);

      // ============================================================
      // 📧 PURCHASE RECEIPT — only after the credit grant above is
      // durably complete. enqueueEmailEvent is idempotent on event_key,
      // so this is safe to call on every delivery (including a
      // duplicate one where credits were granted by an earlier delivery
      // but the email step may not have run yet).
      // ============================================================
      try {
        const { data: buyer } = await supabaseAdmin
          .from('users')
          .select('email, name')
          .eq('id', userId)
          .maybeSingle();

        if (buyer?.email) {
          await enqueueEmailEvent({
            eventKey: `purchase_receipt:${transactionId}`,
            eventType: 'purchase_receipt',
            userId,
            recipientEmail: buyer.email,
            payload: {
              plan: planDetails.plan,
              amountUsd: amount,
              credits: planDetails.credits,
              paymentId: transactionId,
            },
          });
        } else {
          console.error('⚠️ Could not enqueue purchase receipt: no email on file for user', userId);
        }
      } catch (emailError) {
        // Never fail the webhook (and risk Dodo retrying a completed
        // payment) because the receipt email couldn't be enqueued.
        console.error('⚠️ Failed to enqueue purchase receipt email:', emailError);
      }

      // ============================================================
      // 💸 AFFILIATE COMMISSION (SAFE)
      // ============================================================
      try {
        const { data: referral } = await supabaseAdmin
          .from('referrals')
          .select('affiliate_id')
          .eq('referred_user_id', userId)
          .maybeSingle();

        // Self-referral is already blocked at attribution time
        // (api/affiliate/link-referral/route.ts), so no referral row can
        // exist here for a self-referral in the first place.
        if (referral?.affiliate_id) {
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
            // Balance before/after this commission, to detect the exact
            // payment that first crosses the withdrawal-available
            // threshold (not fired again on every commission afterward).
            const { data: affiliateBefore } = await supabaseAdmin
              .from('affiliates')
              .select('total_earned, total_paid')
              .eq('id', referral.affiliate_id)
              .maybeSingle();

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

            try {
              const affiliateEmail = await getAffiliateOwnerEmail(supabaseAdmin, referral.affiliate_id);
              if (affiliateEmail && affiliateBefore) {
                const previousBalance = affiliateBefore.total_earned - affiliateBefore.total_paid;
                const newBalance = previousBalance + commissionAmount;

                await enqueueEmailEvent({
                  eventKey: `affiliate_commission_earned:${transactionId}`,
                  eventType: 'affiliate_commission_earned',
                  recipientEmail: affiliateEmail,
                  payload: { amountUsd: commissionAmount, availableBalanceUsd: newBalance },
                });

                if (previousBalance < AFFILIATE_WITHDRAWAL_AVAILABLE_THRESHOLD_USD && newBalance >= AFFILIATE_WITHDRAWAL_AVAILABLE_THRESHOLD_USD) {
                  // total_paid only changes on payout, so it doubles as a
                  // re-arm cycle: after a payout drops the balance back
                  // down, the next crossing uses a new total_paid value.
                  await enqueueEmailEvent({
                    eventKey: `affiliate_withdrawal_available:${referral.affiliate_id}:${affiliateBefore.total_paid}`,
                    eventType: 'affiliate_withdrawal_available',
                    recipientEmail: affiliateEmail,
                    payload: { availableBalanceUsd: newBalance },
                  });
                }
              }
            } catch (emailError) {
              // Never let an email failure surface as a commission error.
              console.error('⚠️ Failed to enqueue affiliate commission emails:', emailError);
            }
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

      const { error: failedTxnError } = await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        transaction_id: transactionId,
        amount,
        plan_type: planDetails.plan,
        status: 'failed',
        location,
      });

      // Only email once the failed transaction record is durable (this
      // insert, or an earlier delivery's — 23505 means it already is).
      const failedTxnDurable = !failedTxnError || failedTxnError.code === '23505';
      if (failedTxnDurable) {
        console.log('❌ Payment failed logged');
      } else {
        console.error('❌ Failed-payment transaction insert failed (no email sent):', failedTxnError);
      }

      if (failedTxnDurable) {
        try {
          const { data: buyer } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('id', userId)
            .maybeSingle();

          if (buyer?.email) {
            await enqueueEmailEvent({
              eventKey: `payment_failed:${transactionId}`,
              eventType: 'payment_failed',
              userId,
              recipientEmail: buyer.email,
              payload: {},
            });
          }
        } catch (emailError) {
          console.error('⚠️ Failed to enqueue payment-failed email:', emailError);
        }
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}