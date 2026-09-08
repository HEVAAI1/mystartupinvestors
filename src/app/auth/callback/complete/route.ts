import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

function sanitizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/dashboard";
  }

  if (nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const providerError = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));

  const errorRedirect = (reason: string) => {
    const url = new URL("/", request.url);
    url.searchParams.set("auth_error", reason);
    return NextResponse.redirect(url);
  };

  const fallbackRedirect = providerError
    ? errorRedirect(providerError)
    : errorRedirect("Sign-in failed. Please try again.");

  const cookieCarrier = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieCarrier.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    if (!code) {
      return fallbackRedirect;
    }

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Auth code exchange failed:", exchangeError);
      return fallbackRedirect;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth user lookup failed:", userError);
      return fallbackRedirect;
    }

    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id, role, name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (existingUserError) {
      console.error("User bootstrap lookup failed:", existingUserError);
      return fallbackRedirect;
    }

    const userPayload = {
      id: user.id,
      name: user.user_metadata.full_name || existingUser?.name || "",
      email: user.email || existingUser?.email || "",
      profile_picture: user.user_metadata.avatar_url,
      last_login: new Date().toISOString(),
    };

    const role = existingUser?.role ?? "user";

    if (existingUser) {
      const { error: updateError } = await supabase
        .from("users")
        .update(userPayload)
        .eq("id", user.id);

      if (updateError) {
        console.error("User last_login update failed:", updateError);
      }
    } else {
      const { error: insertError } = await supabase.from("users").insert({
        ...userPayload,
        plan: "free",
        credits_allocated: 5,
        credits_used: 0,
        role: "user",
      });

      if (insertError) {
        console.error("User creation failed:", insertError);
        return fallbackRedirect;
      }
    }

    const redirectUrl = new URL(role === "admin" ? "/admin/dashboard" : nextPath, request.url);
    const response = NextResponse.redirect(redirectUrl);

    cookieCarrier.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    return response;
  } catch (error) {
    console.error("Unexpected auth callback error:", error);
    return fallbackRedirect;
  }
}
