import { z } from "zod";

export const progressSchema = z.object({
  lesson_id: z.string().uuid(),
  last_position_seconds: z.coerce.number().int().min(0).default(0),
  is_completed: z.coerce.boolean().default(false)
});

export function calculateProgress(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function sortByPosition<T extends { position: number; title?: string }>(items: T[]) {
  return [...items].sort((a, b) => a.position - b.position || (a.title ?? "").localeCompare(b.title ?? ""));
}
