import "server-only";

import type { createSupabaseAdminClient } from "@/lib/supabaseServer";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

/**
 * Resolves the account email for the person who owns an affiliate record,
 * for lifecycle notices (commission earned, withdrawal status, etc). This is
 * the affiliate's own login email — never the payout `email_id` field from a
 * withdrawal form, which can differ and isn't validated as reachable.
 */
export async function getAffiliateOwnerEmail(admin: AdminClient, affiliateId: string): Promise<string | null> {
    const { data: affiliate } = await admin
        .from("affiliates")
        .select("user_id")
        .eq("id", affiliateId)
        .maybeSingle();

    if (!affiliate?.user_id) {
        return null;
    }

    const { data: userRow } = await admin
        .from("users")
        .select("email")
        .eq("id", affiliate.user_id)
        .maybeSingle();

    return userRow?.email ?? null;
}
