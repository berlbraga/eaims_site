import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { emailDomain } from "@/lib/validation/auth";

export async function POST() {
  const supabase = await createSupabaseServerClient();
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

  const { error } = await adminSupabase.from("profiles").upsert(
    {
      id: user.id,
      email: normalizedEmail,
      is_active: true
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: "Nao foi possivel preparar o perfil." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
