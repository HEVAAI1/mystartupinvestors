import AuthenticatedNavbar from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import CreditsProvider from "@/context/CreditsContext";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  console.log("------ APP LAYOUT START ------");

  const supabase = await createSupabaseServerClient();
  console.log("Supabase client created");

  const userResponse = await supabase.auth.getUser();
  console.log("auth.getUser() response:", userResponse);

  const user = userResponse?.data?.user || null;
  console.log("Extracted user:", user);

  // PROTECTION: Redirect unauthenticated users to home
  if (!user) {
    console.log("No user found - redirecting to home page");
    redirect("/");
  }

  let credits = 0;
  let allocated = 0;
  let used = 0;
  let userRole = "user";

  console.log("User is logged in with ID:", user.id);

  const creditResponse = await supabase
    .from("users")
    .select("credits_allocated, credits_used, role")
    .eq("id", user.id)
    .single();

  console.log("Credit query response:", creditResponse);

  const data = creditResponse?.data;
  console.log("Raw credit data:", data);

  allocated = data?.credits_allocated ?? 0;
  used = data?.credits_used ?? 0;
  userRole = data?.role ?? "user";

  console.log("Allocated:", allocated);
  console.log("Used:", used);
  console.log("User Role:", userRole);

  // PROTECTION: Redirect admins to admin dashboard
  if (userRole === "admin") {
    console.log("Admin user detected - redirecting to admin dashboard");
    redirect("/admin/dashboard");
  }

  credits = allocated - used;

  console.log("Final Computed Credits:", credits);
  console.log("------ APP LAYOUT END ------");

  return (
    <>
      <CreditsProvider value={{ credits, allocated, used, userId: user?.id || null }}>
        <AuthenticatedNavbar />
        {children}
      </CreditsProvider>
    </>
  );
}
