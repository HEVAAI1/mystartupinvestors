import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

export async function POST(request: NextRequest) {
    try {
        const { product_id, user_id } = await request.json();
        console.log('Received create-checkout request:', { product_id, user_id });

        if (!product_id || !user_id) {
            return NextResponse.json(
                { error: 'Missing required fields: product_id and user_id' },
                { status: 400 }
            );
        }

        // ✅ Make sure you're using the right environment
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        const environment =
            (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') ??
            'live_mode';

        if (!apiKey) {
            console.error('DODO_PAYMENTS_API_KEY is not set');
            return NextResponse.json(
                { error: 'Server misconfigured: missing API key' },
                { status: 500 }
            );
        }

        console.log(
            'Initializing Dodo client',
            { environment, keyPreview: apiKey.substring(0, 8) + '****' }
        );

        const client = new DodoPayments({
            bearerToken: apiKey,
            environment, // 👈 THIS is the important part
        });

        // Ensure we have a valid return URL with port
        let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        if (appUrl === 'http://localhost' && process.env.NODE_ENV === 'development') {
            appUrl = 'http://localhost:3000';
        }
        console.log('Using appUrl for return_url:', appUrl);

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
            return_url: `${appUrl}/payment-success`,
        };

        console.log('Sending payload to DodoPayments:', JSON.stringify(payload, null, 2));

        const checkoutSession = await client.checkoutSessions.create(payload);

        console.log('Checkout session created successfully:', checkoutSession);

        return NextResponse.json({
            checkout_url: checkoutSession.checkout_url,
            session_id: checkoutSession.session_id,
        });
    } catch (error: unknown) {
        console.error('Error creating checkout session FULL OBJECT:', error);

        let debug = 'Unknown error';

        if (error instanceof Error) {
            console.error('Error message:', error.message);
            debug = error.message;
        }
        else {
            try {
                debug = JSON.stringify(error);
            } catch { }
        }

        const err = error as {
            body?: unknown;
            response?: unknown;
        };

        if (err?.body) console.error('Error body:', JSON.stringify(err.body, null, 2));
        if (err?.response) console.error('Error response:', JSON.stringify(err.response, null, 2));

        return NextResponse.json(
            {
                error: 'Failed to create checkout session',
                debug,
            },

            { status: 500 }
        );
    }

}
