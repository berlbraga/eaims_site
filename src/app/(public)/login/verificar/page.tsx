import { redirect } from "next/navigation";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { requestOtpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { emailSchema } from "@/lib/validation/auth";
import { maskEmail } from "@/lib/utils/format";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) redirect("/login");
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <section className="w-full max-w-md">
        <p className="mb-6 text-center text-3xl font-bold text-primary">E-AIMS</p>
        <Card>
          <CardHeader>
            <CardTitle>Confira seu e-mail</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de acesso para {maskEmail(parsed.data)}. Clique no link recebido para entrar no E-AIMS.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={async (formData) => {
                "use server";
                await requestOtpAction({ ok: false, message: "" }, formData);
              }}
            >
              <input type="hidden" name="email" value={parsed.data} />
              <Button className="w-full" variant="outline">
                <RefreshCw className="h-4 w-4" aria-hidden />
                Reenviar link de acesso
              </Button>
            </form>
            <Button asChild className="w-full" variant="ghost">
              <Link href="/login">Trocar e-mail</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
