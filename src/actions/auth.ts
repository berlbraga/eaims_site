"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/auth";
import { getEmailDomainAuthorization } from "@/lib/auth/domains";
import { env } from "@/lib/env";

export type ActionState = { ok: boolean; message: string; kind?: "error" | "setup" };

function getRequestOrigin(headerStore: Headers) {
  const origin = headerStore.get("origin");
  if (origin) return origin;

  const referer = headerStore.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      // Fall through to host-based origin.
    }
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : env.NEXT_PUBLIC_APP_URL;
}

export async function requestOtpAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "E-mail invalido." };

  const validation = await validateOtpEmailAction(parsed.data);
  if (!validation.ok) return validation;

  const supabase = await createSupabaseServerClient();
  const headerStore = await headers();
  const appUrl = getRequestOrigin(headerStore);
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${appUrl}/auth/callback`
    }
  });
  if (error) return { ok: false, kind: "error", message: "Nao foi possivel enviar o link agora. Tente novamente em instantes." };
  redirect(`/login/verificar?email=${encodeURIComponent(parsed.data)}`);
}

export async function validateOtpEmailAction(email: string): Promise<ActionState> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "E-mail invalido." };

  const authorization = await getEmailDomainAuthorization(parsed.data).catch(() => null);
  if (!authorization?.configured) {
    return {
      ok: false,
      kind: "setup",
      message: "Nenhum dominio institucional autorizado foi configurado. Defina ALLOWED_EMAIL_DOMAINS e rode o bootstrap."
    };
  }
  if (!authorization.allowed) {
    return {
      ok: false,
      kind: "error",
      message: "Nao foi possivel enviar o link. Verifique se o e-mail pertence a um dominio autorizado."
    };
  }
  if (authorization.source === "environment") {
    return {
      ok: false,
      kind: "setup",
      message:
        "Dominio autorizado. Para enviar o link, configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY e SUPABASE_SERVICE_ROLE_KEY no .env.local; depois rode pnpm bootstrap."
    };
  }

  return { ok: true, message: "" };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getAllowedDomainCount() {
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase.from("allowed_email_domains").select("*", { count: "exact", head: true }).eq("is_active", true);
  return count ?? 0;
}
