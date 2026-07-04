# Authentication

Authentication is passwordless OTP by e-mail.

## Flow

1. User enters institutional e-mail.
2. Server normalizes the e-mail and validates the exact domain against `allowed_email_domains`.
3. Supabase sends a six-digit OTP.
4. User confirms the code.
5. Protected layouts validate active profile and authorized domain again.

## Important wording

Use: "Acessar com e-mail institucional".

Do not use wording that implies official institutional SSO.

## Production setup

Configure SMTP in Supabase Auth for production. Enable the Before User Created Hook with `public.before_user_created_hook`.

## CAPTCHA

The code is prepared for Supabase OTP options, but CAPTCHA is not mandatory in development. Add provider-specific CAPTCHA settings in Supabase before exposing public production traffic if needed.

## Dominios autorizados no MVP

Configure exatamente estes dominios, sem `@`:

```env
ALLOWED_EMAIL_DOMAINS=einstein.edu.br,einstein.br
```
