"use client";

import { FormEvent, useActionState, useRef, useState } from "react";
import { type MaterialActionState, upsertLessonAction, upsertMaterialAction, upsertModuleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ModuleForm() {
  return (
    <form action={upsertModuleAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
      <div className="space-y-2"><Label>Titulo</Label><Input name="title" required /></div>
      <div className="space-y-2"><Label>Slug opcional</Label><Input name="slug" placeholder="deixe vazio para gerar automaticamente" /></div>
      <div className="space-y-2 md:col-span-2"><Label>Descricao</Label><Textarea name="description" /></div>
      <div className="space-y-2"><Label>Posicao</Label><Input name="position" type="number" defaultValue="0" min="0" /></div>
      <label className="flex items-center gap-2 text-sm"><input name="is_published" type="checkbox" value="true" /> Publicado</label>
      <Button className="md:col-span-2">Salvar modulo</Button>
    </form>
  );
}

export function LessonForm({ modules }: { modules: Array<{ id: string; title: string }> }) {
  return (
    <form action={upsertLessonAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Modulo</Label>
        <select name="module_id" required className="h-10 rounded-md border bg-background px-3 text-sm">
          {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
        </select>
      </div>
      <div className="space-y-2"><Label>Titulo</Label><Input name="title" required /></div>
      <div className="space-y-2"><Label>Video UID</Label><Input name="video_uid" /></div>
      <div className="space-y-2"><Label>URL externa</Label><Input name="external_video_url" type="url" /></div>
      <div className="space-y-2"><Label>Duracao em segundos</Label><Input name="duration_seconds" type="number" min="0" /></div>
      <div className="space-y-2"><Label>Posicao</Label><Input name="position" type="number" defaultValue="0" min="0" /></div>
      <div className="space-y-2 md:col-span-2"><Label>Descricao</Label><Textarea name="description" /></div>
      <label className="flex items-center gap-2 text-sm"><input name="is_published" type="checkbox" value="true" /> Publicada</label>
      <Button className="md:col-span-2">Salvar aula</Button>
    </form>
  );
}

export function MaterialForm({ lessons }: { lessons: Array<{ id: string; title: string }> }) {
  const shouldSubmitRef = useRef(false);
  const [actionState, formAction, actionPending] = useActionState<MaterialActionState, FormData>(upsertMaterialAction, {
    ok: false,
    message: ""
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const maxMaterialSizeMb = Number(process.env.NEXT_PUBLIC_MAX_MATERIAL_SIZE_MB ?? 25);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (shouldSubmitRef.current) {
      shouldSubmitRef.current = false;
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("material_file");
    const externalUrl = formData.get("external_url")?.toString().trim();

    if (!(file instanceof File) || file.size === 0) return;

    event.preventDefault();
    setMessage("");

    if (externalUrl) {
      setMessage("Use arquivo PDF ou URL externa, nao ambos.");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Selecione um arquivo PDF.");
      return;
    }

    const maxBytes = maxMaterialSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessage(`O PDF deve ter no maximo ${maxMaterialSizeMb} MB.`);
      return;
    }

    const lessonId = formData.get("lesson_id")?.toString();
    if (!lessonId) {
      setMessage("Selecione uma aula antes de enviar o PDF.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const storagePath = `lessons/${lessonId}/${Date.now()}-${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from("lesson-materials").upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false
      });

      if (error) {
        setMessage("Nao foi possivel enviar o PDF. Verifique se voce esta logado como admin.");
        return;
      }

      setInputValue(form, "storage_path", storagePath);
      setInputValue(form, "file_name", file.name);
      setInputValue(form, "mime_type", file.type);
      setInputValue(form, "file_size", String(file.size));
      setInputValue(form, "material_type", "pdf");

      shouldSubmitRef.current = true;
      form.requestSubmit();
    } finally {
      setUploading(false);
    }
  }

  const visibleMessage = message || actionState.message;
  const isBusy = uploading || actionPending;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Aula</Label>
        <select name="lesson_id" required className="h-10 rounded-md border bg-background px-3 text-sm">
          {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
        </select>
      </div>
      <div className="space-y-2"><Label>Titulo</Label><Input name="title" required /></div>
      <div className="space-y-2">
        <Label>Tipo</Label>
        <select name="material_type" defaultValue="pdf" className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="pdf">PDF</option>
          <option value="link">Link externo</option>
          <option value="slide">Slide</option>
          <option value="document">Documento</option>
          <option value="other">Outro</option>
        </select>
      </div>
      <div className="space-y-2"><Label>URL externa</Label><Input name="external_url" type="url" placeholder="Opcional, se o material for um link" /></div>
      <div className="space-y-2 md:col-span-2">
        <Label>Arquivo PDF</Label>
        <Input name="material_file" type="file" accept="application/pdf,.pdf" />
        <p className="text-xs text-muted-foreground">Use este campo para enviar PDFs privados. Limite por arquivo: {maxMaterialSizeMb} MB.</p>
      </div>
      <input type="hidden" name="storage_path" />
      <input type="hidden" name="file_name" />
      <input type="hidden" name="mime_type" />
      <input type="hidden" name="file_size" />
      <label className="flex items-center gap-2 text-sm"><input name="is_published" type="checkbox" value="true" /> Publicado</label>
      {visibleMessage ? (
        <p className={`text-sm md:col-span-2 ${!message && actionState.ok ? "text-emerald-700" : "text-destructive"}`}>
          {visibleMessage}
        </p>
      ) : null}
      <Button className="md:col-span-2" disabled={isBusy}>{uploading ? "Enviando PDF..." : "Salvar material"}</Button>
    </form>
  );
}

function safeFileName(fileName: string) {
  const withoutPath = fileName.split(/[/\\]/).pop() ?? "material.pdf";
  const normalized = withoutPath
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.endsWith(".pdf") ? normalized : `${normalized || "material"}.pdf`;
}

function setInputValue(form: HTMLFormElement, name: string, value: string) {
  const input = form.elements.namedItem(name);
  if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
    input.value = value;
  }
}
