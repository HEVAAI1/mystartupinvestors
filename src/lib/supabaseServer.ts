import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                set(name: string, value: string, options: any) {
                    try {
                        cookieStore.set(name, value, options);
                    } catch { }
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                remove(name: string, options: any) {
                    try {
                        cookieStore.set(name, "", { ...options, maxAge: 0 });
                    } catch { }
                },
            },
        }
    );
}
