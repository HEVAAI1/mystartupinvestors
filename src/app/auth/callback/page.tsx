"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        let nextPath = new URLSearchParams(window.location.search).get("next");
        if (!nextPath) {
          nextPath = localStorage.getItem("mfl_next_path");
        }
        const { data: { session } } = await supabase.auth.getSession();

        // If we have a session, ensure user exists in database before redirecting
        if (session) {
          const user = session.user;
          console.log("Session found, checking/creating user:", user.id);

          // First, check if user already exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("id, credits_used, name, email, role")
            .eq("id", user.id)
            .single();

          if (existingUser) {
            // User exists - only update last_login, don't touch credits
            console.log("Existing user found, updating last_login only");
            const { error } = await supabase
              .from("users")
              .update({
                last_login: new Date().toISOString(),
                name: user.user_metadata.full_name || existingUser.name,
                email: user.email || existingUser.email,
                profile_picture: user.user_metadata.avatar_url
              })
              .eq("id", user.id);

            if (error) {
              console.error("Error updating user last_login:", error);
            } else {
              console.log("User last_login updated successfully");
            }
          } else {
            // New user - create with default values
            console.log("New user, creating with default credits");
            const { error } = await supabase.from("users").insert({
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

            if (error) {
              console.error("Error creating new user in database:", error);
            } else {
              console.log("New user successfully created in database");
            }
          }

          // Redirect based on user role
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (userData?.role === "admin") {
            console.log("Redirecting admin to /admin/dashboard");
            router.replace("/admin/dashboard");
          } else {
            console.log("Redirecting user to", nextPath || "/dashboard");
            if (localStorage.getItem("mfl_next_path")) localStorage.removeItem("mfl_next_path");
            router.replace(nextPath || "/dashboard");
          }
        }

        // Listen for future auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);

            if (event === "SIGNED_IN" && session) {
              const user = session.user;
              console.log("User signed in via state change, checking/creating user:", user.id);

              // First, check if user already exists
              const { data: existingUser } = await supabase
                .from("users")
                .select("id, credits_used, name, email, role")
                .eq("id", user.id)
                .single();

              if (existingUser) {
                // User exists - only update last_login, don't touch credits
                console.log("Existing user found in state change, updating last_login only");
                const { error } = await supabase
                  .from("users")
                  .update({
                    last_login: new Date().toISOString(),
                    name: user.user_metadata.full_name || existingUser.name,
                    email: user.email || existingUser.email,
                    profile_picture: user.user_metadata.avatar_url
                  })
                  .eq("id", user.id);

                if (error) {
                  console.error("Error updating user last_login:", error);
                } else {
                  console.log("User last_login updated successfully");
                }
              } else {
                // New user - create with default values
                console.log("New user in state change, creating with default credits");
                const { error } = await supabase.from("users").insert({
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

                if (error) {
                  console.error("Error creating new user in database:", error);
                } else {
                  console.log("New user successfully created in database");
                }
              }

              // Redirect based on user role
              const { data: userData } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single();

              if (userData?.role === "admin") {
                console.log("Redirecting admin to /admin/dashboard");
                router.replace("/admin/dashboard");
              } else {
                console.log("Redirecting user to", nextPath || "/dashboard");
                if (localStorage.getItem("mfl_next_path")) localStorage.removeItem("mfl_next_path");
                router.replace(nextPath || "/dashboard");
              }
            }
          }
        );

        return () => {
          console.log("Cleaning up auth listener");
          listener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error in auth callback:", error);
      }
    };

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF7EE]">
      {/* Loading Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#31372B1F] border-t-[#31372B] rounded-full animate-spin"></div>
      </div>

      {/* Loading Text */}
      <p className="mt-6 text-[#31372B] text-lg font-medium">
        Redirecting...
      </p>

      {/* Optional subtext */}
      <p className="mt-2 text-[#717182] text-sm">
        Please wait while we set up your account
      </p>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
