"use client";

import { FormEvent, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { validateOtpEmailAction, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { ok: false, message: "" };

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
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedEmail = new FormData(event.currentTarget).get("email")?.toString() ?? "";

    startTransition(async () => {
      setState(initialState);
      setEmail(submittedEmail);

      const validation = await validateOtpEmailAction(submittedEmail);
      if (!validation.ok) {
        setState(validation);
        return;
      }

      const supabase = createMagicLinkClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: submittedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`
        }
      });

      if (error) {
        const authError = error as { code?: string; status?: number };
        const isRateLimited = authError.code === "over_email_send_rate_limit" || authError.status === 429;

        setState({
          ok: false,
          kind: "error",
          message: isRateLimited
            ? "Muitos links foram solicitados em pouco tempo. Aguarde alguns minutos e tente novamente."
            : "Nao foi possivel enviar o link agora. Verifique as URLs autorizadas no Supabase e tente novamente."
        });
        return;
      }

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
      <Button className="w-full" disabled={pending}>
        <Send className="h-4 w-4" aria-hidden />
        {pending ? "Enviando..." : "Enviar link de acesso"}
      </Button>
    </form>
  );
}
