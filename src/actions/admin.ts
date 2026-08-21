"use server";

import { revalidatePath } from "next/cache";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { contentSlug, lessonSchema, materialSchema, moduleSchema, userUpdateSchema } from "@/lib/validation/content";
import { canModifyAdminStatus } from "@/lib/permissions/roles";

export type MaterialActionState = {
  ok: boolean;
  message: string;
};

type MaterialUploadUrlInput = {
  lessonId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export type MaterialUploadUrlState =
  | {
      ok: true;
      path: string;
      token: string;
    }
  | {
      ok: false;
      message: string;
    };

export async function upsertModuleAction(formData: FormData) {
  const { user } = await requireAdminProfile();
  const id = formData.get("id")?.toString();
  const parsed = moduleSchema.parse(Object.fromEntries(formData));
  const supabase = await createSupabaseServerClient();
  const payload = {
    ...parsed,
    slug: contentSlug(parsed),
    cover_image_url: parsed.cover_image_url || null,
    updated_by: user.id,
    ...(id ? {} : { created_by: user.id })
  };
  if (id) await supabase.from("modules").update(payload).eq("id", id);
  else await supabase.from("modules").insert(payload);
  revalidatePath("/admin/modulos");
  revalidatePath("/modulos");
}

export async function deleteModuleAction(formData: FormData) {
  await requireAdminProfile();
  const supabase = await createSupabaseServerClient();
  await supabase.from("modules").delete().eq("id", formData.get("id"));
  revalidatePath("/admin/modulos");
}

export async function upsertLessonAction(formData: FormData) {
  const { user } = await requireAdminProfile();
  const id = formData.get("id")?.toString();
  const parsed = lessonSchema.parse(Object.fromEntries(formData));
  const supabase = await createSupabaseServerClient();
  const payload = {
    ...parsed,
    slug: contentSlug(parsed),
    video_uid: parsed.video_uid || null,
    external_video_url: parsed.external_video_url || null,
    updated_by: user.id,
    ...(id ? {} : { created_by: user.id })
  };
  if (id) await supabase.from("lessons").update(payload).eq("id", id);
  else await supabase.from("lessons").insert(payload);
  revalidatePath("/admin/aulas");
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdminProfile();
  const supabase = await createSupabaseServerClient();
  await supabase.from("lessons").delete().eq("id", formData.get("id"));
  revalidatePath("/admin/aulas");
}

export async function createMaterialUploadUrlAction(input: MaterialUploadUrlInput): Promise<MaterialUploadUrlState> {
  await requireAdminProfile();

  const maxMaterialSizeMb = Number(process.env.NEXT_PUBLIC_MAX_MATERIAL_SIZE_MB ?? 25);
  const maxBytes = maxMaterialSizeMb * 1024 * 1024;

  if (!input.lessonId) {
    return { ok: false, message: "Selecione uma aula antes de enviar o PDF." };
  }

  if (input.mimeType !== "application/pdf") {
    return { ok: false, message: "Selecione um arquivo PDF." };
  }

  if (input.fileSize > maxBytes) {
    return { ok: false, message: `O PDF deve ter no maximo ${maxMaterialSizeMb} MB.` };
  }

  const storagePath = `lessons/${input.lessonId}/${Date.now()}-${safeStorageFileName(input.fileName)}`;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("lesson-materials").createSignedUploadUrl(storagePath);

  if (error || !data?.token) {
    return {
      ok: false,
      message: "Nao foi possivel preparar o envio do PDF no Supabase Storage."
    };
  }

  return {
    ok: true,
    path: storagePath,
    token: data.token
  };
}

export async function upsertMaterialAction(_: MaterialActionState, formData: FormData): Promise<MaterialActionState> {
  await requireAdminProfile();
  const id = formData.get("id")?.toString();
  const rawMaterial = {
    lesson_id: formData.get("lesson_id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    material_type: formData.get("material_type"),
    storage_path: formData.get("storage_path") || undefined,
    external_url: formData.get("external_url") || undefined,
    file_name: formData.get("file_name") || undefined,
    mime_type: formData.get("mime_type") || undefined,
    file_size: formData.get("file_size") || undefined,
    position: formData.get("position") || 0,
    is_published: formData.get("is_published") === "true"
  };

  const parsed = materialSchema.safeParse(rawMaterial);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      ok: false,
      message: firstIssue?.message ?? "Revise os dados do material e tente novamente."
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("lesson_materials").update(parsed.data).eq("id", id)
    : await supabase.from("lesson_materials").insert(parsed.data);

  if (error) {
    return {
      ok: false,
      message: "Nao foi possivel salvar o material. Verifique as permissoes do Supabase e tente novamente."
    };
  }

  revalidatePath("/admin/aulas");
  return {
    ok: true,
    message: "Material salvo com sucesso."
  };
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

export async function updateUserAction(formData: FormData) {
  await requireAdminProfile();
  const parsed = userUpdateSchema.parse({
    user_id: formData.get("user_id"),
    role: formData.get("role") || undefined,
    is_active: formData.get("is_active") === null ? undefined : formData.get("is_active") === "true",
    full_name: formData.get("full_name") || undefined
  });
  const { user_id, ...updates } = parsed;
  const supabase = createSupabaseAdminClient();
  const { data: target } = await supabase.from("profiles").select("role,is_active").eq("id", parsed.user_id).single();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("is_active", true);
  if (
    target &&
    !canModifyAdminStatus({
      targetRole: target.role,
      targetIsActive: target.is_active,
      nextRole: parsed.role,
      nextIsActive: parsed.is_active,
      activeAdminCount: count ?? 0
    })
  ) {
    throw new Error("Nao e permitido alterar o ultimo administrador ativo.");
  }
  const { error } = await supabase.from("profiles").update(updates).eq("id", user_id);
  if (error) {
    throw new Error(`Nao foi possivel atualizar o usuario: ${error.message}`);
  }
  revalidatePath("/admin/usuarios");
}
