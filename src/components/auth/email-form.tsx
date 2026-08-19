"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { validateOtpEmailAction, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { ok: false, message: "" };
const resendCooldownSeconds = 90;
const rateLimitCooldownSeconds = 5 * 60;

function createMagicLinkClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase publico nao configurado.");
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "implicit",
      persistSession: false
    }
  });
}

export function EmailForm() {
  const [state, setState] = useState<ActionState>(initialState);
  const [email, setEmail] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [pending, startTransition] = useTransition();
  const remainingSeconds = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedEmail = (new FormData(event.currentTarget).get("email")?.toString() ?? "").trim().toLowerCase();
    const existingCooldown = readCooldown(submittedEmail);

    if (existingCooldown > Date.now()) {
      setCooldownUntil(existingCooldown);
      setState({
        ok: false,
        kind: "error",
        message: `Aguarde ${Math.ceil((existingCooldown - Date.now()) / 1000)} segundos antes de solicitar outro link para este e-mail.`
      });
      return;
    }

    startTransition(async () => {
      setState(initialState);
      setEmail(submittedEmail);

      const validation = await validateOtpEmailAction(submittedEmail);
      if (!validation.ok) {
        setState(validation);
        return;
      }

      const supabase = createMagicLinkClient();
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email: submittedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: callbackUrl
        }
      });

      if (error) {
        const authError = error as { code?: string; status?: number };
        const isRateLimited = authError.code === "over_email_send_rate_limit" || authError.status === 429;

        setState({
          ok: false,
          kind: "error",
          message: isRateLimited
            ? "O envio de links do projeto atingiu um limite temporario. Use o link mais recente que chegou ao e-mail ou aguarde alguns minutos antes de tentar novamente."
            : "Nao foi possivel enviar o link agora. Verifique as URLs autorizadas no Supabase e tente novamente."
        });
        if (isRateLimited) {
          setCooldown(submittedEmail, rateLimitCooldownSeconds);
          setCooldownUntil(Date.now() + rateLimitCooldownSeconds * 1000);
        }
        return;
      }

      setCooldown(submittedEmail, resendCooldownSeconds);
      window.location.assign(`/login/verificar?email=${encodeURIComponent(submittedEmail)}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail institucional</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@dominio-institucional.br"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      {state.message ? (
        <div
          className={
            state.kind === "setup"
              ? "rounded-md border border-primary/25 bg-secondary px-3 py-2 text-sm text-secondary-foreground"
              : "text-sm text-destructive"
          }
          role="alert"
        >
          {state.message}
        </div>
      ) : null}
      {remainingSeconds > 0 ? (
        <p className="text-xs text-muted-foreground">
          Link solicitado recentemente. Aguarde {remainingSeconds} segundos antes de pedir outro.
        </p>
      ) : null}
      <Button className="w-full" disabled={pending || remainingSeconds > 0}>
        <Send className="h-4 w-4" aria-hidden />
        {pending ? "Enviando..." : remainingSeconds > 0 ? "Aguarde para reenviar" : "Enviar link de acesso"}
      </Button>
    </form>
  );
}

function cooldownKey(email: string) {
  return `eaims-login-cooldown:${email}`;
}

function readCooldown(email: string) {
  if (!email || typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(cooldownKey(email)) ?? 0);
}

function setCooldown(email: string, seconds: number) {
  if (!email || typeof window === "undefined") return;
  window.localStorage.setItem(cooldownKey(email), String(Date.now() + seconds * 1000));
}
