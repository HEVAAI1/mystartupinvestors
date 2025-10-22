"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // 👇 Step 1: Wait for Supabase to handle the OAuth callback from Google
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session) {
        console.warn("Session not ready yet, waiting for onAuthStateChange...");
      }

      // 👇 Step 2: Listen for auth state changes (fires when Supabase finishes)
      const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            console.log("✅ Signed in! Updating user record...");

            const user = session.user;

            const { error: upsertError } = await supabase.from("users").upsert({
              id: user.id,
              name: user.user_metadata.full_name || "",
              email: user.email || "",
              plan: "free",
              credits_allocated: 5,
              credits_used: 0,
              last_login: new Date().toISOString(),
              role: "user",
              profile_picture: user.user_metadata.avatar_url || null,
            });

            if (upsertError) {
              console.error("Failed to update users table:", upsertError.message);
            } else {
              console.log("✅ User record updated in Supabase");
            }

            router.replace("/dashboard");
          } else if (event === "SIGNED_OUT") {
            console.warn("User signed out");
            router.replace("/login");
          }
        }
      );

      // Optional: fallback in case onAuthStateChange never triggers (rare)
      if (session) {
        router.replace("/dashboard");
      }

      return () => {
        listener.subscription.unsubscribe();
      };
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-[#111418]">
      Redirecting...
    </div>
  );
}
