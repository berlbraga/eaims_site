import { upsertLessonAction, upsertMaterialAction, upsertModuleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  return (
    <form action={upsertMaterialAction} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Aula</Label>
        <select name="lesson_id" required className="h-10 rounded-md border bg-background px-3 text-sm">
          {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
        </select>
      </div>
      <div className="space-y-2"><Label>Titulo</Label><Input name="title" required /></div>
      <div className="space-y-2"><Label>Tipo</Label><Input name="material_type" defaultValue="link" /></div>
      <div className="space-y-2"><Label>URL externa</Label><Input name="external_url" type="url" /></div>
      <div className="space-y-2"><Label>Storage path privado</Label><Input name="storage_path" /></div>
      <label className="flex items-center gap-2 text-sm"><input name="is_published" type="checkbox" value="true" /> Publicado</label>
      <Button className="md:col-span-2">Salvar material</Button>
    </form>
  );
}
