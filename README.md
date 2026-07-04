# E-AIMS Portal

Portal educacional do E-AIMS, o Einstein Academic Initiative for Meta-analysis and Systematic Reviews. O projeto combina uma página pública institucional com uma plataforma autenticada para videoaulas, módulos, apostilas, materiais e acompanhamento de progresso.

## Visão geral

Alunos acessam videoaulas e materiais por link mágico enviado ao e-mail institucional autorizado. Professores e administradores usam o papel `admin`.

Não há SSO, SAML, Microsoft/Google login, senha institucional nem integração interna com Einstein. O sistema valida apenas acesso a uma caixa de e-mail de domínio permitido.

## Funcionalidades

- Página pública institucional do E-AIMS.
- Login por e-mail institucional autorizado.
- Portal autenticado para módulos, aulas e materiais.
- Área administrativa para gerenciar usuários, módulos e aulas.
- Controle de domínios autorizados via Supabase.
- Materiais protegidos por URLs assinadas.
- Suporte a Cloudflare Stream para videoaulas.

## Requisitos

- Node.js 20+
- Projeto Supabase com Auth, Postgres e Storage
- Projeto Cloudflare Stream, opcional para videos privados assinados
- Vercel para deploy

## Instalação

```bash
pnpm install
cp .env.example .env.local
```

Preencha as variáveis públicas do Supabase e rode:

```bash
pnpm dev
```

## Supabase

Execute `supabase/migrations/202607010001_initial_schema.sql` no Supabase CLI ou SQL Editor. A migration cria tabelas, enums, triggers, RLS e o bucket privado `lesson-materials`.

Configure o Auth para OTP por e-mail. Em produção, configure SMTP próprio no painel do Supabase para confiabilidade de entrega.

## Auth Hook

No painel Supabase, ative o Before User Created Hook apontando para a funcao SQL:

```sql
public.before_user_created_hook
```

Ela bloqueia usuários cujo domínio não esteja em `allowed_email_domains`.

## Domínios e primeiro admin

Configure no `.env.local`:

```env
ALLOWED_EMAIL_DOMAINS=einstein.edu.br,einstein.br
ADMIN_EMAILS=professor@einstein.edu.br
```

Depois rode:

```bash
pnpm bootstrap
```

Sem domínios configurados, novos cadastros ficam negados.

## Storage

Use o bucket privado `lesson-materials`. Administradores podem enviar/excluir; alunos autenticados e ativos recebem URL assinada de curta duração pela rota `/api/materials/[materialId]`.

## Cloudflare Stream

Modo basico: informe `video_uid` publico da aula. O portal renderiza o iframe do Stream.

Modo seguro: configure `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_STREAM_API_TOKEN` para gerar token temporario no servidor, ou `CLOUDFLARE_STREAM_SIGNING_KEY_ID` e `CLOUDFLARE_STREAM_SIGNING_KEY` para token assinado via chave privada. Chaves nunca vao ao navegador.

## Variáveis de ambiente

Veja `.env.example`. Variáveis `NEXT_PUBLIC_*` podem ir ao cliente. `SUPABASE_SERVICE_ROLE_KEY` e credenciais Cloudflare são exclusivas do servidor.

Nunca versionar `.env.local`.

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm bootstrap
pnpm seed:demo
```

## Deploy na Vercel

1. Configure o projeto e as variaveis de ambiente.
2. Execute migrations no Supabase.
3. Rode `pnpm bootstrap` com dominios e admins.
4. Configure OTP/SMTP/Auth Hook no Supabase.
5. Configure Cloudflare Stream conforme o modo desejado.
6. Publique na Vercel.

## Problemas comuns

- "Supabase público não configurado": preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- OTP não chega: configure SMTP de produção no Supabase.
- Domínio autorizado bloqueado: rode `pnpm bootstrap` e confirme domínio sem `@`.
- Vídeo privado não abre: confira token/API/chave do Cloudflare Stream.
