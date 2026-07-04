import { describe, expect, it } from "vitest";
import { emailDomain, emailSchema, isExactAllowedEmailDomain, normalizeDomains } from "@/lib/validation/auth";

describe("validacao de autenticacao", () => {
  it("normaliza e extrai dominio do e-mail", () => {
    expect(emailSchema.parse(" Pessoa@Dominio-Institucional.br ")).toBe("pessoa@dominio-institucional.br");
    expect(emailDomain("Pessoa@Dominio-Institucional.br")).toBe("dominio-institucional.br");
  });

  it("aceita somente dominio exato", () => {
    const domains = normalizeDomains(["dominio-institucional.br"]);
    expect(isExactAllowedEmailDomain("aluno@dominio-institucional.br", domains)).toBe(true);
    expect(isExactAllowedEmailDomain("aluno@fake-dominio-institucional.br", domains)).toBe(false);
    expect(isExactAllowedEmailDomain("aluno@dominio-institucional.br.evil.test", domains)).toBe(false);
  });

  it("rejeita e-mail invalido", () => {
    expect(() => emailSchema.parse("aluno sem arroba")).toThrow();
  });
});
