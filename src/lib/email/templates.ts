import "server-only";

import type { EmailOutboxEvent } from "@/lib/email/types";

const SITE_URL = "https://www.myfundinglist.com";
const SUPPORT_EMAIL = "support@myfundinglist.com";
const BRAND_CREAM = "#FAF7EE";
const BRAND_OLIVE = "#31372B";

type RenderedEmail = {
    subject: string;
    html: string;
    text: string;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function absoluteUrl(path: string): string {
    return `${SITE_URL}${path}`;
}

function formatUsd(amountUsd: number): string {
    return `$${amountUsd.toFixed(2)}`;
}

type LayoutInput = {
    title: string;
    preheader: string;
    greetingName?: string | null;
    bodyLines: string[];
    ctaLabel?: string;
    ctaUrl?: string;
    footnote?: string;
};

/**
 * The single branded layout every transactional email is built from: MFL
 * logo, warm cream background, white content card, dark-olive CTA, support
 * footer, plain-text fallback. New event content adds bodyLines/CTA here,
 * never a second layout.
 */
function renderLayout(input: LayoutInput): RenderedEmail {
    const greeting = input.greetingName ? `Hi ${escapeHtml(input.greetingName)},` : "Hi there,";
    const bodyHtml = input.bodyLines.map((line) => `<p style="margin:0 0 16px;color:${BRAND_OLIVE};font-size:15px;line-height:1.6;">${line}</p>`).join("\n");
    const bodyText = input.bodyLines.map((line) => line.replace(/<[^>]+>/g, "")).join("\n\n");

    const ctaHtml = input.ctaLabel && input.ctaUrl
        ? `<a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:${BRAND_OLIVE};color:${BRAND_CREAM};text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${escapeHtml(input.ctaLabel)}</a>`
        : "";
    const ctaText = input.ctaLabel && input.ctaUrl ? `\n\n${input.ctaLabel}: ${input.ctaUrl}` : "";

    const footnoteHtml = input.footnote
        ? `<p style="margin:16px 0 0;color:#717182;font-size:13px;line-height:1.5;">${input.footnote}</p>`
        : "";
    const footnoteText = input.footnote ? `\n\n${input.footnote.replace(/<[^>]+>/g, "")}` : "";

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:32px 16px;background:${BRAND_CREAM};font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(input.preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:24px;text-align:center;">
                <img src="${absoluteUrl("/Logo.svg")}" alt="MyFundingList" height="32" style="height:32px;" />
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border-radius:12px;padding:32px;">
                <p style="margin:0 0 16px;color:${BRAND_OLIVE};font-size:15px;line-height:1.6;">${greeting}</p>
                ${bodyHtml}
                ${ctaHtml}
                ${footnoteHtml}
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;text-align:center;color:#717182;font-size:12px;line-height:1.6;">
                Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_OLIVE};">${SUPPORT_EMAIL}</a><br />
                <a href="${SITE_URL}" style="color:${BRAND_OLIVE};">myfundinglist.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const text = `${greeting}\n\n${bodyText}${ctaText}${footnoteText}\n\nNeed help? Contact us at ${SUPPORT_EMAIL}\n${SITE_URL}`;

    return { subject: input.title, html, text };
}

function renderWelcome(event: EmailOutboxEvent): RenderedEmail {
    const name = typeof event.payload.name === "string" ? event.payload.name : null;
    return renderLayout({
        title: "Your MyFundingList account is ready",
        preheader: "You have 5 free investor unlocks to start with.",
        greetingName: name,
        bodyLines: [
            "Your MyFundingList account is ready to go. You start with 5 free investor unlocks so you can explore contacts right away.",
        ],
        ctaLabel: "Explore investors",
        ctaUrl: absoluteUrl("/dashboard"),
    });
}

function renderStartupSubmitted(event: EmailOutboxEvent): RenderedEmail {
    const companyName = typeof event.payload.companyName === "string" ? event.payload.companyName : "your startup";
    return renderLayout({
        title: "We received your startup submission",
        preheader: `Your submission for ${companyName} is in review.`,
        bodyLines: [
            `Thanks for submitting <strong>${escapeHtml(companyName)}</strong>. Our team will review it and follow up if we need anything else.`,
        ],
        ctaLabel: "Update your profile",
        ctaUrl: absoluteUrl("/add-startup"),
    });
}

function renderInternalStartupSubmitted(event: EmailOutboxEvent): RenderedEmail {
    const companyName = typeof event.payload.companyName === "string" ? event.payload.companyName : "A startup";
    const adminUrl = typeof event.payload.adminUrl === "string" ? event.payload.adminUrl : absoluteUrl("/admin/startup-list");
    return renderLayout({
        title: `New startup submission: ${companyName}`,
        preheader: "A new startup submission needs review.",
        bodyLines: [
            `<strong>${escapeHtml(companyName)}</strong> was just submitted and is waiting for review.`,
        ],
        ctaLabel: "Review submission",
        ctaUrl: adminUrl,
    });
}

function renderContactReceived(event: EmailOutboxEvent): RenderedEmail {
    const subject = typeof event.payload.subject === "string" ? event.payload.subject : "your message";
    return renderLayout({
        title: "We received your message",
        preheader: "Our team will reply soon.",
        bodyLines: [
            `Thanks for reaching out about "${escapeHtml(subject)}". Our team will reply within 1-2 business days.`,
        ],
    });
}

function renderInternalContactRequest(event: EmailOutboxEvent): RenderedEmail {
    const name = typeof event.payload.name === "string" ? event.payload.name : "Someone";
    const subject = typeof event.payload.subject === "string" ? event.payload.subject : "(no subject)";
    const message = typeof event.payload.message === "string" ? event.payload.message : "";
    // event.recipient_email is the internal support list for this event type
    // (see src/app/api/contact/route.ts); the submitter's own address is
    // carried in payload.replyTo, not recipient_email.
    const submitterEmail = typeof event.payload.replyTo === "string" ? event.payload.replyTo : "unknown sender";
    return renderLayout({
        title: `[Contact Us] ${subject}`,
        preheader: `New contact request from ${name}.`,
        bodyLines: [
            `<strong>${escapeHtml(name)}</strong> (${escapeHtml(submitterEmail)}) sent a message:`,
            escapeHtml(message).replace(/\n/g, "<br />"),
        ],
    });
}

function renderPurchaseReceipt(event: EmailOutboxEvent): RenderedEmail {
    const plan = typeof event.payload.plan === "string" ? event.payload.plan : "plan";
    const amountUsd = typeof event.payload.amountUsd === "number" ? event.payload.amountUsd : 0;
    const credits = typeof event.payload.credits === "number" ? event.payload.credits : 0;
    const paymentId = typeof event.payload.paymentId === "string" ? event.payload.paymentId : "";

    return renderLayout({
        title: `Your ${credits} MyFundingList credits are ready`,
        preheader: `Receipt for your ${plan} purchase.`,
        bodyLines: [
            `Thanks for your purchase. Here is your receipt:`,
            `Plan: <strong>${escapeHtml(plan)}</strong><br />Amount: <strong>${formatUsd(amountUsd)}</strong><br />Credits added: <strong>${credits}</strong>${paymentId ? `<br />Payment ID: <strong>${escapeHtml(paymentId)}</strong>` : ""}`,
        ],
        ctaLabel: "Go to dashboard",
        ctaUrl: absoluteUrl("/dashboard"),
    });
}

function renderPaymentFailed(): RenderedEmail {
    return renderLayout({
        title: "We couldn't process your payment",
        preheader: "Please try again or contact support.",
        bodyLines: [
            "We weren't able to process your recent payment. No charge was completed. Please try again, or reach out if you keep seeing this.",
        ],
        ctaLabel: "Try again",
        ctaUrl: absoluteUrl("/pricing"),
    });
}

function renderInvestorCreditsLow(event: EmailOutboxEvent): RenderedEmail {
    const remaining = typeof event.payload.remaining === "number" ? event.payload.remaining : 0;
    return renderLayout({
        title: "Your investor unlocks are running low",
        preheader: `You have ${remaining} unlocks left.`,
        bodyLines: [
            `You have <strong>${remaining}</strong> investor unlocks remaining. Get more credits to keep exploring investors without interruption.`,
        ],
        ctaLabel: "Get more credits",
        ctaUrl: absoluteUrl("/pricing"),
    });
}

function renderInvestorCreditsZero(): RenderedEmail {
    return renderLayout({
        title: "You're out of investor unlocks",
        preheader: "Get more credits to keep unlocking investors.",
        bodyLines: [
            "You've used all your investor unlocks. Get more credits to keep exploring and unlocking investor contacts.",
        ],
        ctaLabel: "Get more credits",
        ctaUrl: absoluteUrl("/pricing"),
    });
}

function renderCalculatorCreditsLow(): RenderedEmail {
    return renderLayout({
        title: "One calculator use left this week",
        preheader: "Your weekly calculator uses reset soon.",
        bodyLines: [
            "You have 1 calculator use left this week. Your free uses reset weekly, or upgrade for unlimited calculations.",
        ],
        ctaLabel: "See plans",
        ctaUrl: absoluteUrl("/pricing"),
    });
}

function renderCalculatorCreditsZero(): RenderedEmail {
    return renderLayout({
        title: "You're out of calculator uses this week",
        preheader: "Your weekly calculator uses reset soon.",
        bodyLines: [
            "You've used all your free calculator uses for this week. They reset weekly, or upgrade for unlimited calculations.",
        ],
        ctaLabel: "See plans",
        ctaUrl: absoluteUrl("/pricing"),
    });
}

function renderAffiliateReady(event: EmailOutboxEvent): RenderedEmail {
    const referralLink = typeof event.payload.referralLink === "string" ? event.payload.referralLink : absoluteUrl("/affiliate/dashboard");
    return renderLayout({
        title: "Your affiliate account is ready",
        preheader: "Start sharing your unique referral link.",
        bodyLines: [
            `Your affiliate account is set up. Share your unique link to start earning commissions:<br /><strong>${escapeHtml(referralLink)}</strong>`,
        ],
        ctaLabel: "View earnings",
        ctaUrl: absoluteUrl("/affiliate/dashboard"),
    });
}

function renderAffiliateReferralJoined(): RenderedEmail {
    return renderLayout({
        title: "You have a new referral",
        preheader: "Someone joined using your referral link.",
        bodyLines: [
            "Someone just joined MyFundingList using your referral link. You'll earn a commission on their purchases.",
        ],
        ctaLabel: "View earnings",
        ctaUrl: absoluteUrl("/affiliate/dashboard"),
    });
}

function renderAffiliateCommissionEarned(event: EmailOutboxEvent): RenderedEmail {
    const amountUsd = typeof event.payload.amountUsd === "number" ? event.payload.amountUsd : 0;
    const availableBalanceUsd = typeof event.payload.availableBalanceUsd === "number" ? event.payload.availableBalanceUsd : 0;
    return renderLayout({
        title: "You earned a new commission",
        preheader: `You earned ${formatUsd(amountUsd)}.`,
        bodyLines: [
            `You earned <strong>${formatUsd(amountUsd)}</strong> in commission. Your available balance is now <strong>${formatUsd(availableBalanceUsd)}</strong>. Withdrawals unlock at $76.`,
        ],
        ctaLabel: "View earnings",
        ctaUrl: absoluteUrl("/affiliate/dashboard"),
    });
}

function renderAffiliateWithdrawalAvailable(event: EmailOutboxEvent): RenderedEmail {
    const availableBalanceUsd = typeof event.payload.availableBalanceUsd === "number" ? event.payload.availableBalanceUsd : 76;
    return renderLayout({
        title: "You can now request a withdrawal",
        preheader: "Your balance has reached the $76 minimum.",
        bodyLines: [
            `Your available balance is <strong>${formatUsd(availableBalanceUsd)}</strong>, which meets the $76 minimum for withdrawal.`,
        ],
        ctaLabel: "Request withdrawal",
        ctaUrl: absoluteUrl("/affiliate/dashboard"),
    });
}

function renderWithdrawalRequested(event: EmailOutboxEvent): RenderedEmail {
    const amountUsd = typeof event.payload.amountUsd === "number" ? event.payload.amountUsd : 0;
    const reference = typeof event.payload.reference === "string" ? event.payload.reference : "";
    return renderLayout({
        title: "Your withdrawal request was received",
        preheader: "We'll notify you once it's processed.",
        bodyLines: [
            `We received your withdrawal request for <strong>${formatUsd(amountUsd)}</strong>${reference ? ` (reference ${escapeHtml(reference)})` : ""}. We'll notify you once it's processed.`,
        ],
    });
}

function renderWithdrawalStatus(event: EmailOutboxEvent): RenderedEmail {
    const status = typeof event.payload.status === "string" ? event.payload.status : "updated";
    const amountUsd = typeof event.payload.amountUsd === "number" ? event.payload.amountUsd : 0;

    const statusCopy: Record<string, string> = {
        approved: "Your withdrawal request has been approved and is being processed.",
        rejected: "Your withdrawal request could not be processed. Contact support if you have questions.",
        paid: "Your withdrawal has been paid out.",
    };

    return renderLayout({
        title: `Your withdrawal was ${status}`,
        preheader: `Withdrawal update: ${status}.`,
        bodyLines: [
            `${statusCopy[status] ?? "Your withdrawal status has been updated."} Amount: <strong>${formatUsd(amountUsd)}</strong>.`,
        ],
        ctaLabel: "Contact support",
        ctaUrl: `mailto:${SUPPORT_EMAIL}`,
    });
}

const RENDERERS: Record<string, (event: EmailOutboxEvent) => RenderedEmail> = {
    welcome: renderWelcome,
    startup_submitted: renderStartupSubmitted,
    internal_startup_submitted: renderInternalStartupSubmitted,
    contact_received: renderContactReceived,
    internal_contact_request: renderInternalContactRequest,
    purchase_receipt: renderPurchaseReceipt,
    payment_failed: renderPaymentFailed,
    investor_credits_low: renderInvestorCreditsLow,
    investor_credits_zero: renderInvestorCreditsZero,
    calculator_credits_low: renderCalculatorCreditsLow,
    calculator_credits_zero: renderCalculatorCreditsZero,
    affiliate_ready: renderAffiliateReady,
    affiliate_referral_joined: renderAffiliateReferralJoined,
    affiliate_commission_earned: renderAffiliateCommissionEarned,
    affiliate_withdrawal_available: renderAffiliateWithdrawalAvailable,
    withdrawal_requested: renderWithdrawalRequested,
    withdrawal_status: renderWithdrawalStatus,
};

export function renderEmailEvent(event: EmailOutboxEvent): RenderedEmail {
    const renderer = RENDERERS[event.event_type];
    if (!renderer) {
        throw new Error(`no renderer registered for event type: ${event.event_type}`);
    }

    return renderer(event);
}
