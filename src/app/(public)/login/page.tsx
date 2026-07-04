import Link from "next/link";
import { EmailForm } from "@/components/auth/email-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const loginErrors: Record<string, string> = {
  dominio: "Este e-mail não pertence a um domínio institucional autorizado.",
  link: "O link de acesso está inválido, expirado ou já foi utilizado. Solicite um novo link nesta página.",
  sessao: "Não foi possível criar sua sessão. Solicite um novo link de acesso."
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const errorMessage = erro ? loginErrors[erro] : null;

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold text-primary">E-AIMS</p>
          <h1 className="mt-4 text-2xl font-semibold">Acessar com e-mail institucional</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Portal educacional para videoaulas, materiais e acompanhamento de progresso.
          </p>
        </div>
        <Card>
          <CardHeader><CardTitle>Receba seu link de acesso</CardTitle></CardHeader>
          <CardContent>
            {errorMessage ? (
              <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                {errorMessage}
              </div>
            ) : null}
            <EmailForm />
            <p className="mt-4 text-xs text-muted-foreground">
              O acesso é destinado a usuários com e-mail de domínio institucional autorizado. Esta verificação comprova somente acesso à caixa de e-mail.
            </p>
            <Link className="mt-4 block text-sm text-primary hover:underline" href="/privacidade">Política de privacidade</Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
