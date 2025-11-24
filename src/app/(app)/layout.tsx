import AuthenticatedNavbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import CreditsProvider from "@/context/CreditsContext";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  console.log("------ APP LAYOUT START ------");

  const supabase = await createSupabaseServerClient();
  console.log("Supabase client created");

  const userResponse = await supabase.auth.getUser();
  console.log("auth.getUser() response:", userResponse);

  const user = userResponse?.data?.user || null;
  console.log("Extracted user:", user);

  let credits = 0;
  let allocated = 0;
  let used = 0;

  if (user) {
    console.log("User is logged in with ID:", user.id);

    const creditResponse = await supabase
      .from("users")
      .select("credits_allocated, credits_used")
      .eq("id", user.id)
      .single();

    console.log("Credit query response:", creditResponse);

    const data = creditResponse?.data;
    console.log("Raw credit data:", data);

    allocated = data?.credits_allocated ?? 0;
    used = data?.credits_used ?? 0;

    console.log("Allocated:", allocated);
    console.log("Used:", used);

    credits = allocated - used;

    console.log("Final Computed Credits:", credits);
  } else {
    console.log("No user found — credits default to 0");
  }

  console.log("------ APP LAYOUT END ------");

  return (
    <>
      <AuthenticatedNavbar credits={credits} />
      <CreditsProvider value={{ credits, allocated, used }}>
        {children}
      </CreditsProvider>
    </>
  );
}
