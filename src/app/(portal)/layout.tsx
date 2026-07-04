import { AppShell } from "@/components/layout/app-shell";
import { requireActiveProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireActiveProfile();
  return <AppShell profile={profile}>{children}</AppShell>;
}
