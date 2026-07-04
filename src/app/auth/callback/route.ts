import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { emailDomain } from "@/lib/validation/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error") ?? requestUrl.searchParams.get("error_code");
  const next = requestUrl.searchParams.get("next") ?? "/portal";

  if (authError) {
    return NextResponse.redirect(new URL("/login?erro=link", requestUrl.origin));
  }

  if (!code) {
    return new NextResponse(renderImplicitCallbackHtml(next), {
      headers: {
        "content-type": "text/html; charset=utf-8"
      }
    });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?erro=sessao", requestUrl.origin));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL("/login?erro=sessao", requestUrl.origin));
  }

  const normalizedEmail = user.email.toLowerCase();
  const adminSupabase = createSupabaseAdminClient();
  const { data: allowed } = await adminSupabase
    .from("allowed_email_domains")
    .select("id")
    .eq("domain", emailDomain(normalizedEmail))
    .eq("is_active", true)
    .maybeSingle();

  if (!allowed) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?erro=dominio", requestUrl.origin));
  }

  await adminSupabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: normalizedEmail,
        is_active: true
      },
      { onConflict: "id" }
    );

  const redirectTo = next.startsWith("/") && !next.startsWith("//") ? next : "/portal";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}

function renderImplicitCallbackHtml(next: string) {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/portal";
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>E-AIMS</title>
    <style>
      body {
        align-items: center;
        background: #eff3f5;
        color: #0e496d;
        display: grid;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        min-height: 100vh;
        margin: 0;
        place-items: center;
      }
      main { text-align: center; padding: 24px; }
      p { color: rgba(14, 73, 109, 0.72); }
    </style>
  </head>
  <body>
    <main>
      <h1>E-AIMS</h1>
      <p>Confirmando seu acesso...</p>
    </main>
    <script>
      (async function () {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const access_token = hash.get("access_token");
        const refresh_token = hash.get("refresh_token");
        const error = hash.get("error") || hash.get("error_code");

        if (error || !access_token || !refresh_token) {
          window.location.replace("/login?erro=link");
          return;
        }

        const response = await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token })
        });

        if (!response.ok) {
          window.location.replace(response.status === 403 ? "/login?erro=dominio" : "/login?erro=sessao");
          return;
        }

        window.location.replace(${JSON.stringify(safeNext)});
      })().catch(function () {
        window.location.replace("/login?erro=sessao");
      });
    </script>
  </body>
</html>`;
}
