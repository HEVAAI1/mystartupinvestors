"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            const user = session.user;

            await supabase.from("users").upsert({
              id: user.id,
              name: user.user_metadata.full_name || "",
              email: user.email || "",
              plan: "free",
              credits_allocated: 5,
              credits_used: 0,
              last_login: new Date().toISOString(),
              role: "user",
              profile_picture: user.user_metadata.avatar_url,
            });

            router.replace("/dashboard");
          }
        }
      );

      if (session) router.replace("/dashboard");

      return () => listener.subscription.unsubscribe();
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-[#111418]">
      Redirecting...
    </div>
  );
}
