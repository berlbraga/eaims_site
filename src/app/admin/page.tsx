import Link from "next/link";
import { BookOpen, FileVideo, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const [{ count: students }, { count: modules }, { count: lessons }, { count: drafts }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("is_active", true),
    supabase.from("modules").select("*", { count: "exact", head: true }),
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", false)
  ]);
  const cards = [
    ["Alunos ativos", students ?? 0, Users],
    ["Modulos", modules ?? 0, BookOpen],
    ["Aulas", lessons ?? 0, FileVideo],
    ["Rascunhos", drafts ?? 0, FileVideo]
  ] as const;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Administracao</h1><p className="text-muted-foreground">Operacao do portal E-AIMS.</p></div>
        <div className="flex gap-2">
          <Button asChild><Link href="/admin/modulos">Criar modulo</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/aulas">Criar aula</Link></Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <Card key={label}><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4" />{label}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{value}</p></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
