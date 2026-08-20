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
  const [isConfirming, setIsConfirming] = useState(false);
  const tokenHash = searchParams.get("token_hash");

  useEffect(() => {
    let mounted = true;

    async function confirmExistingSession() {
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

    if (tokenHash) return () => {
      mounted = false;
    };

    confirmExistingSession().catch(() => {
      if (mounted) router.replace("/login?erro=sessao");
    });

    return () => {
      mounted = false;
    };
  }, [router, searchParams, tokenHash]);

  async function confirmTokenHash() {
    if (!tokenHash || isConfirming) return;
    setIsConfirming(true);
    setMessage("Validando seu link...");

    const requestedType = searchParams.get("type") ?? "email";
    const normalizedType = requestedType === "magiclink" ? "email" : requestedType;
    const type = validEmailOtpTypes.has(normalizedType as EmailOtpType) ? (normalizedType as EmailOtpType) : "email";
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    });

    if (error) {
      router.replace("/login?erro=link");
      return;
    }

    setMessage("Preparando sua plataforma...");
    const response = await fetch("/api/auth/ensure-profile", { method: "POST" });
    if (!response.ok) {
      router.replace(response.status === 403 ? "/login?erro=dominio" : response.status === 423 ? "/login?erro=pendente" : "/login?erro=sessao");
      return;
    }

    const next = searchParams.get("next");
    const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : "/portal";
    router.replace(redirectTo);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <section className="text-center">
        <p className="text-3xl font-bold text-primary">E-AIMS</p>
        {tokenHash ? (
          <>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">
              Clique abaixo para confirmar seu acesso à plataforma.
            </p>
            <button
              type="button"
              onClick={confirmTokenHash}
              disabled={isConfirming}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Confirmando...
                </>
              ) : (
                "Confirmar acesso"
              )}
            </button>
            {isConfirming ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
          </>
        ) : (
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
            {message}
          </div>
        )}
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
