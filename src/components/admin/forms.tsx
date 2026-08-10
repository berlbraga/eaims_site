"use client";

import { FormEvent, useState } from "react";
import { upsertLessonAction, upsertModuleAction } from "@/actions/admin";
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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"error" | "success">("error");
  const maxMaterialSizeMb = Number(process.env.NEXT_PUBLIC_MAX_MATERIAL_SIZE_MB ?? 25);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("material_file");
    const externalUrl = formData.get("external_url")?.toString().trim();
    const title = formData.get("title")?.toString().trim();
    const lessonId = formData.get("lesson_id")?.toString();
    const materialType = formData.get("material_type")?.toString() || "pdf";

    setMessage("");
    setMessageKind("error");

    if (!lessonId) {
      setMessage("Selecione uma aula antes de salvar o material.");
      return;
    }

    if (!title) {
      setMessage("Informe o titulo do material.");
      return;
    }

    if ((file instanceof File && file.size > 0) && externalUrl) {
      setMessage("Use arquivo PDF ou URL externa, nao ambos.");
      return;
    }

    setUploading(true);
    try {
      let storagePath = "";
      let fileName = "";
      let mimeType = "";
      let fileSize: number | undefined;

      if (file instanceof File && file.size > 0) {
        if (file.type !== "application/pdf") {
          setMessage("Selecione um arquivo PDF.");
          return;
        }

        const maxBytes = maxMaterialSizeMb * 1024 * 1024;
        if (file.size > maxBytes) {
          setMessage(`O PDF deve ter no maximo ${maxMaterialSizeMb} MB.`);
          return;
        }

        const signedUploadResponse = await fetch("/api/admin/material-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size
          })
        });
        const signedUpload = await signedUploadResponse.json();
        if (!signedUploadResponse.ok) {
          setMessage(signedUpload.error ?? "Nao foi possivel preparar o envio do PDF.");
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.storage.from("lesson-materials").uploadToSignedUrl(signedUpload.path, signedUpload.token, file, {
          contentType: file.type,
          upsert: false
        });
        if (error) {
          setMessage(`Nao foi possivel enviar o PDF ao Supabase Storage: ${error.message}`);
          return;
        }

        storagePath = signedUpload.path;
        fileName = file.name;
        mimeType = file.type;
        fileSize = file.size;
      }

      const saveResponse = await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lessonId,
          title,
          material_type: storagePath ? "pdf" : materialType,
          storage_path: storagePath || undefined,
          external_url: storagePath ? undefined : externalUrl || undefined,
          file_name: fileName || undefined,
          mime_type: mimeType || undefined,
          file_size: fileSize,
          position: 0,
          is_published: formData.get("is_published") === "true"
        })
      });
      const saveResult = await saveResponse.json();
      if (!saveResponse.ok) {
        setMessage(saveResult.error ?? "Nao foi possivel salvar o material.");
        return;
      }

      form.reset();
      setMessageKind("success");
      setMessage("Material salvo com sucesso.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
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
      {message ? (
        <p className={`text-sm md:col-span-2 ${messageKind === "success" ? "text-emerald-700" : "text-destructive"}`}>
          {message}
        </p>
      ) : null}
      <Button className="md:col-span-2" disabled={uploading}>{uploading ? "Enviando PDF..." : "Salvar material"}</Button>
    </form>
  );
}
