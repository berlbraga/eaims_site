"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase publico nao configurado.");
  }
  return createBrowserClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      detectSessionInUrl: true,
      flowType: "implicit"
    }
  });
}
