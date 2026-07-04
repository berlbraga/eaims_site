import { deleteModuleAction } from "@/actions/admin";
import { ModuleForm } from "@/components/admin/forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminModulesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: modules } = await supabase.from("modules").select("id,title,slug,description,position,is_published,lessons(id)").order("position");
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Modulos</h1><p className="text-muted-foreground">Crie, publique e organize modulos.</p></div>
      <ModuleForm />
      <div className="space-y-3">
        {modules?.map((module) => (
          <Card key={module.id}>
            <CardHeader><CardTitle className="flex items-center justify-between">{module.title}<Badge>{module.is_published ? "Publicado" : "Rascunho"}</Badge></CardTitle></CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{module.lessons?.length ?? 0} aulas · posicao {module.position}</p>
              <form action={deleteModuleAction}>
                <input type="hidden" name="id" value={module.id} />
                <Button variant="destructive" size="sm">Excluir</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
