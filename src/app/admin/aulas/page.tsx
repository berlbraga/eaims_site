import { deleteLessonAction } from "@/actions/admin";
import { LessonForm, MaterialForm } from "@/components/admin/forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLessonsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: modules } = await supabase.from("modules").select("id,title").order("position");
  const { data: lessons } = await supabase.from("lessons").select("id,title,slug,position,is_published,modules(title,slug)").order("position");
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Aulas e materiais</h1><p className="text-muted-foreground">Cadastre videos externos e recursos complementares.</p></div>
      <LessonForm modules={modules ?? []} />
      <MaterialForm lessons={lessons ?? []} />
      <div className="space-y-3">
        {lessons?.map((lesson) => {
          const parentModule = Array.isArray(lesson.modules) ? lesson.modules[0] : lesson.modules;
          return (
          <Card key={lesson.id}>
            <CardHeader><CardTitle className="flex items-center justify-between">{lesson.title}<Badge>{lesson.is_published ? "Publicada" : "Rascunho"}</Badge></CardTitle></CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{parentModule?.title} · posicao {lesson.position}</p>
              <div className="flex gap-2">
                {lesson.is_published ? <Button asChild variant="outline" size="sm"><a href={`/modulos/${parentModule?.slug}/aulas/${lesson.slug}`}>Ver como aluno</a></Button> : null}
                <form action={deleteLessonAction}><input type="hidden" name="id" value={lesson.id} /><Button variant="destructive" size="sm">Excluir</Button></form>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  );
}
