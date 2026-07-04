"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Confirmando seu acesso...");

  useEffect(() => {
    let mounted = true;

    async function confirmSession() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/login?erro=sessao");
        return;
      }

      setMessage("Preparando sua plataforma...");

      const response = await fetch("/api/auth/ensure-profile", { method: "POST" });
      if (!response.ok) {
        router.replace(response.status === 403 ? "/login?erro=dominio" : "/login?erro=sessao");
        return;
      }

      const next = searchParams.get("next");
      const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : "/portal";
      router.replace(redirectTo);
    }

    confirmSession().catch(() => {
      if (mounted) router.replace("/login?erro=sessao");
    });

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <section className="text-center">
        <p className="text-3xl font-bold text-primary">E-AIMS</p>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
          {message}
        </div>
      </section>
    </main>
  );
}
