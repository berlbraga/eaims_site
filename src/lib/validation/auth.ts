import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um e-mail valido.");

export const allowedDomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^(?!@)([a-z0-9-]+\.)+[a-z]{2,}$/, "Informe apenas o dominio, sem @.");

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function emailDomain(email: string) {
  const normalized = normalizeEmail(email);
  const at = normalized.lastIndexOf("@");
  return at > -1 ? normalized.slice(at + 1) : "";
}

export function normalizeDomains(domains: string[]) {
  return [...new Set(domains.map((domain) => domain.trim().toLowerCase().replace(/^@/, "")).filter(Boolean))];
}

export function isExactAllowedEmailDomain(email: string, allowedDomains: string[]) {
  const domain = emailDomain(email);
  return normalizeDomains(allowedDomains).includes(domain);
}
