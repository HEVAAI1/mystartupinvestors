"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Session error:", error.message);
        router.replace("/login");
        return;
      }

      if (data.session) {
        // ✅ User is logged in
        router.replace("/dashboard"); // or wherever you want to send them
      } else {
        // ❌ No session
        router.replace("/login");
      }
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      Redirecting...
    </div>
  );
}
