import type { Profile, UserRole } from "@/types/database";

export function isAdmin(profile?: Pick<Profile, "role" | "is_active"> | null) {
  return profile?.is_active === true && profile.role === "admin";
}

export function canAccessPortal(profile?: Pick<Profile, "is_active"> | null) {
  return profile?.is_active === true;
}

export function nextRole(current: UserRole) {
  return current === "admin" ? "student" : "admin";
}

export function canModifyAdminStatus(params: {
  targetRole: UserRole;
  targetIsActive: boolean;
  nextRole?: UserRole;
  nextIsActive?: boolean;
  activeAdminCount: number;
}) {
  const currentlyActiveAdmin = params.targetRole === "admin" && params.targetIsActive;
  const remainsActiveAdmin = (params.nextRole ?? params.targetRole) === "admin" && (params.nextIsActive ?? params.targetIsActive);
  if (currentlyActiveAdmin && !remainsActiveAdmin && params.activeAdminCount <= 1) return false;
  return true;
}
