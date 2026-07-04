import Link from "next/link";
import { BookOpen, FileVideo, LayoutDashboard, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import type { Profile } from "@/types/database";

const adminNav = [
  { href: "/admin", label: "Resumo", icon: LayoutDashboard },
  { href: "/admin/modulos", label: "Modulos", icon: BookOpen },
  { href: "/admin/aulas", label: "Aulas", icon: FileVideo },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users }
];

export function AdminShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <AppShell profile={profile}>
      <div className="mb-6 flex flex-wrap gap-2">
        {adminNav.map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            <item.icon className="h-4 w-4" aria-hidden />{item.label}
          </Link>
        ))}
      </div>
      {children}
    </AppShell>
  );
}
