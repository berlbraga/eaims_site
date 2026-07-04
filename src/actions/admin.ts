"use server";

import { revalidatePath } from "next/cache";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { contentSlug, lessonSchema, materialSchema, moduleSchema, userUpdateSchema } from "@/lib/validation/content";
import { canModifyAdminStatus } from "@/lib/permissions/roles";

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

export async function upsertMaterialAction(formData: FormData) {
  await requireAdminProfile();
  const id = formData.get("id")?.toString();
  const parsed = materialSchema.parse(Object.fromEntries(formData));
  const supabase = await createSupabaseServerClient();
  if (id) await supabase.from("lesson_materials").update(parsed).eq("id", id);
  else await supabase.from("lesson_materials").insert(parsed);
  revalidatePath("/admin/aulas");
}

export async function updateUserAction(formData: FormData) {
  await requireAdminProfile();
  const parsed = userUpdateSchema.parse({
    user_id: formData.get("user_id"),
    role: formData.get("role") || undefined,
    is_active: formData.get("is_active") === null ? undefined : formData.get("is_active") === "true",
    full_name: formData.get("full_name") || undefined
  });
  const supabase = await createSupabaseServerClient();
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
  await supabase.from("profiles").update(parsed).eq("id", parsed.user_id);
  revalidatePath("/admin/usuarios");
}
