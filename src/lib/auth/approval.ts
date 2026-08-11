import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { emailDomain } from "@/lib/validation/auth";
import type { Profile } from "@/types/database";

type AccessProfileResult =
  | {
      ok: true;
      profile: Profile;
    }
  | {
      ok: false;
      reason: "domain" | "profile";
    };

export async function ensureAuthorizedProfile(user: { id: string; email?: string | null }): Promise<AccessProfileResult> {
  if (!user.email) return { ok: false, reason: "profile" };

  const normalizedEmail = user.email.toLowerCase();
  const adminSupabase = createSupabaseAdminClient();
  const [{ data: allowed }, { data: adminAllowed }, { data: existingProfile }] = await Promise.all([
    adminSupabase
      .from("allowed_email_domains")
      .select("id")
      .eq("domain", emailDomain(normalizedEmail))
      .eq("is_active", true)
      .maybeSingle(),
    adminSupabase.from("admin_allowlist").select("id").eq("email", normalizedEmail).maybeSingle(),
    adminSupabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>()
  ]);

  if (!allowed) return { ok: false, reason: "domain" };

  const isAdminAllowed = Boolean(adminAllowed);
  const nextProfile = {
    id: user.id,
    email: normalizedEmail,
    role: isAdminAllowed ? "admin" : existingProfile?.role ?? "student",
    is_active: isAdminAllowed ? true : existingProfile?.is_active ?? false
  };

  const { data: profile, error } = await adminSupabase
    .from("profiles")
    .upsert(nextProfile, { onConflict: "id" })
    .select("*")
    .single<Profile>();

  if (error || !profile) return { ok: false, reason: "profile" };
  return { ok: true, profile };
}
