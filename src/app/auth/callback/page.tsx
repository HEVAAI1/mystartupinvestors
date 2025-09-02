"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("No session:", error?.message);
        router.replace("/login");
        return;
      }

      const user = session.user;

      // 📝 Upsert into custom users table
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
        console.log("✅ User record updated");
      }

      router.replace("/dashboard");
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      Redirecting...
    </div>
  );
}
