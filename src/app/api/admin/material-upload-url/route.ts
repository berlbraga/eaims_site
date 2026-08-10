import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type UploadUrlRequest = {
  lessonId?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
};

export async function POST(request: Request) {
  await requireAdminProfile();

  const body = (await request.json()) as UploadUrlRequest;
  const maxMaterialSizeMb = Number(process.env.NEXT_PUBLIC_MAX_MATERIAL_SIZE_MB ?? 25);
  const maxBytes = maxMaterialSizeMb * 1024 * 1024;

  if (!body.lessonId) {
    return NextResponse.json({ error: "Selecione uma aula antes de enviar o PDF." }, { status: 400 });
  }

  if (!body.fileName || body.mimeType !== "application/pdf") {
    return NextResponse.json({ error: "Selecione um arquivo PDF." }, { status: 400 });
  }

  if (!body.fileSize || body.fileSize > maxBytes) {
    return NextResponse.json({ error: `O PDF deve ter no maximo ${maxMaterialSizeMb} MB.` }, { status: 400 });
  }

  const storagePath = `lessons/${body.lessonId}/${Date.now()}-${safeStorageFileName(body.fileName)}`;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("lesson-materials").createSignedUploadUrl(storagePath);

  if (error || !data?.token) {
    return NextResponse.json({ error: "Nao foi possivel preparar o envio do PDF no Supabase Storage." }, { status: 500 });
  }

  return NextResponse.json({
    path: storagePath,
    token: data.token
  });
}

function safeStorageFileName(fileName: string) {
  const withoutPath = fileName.split(/[/\\]/).pop() ?? "material.pdf";
  const normalized = withoutPath
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.endsWith(".pdf") ? normalized : `${normalized || "material"}.pdf`;
}
