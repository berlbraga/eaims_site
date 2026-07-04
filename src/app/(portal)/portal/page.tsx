import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireActiveProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateProgress } from "@/lib/validation/progress";

export default async function PortalHomePage() {
  const { user, profile } = await requireActiveProfile();
  const supabase = await createSupabaseServerClient();
  const { data: modules } = await supabase
    .from("modules")
    .select("id,title,slug,description,lessons(id)")
    .eq("is_published", true)
    .order("position");
  const { data: progress } = await supabase.from("lesson_progress").select("lesson_id,is_completed,lessons(title,slug,modules(slug))").eq("user_id", user.id).order("last_watched_at", { ascending: false }).limit(5);
  const totalLessons = modules?.reduce((sum, module) => sum + (module.lessons?.length ?? 0), 0) ?? 0;
  const completed = progress?.filter((item) => item.is_completed).length ?? 0;
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold">Ola, {profile.full_name || "bem-vindo(a)"}</h1>
        <p className="mt-2 text-muted-foreground">Continue seus estudos ou escolha um modulo publicado.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Progresso geral</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold text-primary">{calculateProgress(completed, totalLessons)}%</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Modulos disponiveis</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">{modules?.length ?? 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Aulas concluidas</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">{completed}</p></CardContent></Card>
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Modulos</h2>
          <Button asChild variant="outline" size="sm"><Link href="/modulos">Ver todos</Link></Button>
        </div>
        {modules?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {modules.slice(0, 4).map((module) => (
              <Card key={module.id}>
                <CardHeader><CardTitle>{module.title}</CardTitle></CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{module.description}</p>
                  <Button asChild className="mt-4" variant="outline"><Link href={`/modulos/${module.slug}`}>Acessar <ArrowRight className="h-4 w-4" /></Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : <EmptyState title="Sem modulos publicados" description="Novos conteudos aparecerao aqui quando forem publicados." />}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Aulas recentes</h2>
        {progress?.length ? (
          <div className="space-y-2">
            {progress.map((item) => {
              const recentLesson = Array.isArray(item.lessons) ? item.lessons[0] : item.lessons;
              return (
              <div key={item.lesson_id} className="flex items-center justify-between rounded-lg border p-3">
                <span>{recentLesson?.title ?? "Aula"}</span>
                {item.is_completed ? <Badge>Concluida</Badge> : <Badge>Em andamento</Badge>}
              </div>
              );
            })}
          </div>
        ) : <EmptyState title="Nenhuma aula acessada" description="Ao abrir uma aula, ela aparecera nesta lista." />}
      </section>
    </div>
  );
}
