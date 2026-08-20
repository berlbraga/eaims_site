"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const validEmailOtpTypes = new Set<EmailOtpType>(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Confirmando seu acesso...");

  useEffect(() => {
    let mounted = true;

    async function confirmSession() {
      const supabase = createSupabaseBrowserClient();
      const tokenHash = searchParams.get("token_hash");
      const requestedType = searchParams.get("type") ?? "magiclink";

      if (tokenHash) {
        const type = validEmailOtpTypes.has(requestedType as EmailOtpType) ? (requestedType as EmailOtpType) : "magiclink";
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type
        });

        if (!mounted) return;

        if (error) {
          router.replace("/login?erro=link");
          return;
        }
      }

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

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<AuthConfirmFallback />}>
      <AuthConfirmContent />
    </Suspense>
  );
}

function AuthConfirmFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <section className="text-center">
        <p className="text-3xl font-bold text-primary">E-AIMS</p>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
          Confirmando seu acesso...
        </div>
      </section>
    </main>
  );
}
