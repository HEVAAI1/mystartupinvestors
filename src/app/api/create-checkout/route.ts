import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    type LogEntry = { step: string; data?: unknown; time: string };
    const logs: LogEntry[] = [];

    const log = (step: string, data?: unknown) => {
        logs.push({
            step,
            data,
            time: new Date().toISOString(),
        });
    };

    type CheckoutRequestBody = {
        product_id: string;
        user_id: string;
    };

    const isCheckoutRequestBody = (value: unknown): value is CheckoutRequestBody => {
        if (typeof value !== 'object' || value === null) return false;
        const record = value as Record<string, unknown>;
        return typeof record.product_id === 'string' && typeof record.user_id === 'string';
    };

    try {
        log("START");

        // 🔍 Read raw body
        let rawBody = '';
        try {
            rawBody = await request.text();
            log("RAW BODY", rawBody);
        } catch {
            log("FAILED TO READ RAW BODY");
        }

        // 🔍 Parse JSON safely
        let parsed: unknown = {};
        try {
            parsed = JSON.parse(rawBody);
            log("PARSED BODY", parsed);
        } catch (e) {
            log("JSON PARSE FAILED", e);
            throw new Error("Invalid JSON body");
        }

        const product_id = isCheckoutRequestBody(parsed) ? parsed.product_id : undefined;
        const user_id = isCheckoutRequestBody(parsed) ? parsed.user_id : undefined;

        if (!product_id || !user_id) {
            log("MISSING FIELDS", parsed);
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    logs,
                    requestId,
                },
                { status: 400 }
            );
        }

        // 🔐 ENV CHECK
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        const environment =
            (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') ??
            'live_mode';

        log("ENV CHECK", {
            hasKey: !!apiKey,
            keyLength: apiKey?.length,
            environment,
            nodeEnv: process.env.NODE_ENV,
        });

        if (!apiKey) {
            throw new Error("Missing DODO API key");
        }

        // 💳 Init client
        const client = new DodoPayments({
            bearerToken: apiKey,
            environment,
        });

        log("CLIENT INITIALIZED");

        // 🌍 App URL
        let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        if (appUrl === 'http://localhost' && process.env.NODE_ENV === 'development') {
            appUrl = 'http://localhost:3000';
        }

        const returnUrl = `${appUrl}/payment-success`;

        log("RETURN URL", returnUrl);

        // 📦 Payload
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

        log("PAYLOAD", payload);

        // ⏱️ Call API
        const start = Date.now();

        type CheckoutSession = {
            checkout_url: string;
            session_id: string;
        };

        let checkoutSession: CheckoutSession | null = null;
        try {
            checkoutSession = await client.checkoutSessions.create(payload);
            log("DODO SUCCESS", {
                duration: Date.now() - start,
                session_id: checkoutSession?.session_id,
            });
        } catch (err: unknown) {
            const errRecord =
                typeof err === 'object' && err !== null ? (err as Record<string, unknown>) : undefined;

            const message = errRecord?.message;
            const name = errRecord?.name;
            const stack = errRecord?.stack;

            const keys =
                typeof err === 'object' && err !== null ? Object.keys(errRecord ?? {}) : [];

            const full =
                typeof err === 'object' && err !== null
                    ? JSON.stringify(err, Object.getOwnPropertyNames(err as object))
                    : undefined;

            log("DODO FAILED", {
                duration: Date.now() - start,
                message,
                name,
                stack,
                keys,
                full,
            });

            throw err;
        }

        // ✅ Success response
        if (!checkoutSession) {
            throw new Error('Dodo returned an empty checkout session');
        }
        return NextResponse.json({
            checkout_url: checkoutSession.checkout_url,
            session_id: checkoutSession.session_id,
            logs,
            requestId,
        });

    } catch (error: unknown) {
        const errorRecord =
            typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : undefined;
        const message =
            error instanceof Error ? error.message : typeof errorRecord?.message === 'string' ? errorRecord.message : undefined;
        const stack = error instanceof Error ? error.stack : typeof errorRecord?.stack === 'string' ? errorRecord.stack : undefined;

        log("FINAL ERROR", {
            message,
            stack,
        });

        return NextResponse.json(
            {
                error: 'Failed to create checkout session',
                debug: message,
                logs,
                requestId,
            },
            { status: 500 }
        );
    }
}