import { updateUserAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("profiles").select("id,email,full_name,role,is_active,last_access_at").order("created_at", { ascending: false }).limit(50);
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  const { data: users } = await query;
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Usuarios</h1><p className="text-muted-foreground">Gerencie status e permissao de alunos e administradores.</p></div>
      <form><Input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail" /></form>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted text-left"><tr><th className="p-3">Usuario</th><th className="p-3">Papel</th><th className="p-3">Status</th><th className="p-3">Acoes</th></tr></thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3"><p className="font-medium">{user.full_name || "Sem nome"}</p><p className="text-muted-foreground">{user.email}</p></td>
                <td className="p-3"><Badge>{user.role === "admin" ? "Admin" : "Aluno"}</Badge></td>
                <td className="p-3"><Badge>{user.is_active ? "Ativo" : "Inativo"}</Badge></td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <form action={updateUserAction}><input type="hidden" name="user_id" value={user.id} /><input type="hidden" name="role" value={user.role === "admin" ? "student" : "admin"} /><Button size="sm" variant="outline">{user.role === "admin" ? "Rebaixar" : "Promover"}</Button></form>
                    <form action={updateUserAction}><input type="hidden" name="user_id" value={user.id} /><input type="hidden" name="is_active" value={user.is_active ? "false" : "true"} /><Button size="sm" variant="outline">{user.is_active ? "Desativar" : "Ativar"}</Button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
