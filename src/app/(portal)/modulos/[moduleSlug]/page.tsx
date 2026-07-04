import Link from "next/link";
import { CheckCircle2, CirclePlay } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireActiveProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/utils/format";

export default async function ModuleDetailPage({ params }: { params: Promise<{ moduleSlug: string }> }) {
  const { moduleSlug } = await params;
  const { user } = await requireActiveProfile();
  const supabase = await createSupabaseServerClient();
  const { data: module } = await supabase.from("modules").select("id,title,slug,description").eq("slug", moduleSlug).eq("is_published", true).single();
  if (!module) notFound();
  const { data: lessons } = await supabase.from("lessons").select("id,title,slug,description,duration_seconds,position").eq("module_id", module.id).eq("is_published", true).order("position");
  const { data: progress } = await supabase.from("lesson_progress").select("lesson_id,is_completed").eq("user_id", user.id);
  const completed = new Set(progress?.filter((item) => item.is_completed).map((item) => item.lesson_id));
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <p className="text-sm text-muted-foreground"><Link href="/modulos">Modulos</Link> / {module.title}</p>
        <h1 className="mt-2 text-3xl font-bold">{module.title}</h1>
        <p className="mt-2 text-muted-foreground">{module.description}</p>
      </div>
      <div className="space-y-3">
        {lessons?.map((lesson) => (
          <Link key={lesson.id} href={`/modulos/${module.slug}/aulas/${lesson.slug}`}>
            <Card className="transition hover:bg-muted/40">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {completed.has(lesson.id) ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <CirclePlay className="h-5 w-5 text-muted-foreground" />}
                  <div><p className="font-medium">{lesson.title}</p><p className="text-sm text-muted-foreground">{formatDuration(lesson.duration_seconds)}</p></div>
                </div>
                {completed.has(lesson.id) ? <Badge>Concluida</Badge> : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
