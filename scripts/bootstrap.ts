import { createClient } from "@supabase/supabase-js";
import { normalizeDomains, normalizeEmail } from "../src/lib/validation/auth";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const domains = normalizeDomains((process.env.ALLOWED_EMAIL_DOMAINS ?? "").split(","));
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map(normalizeEmail).filter(Boolean);

  if (!domains.length) {
    console.log("Nenhum dominio configurado. O portal permanecera negando novos cadastros.");
  } else {
    const { error } = await supabase.from("allowed_email_domains").upsert(domains.map((domain) => ({ domain, is_active: true })), { onConflict: "domain" });
    if (error) throw error;
    console.log(`Dominios configurados: ${domains.join(", ")}`);
  }

  if (admins.length) {
    const { error } = await supabase.from("admin_allowlist").upsert(admins.map((email) => ({ email })), { onConflict: "email" });
    if (error) throw error;
    await supabase.from("profiles").update({ role: "admin", is_active: true }).in("email", admins);
    console.log(`Administradores allowlist: ${admins.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
