import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ModulesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("modules").select("id,title,slug,description,cover_image_url,lessons(id)").eq("is_published", true).order("position");
  if (q) query = query.ilike("title", `%${q}%`);
  const { data: modules } = await query;
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold">Modulos</h1>
        <form className="mt-4"><input name="q" defaultValue={q} placeholder="Buscar modulos" className="h-10 w-full rounded-md border px-3 text-sm" /></form>
      </div>
      {modules?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader><CardTitle>{module.title}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{module.description}</p>
                <p className="mt-3 text-sm">{module.lessons?.length ?? 0} aulas</p>
                <Button asChild className="mt-4"><Link href={`/modulos/${module.slug}`}>Acessar modulo</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="Nenhum modulo encontrado" description="Tente ajustar a busca ou aguarde novos conteudos." />}
    </div>
  );
}
