import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold">Pagina nao encontrada</h1>
      <p className="mt-3 text-muted-foreground">O conteudo pode ter sido movido, despublicado ou o endereco esta incorreto.</p>
      <Button asChild className="mt-6 w-fit"><Link href="/">Voltar ao inicio</Link></Button>
    </main>
  );
}
