"use server";

import { revalidatePath } from "next/cache";
import { requireActiveProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { progressSchema } from "@/lib/validation/progress";

export async function saveProgressAction(formData: FormData) {
  const { user } = await requireActiveProfile();
  const parsed = progressSchema.parse({
    lesson_id: formData.get("lesson_id"),
    last_position_seconds: formData.get("last_position_seconds") ?? 0,
    is_completed: formData.get("is_completed") === "true"
  });
  const supabase = await createSupabaseServerClient();
  await supabase.from("lesson_progress").upsert({
    user_id: user.id,
    lesson_id: parsed.lesson_id,
    last_position_seconds: parsed.last_position_seconds,
    is_completed: parsed.is_completed,
    completed_at: parsed.is_completed ? new Date().toISOString() : null,
    last_watched_at: new Date().toISOString()
  });
  revalidatePath("/");
}
