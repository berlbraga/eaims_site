import { Activity, CheckCircle2, Clock3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Student = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  last_access_at: string | null;
};

type LessonProgress = {
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  last_watched_at: string | null;
  completed_at: string | null;
};

type ModuleWithLessons = {
  id: string;
  title: string;
  position: number;
  lessons?: Array<{
    id: string;
    title: string;
    position: number;
    is_published: boolean;
  }> | null;
};

export default async function AdminProgressPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminProfile();
  const { q } = await searchParams;
  const supabase = createSupabaseAdminClient();

  const [studentsResult, modulesResult, progressResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,full_name,is_active,last_access_at")
      .eq("role", "student")
      .order("full_name", { ascending: true, nullsFirst: false }),
    supabase
      .from("modules")
      .select("id,title,position,lessons(id,title,position,is_published)")
      .eq("is_published", true)
      .order("position"),
    supabase.from("lesson_progress").select("user_id,lesson_id,is_completed,last_watched_at,completed_at")
  ]);

  const students = (studentsResult.data ?? []) as Student[];
  const modules = (modulesResult.data ?? []) as ModuleWithLessons[];
  const progress = (progressResult.data ?? []) as LessonProgress[];
  const publishedLessons = modules.flatMap((module) => (module.lessons ?? []).filter((lesson) => lesson.is_published));
  const publishedLessonIds = new Set(publishedLessons.map((lesson) => lesson.id));
  const totalLessons = publishedLessons.length;

  const progressByUser = progress.reduce((map, item) => {
    if (!publishedLessonIds.has(item.lesson_id)) return map;
    const userProgress = map.get(item.user_id) ?? [];
    userProgress.push(item);
    map.set(item.user_id, userProgress);
    return map;
  }, new Map<string, LessonProgress[]>());

  const normalizedQuery = q?.trim().toLowerCase();
  const rows = students
    .filter((student) => {
      if (!normalizedQuery) return true;
      return `${student.full_name ?? ""} ${student.email}`.toLowerCase().includes(normalizedQuery);
    })
    .map((student) => {
      const userProgress = progressByUser.get(student.id) ?? [];
      const completed = new Set(userProgress.filter((item) => item.is_completed).map((item) => item.lesson_id)).size;
      const started = new Set(userProgress.map((item) => item.lesson_id)).size;
      const percent = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
      const lastActivity = latestDate(userProgress.flatMap((item) => [item.last_watched_at, item.completed_at]));
      return {
        ...student,
        completed,
        started,
        percent,
        lastActivity
      };
    })
    .sort((a, b) => b.percent - a.percent || (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0));

  const activeStudents = rows.filter((row) => row.is_active).length;
  const startedStudents = rows.filter((row) => row.started > 0).length;
  const completedStudents = rows.filter((row) => totalLessons > 0 && row.completed === totalLessons).length;
  const averageProgress = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.percent, 0) / rows.length) : 0;
  const cards = [
    { label: "Alunos ativos", value: activeStudents, icon: Users },
    { label: "Progresso medio", value: `${averageProgress}%`, icon: Activity },
    { label: "Iniciaram aulas", value: startedStudents, icon: Clock3 },
    { label: "Concluiram tudo", value: completedStudents, icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progresso dos alunos</h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe a porcentagem de aulas publicadas concluídas por cada aluno.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base da métrica</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          O cálculo considera {totalLessons} {totalLessons === 1 ? "aula publicada" : "aulas publicadas"} em módulos
          publicados. Aulas em rascunho não entram no denominador.
        </CardContent>
      </Card>

      <form>
        <Input name="q" defaultValue={q} placeholder="Buscar aluno por nome ou e-mail" />
      </form>

      {rows.length ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3">Aluno</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progresso</th>
                <th className="p-3">Aulas</th>
                <th className="p-3">Última atividade</th>
                <th className="p-3">Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{row.full_name || "Sem nome"}</p>
                    <p className="text-muted-foreground">{row.email}</p>
                  </td>
                  <td className="p-3">
                    <Badge>{row.is_active ? "Ativo" : "Inativo"}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex min-w-48 items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${row.percent}%` }} />
                      </div>
                      <span className="w-10 text-right font-semibold">{row.percent}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {row.completed}/{totalLessons} concluídas
                    {row.started > row.completed ? <p className="text-xs text-muted-foreground">{row.started - row.completed} em andamento</p> : null}
                  </td>
                  <td className="p-3">{formatDate(row.lastActivity)}</td>
                  <td className="p-3">{formatDate(row.last_access_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Nenhum aluno encontrado" description="Quando alunos acessarem a plataforma, eles aparecerão neste painel." />
      )}
    </div>
  );
}

function latestDate(values: Array<string | null>) {
  const dates = values.filter(Boolean).map((value) => new Date(value as string));
  if (!dates.length) return null;
  return dates.reduce((latest, date) => (date > latest ? date : latest), dates[0]);
}

function formatDate(value: string | Date | null) {
  if (!value) return "Sem registro";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
