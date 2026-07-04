import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCloudflareStreamAccess } from "@/lib/cloudflare/stream";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  await requireActiveProfile();
  const { lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, video_uid, external_video_url, video_provider, is_published")
    .eq("id", lessonId)
    .single();
  if (!lesson?.is_published) return NextResponse.json({ error: "Aula indisponivel." }, { status: 404 });
  if (lesson.video_provider === "external" && lesson.external_video_url) {
    return NextResponse.json({ iframeUrl: lesson.external_video_url, mode: "external" });
  }
  if (!lesson.video_uid) return NextResponse.json({ error: "Video nao configurado." }, { status: 422 });
  const access = await getCloudflareStreamAccess(lesson.video_uid);
  return NextResponse.json(access);
}
