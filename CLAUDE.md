# E-AIMS conventions

- Use Next.js App Router with Server Components by default.
- Keep all authorization checks on the server and in Supabase RLS.
- Never put `SUPABASE_SERVICE_ROLE_KEY` or Cloudflare secrets in client components.
- Use passwordless OTP only. Do not add SSO, SAML, Microsoft, Google or institutional password flows.
- Validate input with Zod in shared schemas and again in server actions.
- Keep UI copy in Brazilian Portuguese and use "Acessar com e-mail institucional".
- Store videos outside the app. Cloudflare Stream UID is the primary video reference.
- Store uploaded materials in the private `lesson-materials` Supabase Storage bucket.
- Protect the last active admin in code and in database triggers.
