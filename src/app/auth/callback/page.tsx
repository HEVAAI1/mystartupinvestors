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
        const { data: { session } } = await supabase.auth.getSession();

        // If we have a session, ensure user exists in database before redirecting
        if (session) {
          const user = session.user;
          console.log("Session found, checking/creating user:", user.id);

          // First, check if user already exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("id, credits_used, name, email")
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

          // Redirect to dashboard after ensuring user is in database
          router.replace("/dashboard");
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
                .select("id, credits_used, name, email")
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

              router.replace("/dashboard");
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
    <div className="flex items-center justify-center min-h-screen text-white bg-[#111418]">
      Redirecting...
    </div>
  );
}
