import { describe, expect, it } from "vitest";
import { canModifyAdminStatus, isAdmin, nextRole } from "@/lib/permissions/roles";

describe("regras de papel", () => {
  it("identifica administradores ativos", () => {
    expect(isAdmin({ role: "admin", is_active: true })).toBe(true);
    expect(isAdmin({ role: "admin", is_active: false })).toBe(false);
    expect(isAdmin({ role: "student", is_active: true })).toBe(false);
  });

  it("alterna entre aluno e admin", () => {
    expect(nextRole("student")).toBe("admin");
    expect(nextRole("admin")).toBe("student");
  });

  it("protege o ultimo administrador ativo", () => {
    expect(canModifyAdminStatus({ targetRole: "admin", targetIsActive: true, nextRole: "student", activeAdminCount: 1 })).toBe(false);
    expect(canModifyAdminStatus({ targetRole: "admin", targetIsActive: true, nextIsActive: false, activeAdminCount: 1 })).toBe(false);
    expect(canModifyAdminStatus({ targetRole: "admin", targetIsActive: true, nextRole: "student", activeAdminCount: 2 })).toBe(true);
  });
});
