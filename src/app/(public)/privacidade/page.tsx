export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-2xl font-bold text-primary">E-AIMS</p>
      <h1 className="mt-6 text-3xl font-bold">Politica de privacidade do MVP</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>Este texto e informativo para o MVP e nao substitui uma revisao juridica definitiva.</p>
        <p>O portal armazena apenas dados necessarios ao funcionamento: e-mail, nome quando informado, papel de acesso, status da conta e progresso academico nas aulas.</p>
        <p>O acesso e feito por link temporario enviado ao e-mail institucional autorizado. O portal nao armazena senha institucional e nao utiliza SSO.</p>
        <p>Materiais e progresso sao usados para entregar aulas, organizar conteudos e permitir administracao pedagogica do portal.</p>
      </div>
    </main>
  );
}
