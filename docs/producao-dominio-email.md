# Configuracao de producao: dominio, login e SMTP

Este guia registra a configuracao de producao do E-AIMS com o dominio `eaims.com.br`.

## 1. DNS no Registro.br

Quando a zona DNS terminar a transicao e ficar editavel, cadastre:

| Tipo | Nome | Dados |
| --- | --- | --- |
| A | vazio | `216.198.79.1` |
| CNAME | `www` | `a3fe05dc7fc884c3.vercel-dns-01.com` |
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

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
https://eaims.com.br/auth/confirm
https://www.eaims.com.br/auth/confirm
```

Mantenha a URL da Vercel como fallback enquanto o dominio novo ainda estiver propagando.

## 5. SMTP de producao e entregabilidade

Para evitar limites frequentes do envio padrao do Supabase, configure SMTP proprio com Resend ou outro provedor.

No Resend, verifique o dominio `eaims.com.br` e copie os registros DNS informados por ele para o Registro.br. Depois, no Supabase, acesse **Authentication > Emails > SMTP Settings** e configure:

```txt
Sender email: acesso@eaims.com.br
Sender name: E-AIMS
SMTP host: smtp.resend.com
SMTP port: 465
SMTP user: resend
SMTP password: chave API do Resend
```

Evite remetentes `no-reply@...`, porque eles tendem a ter pior entregabilidade e podem parecer menos confiaveis para filtros corporativos. Para links de acesso, prefira um remetente funcional e claro, como `acesso@eaims.com.br`.

No Resend, mantenha o dominio com SPF, DKIM e DMARC verificados. Para e-mails de autenticacao, desative **Open Tracking** e **Click Tracking** no dominio ou no envio, quando disponivel. Links reescritos por rastreamento podem aumentar a chance de classificacao como spam em ambientes corporativos.

O alerta **Include valid DMARC record** do Resend e resolvido com o registro TXT `_dmarc` acima. A politica `p=none` e segura para comecar, porque apenas monitora e declara a autenticacao do dominio sem bloquear mensagens.

No Supabase, em **Authentication > Emails > Templates**, use um assunto e corpo simples, institucional e sem linguagem promocional. Evite usar `{{ .ConfirmationURL }}` no corpo do e-mail, porque esse valor gera um link iniciado por `supabase.co`. Para melhorar a entregabilidade, use o dominio proprio do E-AIMS com `{{ .TokenHash }}`.

Assunto sugerido:

```txt
Seu link de acesso ao E-AIMS
```

Template HTML sugerido:

```html
<h2>Seu link de acesso ao E-AIMS</h2>

<p>Ola,</p>

<p>Use o link abaixo para acessar a plataforma E-AIMS:</p>

<p>
  <a href="https://eaims.com.br/auth/confirm?token_hash={{ .TokenHash }}&type=email">
    Acessar plataforma E-AIMS
  </a>
</p>

<p>Este link e individual, expira em poucos minutos e pode ser usado apenas uma vez.</p>

<p>Se voce nao solicitou este acesso, ignore este e-mail.</p>

<p>
  E-AIMS<br />
  Einstein Academic Initiative for Meta-analysis and Systematic Reviews
</p>
```

Template de texto simples sugerido:

```txt
Ola,

Use o link abaixo para acessar a plataforma E-AIMS:

https://eaims.com.br/auth/confirm?token_hash={{ .TokenHash }}&type=email

Este link e individual e expira em poucos minutos.

Se voce nao solicitou este acesso, ignore este e-mail.

E-AIMS
Einstein Academic Initiative for Meta-analysis and Systematic Reviews
```

Depois de salvar, teste um novo login usando um e-mail institucional autorizado. No Resend, confirme se o envio aparece como **Delivered** em ate 1 minuto. Se aparecer como entregue e ainda cair em spam, solicite ao time de TI institucional a liberacao de `acesso@eaims.com.br` e do dominio `eaims.com.br`.

