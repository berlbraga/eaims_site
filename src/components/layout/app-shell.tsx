import Link from "next/link";
import { BookOpen, FileText, Home, LogOut, Shield } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";

const nav = [
  { href: "/portal", label: "Inicio", icon: Home },
  { href: "/modulos", label: "Modulos", icon: BookOpen },
  { href: "/materiais", label: "Materiais", icon: FileText }
];

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/portal" className="text-xl font-bold tracking-normal text-primary">E-AIMS</Link>
          <div className="flex items-center gap-2">
            {profile.role === "admin" ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin"><Shield className="h-4 w-4" aria-hidden />Admin</Link>
              </Button>
            ) : null}
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                <item.icon className="h-4 w-4" aria-hidden />{item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-6 text-sm text-muted-foreground">{profile.full_name || profile.email}</p>
        </aside>
        <main>{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t bg-background md:hidden">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 text-xs">
            <item.icon className="h-5 w-5" aria-hidden />{item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
