import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { requireAdminProfile } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type RatingRow = {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
  lessons?: {
    title: string;
    modules?: {
      title: string;
    } | null;
  } | null;
  profiles?: {
    full_name: string | null;
    email: string;
  } | null;
};

export default async function AdminRatingsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminProfile();
  const { q } = await searchParams;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("lesson_ratings")
    .select("id,rating,feedback,created_at,lessons(title,modules(title)),profiles(full_name,email)")
    .order("created_at", { ascending: false });
  const normalizedQuery = q?.trim().toLowerCase();
  const normalizedRatings = (data ?? []).map((item) => ({
    ...item,
    lessons: Array.isArray(item.lessons)
      ? {
          ...item.lessons[0],
          modules: Array.isArray(item.lessons[0]?.modules) ? item.lessons[0]?.modules[0] : item.lessons[0]?.modules
        }
      : item.lessons,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
  })) as RatingRow[];
  const ratings = normalizedRatings.filter((item) => {
    if (!normalizedQuery) return true;
    return `${item.lessons?.title ?? ""} ${item.lessons?.modules?.title ?? ""} ${item.profiles?.full_name ?? ""} ${item.profiles?.email ?? ""}`
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const average = ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : null;
  const withFeedback = ratings.filter((item) => item.feedback?.trim()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Avaliacoes das aulas</h1>
        <p className="mt-2 text-muted-foreground">Veja as notas e feedbacks privados enviados pelos alunos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Media filtrada</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{average ? average.toFixed(1) : "-"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Avaliacoes</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{ratings.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Feedbacks escritos</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{withFeedback}</p></CardContent>
        </Card>
      </div>

      <form>
        <Input name="q" defaultValue={q} placeholder="Buscar por aula, modulo, aluno ou e-mail" />
      </form>

      {ratings.length ? (
        <div className="space-y-3">
          {ratings.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.lessons?.title ?? "Aula"}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{item.lessons?.modules?.title ?? "Modulo"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`h-5 w-5 ${index < item.rating ? "fill-primary" : ""}`} aria-hidden />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-foreground">{item.rating}/5</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {item.profiles?.full_name || "Sem nome"} · {item.profiles?.email ?? "Sem e-mail"} · {formatDate(item.created_at)}
                </p>
                {item.feedback ? (
                  <p className="whitespace-pre-line rounded-lg bg-muted p-3 text-sm leading-6">{item.feedback}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem feedback escrito.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhuma avaliacao encontrada" description="As avaliacoes enviadas pelos alunos aparecerao aqui." />
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
