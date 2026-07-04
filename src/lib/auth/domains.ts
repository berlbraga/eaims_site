import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { emailSchema, isExactAllowedEmailDomain, normalizeDomains } from "@/lib/validation/auth";

export type EmailDomainAuthorization = {
  allowed: boolean;
  configured: boolean;
  source: "database" | "environment";
};

function envAllowedDomains() {
  return normalizeDomains((env.ALLOWED_EMAIL_DOMAINS ?? "").split(","));
}

export async function isAllowedInstitutionalEmail(emailInput: string) {
  const result = await getEmailDomainAuthorization(emailInput);
  return result.allowed;
}

export async function getEmailDomainAuthorization(emailInput: string): Promise<EmailDomainAuthorization> {
  const email = emailSchema.parse(emailInput);
  const fallbackDomains = envAllowedDomains();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      allowed: isExactAllowedEmailDomain(email, fallbackDomains),
      configured: fallbackDomains.length > 0,
      source: "environment"
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("allowed_email_domains").select("domain").eq("is_active", true);
  if (error) throw error;
  const domains = data?.map((row) => row.domain) ?? [];
  return {
    allowed: isExactAllowedEmailDomain(email, domains),
    configured: domains.length > 0,
    source: "database"
  };
}
