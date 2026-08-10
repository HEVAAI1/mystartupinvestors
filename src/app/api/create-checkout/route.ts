import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rateLimitKey = `checkout:${user.id}`;
        const rateLimit = checkRateLimit(rateLimitKey, 5, 300);
        if (!rateLimit.allowed) {
            return rateLimitResponse(rateLimit.retryAfterSeconds);
        }

        const user_id = user.id;

        let rawBody = '';
        try {
            rawBody = await request.text();
        } catch {
            return NextResponse.json(
                { error: 'Failed to read request body' },
                { status: 400 }
            );
        }

        let parsed: unknown = {};
        try {
            parsed = JSON.parse(rawBody);
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        const isCheckoutRequestBody = (value: unknown): value is { product_id: string } => {
            if (typeof value !== 'object' || value === null) return false;
            const record = value as Record<string, unknown>;
            return typeof record.product_id === 'string';
        };

        const product_id = isCheckoutRequestBody(parsed) ? parsed.product_id : undefined;

        if (!product_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        const environment =
            process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode'
                ? 'test_mode'
                : 'live_mode';

        if (!apiKey) {
            console.error('Missing DODO API key');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const client = new DodoPayments({
            bearerToken: apiKey,
            environment,
            webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
        });

        let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        if (appUrl === 'http://localhost' && process.env.NODE_ENV === 'development') {
            appUrl = 'http://localhost:3000';
        }

        const returnUrl = `${appUrl}/payment-success`;

        const payload = {
            product_cart: [
                {
                    product_id,
                    quantity: 1,
                },
            ],
            metadata: {
                user_id,
            },
            return_url: returnUrl,
        };

        type CheckoutSession = {
            checkout_url: string;
            session_id: string;
        };

        let checkoutSession: CheckoutSession;
        try {
            checkoutSession = await client.checkoutSessions.create(payload);
        } catch (err) {
            const errDetails = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
            console.error('Dodo checkout failed details:', errDetails);
            return NextResponse.json(
                { error: 'Failed to create checkout session with payment provider' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            checkout_url: checkoutSession.checkout_url,
            session_id: checkoutSession.session_id,
        });

    } catch (err) {
        console.error('Checkout error:', err);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
