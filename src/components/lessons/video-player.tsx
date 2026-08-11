"use client";

import { useEffect, useRef, useState } from "react";
import { saveProgressAction } from "@/actions/progress";
import { Button } from "@/components/ui/button";

export function VideoPlayer({
  lessonId,
  title,
  initialPosition,
  completed
}: {
  lessonId: string;
  title: string;
  initialPosition: number;
  completed: boolean;
}) {
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(completed);
  const [saving, setSaving] = useState(false);
  const lastSave = useRef(initialPosition);
  const completedRef = useRef(completed);

  useEffect(() => {
    setIsCompleted(completed);
    completedRef.current = completed;
  }, [completed]);

  useEffect(() => {
    fetch(`/api/video-access/${lessonId}`)
      .then((response) => response.json())
      .then((data) => {
        setIframeUrl(data.iframeUrl ?? "");
        setWarning(data.warning ?? "");
      })
      .catch(() => setWarning("Nao foi possivel carregar o acesso ao video."));
  }, [lessonId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      lastSave.current += 30;
      const form = new FormData();
      form.set("lesson_id", lessonId);
      form.set("last_position_seconds", String(lastSave.current));
      form.set("is_completed", String(completedRef.current));
      void saveProgressAction(form);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [lessonId]);

  async function toggleCompleted() {
    const nextCompleted = !completedRef.current;
    setSaving(true);
    setIsCompleted(nextCompleted);
    completedRef.current = nextCompleted;

    const form = new FormData();
    form.set("lesson_id", lessonId);
    form.set("last_position_seconds", String(lastSave.current));
    form.set("is_completed", String(nextCompleted));

    try {
      await saveProgressAction(form);
    } catch {
      const previousCompleted = !nextCompleted;
      setIsCompleted(previousCompleted);
      completedRef.current = previousCompleted;
      setWarning("Nao foi possivel atualizar o progresso. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Carregando video...</div>
        )}
      </div>
      {warning ? <p className="text-sm text-muted-foreground">{warning}</p> : null}
      <Button onClick={toggleCompleted} variant={isCompleted ? "secondary" : "default"} disabled={saving}>
        {saving ? "Salvando..." : isCompleted ? "Desfazer conclusao" : "Marcar como concluida"}
      </Button>
    </div>
  );
}
