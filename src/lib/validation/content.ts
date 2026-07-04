import { z } from "zod";
import { slugify } from "@/lib/utils/format";

const slugSchema = z
  .string()
  .trim()
  .min(2, "O slug deve ter ao menos 2 caracteres.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minusculas, numeros e hifens.");

const optionalSlugSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, slugSchema.optional());

const optionalUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}, z.string().url().nullable().optional());

const optionalTextSchema = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }, z.string().max(max).nullable().optional());

export const moduleSchema = z.object({
  title: z.string().trim().min(3, "Informe um titulo."),
  slug: optionalSlugSchema,
  description: optionalTextSchema(1000),
  cover_image_url: optionalUrlSchema,
  position: z.coerce.number().int().min(0).default(0),
  is_published: z.coerce.boolean().default(false)
});

export const lessonSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().trim().min(3, "Informe um titulo."),
  slug: optionalSlugSchema,
  description: optionalTextSchema(2000),
  position: z.coerce.number().int().min(0).default(0),
  video_provider: z.enum(["cloudflare_stream", "external"]).default("cloudflare_stream"),
  video_uid: optionalTextSchema(300),
  external_video_url: optionalUrlSchema,
  duration_seconds: z.coerce.number().int().min(0).optional().nullable(),
  is_published: z.coerce.boolean().default(false)
});

export const materialSchema = z
  .object({
    lesson_id: z.string().uuid(),
    title: z.string().trim().min(3),
    description: z.string().trim().max(1000).optional().nullable(),
    material_type: z.enum(["pdf", "slide", "sheet", "document", "image", "archive", "code", "link", "other"]),
    storage_path: z.string().trim().optional().nullable(),
    external_url: z.string().trim().url().optional().or(z.literal("")).nullable(),
    file_name: z.string().trim().max(255).optional().nullable(),
    mime_type: z.string().trim().max(120).optional().nullable(),
    file_size: z.coerce.number().int().min(0).optional().nullable(),
    position: z.coerce.number().int().min(0).default(0),
    is_published: z.coerce.boolean().default(false)
  })
  .refine((data) => Boolean(data.storage_path) !== Boolean(data.external_url), {
    message: "Use arquivo privado ou link externo, nao ambos.",
    path: ["external_url"]
  });

export const userUpdateSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["student", "admin"]).optional(),
  is_active: z.coerce.boolean().optional(),
  full_name: z.string().trim().max(160).optional().nullable()
});

export function contentSlug(input: { title: string; slug?: string | null }) {
  return input.slug?.trim() ? input.slug.trim().toLowerCase() : slugify(input.title);
}
