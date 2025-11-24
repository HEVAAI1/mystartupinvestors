// lib/getUserCredits.ts
import { supabase } from "./supabaseClient";

export async function getUserCredits() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return 0;
  }

  const { data, error } = await supabase
    .from("users")
    .select("credits_allocated, credits_used")
    .eq("id", user.id)
    .single();

  if (error || !data) return 0;

  return (data.credits_allocated || 0) - (data.credits_used || 0);
}
