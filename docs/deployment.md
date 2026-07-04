# Deployment

## Supabase

1. Create a Supabase project.
2. Apply migrations.
3. Configure Auth OTP e-mail.
4. Configure SMTP for production.
5. Enable Before User Created Hook: `public.before_user_created_hook`.
6. Confirm the private bucket `lesson-materials`.
7. Run `pnpm bootstrap` with `ALLOWED_EMAIL_DOMAINS` and `ADMIN_EMAILS`.

## Cloudflare Stream

Upload videos directly to Cloudflare Stream outside the portal. Copy the Stream UID into each lesson.

For private videos, configure server-only variables for token generation. Without them, the app uses basic public iframe mode and warns admins/developers.

## Vercel

Set all environment variables from `.env.example`. Mark service keys and Cloudflare credentials as server-only variables. Deploy with the default Next.js build command.

## Checks before release

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
