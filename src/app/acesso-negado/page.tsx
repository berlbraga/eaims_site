import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4">
      <ShieldAlert className="mb-4 h-10 w-10 text-primary" aria-hidden />
      <h1 className="text-3xl font-bold">Acesso negado</h1>
      <p className="mt-3 text-muted-foreground">Esta area exige permissao de professor/administrador.</p>
      <Button asChild className="mt-6 w-fit"><Link href="/portal">Voltar ao portal</Link></Button>
    </main>
  );
}
