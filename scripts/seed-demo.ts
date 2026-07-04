import { createClient } from "@supabase/supabase-js";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: moduleError } = await supabase.from("modules").upsert(
    [
      { title: "Fundamentos do E-AIMS", slug: "fundamentos-do-e-aims", description: "Introducao ao uso do portal e aos objetivos educacionais.", position: 0, is_published: true },
      { title: "Metodologia aplicada", slug: "metodologia-aplicada", description: "Aulas sobre estrutura, praticas e acompanhamento.", position: 1, is_published: true },
      { title: "Trilhas complementares", slug: "trilhas-complementares", description: "Conteudos adicionais para aprofundamento.", position: 2, is_published: false }
    ],
    { onConflict: "slug" }
  );
  if (moduleError) throw moduleError;

  const { data: module } = await supabase.from("modules").select("id").eq("slug", "fundamentos-do-e-aims").single();
  if (!module) throw new Error("Modulo demo nao encontrado.");

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .upsert(
      {
        module_id: module.id,
        title: "Boas-vindas ao portal",
        slug: "boas-vindas-ao-portal",
        description: "Visao geral do ambiente de aprendizagem.",
        position: 0,
        video_provider: "cloudflare_stream",
        video_uid: "demo-video-uid",
        duration_seconds: 420,
        is_published: true
      },
      { onConflict: "module_id,slug" }
    )
    .select("id")
    .single();
  if (lessonError) throw lessonError;

  const { error: materialError } = await supabase.from("lesson_materials").insert({
    lesson_id: lesson.id,
    title: "Guia de estudo do modulo",
    material_type: "link",
    external_url: "https://example.com/material-demo",
    position: 0,
    is_published: true
  });
  if (materialError && materialError.code !== "23505") throw materialError;
  console.log("Seed de desenvolvimento aplicado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
