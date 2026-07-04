import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ materialId: string }> }) {
  await requireActiveProfile();
  const { materialId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: material } = await supabase
    .from("lesson_materials")
    .select("storage_path, external_url, is_published")
    .eq("id", materialId)
    .single();
  if (!material?.is_published) return NextResponse.json({ error: "Material indisponivel." }, { status: 404 });
  if (material.external_url) return NextResponse.redirect(material.external_url);
  if (!material.storage_path) return NextResponse.json({ error: "Arquivo nao configurado." }, { status: 422 });
  const { data, error } = await supabase.storage.from("lesson-materials").createSignedUrl(material.storage_path, 60 * 5);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Nao foi possivel gerar acesso temporario." }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
