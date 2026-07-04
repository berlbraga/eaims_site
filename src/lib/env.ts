import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ALLOWED_EMAIL_DOMAINS: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_STREAM_CUSTOMER_CODE: z.string().optional(),
  CLOUDFLARE_STREAM_API_TOKEN: z.string().optional(),
  CLOUDFLARE_STREAM_SIGNING_KEY_ID: z.string().optional(),
  CLOUDFLARE_STREAM_SIGNING_KEY: z.string().optional(),
  NEXT_PUBLIC_MAX_MATERIAL_SIZE_MB: z.coerce.number().positive().default(25)
});

export const env = envSchema.parse(process.env);

export function requireSupabasePublicEnv() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase publico nao configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
}

export function cloudflareSecureModeEnabled() {
  return Boolean(env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_STREAM_API_TOKEN);
}
