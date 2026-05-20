import SmartNavbar from "@/components/SmartNavbar";
import ReferralLinker from "@/components/ReferralLinker";
import CreditsProvider from "@/context/CreditsContext";
import { CalculationCreditsProvider } from "@/context/CalculationCreditsContext";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Default values for logged-out visitors.
  let credits = 0;
  let allocated = 0;
  let used = 0;
  let hasPaid = false;

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("credits_allocated, credits_used, has_paid")
      .eq("id", user.id)
      .maybeSingle();

    allocated = data?.credits_allocated ?? 0;
    used = data?.credits_used ?? 0;
    credits = allocated - used;
    hasPaid = data?.has_paid ?? false;
  }

  return (
    <CreditsProvider value={{ credits, allocated, used, userId: user?.id || null, hasPaid }}>
      <CalculationCreditsProvider>
        <ReferralLinker />
        <SmartNavbar />
        {children}
      </CalculationCreditsProvider>
    </CreditsProvider>
  );
}

