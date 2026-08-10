import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { materialSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdminProfile();

  const body = await request.json();
  const parsed = materialSchema.safeParse({
    lesson_id: body.lesson_id,
    title: body.title,
    description: body.description || undefined,
    material_type: body.material_type,
    storage_path: body.storage_path || undefined,
    external_url: body.external_url || undefined,
    file_name: body.file_name || undefined,
    mime_type: body.mime_type || undefined,
    file_size: body.file_size || undefined,
    position: body.position || 0,
    is_published: body.is_published === true
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revise os dados do material e tente novamente." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("lesson_materials").insert(parsed.data);

  if (error) {
    return NextResponse.json({ error: "Nao foi possivel salvar o material no banco de dados." }, { status: 500 });
  }

  revalidatePath("/admin/aulas");
  return NextResponse.json({ ok: true });
}
