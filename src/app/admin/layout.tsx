import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdminProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdminProfile();
  return <AdminShell profile={profile}>{children}</AdminShell>;
}
