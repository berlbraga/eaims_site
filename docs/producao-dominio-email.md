# Configuracao de producao: dominio, login e SMTP

Este guia registra a configuracao de producao do E-AIMS com o dominio `eaims.com.br`.

## 1. DNS no Registro.br

Quando a zona DNS terminar a transicao e ficar editavel, cadastre:

| Tipo | Nome | Dados |
| --- | --- | --- |
| A | vazio | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

No Registro.br, o dominio principal geralmente fica com o campo **Nome** vazio. Nao use `@`, porque o painel pode rejeitar esse caractere.

## 2. Dominio na Vercel

O projeto deve manter estes dominios em **Project Settings > Domains**:

- `eaims.com.br`
- `www.eaims.com.br`
- `eaims-gules.vercel.app` como fallback temporario

Depois que o DNS propagar, a Vercel deve mostrar os dominios como validos.

## 3. Variaveis de ambiente na Vercel

Em **Project Settings > Environment Variables**, confirme:

```env
NEXT_PUBLIC_APP_URL=https://eaims.com.br
NEXT_PUBLIC_SUPABASE_URL=https://fqugaewjnqucubheoyzn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ALLOWED_EMAIL_DOMAINS=einstein.edu.br,einstein.br
ADMIN_EMAILS=bernardo.baraujo@einstein.edu.br
```

O formulario de login tambem usa o dominio atual do navegador para montar o callback do link magico. Assim, quando o aluno acessar `https://eaims.com.br/login`, o link enviado deve voltar para `https://eaims.com.br/auth/callback`.

## 4. URLs de autenticacao no Supabase

No Supabase, acesse **Authentication > URL Configuration** e configure:

**Site URL**

```txt
https://eaims.com.br
```

**Redirect URLs**

```txt
https://eaims.com.br/auth/callback
https://www.eaims.com.br/auth/callback
https://eaims-gules.vercel.app/auth/callback
```

Mantenha a URL da Vercel como fallback enquanto o dominio novo ainda estiver propagando.

## 5. SMTP de producao

Para evitar limites frequentes do envio padrao do Supabase, configure SMTP proprio com Resend ou outro provedor.

No Resend, verifique o dominio `eaims.com.br` e copie os registros DNS informados por ele para o Registro.br. Depois, no Supabase, acesse **Authentication > Emails > SMTP Settings** e configure:

```txt
Sender email: no-reply@eaims.com.br
Sender name: E-AIMS
SMTP host: smtp.resend.com
SMTP port: 465
SMTP user: resend
SMTP password: chave API do Resend
```

Depois de salvar, teste um novo login usando um e-mail institucional autorizado.
