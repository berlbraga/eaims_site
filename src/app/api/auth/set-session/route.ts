import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureAuthorizedProfile } from "@/lib/auth/approval";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
