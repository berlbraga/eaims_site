import { MessageCircle } from "lucide-react";
import { createLessonDiscussionAction } from "@/actions/lesson-interactions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type LessonDiscussionItem = {
  id: string;
  lesson_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
    role: "student" | "admin";
  } | null;
};

export function LessonDiscussion({
  lessonId,
  path,
  items
}: {
  lessonId: string;
  path: string;
  items: LessonDiscussionItem[];
}) {
  const questions = items.filter((item) => !item.parent_id);
  const repliesByParent = items.reduce((map, item) => {
    if (!item.parent_id) return map;
    const replies = map.get(item.parent_id) ?? [];
    replies.push(item);
    map.set(item.parent_id, replies);
    return map;
  }, new Map<string, LessonDiscussionItem[]>());

  return (
    <div className="space-y-5">
      <DiscussionForm lessonId={lessonId} path={path} buttonLabel="Enviar duvida" placeholder="Escreva sua duvida sobre esta aula" />
      {questions.length ? (
        <div className="space-y-4">
          {questions.map((question) => (
            <article key={question.id} className="rounded-lg border p-4">
              <DiscussionMessage item={question} />
              <div className="mt-4 space-y-3 border-l pl-4">
                {(repliesByParent.get(question.id) ?? []).map((reply) => (
                  <DiscussionMessage key={reply.id} item={reply} compact />
                ))}
                <DiscussionForm
                  lessonId={lessonId}
                  parentId={question.id}
                  path={path}
                  buttonLabel="Responder"
                  placeholder="Responder publicamente"
                  compact
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
          <MessageCircle className="mb-2 h-5 w-5" aria-hidden />
          Nenhuma duvida enviada ainda. Seja o primeiro a perguntar.
        </div>
      )}
    </div>
  );
}

function DiscussionMessage({ item, compact = false }: { item: LessonDiscussionItem; compact?: boolean }) {
  const author = item.profiles?.full_name || item.profiles?.email || "Aluno";
  const isAdmin = item.profiles?.role === "admin";
  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{author}</span>
        {isAdmin ? <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">Admin</span> : null}
        <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
      </div>
      <p className="whitespace-pre-line text-sm leading-6">{item.body}</p>
    </div>
  );
}

function DiscussionForm({
  lessonId,
  parentId,
  path,
  buttonLabel,
  placeholder,
  compact = false
}: {
  lessonId: string;
  parentId?: string;
  path: string;
  buttonLabel: string;
  placeholder: string;
  compact?: boolean;
}) {
  return (
    <form action={createLessonDiscussionAction} className={compact ? "space-y-2" : "space-y-3"}>
      <input type="hidden" name="lesson_id" value={lessonId} />
      <input type="hidden" name="path" value={path} />
      {parentId ? <input type="hidden" name="parent_id" value={parentId} /> : null}
      <Textarea name="body" placeholder={placeholder} rows={compact ? 2 : 4} required />
      <Button size={compact ? "sm" : "default"}>{buttonLabel}</Button>
    </form>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
