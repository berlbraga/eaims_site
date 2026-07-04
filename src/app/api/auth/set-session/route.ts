import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { emailDomain } from "@/lib/validation/auth";

const sessionSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = sessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Link invalido." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error: sessionError } = await supabase.auth.setSession(parsed.data);
  if (sessionError) {
    return NextResponse.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const normalizedEmail = user.email.toLowerCase();
  const adminSupabase = createSupabaseAdminClient();
  const { data: allowed } = await adminSupabase
    .from("allowed_email_domains")
    .select("id")
    .eq("domain", emailDomain(normalizedEmail))
    .eq("is_active", true)
    .maybeSingle();

  if (!allowed) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Dominio nao autorizado." }, { status: 403 });
  }

  const { error: profileError } = await adminSupabase.from("profiles").upsert(
    {
      id: user.id,
      email: normalizedEmail,
      is_active: true
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return NextResponse.json({ error: "Nao foi possivel preparar o perfil." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
