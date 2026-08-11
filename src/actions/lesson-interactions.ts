"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ratingSchema = z.object({
  lesson_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  feedback: z
    .string()
    .trim()
    .max(2000, "O feedback deve ter no maximo 2000 caracteres.")
    .optional()
    .nullable(),
  path: z.string().startsWith("/").optional()
});

const discussionSchema = z.object({
  lesson_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
  body: z.string().trim().min(3, "Escreva ao menos 3 caracteres.").max(2000, "A mensagem deve ter no maximo 2000 caracteres."),
  path: z.string().startsWith("/").optional()
});

export async function saveLessonRatingAction(formData: FormData) {
  const { user } = await requireActiveProfile();
  const parsed = ratingSchema.parse({
    lesson_id: formData.get("lesson_id"),
    rating: formData.get("rating"),
    feedback: formData.get("feedback") || null,
    path: formData.get("path") || undefined
  });
  const supabase = await createSupabaseServerClient();
  await supabase.from("lesson_ratings").upsert(
    {
      lesson_id: parsed.lesson_id,
      user_id: user.id,
      rating: parsed.rating,
      feedback: parsed.feedback || null
    },
    { onConflict: "lesson_id,user_id" }
  );
  revalidatePath(parsed.path ?? "/portal");
}

export async function createLessonDiscussionAction(formData: FormData) {
  const { user } = await requireActiveProfile();
  const parsed = discussionSchema.parse({
    lesson_id: formData.get("lesson_id"),
    parent_id: formData.get("parent_id") || null,
    body: formData.get("body"),
    path: formData.get("path") || undefined
  });
  const supabase = await createSupabaseServerClient();
  await supabase.from("lesson_discussions").insert({
    lesson_id: parsed.lesson_id,
    user_id: user.id,
    parent_id: parsed.parent_id || null,
    body: parsed.body
  });
  revalidatePath(parsed.path ?? "/portal");
}
