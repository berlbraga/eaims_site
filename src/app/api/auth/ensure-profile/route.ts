import { NextResponse } from "next/server";
import { ensureAuthorizedProfile } from "@/lib/auth/approval";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Sessao invalida." }, { status: 401 });
  }

  const profileResult = await ensureAuthorizedProfile(user);
  if (!profileResult.ok && profileResult.reason === "domain") {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Dominio nao autorizado." }, { status: 403 });
  }

  if (!profileResult.ok) {
    return NextResponse.json({ error: "Nao foi possivel preparar o perfil." }, { status: 500 });
  }

  if (!profileResult.profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Acesso pendente de aprovacao pelo administrador." }, { status: 423 });
  }

  return NextResponse.json({ ok: true });
}
