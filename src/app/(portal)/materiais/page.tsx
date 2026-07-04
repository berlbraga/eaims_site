import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q, type } = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("lesson_materials")
    .select("id,title,description,material_type,lessons(title,modules(title))")
    .eq("is_published", true)
    .order("position");
  if (q) query = query.ilike("title", `%${q}%`);
  if (type) query = query.eq("material_type", type);
  const { data: materials } = await query;
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold">Materiais</h1>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <input name="q" defaultValue={q} placeholder="Buscar materiais" className="h-10 rounded-md border px-3 text-sm" />
          <select name="type" defaultValue={type} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="">Todos os tipos</option>
            <option value="pdf">PDF</option>
            <option value="link">Link</option>
            <option value="document">Documento</option>
            <option value="slide">Apresentacao</option>
          </select>
        </form>
      </div>
      {materials?.length ? (
        <div className="space-y-2">
          {materials.map((material) => {
            const lesson = Array.isArray(material.lessons) ? material.lessons[0] : material.lessons;
            return (
            <div key={material.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div className="flex items-start gap-3"><FileText className="mt-1 h-5 w-5 text-primary" /><div><p className="font-medium">{material.title}</p><p className="text-sm text-muted-foreground">{lesson?.title}</p></div></div>
              <Button asChild variant="outline"><a href={`/api/materials/${material.id}`} target="_blank" rel="noreferrer">Abrir</a></Button>
            </div>
            );
          })}
        </div>
      ) : <EmptyState title="Nenhum material encontrado" description="Materiais publicados das aulas aparecerao aqui." />}
    </div>
  );
}
