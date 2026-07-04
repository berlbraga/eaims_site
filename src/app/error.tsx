"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4">
      <h1 className="text-3xl font-bold">Algo saiu do esperado</h1>
      <p className="mt-3 text-muted-foreground">Nao exibimos detalhes tecnicos aqui. Tente novamente ou volte ao inicio.</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button asChild variant="outline"><Link href="/portal">Voltar</Link></Button>
      </div>
    </main>
  );
}
