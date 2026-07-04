import { describe, expect, it } from "vitest";
import { lessonSchema, materialSchema, moduleSchema } from "@/lib/validation/content";
import { calculateProgress, sortByPosition } from "@/lib/validation/progress";

describe("schemas de conteudo", () => {
  it("valida modulo principal", () => {
    const parsedModule = moduleSchema.parse({ title: "Modulo inicial", position: 0, is_published: true });
    expect(parsedModule.title).toBe("Modulo inicial");
  });

  it("trata slug vazio como nao informado", () => {
    const parsedModule = moduleSchema.parse({ title: "Modulo inicial", slug: "", position: 0 });
    expect(parsedModule.slug).toBeUndefined();
  });

  it("valida aula em rascunho sem video", () => {
    const lesson = lessonSchema.parse({ module_id: "00000000-0000-4000-8000-000000000000", title: "Aula teste", slug: "" });
    expect(lesson.video_provider).toBe("cloudflare_stream");
    expect(lesson.slug).toBeUndefined();
  });

  it("rejeita material com arquivo e link ao mesmo tempo", () => {
    expect(() =>
      materialSchema.parse({
        lesson_id: "00000000-0000-4000-8000-000000000000",
        title: "Material",
        material_type: "pdf",
        storage_path: "private/a.pdf",
        external_url: "https://example.com/a.pdf"
      })
    ).toThrow();
  });
});

describe("progresso e ordenacao", () => {
  it("calcula progresso sem divisao por zero", () => {
    expect(calculateProgress(0, 0)).toBe(0);
    expect(calculateProgress(2, 4)).toBe(50);
  });

  it("ordena por posicao e titulo", () => {
    const sorted = sortByPosition([
      { position: 2, title: "B" },
      { position: 1, title: "C" },
      { position: 1, title: "A" }
    ]);
    expect(sorted.map((item) => item.title)).toEqual(["A", "C", "B"]);
  });
});
