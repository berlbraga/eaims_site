import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/lessons/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LessonPage({ params }: { params: Promise<{ moduleSlug: string; lessonSlug: string }> }) {
  const { moduleSlug, lessonSlug } = await params;
  const { user } = await requireActiveProfile();
  const supabase = await createSupabaseServerClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id,title,slug,description,position,modules(id,title,slug),lesson_materials(id,title,description,material_type,is_published)")
    .eq("slug", lessonSlug)
    .eq("is_published", true)
    .eq("modules.slug", moduleSlug)
    .single();
  if (!lesson) notFound();
  const parentModule = Array.isArray(lesson.modules) ? lesson.modules[0] : lesson.modules;
  const { data: progress } = await supabase.from("lesson_progress").select("last_position_seconds,is_completed").eq("user_id", user.id).eq("lesson_id", lesson.id).maybeSingle();
  const materials = (lesson.lesson_materials ?? []).filter((material) => material.is_published);
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <p className="text-sm text-muted-foreground"><Link href="/modulos">Modulos</Link> / <Link href={`/modulos/${parentModule?.slug}`}>{parentModule?.title}</Link> / {lesson.title}</p>
      <div>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="mt-2 text-muted-foreground">{lesson.description}</p>
      </div>
      <VideoPlayer lessonId={lesson.id} title={lesson.title} initialPosition={progress?.last_position_seconds ?? 0} completed={progress?.is_completed ?? false} />
      <Card>
        <CardHeader><CardTitle>Materiais complementares</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {materials.length ? materials.map((material) => (
            <Button key={material.id} asChild variant="outline" className="justify-start">
              <a href={`/api/materials/${material.id}`} target="_blank" rel="noreferrer">{material.title}</a>
            </Button>
          )) : <p className="text-sm text-muted-foreground">Nenhum material publicado para esta aula.</p>}
        </CardContent>
      </Card>
      <Button asChild variant="outline"><Link href={`/modulos/${parentModule?.slug}`}>Retornar ao modulo</Link></Button>
    </div>
  );
}
