import AuthenticatedNavbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import CreditsProvider from "@/context/CreditsContext";
import { CalculationCreditsProvider } from "@/context/CalculationCreditsContext";
import { redirect } from "next/navigation";
import ReferralLinker from "@/components/ReferralLinker";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const userResponse = await supabase.auth.getUser();
  const user = userResponse?.data?.user || null;

  if (!user) {
    redirect("/");
  }

  let credits = 0;
  let allocated = 0;
  let used = 0;
  let userRole = "user";
  let hasPaid = false;

  const creditResponse = await supabase
    .from("users")
    .select("credits_allocated, credits_used, role, has_paid")
    .eq("id", user.id)
    .single();

  const data = creditResponse?.data;

  allocated = data?.credits_allocated ?? 0;
  used = data?.credits_used ?? 0;
  userRole = data?.role ?? "user";
  hasPaid = data?.has_paid ?? false;

  if (userRole === "admin") {
    redirect("/admin/dashboard");
  }

  credits = allocated - used;

  return (
    <>
      <CreditsProvider value={{ credits, allocated, used, userId: user?.id || null, hasPaid }}>
        <CalculationCreditsProvider>
          <ReferralLinker />
          <AuthenticatedNavbar />
          {children}
        </CalculationCreditsProvider>
      </CreditsProvider>
    </>
  );
}
