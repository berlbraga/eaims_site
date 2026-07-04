import { redirect } from "next/navigation";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessPortal, isAdmin } from "@/lib/permissions/roles";
import { emailDomain } from "@/lib/validation/auth";
import type { Profile } from "@/types/database";

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user?.email) return { user: null, profile: null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  return { user, profile };
}

export async function requireActiveProfile() {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile || !canAccessPortal(profile)) redirect("/login");

  const domain = emailDomain(user.email ?? profile.email);
  const adminSupabase = createSupabaseAdminClient();
  const { data: allowed } = await adminSupabase
    .from("allowed_email_domains")
    .select("id")
    .eq("domain", domain)
    .eq("is_active", true)
    .maybeSingle();
  if (!allowed) redirect("/login?erro=dominio");

  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ last_access_at: new Date().toISOString() }).eq("id", user.id);
  return { user, profile };
}

export async function requireAdminProfile() {
  const session = await requireActiveProfile();
  if (!isAdmin(session.profile)) redirect("/acesso-negado");
  return session;
}
