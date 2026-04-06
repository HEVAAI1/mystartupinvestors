import AuthenticatedNavbar from "@/components/Navbar";
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

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("credits_allocated, credits_used")
      .eq("id", user.id)
      .maybeSingle();

    allocated = data?.credits_allocated ?? 0;
    used = data?.credits_used ?? 0;
    credits = allocated - used;
  }

  return (
    <CreditsProvider value={{ credits, allocated, used, userId: user?.id || null }}>
      <CalculationCreditsProvider>
        <ReferralLinker />
        <AuthenticatedNavbar />
        {children}
      </CalculationCreditsProvider>
    </CreditsProvider>
  );
}

